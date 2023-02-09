import Fastify from "fastify";
import { port, serverHost } from "./config/configuration";
import { appRoutes } from "./routes";
import fastifyRedis from "@fastify/redis";
const app = Fastify({ logger: false });

app.register(appRoutes);
app.register(fastifyRedis, {
  host: serverHost,
  port: 6379,
});

const startServer = async () => {
  try {
    await app.listen({ port, host: serverHost });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
