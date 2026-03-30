import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { solvaPayRequest, ensureCustomer } from './GenericFunctions';

import { customerOperations, customerFields } from './descriptions/CustomerDescription';
import { productOperations, productFields } from './descriptions/ProductDescription';
import { planOperations, planFields } from './descriptions/PlanDescription';
import { checkoutOperations, checkoutFields } from './descriptions/CheckoutDescription';
import { purchaseOperations, purchaseFields } from './descriptions/PurchaseDescription';
import { usageOperations, usageFields } from './descriptions/UsageDescription';

export class SolvaPay implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SolvaPay',
		name: 'solvaPay',
		icon: 'file:solvapay.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage payments, subscriptions, usage billing, and automation with SolvaPay',
		defaults: {
			name: 'SolvaPay',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'solvaPayApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Checkout', value: 'checkout' },
					{ name: 'Customer', value: 'customer' },
					{ name: 'Plan', value: 'plan' },
					{ name: 'Product', value: 'product' },
					{ name: 'Purchase', value: 'purchase' },
					{ name: 'Usage', value: 'usage' },
				],
				default: 'customer',
			},
			...customerOperations,
			...customerFields,
			...productOperations,
			...productFields,
			...planOperations,
			...planFields,
			...checkoutOperations,
			...checkoutFields,
			...purchaseOperations,
			...purchaseFields,
			...usageOperations,
			...usageFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'customer') {
					responseData = await executeCustomer.call(this, operation, i);
				} else if (resource === 'product') {
					responseData = await executeProduct.call(this, operation, i);
				} else if (resource === 'plan') {
					responseData = await executePlan.call(this, operation, i);
				} else if (resource === 'checkout') {
					responseData = await executeCheckout.call(this, operation, i);
				} else if (resource === 'purchase') {
					responseData = await executePurchase.call(this, operation, i);
				} else if (resource === 'usage') {
					responseData = await executeUsage.call(this, operation, i);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
						itemIndex: i,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function executeCustomer(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'ensure') {
		const email = this.getNodeParameter('email', i) as string;
		const name = this.getNodeParameter('name', i, '') as string;
		const externalRef = this.getNodeParameter('externalRef', i, '') as string;
		return ensureCustomer.call(this, email, name || undefined, externalRef || undefined);
	}

	if (operation === 'create') {
		const email = this.getNodeParameter('email', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const body: IDataObject = { email, ...additionalFields };
		if (typeof body['metadata'] === 'string') {
			body['metadata'] = JSON.parse(body['metadata'] as string);
		}
		return solvaPayRequest.call(this, 'POST', '/customers', body);
	}

	if (operation === 'get') {
		const reference = this.getNodeParameter('reference', i) as string;
		return solvaPayRequest.call(this, 'GET', `/customers/${reference}`);
	}

	if (operation === 'createSession') {
		const reference = this.getNodeParameter('reference', i) as string;
		return solvaPayRequest.call(this, 'POST', '/customers/customer-sessions', {
			customerRef: reference,
		});
	}

	throw new NodeOperationError(this.getNode(), `Unknown customer operation: ${operation}`, {
		itemIndex: i,
	});
}

async function executeProduct(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const name = this.getNodeParameter('name', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		return solvaPayRequest.call(this, 'POST', '/products', { name, ...additionalFields });
	}

	if (operation === 'get') {
		const reference = this.getNodeParameter('reference', i) as string;
		return solvaPayRequest.call(this, 'GET', `/products/${reference}`);
	}

	if (operation === 'update') {
		const reference = this.getNodeParameter('reference', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return solvaPayRequest.call(this, 'PUT', `/products/${reference}`, updateFields);
	}

	if (operation === 'delete') {
		const reference = this.getNodeParameter('reference', i) as string;
		return solvaPayRequest.call(this, 'DELETE', `/products/${reference}`);
	}

	if (operation === 'list') {
		return solvaPayRequest.call(this, 'GET', '/products');
	}

	throw new NodeOperationError(this.getNode(), `Unknown product operation: ${operation}`, {
		itemIndex: i,
	});
}

async function executePlan(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const productRef = this.getNodeParameter('productRef', i) as string;
		const type = this.getNodeParameter('type', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = { type, ...additionalFields };

		if (typeof body['features'] === 'string') {
			body['features'] = JSON.parse(body['features'] as string);
		}
		if (typeof body['metadata'] === 'string') {
			body['metadata'] = JSON.parse(body['metadata'] as string);
		}

		const typeSpecificFields = [
			'price',
			'currency',
			'billingCycle',
			'setupFee',
			'trialDays',
			'pricePerUnit',
			'billingModel',
			'freeUnits',
			'usageLimit',
			'basePrice',
		];
		for (const field of typeSpecificFields) {
			const value = this.getNodeParameter(field, i, undefined) as unknown;
			if (value !== undefined && value !== '' && value !== 0) {
				const apiField = field === 'usageLimit' ? 'limit' : field;
				body[apiField] = value;
			}
		}

		return solvaPayRequest.call(this, 'POST', `/products/${productRef}/plans`, body);
	}

	if (operation === 'get') {
		const productRef = this.getNodeParameter('productRef', i) as string;
		const planRef = this.getNodeParameter('planRef', i) as string;
		return solvaPayRequest.call(this, 'GET', `/products/${productRef}/plans/${planRef}`);
	}

	if (operation === 'update') {
		const productRef = this.getNodeParameter('productRef', i) as string;
		const planRef = this.getNodeParameter('planRef', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		if (typeof updateFields['features'] === 'string') {
			updateFields['features'] = JSON.parse(updateFields['features'] as string);
		}
		if (typeof updateFields['metadata'] === 'string') {
			updateFields['metadata'] = JSON.parse(updateFields['metadata'] as string);
		}
		if (updateFields['usageLimit'] !== undefined) {
			updateFields['limit'] = updateFields['usageLimit'];
			delete updateFields['usageLimit'];
		}
		return solvaPayRequest.call(
			this,
			'PUT',
			`/products/${productRef}/plans/${planRef}`,
			updateFields,
		);
	}

	if (operation === 'delete') {
		const productRef = this.getNodeParameter('productRef', i) as string;
		const planRef = this.getNodeParameter('planRef', i) as string;
		return solvaPayRequest.call(this, 'DELETE', `/products/${productRef}/plans/${planRef}`);
	}

	if (operation === 'listForProduct') {
		const productRef = this.getNodeParameter('productRef', i) as string;
		return solvaPayRequest.call(this, 'GET', `/products/${productRef}/plans`);
	}

	throw new NodeOperationError(this.getNode(), `Unknown plan operation: ${operation}`, {
		itemIndex: i,
	});
}

async function executeCheckout(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const customerRef = this.getNodeParameter('customerRef', i) as string;
		const productRef = this.getNodeParameter('productRef', i) as string;
		const planRef = this.getNodeParameter('planRef', i, '') as string;
		const returnUrl = this.getNodeParameter('returnUrl', i, '') as string;

		const body: IDataObject = { customerRef, productRef };
		if (planRef) body['planRef'] = planRef;
		if (returnUrl) body['returnUrl'] = returnUrl;

		return solvaPayRequest.call(this, 'POST', '/checkout-sessions', body);
	}

	throw new NodeOperationError(this.getNode(), `Unknown checkout operation: ${operation}`, {
		itemIndex: i,
	});
}

async function executePurchase(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		const purchaseId = this.getNodeParameter('purchaseId', i) as string;
		return solvaPayRequest.call(this, 'GET', `/purchases/${purchaseId}`);
	}

	if (operation === 'list') {
		const status = this.getNodeParameter('status', i, '') as string;
		const qs: IDataObject = {};
		if (status) qs['status'] = status;
		return solvaPayRequest.call(this, 'GET', '/purchases', undefined, qs);
	}

	if (operation === 'listByCustomer') {
		const customerRef = this.getNodeParameter('customerRef', i) as string;
		const status = this.getNodeParameter('status', i, '') as string;
		const qs: IDataObject = {};
		if (status) qs['status'] = status;
		return solvaPayRequest.call(
			this,
			'GET',
			`/purchases/customer/${customerRef}`,
			undefined,
			qs,
		);
	}

	if (operation === 'listByProduct') {
		const productRef = this.getNodeParameter('productRef', i) as string;
		const status = this.getNodeParameter('status', i, '') as string;
		const qs: IDataObject = {};
		if (status) qs['status'] = status;
		return solvaPayRequest.call(
			this,
			'GET',
			`/purchases/product/${productRef}`,
			undefined,
			qs,
		);
	}

	if (operation === 'cancel') {
		const purchaseId = this.getNodeParameter('purchaseId', i) as string;
		const reason = this.getNodeParameter('reason', i, '') as string;
		const body: IDataObject = {};
		if (reason) body['reason'] = reason;
		return solvaPayRequest.call(this, 'POST', `/purchases/${purchaseId}/cancel`, body);
	}

	throw new NodeOperationError(this.getNode(), `Unknown purchase operation: ${operation}`, {
		itemIndex: i,
	});
}

async function executeUsage(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'record') {
		const customerRef = this.getNodeParameter('customerRef', i) as string;
		const productRef = this.getNodeParameter('productRef', i) as string;
		const outcome = this.getNodeParameter('outcome', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = { customerRef, productRef, outcome, ...additionalFields };
		return solvaPayRequest.call(this, 'POST', '/usages', body);
	}

	if (operation === 'recordBulk') {
		const eventsData = this.getNodeParameter('events', i, {}) as IDataObject;
		const events = (eventsData['event'] as IDataObject[]) ?? [];
		return solvaPayRequest.call(this, 'POST', '/usages/bulk', { events } as IDataObject);
	}

	if (operation === 'checkLimits') {
		const customerRef = this.getNodeParameter('customerRef', i) as string;
		const productRef = this.getNodeParameter('productRef', i) as string;
		return solvaPayRequest.call(this, 'POST', '/limits', {
			customerRef,
			productRef,
		});
	}

	throw new NodeOperationError(this.getNode(), `Unknown usage operation: ${operation}`, {
		itemIndex: i,
	});
}
