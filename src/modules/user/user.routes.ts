import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";
import {
  createUserSchema,
  loginUserSchema,
  logoutUserSchema,
  refreshUserTokenSchema,
} from "../../schema/user.schema";
import {
  postCreateUser,
  postLoginUser,
  postLogoutUser,
  postRefreshUserToken,
} from "./user.service";

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
      const token = await postLoginUser(loginCredentials, app);
      return { token };
    } catch (err) {
      reply.code(500).send(err);
    }
  });

  // Route for refresh user auth token
  app.post("/refresh-token", async (request, reply) => {
    const { refresh_token } = refreshUserTokenSchema.parse(request.body);
    try {
      const token = await postRefreshUserToken(refresh_token, app);

      return { token };
    } catch (err) {
      reply.code(500).send(err);
    }
  });

  // Route for logout a user
  app.post(
    "/logout",
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      try {
        const { refresh_token } = logoutUserSchema.parse(request.body);

        await postLogoutUser(refresh_token, app);

        reply.code(200);
      } catch (err) {
        reply.code(500).send(err);
      }
    }
  );
};
