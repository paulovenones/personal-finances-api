import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";
import { createUserSchema, loginUserSchema } from "../../schema/user.schema";
import { postCreateUser, postLoginUser } from "./user.service";

export const userRoutes = async (app: FastifyInstance) => {
  // Route for create a new user
  app.post("/signup", async (request, reply) => {
    const body = createUserSchema.parse(request.body);
    try {
      const user = await postCreateUser(body);
      return user;
    } catch (err) {
      reply.code(500).send(err);
    }
  });

  // Route for login a user
  app.post("/login", async (request, reply) => {
    const loginCredentials = loginUserSchema.parse(request.body);
    try {
      const token = await postLoginUser(loginCredentials);
      return { token };
    } catch (err) {
      reply.code(500).send(err);
    }
  });
};
