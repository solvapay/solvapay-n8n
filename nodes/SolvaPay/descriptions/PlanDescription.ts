import type { INodeProperties } from 'n8n-workflow';

const billingCycleOptions = [
	{ name: 'Custom', value: 'custom' },
	{ name: 'Monthly', value: 'monthly' },
	{ name: 'Quarterly', value: 'quarterly' },
	{ name: 'Weekly', value: 'weekly' },
	{ name: 'Yearly', value: 'yearly' },
];

const statusOptions = [
	{ name: 'Active', value: 'active' },
	{ name: 'Inactive', value: 'inactive' },
	{ name: 'Archived', value: 'archived' },
];

export const planOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['plan'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new plan under a product',
				action: 'Create a plan',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a plan',
				action: 'Delete a plan',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a plan by reference',
				action: 'Get a plan',
			},
			{
				name: 'List for Product',
				value: 'listForProduct',
				description: 'List all plans under a product',
				action: 'List plans for a product',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a plan',
				action: 'Update a plan',
			},
		],
		default: 'create',
	},
];

export const planFields: INodeProperties[] = [
	{
		displayName: 'Product Reference',
		name: 'productRef',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'prd_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create', 'get', 'update', 'delete', 'listForProduct'],
			},
		},
		description: 'The product reference (prd_…)',
	},
	{
		displayName: 'Plan Reference',
		name: 'planRef',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'pln_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The plan reference (pln_…)',
	},
	{
		displayName: 'Plan Type',
		name: 'type',
		type: 'options',
		default: 'recurring',
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Hybrid', value: 'hybrid' },
			{ name: 'One-Time', value: 'one-time' },
			{ name: 'Recurring', value: 'recurring' },
			{ name: 'Usage-Based', value: 'usage-based' },
		],
		description: 'The billing type for this plan',
	},
	{
		displayName: 'Price',
		name: 'price',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['recurring', 'one-time'],
			},
		},
		description: 'Price in the lowest currency unit (e.g. 2000 = $20.00 USD)',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		default: 'USD',
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
			},
		},
		description: 'ISO 4217 currency code (e.g. USD, EUR, SEK)',
	},
	{
		displayName: 'Billing Cycle',
		name: 'billingCycle',
		type: 'options',
		default: 'monthly',
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['recurring', 'usage-based', 'hybrid'],
			},
		},
		options: billingCycleOptions,
		description: 'How often the customer is billed',
	},
	{
		displayName: 'Setup Fee',
		name: 'setupFee',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['recurring', 'one-time'],
			},
		},
		description: 'One-time setup fee in the lowest currency unit (e.g. 500 = $5.00 USD)',
	},
	{
		displayName: 'Trial Days',
		name: 'trialDays',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['recurring'],
			},
		},
		description: 'Number of free trial days',
	},
	{
		displayName: 'Price per Unit',
		name: 'pricePerUnit',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['usage-based', 'hybrid'],
			},
		},
		description: 'Price per unit in the lowest currency unit (e.g. 10 = $0.10 USD)',
	},
	{
		displayName: 'Billing Model',
		name: 'billingModel',
		type: 'options',
		default: 'post-paid',
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['usage-based'],
			},
		},
		options: [
			{ name: 'Post-Paid', value: 'post-paid' },
			{ name: 'Pre-Paid', value: 'pre-paid' },
		],
		description: 'Whether the customer pays before or after usage',
	},
	{
		displayName: 'Free Units',
		name: 'freeUnits',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['usage-based', 'hybrid'],
			},
		},
		description: 'Number of free units included',
	},
	{
		displayName: 'Usage Limit',
		name: 'usageLimit',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['usage-based', 'hybrid'],
			},
		},
		description: 'Maximum usage units allowed (0 = unlimited)',
	},
	{
		displayName: 'Base Price',
		name: 'basePrice',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
				type: ['hybrid'],
			},
		},
		description: 'Recurring base price in the lowest currency unit (e.g. 1000 = $10.00 USD)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Default',
				name: 'default',
				type: 'boolean',
				default: false,
				description: 'Whether this is the default plan for the product',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the plan',
			},
			{
				displayName: 'Features',
				name: 'features',
				type: 'json',
				default: '{}',
				description: 'Feature flags as JSON',
			},
			{
				displayName: 'Is Free Tier',
				name: 'isFreeTier',
				type: 'boolean',
				default: false,
				description: 'Whether this is a free tier plan',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'Custom metadata as JSON',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Display name for the plan',
			},
			{
				displayName: 'Rollover Unused Units',
				name: 'rolloverUnusedUnits',
				type: 'boolean',
				default: false,
				description: 'Whether unused units roll over to the next billing period',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'active',
				options: statusOptions,
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Base Price',
				name: 'basePrice',
				type: 'number',
				default: 0,
				description: 'Recurring base price in the lowest currency unit (e.g. 1000 = $10.00 USD)',
			},
			{
				displayName: 'Billing Cycle',
				name: 'billingCycle',
				type: 'options',
				default: 'monthly',
				options: billingCycleOptions,
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				description: 'ISO 4217 currency code',
			},
			{
				displayName: 'Default',
				name: 'default',
				type: 'boolean',
				default: false,
				description: 'Whether this is the default plan for the product',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the plan',
			},
			{
				displayName: 'Features',
				name: 'features',
				type: 'json',
				default: '{}',
				description: 'Feature flags as JSON',
			},
			{
				displayName: 'Free Units',
				name: 'freeUnits',
				type: 'number',
				default: 0,
				description: 'Number of free units included',
			},
			{
				displayName: 'Is Free Tier',
				name: 'isFreeTier',
				type: 'boolean',
				default: false,
				description: 'Whether this is a free tier plan',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'Custom metadata as JSON',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Display name for the plan',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 0,
				description: 'Price in the lowest currency unit (e.g. 2000 = $20.00 USD)',
			},
			{
				displayName: 'Price per Unit',
				name: 'pricePerUnit',
				type: 'number',
				default: 0,
				description: 'Price per unit in the lowest currency unit (e.g. 10 = $0.10 USD)',
			},
			{
				displayName: 'Setup Fee',
				name: 'setupFee',
				type: 'number',
				default: 0,
				description: 'One-time setup fee in the lowest currency unit (e.g. 500 = $5.00 USD)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'active',
				options: statusOptions,
			},
			{
				displayName: 'Trial Days',
				name: 'trialDays',
				type: 'number',
				default: 0,
				description: 'Number of free trial days',
			},
			{
				displayName: 'Usage Limit',
				name: 'usageLimit',
				type: 'number',
				default: 0,
				description: 'Maximum usage units allowed (0 = unlimited)',
			},
		],
	},
];
