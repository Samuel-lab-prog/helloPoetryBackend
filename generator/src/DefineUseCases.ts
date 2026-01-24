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
	body: string;
};

/* =======================
   Errors
======================= */

type ErrorType = 'NOT_FOUND' | 'VALIDATION_FAILED' | 'UNAUTHORIZED';

type ErrorDefinition = {
	name: string;
	type: ErrorType;
	message: string;
};

type ErrorsDefinition = ErrorDefinition[];

/* =======================
   HTTP
======================= */

type ServiceDefinition = {
	useCaseFuncName: string;
	params: Record<string, string>[];
	returns: string[];
};

/* =======================
   Repository / Use Case
======================= */

type RepositoryMethodDefinition<DataModels> = {
	name: string;
	params: ParamDefinition[];
	returns: ReturnTypeNames<DataModels>[];
	body: string;
	selectModel?: { name: string; body: string };
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

	serviceFunctions: ServiceDefinition[];

	dtos?: {
		inputModel: string;
		outputModel: string;
		body: string;
	}[];

	policies?: {
		name: string;
		parameters: Record<string, Primitive>;
		body: string;
	}[];
};

/* =======================
   Entry point
======================= */

export function defineUseCases<
	UC extends UseCaseDefinition<DataModelsDefinition>[],
>(definition: { domain: string; useCases: UC }) {
	return definition;
}
