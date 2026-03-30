import type { INodeProperties } from 'n8n-workflow';

const statusOptions = [
	{ name: 'Any', value: '' },
	{ name: 'Active', value: 'active' },
	{ name: 'Canceled', value: 'canceled' },
	{ name: 'Expired', value: 'expired' },
	{ name: 'Past Due', value: 'past_due' },
];

export const purchaseOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['purchase'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a purchase',
				action: 'Cancel a purchase',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a purchase by ID',
				action: 'Get a purchase',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all purchases',
				action: 'List purchases',
			},
			{
				name: 'List by Customer',
				value: 'listByCustomer',
				description: 'List purchases for a customer',
				action: 'List purchases by customer',
			},
			{
				name: 'List by Product',
				value: 'listByProduct',
				description: 'List purchases for a product',
				action: 'List purchases by product',
			},
		],
		default: 'list',
	},
];

export const purchaseFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//        get / cancel
	// ------------------------------------------------------------------
	{
		displayName: 'Purchase ID',
		name: 'purchaseId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['get', 'cancel'],
			},
		},
	},

	// ------------------------------------------------------------------
	//        cancel: reason
	// ------------------------------------------------------------------
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['cancel'],
			},
		},
		description: 'Optional reason for cancellation',
	},

	// ------------------------------------------------------------------
	//        list
	// ------------------------------------------------------------------
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		default: '',
		options: statusOptions,
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['list'],
			},
		},
		description: 'Filter by purchase status',
	},

	// ------------------------------------------------------------------
	//        listByCustomer
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
				resource: ['purchase'],
				operation: ['listByCustomer'],
			},
		},
		description: 'The customer reference (cus_…)',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		default: '',
		options: statusOptions,
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['listByCustomer'],
			},
		},
		description: 'Filter by purchase status',
	},

	// ------------------------------------------------------------------
	//        listByProduct
	// ------------------------------------------------------------------
	{
		displayName: 'Product Reference',
		name: 'productRef',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'prd_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['listByProduct'],
			},
		},
		description: 'The product reference (prd_…)',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		default: '',
		options: statusOptions,
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['listByProduct'],
			},
		},
		description: 'Filter by purchase status',
	},
];
