import {
	createMcpServer,
	defaultInstanceResolver,
	type InstanceResolver,
	resolveMcpServerInstance,
} from "../src/index.js";

class ZeroArgumentServer {}

class NeedsDependency {
	public constructor(_dependency: string) {
		void _dependency;
	}
}

const zeroArgumentInstance: ZeroArgumentServer =
	defaultInstanceResolver.resolve(ZeroArgumentServer);
void zeroArgumentInstance;

// @ts-expect-error Direct construction requires a zero-argument server class.
void resolveMcpServerInstance(NeedsDependency);

// @ts-expect-error Direct compilation requires a resolver for a dependency-requiring class.
void createMcpServer(NeedsDependency);

const dependencyResolver: InstanceResolver<NeedsDependency> = {
	resolve: async () => {
		throw new Error("resolver test");
	},
};

void resolveMcpServerInstance(NeedsDependency, dependencyResolver);
void createMcpServer(NeedsDependency, dependencyResolver);
