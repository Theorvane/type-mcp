const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const CONFIGURATION_FAILURE_MESSAGE = "OpenAI provider is not configured";
const REQUEST_FAILURE_MESSAGE = "OpenAI request failed";
const RESPONSE_FAILURE_MESSAGE = "OpenAI response was invalid";

export type OpenAiProviderFailureCode =
	| "configuration"
	| "request"
	| "response";

export interface OpenAiProviderFailure {
	readonly code: OpenAiProviderFailureCode;
	readonly message: string;
}

export interface OpenAiResponsesRequest {
	readonly model: string;
	readonly input: string;
	readonly instructions?: string | undefined;
}

export type OpenAiResponsesResult =
	| { readonly ok: true; readonly text: string }
	| { readonly ok: false; readonly error: OpenAiProviderFailure };

export interface CreateOpenAiResponsesProviderOptions {
	readonly apiKey?: string | undefined;
	readonly baseUrl?: string | undefined;
	readonly fetch?: typeof globalThis.fetch | undefined;
}

export interface OpenAiResponsesProvider {
	generate(request: OpenAiResponsesRequest): Promise<OpenAiResponsesResult>;
}

interface ProviderConfiguration {
	readonly apiKey: string;
	readonly baseUrl: string;
	readonly fetch: typeof globalThis.fetch;
}

export function createOpenAiResponsesProvider(
	options: CreateOpenAiResponsesProviderOptions = {},
): OpenAiResponsesProvider {
	const configuration = readConfiguration(options);

	return {
		async generate(
			request: OpenAiResponsesRequest,
		): Promise<OpenAiResponsesResult> {
			if (configuration === undefined || !isValidRequest(request)) {
				return failure("configuration", CONFIGURATION_FAILURE_MESSAGE);
			}

			let response: Response;
			try {
				response = await configuration.fetch(
					`${configuration.baseUrl}/responses`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${configuration.apiKey}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							model: request.model,
							input: request.input,
							...(request.instructions === undefined
								? {}
								: { instructions: request.instructions }),
						}),
					},
				);
			} catch {
				return failure("request", REQUEST_FAILURE_MESSAGE);
			}

			if (!response.ok) {
				return failure("request", REQUEST_FAILURE_MESSAGE);
			}

			let payload: unknown;
			try {
				payload = await response.json();
			} catch {
				return failure("response", RESPONSE_FAILURE_MESSAGE);
			}

			const text = readOutputText(payload);
			if (text === undefined) {
				return failure("response", RESPONSE_FAILURE_MESSAGE);
			}

			return { ok: true, text };
		},
	};
}

function readConfiguration(
	options: CreateOpenAiResponsesProviderOptions,
): ProviderConfiguration | undefined {
	const apiKey = nonEmptyString(options.apiKey ?? process.env.OPENAI_API_KEY);
	const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
	if (apiKey === undefined || baseUrl === undefined) {
		return undefined;
	}

	return {
		apiKey,
		baseUrl,
		fetch: options.fetch ?? globalThis.fetch,
	};
}

function isValidRequest(request: OpenAiResponsesRequest): boolean {
	return (
		nonEmptyString(request.model) !== undefined &&
		nonEmptyString(request.input) !== undefined &&
		(request.instructions === undefined ||
			nonEmptyString(request.instructions) !== undefined)
	);
}

function normalizeBaseUrl(value: string): string | undefined {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return undefined;
	}

	if (
		url.username !== "" ||
		url.password !== "" ||
		url.search !== "" ||
		url.hash !== "" ||
		(url.protocol !== "https:" &&
			(url.protocol !== "http:" || !isLoopbackHost(url.hostname)))
	) {
		return undefined;
	}

	return url.toString().replace(/\/+$/, "");
}

function isLoopbackHost(hostname: string): boolean {
	return (
		hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
	);
}

function readOutputText(value: unknown): string | undefined {
	if (!isRecord(value) || !Array.isArray(value.output)) {
		return undefined;
	}

	const text = value.output.flatMap((output) => {
		if (!isRecord(output) || !Array.isArray(output.content)) {
			return [];
		}

		return output.content.flatMap((content) =>
			isRecord(content) &&
			content.type === "output_text" &&
			typeof content.text === "string"
				? [content.text]
				: [],
		);
	});
	const result = text.join("");
	return result.trim() === "" ? undefined : result;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
	return typeof value === "object" && value !== null;
}

function nonEmptyString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function failure(
	code: OpenAiProviderFailureCode,
	message: string,
): OpenAiResponsesResult {
	return { ok: false, error: { code, message } };
}
