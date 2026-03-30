import type { INode } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { solvaPayRequest, ensureCustomer } from '../../nodes/SolvaPay/GenericFunctions';
import { createMockExecuteFunctions, getHttpMock } from './helpers/mockExecuteFunctions';

function mockNode(): INode {
	return {
		id: 'test-node-id',
		name: 'test',
		type: 'test',
		typeVersion: 1,
		position: [0, 0],
		parameters: {},
	};
}

function makeAlreadyExistsError(): NodeApiError {
	const err = new NodeApiError(mockNode(), {} as import('n8n-workflow').JsonObject);
	Object.defineProperty(err, 'message', { value: 'Customer already exists', writable: true, configurable: true });
	err.httpCode = '409';
	return err;
}

describe('solvaPayRequest', () => {
	it('should make a GET request with correct URL', async () => {
		const mock = createMockExecuteFunctions({ httpResponse: { id: '123' } });
		const httpMock = getHttpMock(mock);

		const result = await solvaPayRequest.call(mock, 'GET', '/customers/cus_abc');

		expect(httpMock).toHaveBeenCalledWith(
			'solvaPayApi',
			expect.objectContaining({
				method: 'GET',
				url: 'https://api.solvapay.com/v1/sdk/customers/cus_abc',
				json: true,
			}),
		);
		expect(result).toEqual({ id: '123' });
	});

	it('should include body for POST requests', async () => {
		const mock = createMockExecuteFunctions({ httpResponse: { id: '123' } });
		const httpMock = getHttpMock(mock);

		await solvaPayRequest.call(mock, 'POST', '/customers', { email: 'test@example.com' });

		expect(httpMock).toHaveBeenCalledWith(
			'solvaPayApi',
			expect.objectContaining({
				method: 'POST',
				body: { email: 'test@example.com' },
			}),
		);
	});

	it('should include query params when provided', async () => {
		const mock = createMockExecuteFunctions({ httpResponse: {} });
		const httpMock = getHttpMock(mock);

		await solvaPayRequest.call(mock, 'GET', '/customers', undefined, {
			email: 'test@example.com',
		});

		expect(httpMock).toHaveBeenCalledWith(
			'solvaPayApi',
			expect.objectContaining({
				qs: { email: 'test@example.com' },
			}),
		);
	});

	it('should not include body when empty', async () => {
		const mock = createMockExecuteFunctions({ httpResponse: {} });
		const httpMock = getHttpMock(mock);

		await solvaPayRequest.call(mock, 'GET', '/products');

		const callArgs = httpMock.mock.calls[0][1];
		expect(callArgs.body).toBeUndefined();
	});

	it('should throw NodeApiError on HTTP failure', async () => {
		const httpError = new Error('Request failed');
		const mock = createMockExecuteFunctions({ httpError });

		await expect(
			solvaPayRequest.call(mock, 'GET', '/products'),
		).rejects.toThrow(NodeApiError);
	});
});

describe('ensureCustomer', () => {
	it('should return customer on successful create', async () => {
		const customer = { reference: 'cus_abc', email: 'test@example.com' };
		const mock = createMockExecuteFunctions({ httpResponse: customer });

		const result = await ensureCustomer.call(mock, 'test@example.com', 'Test User');

		const httpMock = getHttpMock(mock);
		expect(httpMock).toHaveBeenCalledWith(
			'solvaPayApi',
			expect.objectContaining({
				method: 'POST',
				url: 'https://api.solvapay.com/v1/sdk/customers',
				body: { email: 'test@example.com', name: 'Test User' },
			}),
		);
		expect(result).toEqual(customer);
	});

	it('should include externalRef when provided', async () => {
		const mock = createMockExecuteFunctions({ httpResponse: { reference: 'cus_abc' } });

		await ensureCustomer.call(mock, 'test@example.com', 'Test', 'ext_123');

		const httpMock = getHttpMock(mock);
		expect(httpMock).toHaveBeenCalledWith(
			'solvaPayApi',
			expect.objectContaining({
				body: { email: 'test@example.com', name: 'Test', externalRef: 'ext_123' },
			}),
		);
	});

	it('should fall back to GET by email when create throws "already exists"', async () => {
		const existingCustomer = { reference: 'cus_existing', email: 'test@example.com' };

		const mock = createMockExecuteFunctions({});
		const httpMock = getHttpMock(mock);

		let callCount = 0;
		httpMock.mockImplementation((_credName: string, opts: { url: string }) => {
			callCount++;
			if (callCount === 1) {
				throw makeAlreadyExistsError();
			}
			if (opts.url.includes('/customers')) {
				return Promise.resolve(existingCustomer);
			}
			return Promise.resolve({});
		});

		const result = await ensureCustomer.call(mock, 'test@example.com');

		expect(callCount).toBe(2);
		expect(result).toEqual(existingCustomer);
	});

	it('should re-throw when fallback returns no reference', async () => {
		const mock = createMockExecuteFunctions({});
		const httpMock = getHttpMock(mock);

		let callCount = 0;
		httpMock.mockImplementation(() => {
			callCount++;
			if (callCount === 1) throw makeAlreadyExistsError();
			return Promise.resolve({});
		});

		await expect(ensureCustomer.call(mock, 'test@example.com')).rejects.toThrow();
	});

	it('should re-throw non-duplicate errors', async () => {
		const serverError = new NodeApiError(mockNode(), {} as import('n8n-workflow').JsonObject);
		Object.defineProperty(serverError, 'message', { value: 'Internal server error', writable: true, configurable: true });
		serverError.httpCode = '500';

		const mock = createMockExecuteFunctions({});
		getHttpMock(mock).mockRejectedValue(serverError);

		await expect(ensureCustomer.call(mock, 'test@example.com')).rejects.toThrow();
	});
});
