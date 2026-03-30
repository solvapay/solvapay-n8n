import { SolvaPay } from '../../nodes/SolvaPay/SolvaPay.node';
import { createMockExecuteFunctions, getHttpMock } from './helpers/mockExecuteFunctions';

const BASE = 'https://api.solvapay.com/v1/sdk';

function runNode(params: Record<string, unknown>, httpResponse: unknown = {}) {
	const mock = createMockExecuteFunctions({ params, httpResponse });
	const node = new SolvaPay();
	return { mock, result: node.execute.call(mock), httpMock: getHttpMock(mock) };
}

function expectCall(httpMock: jest.Mock, method: string, urlSuffix: string, bodyOrQs?: Record<string, unknown>) {
	const matcher: Record<string, unknown> = { method, url: `${BASE}${urlSuffix}` };
	if (bodyOrQs && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
		matcher['body'] = expect.objectContaining(bodyOrQs);
	}
	expect(httpMock).toHaveBeenCalledWith('solvaPayApi', expect.objectContaining(matcher));
}

// ───────────────────────────── Customer ─────────────────────────────

describe('Customer', () => {
	it('ensure — calls ensureCustomer helper', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'customer', operation: 'ensure', email: 'a@b.com', name: 'A', externalRef: '' },
			{ reference: 'cus_1', email: 'a@b.com' },
		);
		const out = await result;
		expectCall(httpMock, 'POST', '/customers');
		expect(out[0][0].json).toEqual({ reference: 'cus_1', email: 'a@b.com' });
	});

	it('create — POST /customers with body', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'customer', operation: 'create', email: 'a@b.com', additionalFields: { name: 'Test' } },
			{ reference: 'cus_2' },
		);
		await result;
		expectCall(httpMock, 'POST', '/customers', { email: 'a@b.com', name: 'Test' });
	});

	it('create — parses metadata JSON string', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'customer', operation: 'create', email: 'a@b.com', additionalFields: { metadata: '{"k":"v"}' } },
			{ reference: 'cus_3' },
		);
		await result;
		const callBody = httpMock.mock.calls[0][1].body;
		expect(callBody.metadata).toEqual({ k: 'v' });
	});

	it('get — GET /customers/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'customer', operation: 'get', reference: 'cus_1' },
			{ reference: 'cus_1' },
		);
		await result;
		expectCall(httpMock, 'GET', '/customers/cus_1');
	});

	it('createSession — POST /customers/customer-sessions with customerRef body', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'customer', operation: 'createSession', reference: 'cus_1' },
			{ sessionId: 'sess_1', customerUrl: 'https://portal.example.com' },
		);
		await result;
		expectCall(httpMock, 'POST', '/customers/customer-sessions', { customerRef: 'cus_1' });
	});
});

// ───────────────────────────── Product ──────────────────────────────

describe('Product', () => {
	it('create — POST /products', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'product', operation: 'create', name: 'Widget', additionalFields: { description: 'desc' } },
			{ reference: 'prd_1' },
		);
		await result;
		expectCall(httpMock, 'POST', '/products', { name: 'Widget', description: 'desc' });
	});

	it('get — GET /products/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'product', operation: 'get', reference: 'prd_1' },
		);
		await result;
		expectCall(httpMock, 'GET', '/products/prd_1');
	});

	it('update — PUT /products/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'product', operation: 'update', reference: 'prd_1', updateFields: { name: 'New' } },
		);
		await result;
		expectCall(httpMock, 'PUT', '/products/prd_1', { name: 'New' });
	});

	it('delete — DELETE /products/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'product', operation: 'delete', reference: 'prd_1' },
		);
		await result;
		expectCall(httpMock, 'DELETE', '/products/prd_1');
	});

	it('list — GET /products', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'product', operation: 'list' },
		);
		await result;
		expectCall(httpMock, 'GET', '/products');
	});
});

// ───────────────────────────── Plan ─────────────────────────────────

describe('Plan', () => {
	it('create recurring — POST /products/:ref/plans with type-specific fields', async () => {
		const { result, httpMock } = runNode(
			{
				resource: 'plan', operation: 'create', productRef: 'prd_1', type: 'recurring',
				price: 2000, currency: 'USD', billingCycle: 'monthly', setupFee: 0, trialDays: 0,
				pricePerUnit: undefined, billingModel: undefined, freeUnits: undefined, usageLimit: undefined, basePrice: undefined,
				additionalFields: { name: 'Pro' },
			},
			{ reference: 'pln_1' },
		);
		await result;
		const callBody = httpMock.mock.calls[0][1].body;
		expect(callBody.type).toBe('recurring');
		expect(callBody.price).toBe(2000);
		expect(callBody.currency).toBe('USD');
		expect(callBody.name).toBe('Pro');
	});

	it('create usage-based — includes pricePerUnit and maps usageLimit to limit', async () => {
		const { result, httpMock } = runNode(
			{
				resource: 'plan', operation: 'create', productRef: 'prd_1', type: 'usage-based',
				price: undefined, currency: 'USD', billingCycle: 'monthly', setupFee: undefined, trialDays: undefined,
				pricePerUnit: 10, billingModel: 'post-paid', freeUnits: 100, usageLimit: 5000, basePrice: undefined,
				additionalFields: {},
			},
			{ reference: 'pln_2' },
		);
		await result;
		const callBody = httpMock.mock.calls[0][1].body;
		expect(callBody.pricePerUnit).toBe(10);
		expect(callBody.limit).toBe(5000);
		expect(callBody.usageLimit).toBeUndefined();
	});

	it('get — GET /products/:ref/plans/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'plan', operation: 'get', productRef: 'prd_1', planRef: 'pln_1' },
		);
		await result;
		expectCall(httpMock, 'GET', '/products/prd_1/plans/pln_1');
	});

	it('update — PUT, maps usageLimit to limit in updateFields', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'plan', operation: 'update', productRef: 'prd_1', planRef: 'pln_1', updateFields: { usageLimit: 999 } },
		);
		await result;
		const callArgs = httpMock.mock.calls[0][1];
		expect(callArgs.method).toBe('PUT');
		expect(callArgs.body.limit).toBe(999);
		expect(callArgs.body.usageLimit).toBeUndefined();
	});

	it('update — parses features JSON string', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'plan', operation: 'update', productRef: 'prd_1', planRef: 'pln_1', updateFields: { features: '{"a":1}' } },
		);
		await result;
		const callBody = httpMock.mock.calls[0][1].body;
		expect(callBody.features).toEqual({ a: 1 });
	});

	it('delete — DELETE /products/:ref/plans/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'plan', operation: 'delete', productRef: 'prd_1', planRef: 'pln_1' },
		);
		await result;
		expectCall(httpMock, 'DELETE', '/products/prd_1/plans/pln_1');
	});

	it('listForProduct — GET /products/:ref/plans', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'plan', operation: 'listForProduct', productRef: 'prd_1' },
		);
		await result;
		expectCall(httpMock, 'GET', '/products/prd_1/plans');
	});
});

// ───────────────────────────── Checkout ──────────────────────────────

describe('Checkout', () => {
	it('create — POST /checkout-sessions with required fields', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'checkout', operation: 'create', customerRef: 'cus_1', productRef: 'prd_1', planRef: '', returnUrl: '' },
			{ sessionId: 'sess_1', url: 'https://checkout.example.com' },
		);
		const out = await result;
		expectCall(httpMock, 'POST', '/checkout-sessions', { customerRef: 'cus_1', productRef: 'prd_1' });
		expect(out[0][0].json).toHaveProperty('url');
	});

	it('create — includes optional planRef when provided', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'checkout', operation: 'create', customerRef: 'cus_1', productRef: 'prd_1', planRef: 'pln_1', returnUrl: 'https://return.com' },
		);
		await result;
		const callBody = httpMock.mock.calls[0][1].body;
		expect(callBody.planRef).toBe('pln_1');
		expect(callBody.returnUrl).toBe('https://return.com');
	});
});

// ───────────────────────────── Purchase ──────────────────────────────

describe('Purchase', () => {
	it('get — GET /purchases/:id', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'purchase', operation: 'get', purchaseId: 'pur_1' },
		);
		await result;
		expectCall(httpMock, 'GET', '/purchases/pur_1');
	});

	it('list — GET /purchases with status filter', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'purchase', operation: 'list', status: 'active' },
		);
		await result;
		expect(httpMock).toHaveBeenCalledWith(
			'solvaPayApi',
			expect.objectContaining({ qs: { status: 'active' } }),
		);
	});

	it('list — GET /purchases without status when empty', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'purchase', operation: 'list', status: '' },
		);
		await result;
		const callArgs = httpMock.mock.calls[0][1];
		expect(callArgs.qs).toBeUndefined();
	});

	it('listByCustomer — GET /purchases/customer/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'purchase', operation: 'listByCustomer', customerRef: 'cus_1', status: '' },
		);
		await result;
		expectCall(httpMock, 'GET', '/purchases/customer/cus_1');
	});

	it('listByProduct — GET /purchases/product/:ref', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'purchase', operation: 'listByProduct', productRef: 'prd_1', status: 'active' },
		);
		await result;
		expect(httpMock).toHaveBeenCalledWith(
			'solvaPayApi',
			expect.objectContaining({ url: `${BASE}/purchases/product/prd_1`, qs: { status: 'active' } }),
		);
	});

	it('cancel — POST /purchases/:id/cancel', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'purchase', operation: 'cancel', purchaseId: 'pur_1', reason: 'Too expensive' },
		);
		await result;
		expectCall(httpMock, 'POST', '/purchases/pur_1/cancel', { reason: 'Too expensive' });
	});
});

// ───────────────────────────── Usage ────────────────────────────────

describe('Usage', () => {
	it('record — POST /usages', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'usage', operation: 'record', customerRef: 'cus_1', productRef: 'prd_1', outcome: 'success', additionalFields: { action: 'query' } },
		);
		await result;
		expectCall(httpMock, 'POST', '/usages', { customerRef: 'cus_1', productRef: 'prd_1', outcome: 'success', action: 'query' });
	});

	it('recordBulk — POST /usages/bulk', async () => {
		const events = [
			{ customerRef: 'cus_1', productRef: 'prd_1', outcome: 'success' },
			{ customerRef: 'cus_2', productRef: 'prd_1', outcome: 'failure' },
		];
		const { result, httpMock } = runNode(
			{ resource: 'usage', operation: 'recordBulk', events: { event: events } },
		);
		await result;
		expectCall(httpMock, 'POST', '/usages/bulk', { events });
	});

	it('checkLimits — POST /limits with body', async () => {
		const { result, httpMock } = runNode(
			{ resource: 'usage', operation: 'checkLimits', customerRef: 'cus_1', productRef: 'prd_1' },
			{ hasAccess: true, used: 5, remaining: 95, limit: 100 },
		);
		const out = await result;
		expectCall(httpMock, 'POST', '/limits', { customerRef: 'cus_1', productRef: 'prd_1' });
		expect(out[0][0].json).toHaveProperty('hasAccess', true);
	});
});

// ───────────────────────────── Cross-cutting ────────────────────────

describe('Error handling', () => {
	it('continueOnFail — returns error JSON instead of throwing', async () => {
		const mock = createMockExecuteFunctions({
			params: { resource: 'customer', operation: 'get', reference: 'cus_bad' },
			httpError: new Error('Not Found'),
			continueOnFail: true,
		});

		const out = await new SolvaPay().execute.call(mock);
		expect(out[0][0].json).toHaveProperty('error');
	});

	it('unknown resource — throws NodeOperationError', async () => {
		const mock = createMockExecuteFunctions({
			params: { resource: 'unknown', operation: 'get' },
		});
		await expect(new SolvaPay().execute.call(mock)).rejects.toThrow('Unknown resource');
	});
});
