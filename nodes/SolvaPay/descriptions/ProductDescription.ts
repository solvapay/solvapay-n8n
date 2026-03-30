import type { INodeProperties } from 'n8n-workflow';

export const productOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new product',
				action: 'Create a product',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a product',
				action: 'Delete a product',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a product by reference',
				action: 'Get a product',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all products',
				action: 'List products',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a product',
				action: 'Update a product',
			},
		],
		default: 'create',
	},
];

export const productFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	//        create
	// ------------------------------------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		description: 'Name of the product',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the product',
			},
		],
	},

	// ------------------------------------------------------------------
	//        get / delete / getBalance
	// ------------------------------------------------------------------
	{
		displayName: 'Product Reference',
		name: 'reference',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'prd_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['get', 'delete'],
			},
		},
		description: 'The product reference (prd_…)',
	},

	// ------------------------------------------------------------------
	//        update
	// ------------------------------------------------------------------
	{
		displayName: 'Product Reference',
		name: 'reference',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'prd_XXXXXXXX',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		description: 'The product reference (prd_…)',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the product',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the product',
			},
		],
	},
];
