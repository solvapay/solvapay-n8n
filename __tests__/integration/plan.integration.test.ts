import { api, skipIfNoKey } from './helpers/apiClient';

skipIfNoKey();

describe('Plan resource (integration)', () => {
	let productRef: string;
	let planRef: string;

	beforeAll(async () => {
		const prod = await api.post('/products', {
			name: `n8n-plan-test-${Date.now()}`,
		});
		productRef = prod.data['reference'] as string;
	});

	afterAll(async () => {
		if (planRef && productRef) {
			await api.del(`/products/${productRef}/plans/${planRef}`).catch(() => {});
		}
		if (productRef) {
			await api.del(`/products/${productRef}`).catch(() => {});
		}
	});

	it('create — POST /products/:ref/plans', async () => {
		const res = await api.post(`/products/${productRef}/plans`, {
			type: 'recurring',
			name: 'Test Plan',
			price: 1000,
			currency: 'USD',
			billingCycle: 'monthly',
		});
		expect(res.status).toBe(201);
		expect(res.data).toHaveProperty('reference');
		planRef = res.data['reference'] as string;
	});

	it('get — GET /products/:ref/plans/:ref', async () => {
		const res = await api.get(`/products/${productRef}/plans/${planRef}`);
		expect(res.status).toBe(200);
		expect(res.data['reference']).toBe(planRef);
	});

	it('update — PUT /products/:ref/plans/:ref', async () => {
		const res = await api.put(`/products/${productRef}/plans/${planRef}`, {
			name: 'Updated Plan',
		});
		expect(res.status).toBe(200);
	});

	it('listForProduct — GET /products/:ref/plans', async () => {
		const res = await api.get<{ plans: Record<string, unknown>[]; total: number }>(
			`/products/${productRef}/plans`,
		);
		expect(res.status).toBe(200);
		expect(res.data).toHaveProperty('plans');
		expect(res.data.plans.length).toBeGreaterThanOrEqual(1);
	});

	it('delete — DELETE /products/:ref/plans/:ref', async () => {
		const res = await api.del(`/products/${productRef}/plans/${planRef}`);
		expect(res.status).toBe(200);
		planRef = '';
	});
});
