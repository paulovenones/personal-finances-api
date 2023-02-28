import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";
import {
  completeForgotPasswordResetSchema,
  createUserSchema,
  forgotPasswordSchema,
  loginUserSchema,
  logoutUserSchema,
  refreshUserTokenSchema,
  verifyForgotPasswordResetPinSchema,
  verifyRegistrationSchema,
} from "../../schema/user.schema";
import {
  getForgotPassword,
  postVerifyForgotPasswordResetPin,
  postCreateUser,
  postLoginUser,
  postLogoutUser,
  postRefreshUserToken,
  postVerifyRegistration,
  postCompleteForgotPasswordReset,
  getUserByToken,
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

  // Route for start forgot password reset
  app.get("/user/forgot-password/:email", async (request, reply) => {
    const { email } = forgotPasswordSchema.parse(request.params);
    await getForgotPassword(email, app);
    reply.status(200);
  });

  // Route for verify forgot password reset PIN
  app.post("/user/forgot-password/verify-pin", async (request, reply) => {
    const body = verifyForgotPasswordResetPinSchema.parse(request.body);
    await postVerifyForgotPasswordResetPin(body, app);
    reply.status(200);
  });

  // Route for complete forgot password reset
  app.post("/user/forgot-password/complete", async (request, reply) => {
    const body = completeForgotPasswordResetSchema.parse(request.body);
    await postCompleteForgotPasswordReset(body, app);
    reply.status(200);
  });

  // Route for get user from access token
  app.get("/token/user", { preHandler: [ensureAuthenticated] }, getUserByToken);

  // Route for create a new user
  app.post("/verify-registration", async (request) => {
    const body = verifyRegistrationSchema.parse(request.body);
    const user = await postVerifyRegistration(body, app);
    return user;
  });

  // Route for login a user
  app.post("/login", async (request) => {
    const loginCredentials = loginUserSchema.parse(request.body);
    const { accessToken, refreshToken, user } = await postLoginUser(
      loginCredentials,
      app
    );
    return { accessToken, refreshToken, user };
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
