import Handlebars from 'handlebars';

/**
 * Registers all custom Handlebars helpers.
 */
export function registerHandlebarsHelpers() {
	Handlebars.registerHelper('splitName', function (param: string) {
		return param.split(':')[0]!.trim();
	});
}
