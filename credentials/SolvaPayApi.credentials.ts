import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SolvaPayApi implements ICredentialType {
	name = 'solvaPayApi';

	displayName = 'SolvaPay API';

	documentationUrl = 'https://docs.solvapay.com/api';

	icon = 'file:solvapay.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Your SolvaPay API key (starts with sk_). Found in SolvaPay Dashboard → Settings → API Keys.',
		},
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Secret for verifying incoming webhook signatures. Found in SolvaPay Dashboard → Settings → Webhooks.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.solvapay.com/v1/sdk',
			url: '/products',
			method: 'GET',
		},
	};
}
