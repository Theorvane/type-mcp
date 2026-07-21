import type { InstanceResolver } from "./instance-resolver.js";

export const defaultInstanceResolver: InstanceResolver = {
	resolve<T extends object>(serverClass: new (...args: never[]) => T): T {
		return new serverClass();
	},
};
