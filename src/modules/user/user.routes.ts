import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";
import {
  createUserSchema,
  loginUserSchema,
  logoutUserSchema,
  refreshUserTokenSchema,
  verifyRegistrationSchema,
} from "../../schema/user.schema";
import {
  postCreateUser,
  postLoginUser,
  postLogoutUser,
  postRefreshUserToken,
  postVerifyRegistration,
} from "./user.service";

export const userRoutes = async (app: FastifyInstance) => {
  app.get("/", (_, reply) => {
    return reply.status(200);
  });

  // Route for generate a email verification PIN code
  app.post("/signup", async (request, reply) => {
    const body = createUserSchema.parse(request.body);
    await postCreateUser(body, app);
    reply.status(201);
  });

  // Route for create a new user
  app.post("/verify-registration", async (request) => {
    const body = verifyRegistrationSchema.parse(request.body);
    const user = await postVerifyRegistration(body, app);
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
