import { getLogLevel } from 'config';
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
