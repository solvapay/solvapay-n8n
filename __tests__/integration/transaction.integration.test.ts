import { skipIfNoKey } from './helpers/apiClient';

skipIfNoKey();

describe('Transaction resource (integration)', () => {
	it('note: no SDK endpoint for transactions — tested via unit tests only', () => {
		expect(true).toBe(true);
	});
});
