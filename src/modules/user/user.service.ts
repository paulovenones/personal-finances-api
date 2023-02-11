import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { AUTH_REFRESH_TOKEN_EXPIRATION } from "../../config/configuration";
import { CustomError } from "../../helpers/CustomError";

import { CreateUserRequest, LoginUserRequest } from "../../schema/user.schema";
import { generateAuthenticationToken } from "../../utils/generate-authentication-token";
import {
  createNewUser,
  deleteRefreshToken,
  fetchRefreshTokenUserId,
  getUserByEmail,
  storeRefreshToken,
} from "./userDataAccess";

export const postCreateUser = async ({
  name,
  email,
  password,
  timezone,
}: CreateUserRequest) => {
  const userAlreadyExists = await getUserByEmail(email);

  if (userAlreadyExists) {
    throw new CustomError("User already exists!", 409);
  }

  const passwordHash = await bcrypt.hash(password, 8);

  const user = await createNewUser(name, email, passwordHash, timezone);

  return user;
};

export const postLoginUser = async (
  { email, password }: LoginUserRequest,
  app: FastifyInstance
) => {
  const userAlreadyExists = await getUserByEmail(email);

  if (!userAlreadyExists) {
    throw new CustomError("Email or password incorrect", 401);
  }

  const passwordMatch = await bcrypt.compare(
    password,
    userAlreadyExists.password
  );

  if (!passwordMatch) {
    throw new CustomError("Email or password incorrect", 401);
  }

  const token = generateAuthenticationToken(userAlreadyExists.id);

  const expiresIn = AUTH_REFRESH_TOKEN_EXPIRATION * 60;

  const refreshToken = await storeRefreshToken(
    userAlreadyExists.id,
    expiresIn,
    app.redis
  );

  return { token, refreshToken };
};

export const postRefreshUserToken = async (
  refreshToken: string,
  app: FastifyInstance
) => {
  const tokenUserId = await fetchRefreshTokenUserId(refreshToken, app.redis);

  if (!tokenUserId) {
    throw new CustomError("Refresh token invalid", 400);
  }

  const token = generateAuthenticationToken(tokenUserId);

  return token;
};

export const postLogoutUser = async (
  refreshToken: string,
  app: FastifyInstance
) => {
  const refreshTokenExists = await fetchRefreshTokenUserId(
    refreshToken,
    app.redis
  );

  if (!refreshTokenExists) {
    throw new CustomError("Invalid refresh token", 400);
  }

  await deleteRefreshToken(refreshToken, app.redis);
};
