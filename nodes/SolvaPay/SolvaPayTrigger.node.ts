import { createHmac, timingSafeEqual } from 'crypto';
import type {
	IWebhookFunctions,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { solvaPayRequest } from './GenericFunctions';

const WEBHOOK_API_AVAILABLE = false;

export class SolvaPayTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SolvaPay Trigger',
		name: 'solvaPayTrigger',
		icon: 'file:solvapay.svg',
		group: ['trigger'],
		version: 1,
		usableAsTool: true,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a SolvaPay event occurs',
		defaults: {
			name: 'SolvaPay Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'solvaPayApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'Copy this webhook URL and add it in your <a href="https://app.solvapay.com/settings/webhooks" target="_blank">SolvaPay Dashboard → Settings → Webhooks</a>. Select the matching event type.<br/><br/>Webhook URL: <code>={{$nodeWebhookUrl}}</code>',
				name: 'webhookNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {},
				},
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'payment.succeeded',
				options: [
					{
						name: 'Payment Failed',
						value: 'payment.failed',
					},
					{
						name: 'Payment Succeeded',
						value: 'payment.succeeded',
					},
					{
						name: 'Purchase Cancelled',
						value: 'purchase.cancelled',
					},
					{
						name: 'Purchase Created',
						value: 'purchase.created',
					},
					{
						name: 'Purchase Updated',
						value: 'purchase.updated',
					},
					{
						name: 'Transaction Completed',
						value: 'transaction.completed',
					},
				],
				description: 'The SolvaPay event to listen for',
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description:
					'Whether to verify the HMAC signature. Requires Webhook Secret in the credential.',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				if (!WEBHOOK_API_AVAILABLE) {
					return true;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const webhookData = this.getWorkflowStaticData('node');

				try {
					const webhooks = (await solvaPayRequest.call(
						this as unknown as import('n8n-workflow').IExecuteFunctions,
						'GET',
						'/webhooks',
					)) as IDataObject[];

					for (const webhook of webhooks) {
						if (webhook['url'] === webhookUrl) {
							webhookData['webhookId'] = webhook['id'] as string;
							return true;
						}
					}
				} catch {
					// Webhook API may not be available
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				if (!WEBHOOK_API_AVAILABLE) {
					const webhookUrl = this.getNodeWebhookUrl('default') as string;
					const webhookData = this.getWorkflowStaticData('node');
					webhookData['webhookUrl'] = webhookUrl;
					return true;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;
				const webhookData = this.getWorkflowStaticData('node');

				try {
					const response = (await solvaPayRequest.call(
						this as unknown as import('n8n-workflow').IExecuteFunctions,
						'POST',
						'/webhooks',
						{
							url: webhookUrl,
							events: [event],
						} as IDataObject,
					)) as IDataObject;

					webhookData['webhookId'] = response['id'] as string;
					if (response['secret']) {
						webhookData['webhookSecret'] = response['secret'] as string;
					}
					return true;
				} catch (error) {
					throw new NodeOperationError(
						this.getNode(),
						`Failed to register webhook: ${(error as JsonObject)['message'] ?? 'Unknown error'}`,
					);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				if (!WEBHOOK_API_AVAILABLE) {
					const webhookData = this.getWorkflowStaticData('node');
					delete webhookData['webhookUrl'];
					return true;
				}

				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData['webhookId'] as string;

				if (!webhookId) {
					return true;
				}

				try {
					await solvaPayRequest.call(
						this as unknown as import('n8n-workflow').IExecuteFunctions,
						'DELETE',
						`/webhooks/${webhookId}`,
					);
				} catch {
					// Webhook may already have been deleted
				}

				delete webhookData['webhookId'];
				delete webhookData['webhookSecret'];
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const verifySig = this.getNodeParameter('verifySignature') as boolean;

		if (verifySig) {
			const headers = this.getHeaderData() as IDataObject;
			const sig = headers['x-solvapay-signature'] as string | undefined;
			const creds = await this.getCredentials('solvaPayApi');
			const secret = creds['webhookSecret'] as string;

			if (!secret) {
				throw new NodeOperationError(
					this.getNode(),
					'Webhook Secret is not set in the SolvaPay API credential.',
				);
			}

			const rawBody =
				(req as unknown as Record<string, unknown>)['rawBody'] ?? JSON.stringify(body);
			const expected = createHmac('sha256', secret)
				.update(rawBody as string)
				.digest('hex');
			const provided = sig?.replace('sha256=', '') ?? '';

			if (
				expected.length !== provided.length ||
				!timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(provided, 'utf8'))
			) {
				throw new NodeOperationError(
					this.getNode(),
					'Webhook signature verification failed.',
				);
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
