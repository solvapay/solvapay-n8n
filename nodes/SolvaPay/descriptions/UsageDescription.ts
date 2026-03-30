import type { INodeProperties } from 'n8n-workflow';

export const usageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['usage'],
			},
		},
		options: [
			{
				name: 'Record',
				value: 'record',
				description: 'Record a single usage event',
				action: 'Record usage',
			},
			{
				name: 'Record Bulk',
				value: 'recordBulk',
				description: 'Record multiple usage events',
				action: 'Record bulk usage',
			},
			{
				name: 'Check Limits',
				value: 'checkLimits',
				description: 'Check usage limits for a customer and product',
				action: 'Check usage limits',
			},
		],
		default: 'record',
	},
];

export const usageFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//        record
	// ------------------------------------------------------------------
	{
		displayName: 'Customer Reference',
		name: 'customerRef',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'cus_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['usage'],
				operation: ['record'],
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
				resource: ['usage'],
				operation: ['record'],
			},
		},
		description: 'The product reference (prd_…)',
	},
	{
		displayName: 'Outcome',
		name: 'outcome',
		type: 'options',
		required: true,
		default: 'success',
		displayOptions: {
			show: {
				resource: ['usage'],
				operation: ['record'],
			},
		},
		options: [
			{ name: 'Success', value: 'success' },
			{ name: 'Failure', value: 'failure' },
			{ name: 'Error', value: 'error' },
		],
		description: 'The outcome of the usage event',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['usage'],
				operation: ['record'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'string',
				default: '',
				description: 'Name of the action being tracked',
			},
			{
				displayName: 'Action Duration',
				name: 'actionDuration',
				type: 'number',
				default: 0,
				description: 'Duration in milliseconds',
			},
			{
				displayName: 'Request ID',
				name: 'requestId',
				type: 'string',
				default: '',
				description: 'Idempotency key to prevent duplicate events',
			},
		],
	},

	// ------------------------------------------------------------------
	//        recordBulk
	// ------------------------------------------------------------------
	{
		displayName: 'Events',
		name: 'events',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['usage'],
				operation: ['recordBulk'],
			},
		},
		options: [
			{
				displayName: 'Event',
				name: 'event',
				values: [
					{
						displayName: 'Action',
						name: 'action',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Action Duration',
						name: 'actionDuration',
						type: 'number',
						default: 0,
						description: 'Duration in milliseconds',
					},
					{
						displayName: 'Customer Reference',
						name: 'customerRef',
						type: 'string',
							required:	true,
						default: '',
						placeholder: 'cus_XXXXXXXX',
					},
					{
						displayName: 'Outcome',
						name: 'outcome',
						type: 'options',
							required:	true,
						default: 'success',
						options: [
							{
								name: 'Success',
								value: 'success',
							},
							{
								name: 'Failure',
								value: 'failure',
							},
							{
								name: 'Error',
								value: 'error',
							},
						]
					},
					{
						displayName: 'Product Reference',
						name: 'productRef',
						type: 'string',
							required:	true,
						default: '',
						placeholder: 'prd_XXXXXXXX',
					},
					{
						displayName: 'Request ID',
						name: 'requestId',
						type: 'string',
						default: '',
						description: 'Idempotency key',
					},
			],
			},
		],
		description: 'Usage events to record in bulk',
	},

	// ------------------------------------------------------------------
	//        checkLimits
	// ------------------------------------------------------------------
	{
		displayName: 'Customer Reference',
		name: 'customerRef',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'cus_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['usage'],
				operation: ['checkLimits'],
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
				resource: ['usage'],
				operation: ['checkLimits'],
			},
		},
		description:
			'The product reference (prd_…). Use the checkoutUrl in the response to send customers an upgrade link when they have hit their limit.',
	},
];
