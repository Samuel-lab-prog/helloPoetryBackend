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

type ParamDefinition = {
	name: string;
	type: Primitive;
};

/* =======================
   Data Models
======================= */

export type DataModelDefinition = {
	name: string;
	properties: PropertyMap;
};

export type DataModelsDefinition = DataModelDefinition[];

type ResolveDataModels<T extends DataModelsDefinition> = {
	[M in T[number] as M['name']]: ResolveProperties<M['properties']>;
};

/* =======================
   Returns
======================= */

type BaseReturn = 'null' | 'void';

type ReturnTypeNames<DataModels> = keyof DataModels | BaseReturn;

type FunctionDefinition<DataModels> = {
	params: ParamDefinition[];
	returns: ReturnTypeNames<DataModels>[];
};

/* =======================
   Errors
======================= */

type ErrorType = 'NOT_FOUND' | 'VALIDATION' | 'UNAUTHORIZED';

type ErrorDefinition = {
	name: string;
	type: ErrorType;
	message: string;
};

type ErrorsDefinition = ErrorDefinition[];

/* =======================
   HTTP
======================= */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type HttpDefinition = {
	method: HttpMethod;
	path: string;
	params: ParamDefinition[];
	responsesCodes: number[];
	needsAuth: boolean;
	schemaName: string;
};

/* =======================
   Repository / Use Case
======================= */

type RepositoryMethodDefinition<DataModels> = {
	name: string;
	params: ParamDefinition[];
	returns: ReturnTypeNames<DataModels>[];
};

export type UseCaseDefinition<DataModels extends DataModelsDefinition> = {
	name: string;
	type: 'command' | 'query';

	dataModels: DataModels;
	errors: ErrorsDefinition;

	repositoryMethods: RepositoryMethodDefinition<
		ResolveDataModels<DataModels>
	>[];

	useCaseFunc: FunctionDefinition<ResolveDataModels<DataModels>>;

	serviceFunc: FunctionDefinition<ResolveDataModels<DataModels>>;

	http: HttpDefinition;
};

/* =======================
   Entry point
======================= */

export function defineUseCases<
	UC extends UseCaseDefinition<DataModelsDefinition>[],
>(definition: { domain: string; useCases: UC }) {
	return definition;
}
