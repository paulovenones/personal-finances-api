import Fastify from "fastify";
import fastifyRedis from "@fastify/redis";
import cors from "@fastify/cors";

import {
  CLIENT_URL,
  PORT,
  REDIS_HOST,
  REDIS_PORT,
  SERVER_HOST,
} from "./config/configuration";
import { errorHandler } from "./helpers/ErrorHandler";
import { appRoutes } from "./routes";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: CLIENT_URL,
});
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
