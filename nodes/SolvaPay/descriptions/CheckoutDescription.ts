import type { INodeProperties } from 'n8n-workflow';

export const checkoutOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['checkout'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a checkout session',
				action: 'Create a checkout session',
			},
		],
		default: 'create',
	},
];

export const checkoutFields: INodeProperties[] = [
	{
		displayName: 'Customer Reference',
		name: 'customerRef',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'cus_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['checkout'],
				operation: ['create'],
			},
		},
		description: 'The customer reference (cus_…)',
	},
	{
		displayName: 'Product Reference',
		name: 'productRef',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'prd_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['checkout'],
				operation: ['create'],
			},
		},
		description: 'The product reference (prd_…)',
	},
	{
		displayName: 'Plan Reference',
		name: 'planRef',
		type: 'string',
		default: '',
		placeholder: 'pln_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['checkout'],
				operation: ['create'],
			},
		},
		description:
			'The plan reference (pln_…). Leave blank to show a plan picker to the customer.',
	},
	{
		displayName: 'Return URL',
		name: 'returnUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/success',
		displayOptions: {
			show: {
				resource: ['checkout'],
				operation: ['create'],
			},
		},
		description: 'URL to redirect the customer to after checkout',
	},
];
