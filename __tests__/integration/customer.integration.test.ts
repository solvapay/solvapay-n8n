import { api, skipIfNoKey } from './helpers/apiClient';

skipIfNoKey();

describe('Customer resource (integration)', () => {
	let customerRef: string;
	const testEmail = `test+${Date.now()}@solvapay-n8n.test`;

	it('create — POST /customers', async () => {
		const res = await api.post('/customers', {
			email: testEmail,
			name: 'Integration Test User',
		});
		expect(res.status).toBe(201);
		expect(res.data).toHaveProperty('reference');
		customerRef = res.data['reference'] as string;
	});

	it('get by reference — GET /customers/:ref', async () => {
		const res = await api.get(`/customers/${customerRef}`);
		expect(res.status).toBe(200);
		expect(res.data['email']).toBe(testEmail);
	});

	it('get by query — GET /customers?reference=...', async () => {
		const res = await api.get('/customers', { reference: customerRef });
		expect(res.status).toBe(200);
		expect(res.data['reference']).toBe(customerRef);
	});

	it('get by email — GET /customers?email=...', async () => {
		const res = await api.get('/customers', { email: testEmail });
		expect(res.status).toBe(200);
	});

	it('createSession — POST /customers/customer-sessions', async () => {
		const res = await api.post('/customers/customer-sessions', {
			customerRef,
		});
		expect(res.status).toBe(201);
		expect(res.data).toHaveProperty('sessionId');
		expect(res.data).toHaveProperty('customerUrl');
	});
});
