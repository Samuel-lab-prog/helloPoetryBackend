import { getLogLevel } from '@GenericSubdomains/server-config/config';
import pino from 'pino';

export const log = pino({
	level: getLogLevel(),
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'mm-dd HH:MM:ss',
			singleLine: false,
		},
	},
});
