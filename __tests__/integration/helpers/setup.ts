/* eslint-disable */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });

if (!process.env['SOLVAPAY_TEST_API_KEY']) {
	console.warn(
		'SOLVAPAY_TEST_API_KEY not set in .env — integration tests will be skipped.',
	);
}
