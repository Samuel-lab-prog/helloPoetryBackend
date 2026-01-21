type Primitive = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]';

type ResolvePrimitive<T extends Primitive> = T extends 'string'
	? string
	: T extends 'number'
		? number
		: T extends 'boolean'
			? boolean
			: T extends 'string[]'
				? string[]
				: T extends 'number[]'
					? number[]
					: never;

type PropertyMap = Record<string, Primitive>;

type ResolveProperties<T extends PropertyMap> = {
	[K in keyof T]: ResolvePrimitive<T[K]>;
};

export type DataModelsDefinition = Record<string, PropertyMap>;

type __ResolveDataModels<T extends DataModelsDefinition> = {
	[ModelName in keyof T]: ResolveProperties<T[ModelName]>;
};

type BaseReturn = 'null' | 'void';

type ReturnTypeNames<DataModels> = keyof DataModels | BaseReturn;

type FunctionDefinition<DataModels, Params extends PropertyMap> = {
	params: Params;
	returns: ReturnTypeNames<DataModels>[];
};

type ErrorType = 'NOT_FOUND' | 'VALIDATION' | 'UNAUTHORIZED';

type ErrorDefinition = {
	type: ErrorType;
	message: string;
};

type ErrorsDefinition = Record<string, ErrorDefinition>;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type HttpDefinition<Params extends PropertyMap> = {
	method: HttpMethod;
	path: string;
	params: Params;
	responsesCodes: number[];
	needsAuth: boolean;
	schemaName: string;
};

export type UseCaseDefinition<DataModels extends DataModelsDefinition> = {
	name: string;
	type: 'command' | 'query';

	dataModels: DataModels;
	errors: ErrorsDefinition;

	repositoryMethods: Record<
		string,
		FunctionDefinition<DataModels, PropertyMap>
	>;

	useCaseFunc: FunctionDefinition<DataModels, PropertyMap>;
	serviceFunc: FunctionDefinition<DataModels, PropertyMap>;

	http: HttpDefinition<PropertyMap>;
};

export function defineUseCases<
	UC extends UseCaseDefinition<DataModelsDefinition>[],
>(definition: { domain: string; useCases: UC }) {
	return definition;
}
