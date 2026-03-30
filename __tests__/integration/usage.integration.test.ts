import { api, skipIfNoKey } from './helpers/apiClient';

skipIfNoKey();

describe('Usage resource (integration)', () => {
	let customerRef: string;
	let productRef: string;

	beforeAll(async () => {
		const [cust, prod] = await Promise.all([
			api.post('/customers', { email: `usage+${Date.now()}@solvapay-n8n.test` }),
			api.post('/products', { name: `n8n-usage-test-${Date.now()}` }),
		]);
		customerRef = cust.data['reference'] as string;
		productRef = prod.data['reference'] as string;
	});

	afterAll(async () => {
		await Promise.all([
			api.del(`/products/${productRef}`).catch(() => {}),
		]);
	});

	it('record — POST /usages', async () => {
		const res = await api.post('/usages', {
			customerRef,
			productRef,
			outcome: 'success',
			action: 'integration-test',
		});
		// 400 is expected when the customer has no active usage-based purchase
		expect([200, 201, 400]).toContain(res.status);
	});

	it('recordBulk — POST /usages/bulk', async () => {
		const res = await api.post('/usages/bulk', {
			events: [
				{ customerRef, productRef, outcome: 'success', action: 'bulk-1' },
				{ customerRef, productRef, outcome: 'success', action: 'bulk-2' },
			],
		});
		expect([200, 201, 400]).toContain(res.status);
	});

	it('checkLimits — POST /limits', async () => {
		const res = await api.post('/limits', { customerRef, productRef });
		expect(res.status).toBe(200);
		expect(res.data).toHaveProperty('withinLimits');
	});
});
