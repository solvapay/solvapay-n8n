import { api, skipIfNoKey } from './helpers/apiClient';

skipIfNoKey();

describe('Checkout resource (integration)', () => {
	let customerRef: string;
	let productRef: string;
	let planRef: string;

	beforeAll(async () => {
		const [cust, prod] = await Promise.all([
			api.post('/customers', { email: `checkout+${Date.now()}@solvapay-n8n.test` }),
			api.post('/products', { name: `n8n-checkout-test-${Date.now()}` }),
		]);
		customerRef = cust.data['reference'] as string;
		productRef = prod.data['reference'] as string;

		const plan = await api.post(`/products/${productRef}/plans`, {
			type: 'recurring',
			name: 'Checkout Test Plan',
			price: 500,
			currency: 'USD',
			billingCycle: 'monthly',
		});
		planRef = plan.data['reference'] as string;
	});

	afterAll(async () => {
		await Promise.all([
			api.del(`/products/${productRef}/plans/${planRef}`).catch(() => {}),
		]);
		await api.del(`/products/${productRef}`).catch(() => {});
	});

	it('create — POST /checkout-sessions', async () => {
		const res = await api.post('/checkout-sessions', {
			customerRef,
			productRef,
			planRef,
		});
		expect(res.status).toBe(201);
		expect(res.data).toHaveProperty('checkoutUrl');
	});

	it('create without planRef — POST /checkout-sessions', async () => {
		const res = await api.post('/checkout-sessions', {
			customerRef,
			productRef,
		});
		expect([200, 201]).toContain(res.status);
	});
});
