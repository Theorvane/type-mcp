import type {
	Annotations,
	AudioContent,
	ImageContent,
} from "@modelcontextprotocol/server";

export interface McpMediaOptions {
	readonly mimeType: string;
	readonly annotations?: Readonly<Annotations> | undefined;
}

export class McpImage {
	readonly #data: Uint8Array;
	readonly #mimeType: string;
	readonly #annotations: Readonly<Annotations> | undefined;

	public constructor(data: Uint8Array, options: McpMediaOptions) {
		this.#data = copyBytes(data);
		this.#mimeType = requireMimeType(options.mimeType, "image");
		this.#annotations = copyAnnotations(options.annotations);
		Object.freeze(this);
	}

	public toContent(): ImageContent {
		return {
			type: "image",
			data: encodeBase64(this.#data),
			mimeType: this.#mimeType,
			...(this.#annotations === undefined
				? {}
				: { annotations: copyAnnotations(this.#annotations) }),
		};
	}
}

export class McpAudio {
	readonly #data: Uint8Array;
	readonly #mimeType: string;
	readonly #annotations: Readonly<Annotations> | undefined;

	public constructor(data: Uint8Array, options: McpMediaOptions) {
		this.#data = copyBytes(data);
		this.#mimeType = requireMimeType(options.mimeType, "audio");
		this.#annotations = copyAnnotations(options.annotations);
		Object.freeze(this);
	}

	public toContent(): AudioContent {
		return {
			type: "audio",
			data: encodeBase64(this.#data),
			mimeType: this.#mimeType,
			...(this.#annotations === undefined
				? {}
				: { annotations: copyAnnotations(this.#annotations) }),
		};
	}
}

export function isMcpMedia(value: unknown): value is McpImage | McpAudio {
	return value instanceof McpImage || value instanceof McpAudio;
}

function copyBytes(data: Uint8Array): Uint8Array {
	return new Uint8Array(data);
}

function copyAnnotations(
	annotations: Readonly<Annotations> | undefined,
): Annotations | undefined {
	if (annotations === undefined) {
		return undefined;
	}
	return {
		...annotations,
		...(annotations.audience === undefined
			? {}
			: { audience: [...annotations.audience] }),
	};
}

function requireMimeType(mimeType: string, family: "image" | "audio"): string {
	const pattern =
		family === "image"
			? /^image\/[a-z0-9][a-z0-9.+-]*$/i
			: /^audio\/[a-z0-9][a-z0-9.+-]*$/i;
	if (!pattern.test(mimeType)) {
		throw new TypeError(`MCP ${family} MIME type must start with ${family}/`);
	}
	return mimeType;
}

function encodeBase64(data: Uint8Array): string {
	const alphabet =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	let encoded = "";
	for (let index = 0; index < data.length; index += 3) {
		const first = data[index] ?? 0;
		const second = data[index + 1];
		const third = data[index + 2];
		const value = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
		encoded += alphabet.charAt((value >> 18) & 63);
		encoded += alphabet.charAt((value >> 12) & 63);
		encoded += second === undefined ? "=" : alphabet.charAt((value >> 6) & 63);
		encoded += third === undefined ? "=" : alphabet.charAt(value & 63);
	}
	return encoded;
}
