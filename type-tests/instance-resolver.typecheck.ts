import {
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

const dependencyResolver: InstanceResolver = {
	resolve: async () => {
		throw new Error("resolver test");
	},
};

void resolveMcpServerInstance(NeedsDependency, dependencyResolver);
