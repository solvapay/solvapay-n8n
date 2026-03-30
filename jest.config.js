/** @type {import('jest').Config} */
module.exports = {
	projects: [
		{
			displayName: 'unit',
			preset: 'ts-jest',
			testEnvironment: 'node',
			testMatch: ['<rootDir>/__tests__/unit/**/*.test.ts'],
			moduleFileExtensions: ['ts', 'js', 'json'],
		},
		{
			displayName: 'integration',
			preset: 'ts-jest',
			testEnvironment: 'node',
			testMatch: ['<rootDir>/__tests__/integration/**/*.integration.test.ts'],
			setupFiles: ['<rootDir>/__tests__/integration/helpers/setup.ts'],
			testTimeout: 30000,
			moduleFileExtensions: ['ts', 'js', 'json'],
		},
	],
};
