import { server } from 'Index';
import { HOST_NAME, PORT } from 'config';

server.listen({
	hostname: HOST_NAME,
	port: PORT,
});
