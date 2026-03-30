import { createHmac } from 'crypto';
import type { IDataObject } from 'n8n-workflow';
import { SolvaPayTrigger } from '../../nodes/SolvaPay/SolvaPayTrigger.node';
import {
	createMockWebhookFunctions,
	createMockHookFunctions,
} from './helpers/mockExecuteFunctions';

function signPayload(body: string, secret: string): string {
	return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

// ───────────────────────────── webhook() ─────────────────────────────

describe('SolvaPayTrigger webhook()', () => {
	const trigger = new SolvaPayTrigger();

	it('passes through body when signature verification is disabled', async () => {
		const body = { event: 'payment.succeeded', data: { amount: 2000 } };
		const mock = createMockWebhookFunctions({
			body,
			params: { verifySignature: false },
			credentials: { apiKey: 'sk_test', webhookSecret: '' },
		});

		const result = await trigger.webhook.call(mock);
		expect(result.workflowData).toBeDefined();
		expect(result.workflowData![0][0].json).toEqual(body);
	});

	it('passes through body when signature is valid', async () => {
		const body = { event: 'payment.succeeded', data: { amount: 2000 } };
		const rawBody = JSON.stringify(body);
		const secret = 'whsec_test_secret_123';
		const signature = signPayload(rawBody, secret);

		const mock = createMockWebhookFunctions({
			body,
			rawBody,
			headers: { 'x-solvapay-signature': signature },
			params: { verifySignature: true },
			credentials: { apiKey: 'sk_test', webhookSecret: secret },
		});

		const result = await trigger.webhook.call(mock);
		expect(result.workflowData![0][0].json).toEqual(body);
	});

	it('throws when webhook secret is not set but verification is enabled', async () => {
		const mock = createMockWebhookFunctions({
			body: { event: 'test' },
			headers: { 'x-solvapay-signature': 'sha256=abc' },
			params: { verifySignature: true },
			credentials: { apiKey: 'sk_test', webhookSecret: '' },
		});

		await expect(trigger.webhook.call(mock)).rejects.toThrow(
			'Webhook Secret is not set',
		);
	});

	it('throws when signature is invalid', async () => {
		const body = { event: 'payment.succeeded' };
		const rawBody = JSON.stringify(body);
		const secret = 'whsec_real_secret';

		const mock = createMockWebhookFunctions({
			body,
			rawBody,
			headers: { 'x-solvapay-signature': 'sha256=deadbeef0000000000000000000000000000000000000000000000000000dead' },
			params: { verifySignature: true },
			credentials: { apiKey: 'sk_test', webhookSecret: secret },
		});

		await expect(trigger.webhook.call(mock)).rejects.toThrow(
			'Webhook signature verification failed',
		);
	});

	it('throws when signature header is missing', async () => {
		const body = { event: 'payment.succeeded' };
		const rawBody = JSON.stringify(body);
		const secret = 'whsec_real_secret';

		const mock = createMockWebhookFunctions({
			body,
			rawBody,
			headers: {},
			params: { verifySignature: true },
			credentials: { apiKey: 'sk_test', webhookSecret: secret },
		});

		await expect(trigger.webhook.call(mock)).rejects.toThrow(
			'Webhook signature verification failed',
		);
	});

	it('uses JSON.stringify(body) when rawBody is not available', async () => {
		const body = { event: 'purchase.created', data: { id: 'pur_1' } };
		const secret = 'whsec_test';
		const expectedRaw = JSON.stringify(body);
		const signature = signPayload(expectedRaw, secret);

		const mock = createMockWebhookFunctions({
			body,
			headers: { 'x-solvapay-signature': signature },
			params: { verifySignature: true },
			credentials: { apiKey: 'sk_test', webhookSecret: secret },
		});

		const result = await trigger.webhook.call(mock);
		expect(result.workflowData![0][0].json).toEqual(body);
	});
});

// ───────────────────────── webhookMethods (flag=false) ───────────────

describe('SolvaPayTrigger webhookMethods (WEBHOOK_API_AVAILABLE=false)', () => {
	const trigger = new SolvaPayTrigger();

	it('checkExists returns true (stub)', async () => {
		const mock = createMockHookFunctions({});
		const result = await trigger.webhookMethods.default.checkExists.call(mock);
		expect(result).toBe(true);
	});

	it('create stores webhookUrl in static data and returns true', async () => {
		const staticData: IDataObject = {};
		const mock = createMockHookFunctions({
			webhookUrl: 'https://n8n.test/webhook/abc',
			staticData,
		});

		const result = await trigger.webhookMethods.default.create.call(mock);
		expect(result).toBe(true);
		expect(staticData['webhookUrl']).toBe('https://n8n.test/webhook/abc');
	});

	it('delete clears webhookUrl from static data and returns true', async () => {
		const staticData: IDataObject = { webhookUrl: 'https://n8n.test/webhook/abc' };
		const mock = createMockHookFunctions({ staticData });

		const result = await trigger.webhookMethods.default.delete.call(mock);
		expect(result).toBe(true);
		expect(staticData['webhookUrl']).toBeUndefined();
	});
});
