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
  app.get("/", (_, reply) => {
    return reply.status(200);
  });

  // Route for create a new user
  app.post("/signup", async (request) => {
    const body = createUserSchema.parse(request.body);
    const user = await postCreateUser(body, app);
    return user;
  });

  // Route for login a user
  app.post("/login", async (request) => {
    const loginCredentials = loginUserSchema.parse(request.body);
    const { token, refreshToken } = await postLoginUser(loginCredentials, app);
    return { token, refreshToken };
  });

  // Route for refresh user auth token
  app.post("/refresh-token", async (request) => {
    const { refresh_token } = refreshUserTokenSchema.parse(request.body);
    const token = await postRefreshUserToken(refresh_token, app);

    return { token };
  });

  // Route for logout a user
  app.post(
    "/logout",
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const { refresh_token } = logoutUserSchema.parse(request.body);

      await postLogoutUser(refresh_token, app);

      reply.code(200);
    }
  );
};
