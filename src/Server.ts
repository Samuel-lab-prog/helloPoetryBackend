import { createServer, HOST_NAME, PORT } from './index';

createServer.listen({
  hostname: HOST_NAME,
  port: PORT,
});