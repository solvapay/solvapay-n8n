import { api, skipIfNoKey } from './helpers/apiClient';

skipIfNoKey();

describe('Purchase resource (integration)', () => {
	it('list — GET /purchases', async () => {
		const res = await api.get<{ purchases: Record<string, unknown>[]; total: number }>(
			'/purchases',
			{ limit: 5 },
		);
		expect(res.status).toBe(200);
		const data = res.data;
		const hasList = Array.isArray(data) || (data && 'purchases' in data);
		expect(hasList).toBe(true);
	});

	it('get — GET /purchases/:id (if any exist)', async () => {
		const list = await api.get<{ purchases: Record<string, unknown>[] }>(
			'/purchases',
			{ limit: 1 },
		);
		const items = Array.isArray(list.data)
			? list.data as Record<string, unknown>[]
			: (list.data.purchases ?? []);
		if (items.length > 0) {
			const id = (items[0]['reference'] ?? items[0]['purchaseId'] ?? items[0]['id']) as string;
			const res = await api.get(`/purchases/${id}`);
			expect(res.status).toBe(200);
		}
	});

	it('listByCustomer — GET /purchases/customer/:ref (read-only)', async () => {
		const custs = await api.get('/customers', { limit: 1 });
		const custRef = custs.data['reference'] as string | undefined;
		if (custRef) {
			const res = await api.get(`/purchases/customer/${custRef}`);
			expect(res.status).toBe(200);
		}
	});

	it('listByProduct — GET /purchases/product/:ref (read-only)', async () => {
		const prods = await api.get<Record<string, unknown>[]>('/products');
		const items = Array.isArray(prods.data) ? prods.data : [];
		if (items.length > 0) {
			const prodRef = items[0]['reference'] as string;
			const res = await api.get(`/purchases/product/${prodRef}`);
			expect(res.status).toBe(200);
		}
	});
});
