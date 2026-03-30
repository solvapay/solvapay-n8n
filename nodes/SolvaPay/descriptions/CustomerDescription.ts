import type { INodeProperties } from 'n8n-workflow';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new customer',
				action: 'Create a customer',
			},
			{
				name: 'Create Portal Session',
				value: 'createSession',
				description: 'Create a hosted billing portal session for a customer',
				action: 'Create a portal session',
			},
			{
				name: 'Ensure Customer',
				value: 'ensure',
				description: 'Create a customer if they do not exist, or return the existing one',
				action: 'Ensure a customer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a customer by reference',
				action: 'Get a customer',
			},
		],
		default: 'ensure',
	},
];

export const customerFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//        ensure
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['ensure'],
			},
		},
		description: 'Email address of the customer',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['ensure'],
			},
		},
		description: 'Full name of the customer',
	},
	{
		displayName: 'External Ref',
		name: 'externalRef',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['ensure'],
			},
		},
		description: 'Your internal user ID — stored for lookup',
	},

	// ------------------------------------------------------------------
	//        create
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		description: 'Email address of the customer',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Full name of the customer',
			},
			{
				displayName: 'Telephone',
				name: 'telephone',
				type: 'string',
				default: '',
				description: 'Phone number of the customer',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'Key-value metadata as JSON',
			},
		],
	},

	// ------------------------------------------------------------------
	//        get / createSession
	// ------------------------------------------------------------------
	{
		displayName: 'Customer Reference',
		name: 'reference',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'cus_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get', 'createSession'],
			},
		},
		description: 'The customer reference (cus_…)',
	},
];
