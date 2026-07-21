import type { ZeroArgumentMcpServerConstructor } from "../types.js";

export const defaultInstanceResolver = {
	resolve<T extends object>(
		serverClass: ZeroArgumentMcpServerConstructor<T>,
	): T {
		return new serverClass();
	},
};
