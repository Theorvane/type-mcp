import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenAiResponsesProvider } from "../src/openai.js";

const savedApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
	if (savedApiKey === undefined) {
		delete process.env.OPENAI_API_KEY;
	} else {
		process.env.OPENAI_API_KEY = savedApiKey;
	}
});

describe("OpenAI Responses provider", () => {
	it("forms one authenticated Responses request and projects output text", async () => {
		const fetchImplementation = vi.fn<typeof fetch>(async () => {
			return new Response(
				JSON.stringify({
					output: [
						{
							content: [
								{ type: "output_text", text: "First " },
								{ type: "output_text", text: "second" },
							],
						},
					],
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			);
		});
		const provider = createOpenAiResponsesProvider({
			apiKey: "test-key",
			fetch: fetchImplementation,
		});

		const result = await provider.generate({
			model: "gpt-4.1-mini",
			input: "Summarize this.",
			instructions: "Be concise.",
		});

		expect(result).toEqual({ ok: true, text: "First second" });
		expect(fetchImplementation).toHaveBeenCalledTimes(1);
		const [url, init] = fetchImplementation.mock.calls[0] ?? [];
		expect(url).toBe("https://api.openai.com/v1/responses");
		expect(init).toMatchObject({
			method: "POST",
			headers: {
				Authorization: "Bearer test-key",
				"Content-Type": "application/json",
			},
		});
		expect(JSON.parse(String(init?.body))).toEqual({
			model: "gpt-4.1-mini",
			input: "Summarize this.",
			instructions: "Be concise.",
		});
	});

	it("uses OPENAI_API_KEY and normalizes a compatible base URL", async () => {
		process.env.OPENAI_API_KEY = "environment-key";
		const fetchImplementation = vi.fn<typeof fetch>(async () => {
			return new Response(
				JSON.stringify({
					output: [{ content: [{ type: "output_text", text: "ok" }] }],
				}),
			);
		});
		const provider = createOpenAiResponsesProvider({
			baseUrl: "http://127.0.0.1:8080/v1/",
			fetch: fetchImplementation,
		});

		await expect(
			provider.generate({ model: "local", input: "Hello" }),
		).resolves.toEqual({
			ok: true,
			text: "ok",
		});
		expect(fetchImplementation).toHaveBeenCalledWith(
			"http://127.0.0.1:8080/v1/responses",
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer environment-key",
				}),
			}),
		);
	});

	it("rejects invalid configuration before fetching", async () => {
		delete process.env.OPENAI_API_KEY;
		const fetchImplementation = vi.fn<typeof fetch>();
		const provider = createOpenAiResponsesProvider({
			fetch: fetchImplementation,
		});

		await expect(provider.generate({ model: "", input: "" })).resolves.toEqual({
			ok: false,
			error: {
				code: "configuration",
				message: "OpenAI provider is not configured",
			},
		});
		expect(fetchImplementation).not.toHaveBeenCalled();
	});

	it("returns a safe configuration failure for malformed runtime request values", async () => {
		const fetchImplementation = vi.fn<typeof fetch>();
		const provider = createOpenAiResponsesProvider({
			apiKey: "test-key",
			fetch: fetchImplementation,
		});

		const results = await Promise.all([
			provider.generate(null as never),
			provider.generate(undefined as never),
			provider.generate({
				model: "gpt-4.1-mini",
				input: "Hello",
				instructions: "",
			}),
		]);

		expect(results).toEqual([
			{
				ok: false,
				error: {
					code: "configuration",
					message: "OpenAI provider is not configured",
				},
			},
			{
				ok: false,
				error: {
					code: "configuration",
					message: "OpenAI provider is not configured",
				},
			},
			{
				ok: false,
				error: {
					code: "configuration",
					message: "OpenAI provider is not configured",
				},
			},
		]);
		expect(fetchImplementation).not.toHaveBeenCalled();
	});

	it("returns fixed safe failures for request and response problems", async () => {
		const responseFailure = createOpenAiResponsesProvider({
			apiKey: "test-key",
			fetch: async () =>
				new Response('{"error":"provider-secret"}', { status: 401 }),
		});
		const malformedResponse = createOpenAiResponsesProvider({
			apiKey: "test-key",
			fetch: async () => new Response("not-json", { status: 200 }),
		});
		const networkFailure = createOpenAiResponsesProvider({
			apiKey: "test-key",
			fetch: async () => Promise.reject(new Error("network-secret")),
		});

		const results = await Promise.all([
			responseFailure.generate({ model: "gpt-4.1-mini", input: "Hello" }),
			malformedResponse.generate({ model: "gpt-4.1-mini", input: "Hello" }),
			networkFailure.generate({ model: "gpt-4.1-mini", input: "Hello" }),
		]);

		expect(results).toEqual([
			{
				ok: false,
				error: { code: "request", message: "OpenAI request failed" },
			},
			{
				ok: false,
				error: { code: "response", message: "OpenAI response was invalid" },
			},
			{
				ok: false,
				error: { code: "request", message: "OpenAI request failed" },
			},
		]);
		expect(JSON.stringify(results)).not.toContain("provider-secret");
		expect(JSON.stringify(results)).not.toContain("network-secret");
		expect(JSON.stringify(results)).not.toContain("test-key");
	});
});
