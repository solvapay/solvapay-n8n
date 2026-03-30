import type {
	IExecuteFunctions,
	IWebhookFunctions,
	IHookFunctions,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

export interface MockParams {
	[key: string]: unknown;
}

export interface MockExecuteOptions {
	params?: MockParams;
	httpResponse?: unknown;
	httpError?: Error;
	continueOnFail?: boolean;
	inputItems?: INodeExecutionData[];
}

export function createMockExecuteFunctions(options: MockExecuteOptions = {}): IExecuteFunctions {
	const {
		params = {},
		httpResponse = {},
		httpError,
		continueOnFail = false,
		inputItems = [{ json: {} }],
	} = options;

	const httpMock = jest.fn().mockImplementation(() => {
		if (httpError) throw httpError;
		return Promise.resolve(httpResponse);
	});

	const mock = {
		getInputData: jest.fn().mockReturnValue(inputItems),
		getNodeParameter: jest.fn().mockImplementation((name: string, _index: number, fallback?: unknown) => {
			if (name in params) return params[name];
			return fallback;
		}),
		getNode: jest.fn().mockReturnValue({
			name: 'SolvaPay',
			type: 'n8n-nodes-solvapay.solvaPay',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		continueOnFail: jest.fn().mockReturnValue(continueOnFail),
		helpers: {
			httpRequestWithAuthentication: httpMock,
			constructExecutionMetaData: jest.fn().mockImplementation(
				(items: INodeExecutionData[], opts: { itemData: { item: number } }) =>
					items.map((item) => ({ ...item, pairedItem: opts.itemData })),
			),
			returnJsonArray: jest.fn().mockImplementation((data: IDataObject | IDataObject[]) => {
				if (Array.isArray(data)) return data.map((d) => ({ json: d }));
				return [{ json: data }];
			}),
		},
	} as unknown as IExecuteFunctions;

	return mock;
}

export function getHttpMock(mock: IExecuteFunctions): jest.Mock {
	return (mock.helpers as unknown as { httpRequestWithAuthentication: jest.Mock })
		.httpRequestWithAuthentication;
}

export interface MockWebhookOptions {
	body?: IDataObject;
	headers?: IDataObject;
	params?: MockParams;
	credentials?: IDataObject;
	rawBody?: string;
}

export function createMockWebhookFunctions(options: MockWebhookOptions = {}): IWebhookFunctions {
	const {
		body = {},
		headers = {},
		params = {},
		credentials = {},
		rawBody,
	} = options;

	const requestObj: Record<string, unknown> = {};
	if (rawBody !== undefined) requestObj['rawBody'] = rawBody;

	return {
		getRequestObject: jest.fn().mockReturnValue(requestObj),
		getBodyData: jest.fn().mockReturnValue(body),
		getHeaderData: jest.fn().mockReturnValue(headers),
		getNodeParameter: jest.fn().mockImplementation((name: string) => {
			if (name in params) return params[name];
			return undefined;
		}),
		getCredentials: jest.fn().mockResolvedValue(credentials),
		getNode: jest.fn().mockReturnValue({
			name: 'SolvaPay Trigger',
			type: 'n8n-nodes-solvapay.solvaPayTrigger',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		helpers: {
			returnJsonArray: jest.fn().mockImplementation((data: IDataObject | IDataObject[]) => {
				if (Array.isArray(data)) return data.map((d) => ({ json: d }));
				return [{ json: data }];
			}),
		},
	} as unknown as IWebhookFunctions;
}

export interface MockHookOptions {
	webhookUrl?: string;
	params?: MockParams;
	staticData?: IDataObject;
	httpResponse?: unknown;
	httpError?: Error;
}

export function createMockHookFunctions(options: MockHookOptions = {}): IHookFunctions {
	const {
		webhookUrl = 'https://n8n.example.com/webhook/test',
		params = {},
		staticData = {},
		httpResponse = {},
		httpError,
	} = options;

	const httpMock = jest.fn().mockImplementation(() => {
		if (httpError) throw httpError;
		return Promise.resolve(httpResponse);
	});

	return {
		getNodeWebhookUrl: jest.fn().mockReturnValue(webhookUrl),
		getNodeParameter: jest.fn().mockImplementation((name: string) => {
			if (name in params) return params[name];
			return undefined;
		}),
		getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
		getNode: jest.fn().mockReturnValue({
			name: 'SolvaPay Trigger',
			type: 'n8n-nodes-solvapay.solvaPayTrigger',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		helpers: {
			httpRequestWithAuthentication: httpMock,
		},
	} as unknown as IHookFunctions;
}

export function getHookHttpMock(mock: IHookFunctions): jest.Mock {
	return (mock.helpers as unknown as { httpRequestWithAuthentication: jest.Mock })
		.httpRequestWithAuthentication;
}
