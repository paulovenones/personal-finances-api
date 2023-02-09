import { FastifyInstance } from "fastify";
import { userRoutes } from "./modules/user/user.routes";

export async function appRoutes(app: FastifyInstance) {
  userRoutes(app);
}
