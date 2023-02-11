import Fastify from "fastify";
import fastifyRedis from "@fastify/redis";

import {
  PORT,
  REDIS_HOST,
  REDIS_PORT,
  SERVER_HOST,
} from "./config/configuration";
import { errorHandler } from "./helpers/ErrorHandler";
import { appRoutes } from "./routes";

const app = Fastify({ logger: false });

app.register(appRoutes);
app.setErrorHandler(errorHandler);
app.register(fastifyRedis, {
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const startServer = async () => {
  try {
    await app.listen({ port: PORT, host: SERVER_HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
