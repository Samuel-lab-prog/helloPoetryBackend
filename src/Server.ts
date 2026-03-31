import 'dotenv/config'; // Load environment variables from .env file.

import { server } from 'Index';
import { HOST_NAME, PORT } from 'server-config/config';

server.listen({
	hostname: HOST_NAME,
	port: PORT,
});
