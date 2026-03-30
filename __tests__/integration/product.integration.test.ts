import { api, skipIfNoKey } from './helpers/apiClient';

skipIfNoKey();

describe('Product resource (integration)', () => {
	let productRef: string;

	afterAll(async () => {
		if (productRef) {
			await api.del(`/products/${productRef}`).catch(() => {});
		}
	});

	it('create — POST /products', async () => {
		const res = await api.post('/products', {
			name: `n8n-test-product-${Date.now()}`,
			description: 'Created by solvapay-n8n integration tests',
		});
		expect(res.status).toBe(201);
		expect(res.data).toHaveProperty('reference');
		productRef = res.data['reference'] as string;
	});

	it('get — GET /products/:ref', async () => {
		const res = await api.get(`/products/${productRef}`);
		expect(res.status).toBe(200);
		expect(res.data['reference']).toBe(productRef);
	});

	it('update — PUT /products/:ref', async () => {
		const res = await api.put(`/products/${productRef}`, {
			description: 'Updated by test',
		});
		expect(res.status).toBe(200);
	});

	it('list — GET /products', async () => {
		const res = await api.get<{ products: Record<string, unknown>[] }>('/products');
		expect(res.status).toBe(200);
		const data = res.data;
		const hasArray = Array.isArray(data) || (data && 'products' in data);
		expect(hasArray).toBe(true);
	});

	it('delete — DELETE /products/:ref', async () => {
		const res = await api.del(`/products/${productRef}`);
		expect([200, 204]).toContain(res.status);
		productRef = '';
	});
});
