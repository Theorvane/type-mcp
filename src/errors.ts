export class TypeMcpDefinitionError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "TypeMcpDefinitionError";
	}
}
