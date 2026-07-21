import { describe, expect, it } from "vitest";
import {
	defaultInstanceResolver,
	type InstanceResolver,
	resolveMcpServerInstance,
} from "../src/index.js";

describe("instance resolvers", () => {
	it("constructs a zero-argument server through the default resolver", async () => {
		class DefaultServer {
			public readonly source = "default";
		}

		const instance = await resolveMcpServerInstance(DefaultServer);

		expect(instance).toBeInstanceOf(DefaultServer);
		expect(instance.source).toBe("default");
		expect(defaultInstanceResolver.resolve(DefaultServer)).toBeInstanceOf(
			DefaultServer,
		);
	});

	it("passes a dependency-requiring constructor to a custom synchronous resolver", async () => {
		class InjectedServer {
			public constructor(public readonly dependency: string) {}
		}
		const injected = new InjectedServer("injected");
		const received: object[] = [];
		const resolver: InstanceResolver<InjectedServer> = {
			resolve(serverClass) {
				received.push(serverClass);
				return injected;
			},
		};

		const instance = await resolveMcpServerInstance(InjectedServer, resolver);

		expect(instance).toBe(injected);
		expect(received).toEqual([InjectedServer]);
	});

	it("awaits an asynchronous custom resolver", async () => {
		class AsyncServer {
			public readonly source = "async";
		}
		const resolver: InstanceResolver<AsyncServer> = {
			resolve: async () => new AsyncServer(),
		};

		const instance = await resolveMcpServerInstance(AsyncServer, resolver);

		expect(instance).toBeInstanceOf(AsyncServer);
		expect(instance.source).toBe("async");
	});
});
