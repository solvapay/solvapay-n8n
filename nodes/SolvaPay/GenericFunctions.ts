import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://api.solvapay.com/v1/sdk';

export interface ListResponse<T = IDataObject> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
}

export async function solvaPayRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'solvaPayApi',
			options,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

function isAlreadyExistsError(error: unknown): boolean {
	if (error instanceof NodeApiError) {
		const statusCode = error.httpCode;
		const message = error.message?.toLowerCase() ?? '';
		return (
			(statusCode === '409' || statusCode === '400' || statusCode === '422') &&
			message.includes('already exists')
		);
	}
	if (typeof error === 'object' && error !== null) {
		const err = error as Record<string, unknown>;
		const statusCode = err['statusCode'] as number | undefined;
		const message = (err['message'] as string | undefined)?.toLowerCase() ?? '';
		return (
			(statusCode === 409 || statusCode === 400 || statusCode === 422) &&
			message.includes('already exists')
		);
	}
	return false;
}

export async function ensureCustomer(
	this: IExecuteFunctions,
	email: string,
	name?: string,
	externalRef?: string,
): Promise<IDataObject> {
	const body: IDataObject = { email };
	if (name) body['name'] = name;
	if (externalRef) body['externalRef'] = externalRef;

	try {
		return (await solvaPayRequest.call(this, 'POST', '/customers', body)) as IDataObject;
	} catch (error) {
		if (isAlreadyExistsError(error)) {
			const result = (await solvaPayRequest.call(this, 'GET', '/customers', undefined, {
				email,
			})) as IDataObject;
			if (result && result['reference']) return result;
		}
		throw error;
	}
}
