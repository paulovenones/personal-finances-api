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

const REFRESH_TOKEN_EXPIRATION = AUTH_REFRESH_TOKEN_EXPIRATION * 60;

export const postCreateUser = async (
  { name, email, password, timezone }: CreateUserRequest,
  app: FastifyInstance
) => {
  const lowerCaseEmail = email.toLowerCase();
  const userAlreadyExists = await getUserByEmail(lowerCaseEmail);

  if (userAlreadyExists) {
    throw new CustomError("User already exists!", 409);
  }

  const passwordHash = await bcrypt.hash(password, 8);

  const user = await createNewUser(
    name,
    lowerCaseEmail,
    passwordHash,
    timezone
  );

  const token = generateAuthenticationToken(user.id);
  const refreshToken = await storeRefreshToken(
    user.id,
    REFRESH_TOKEN_EXPIRATION,
    app.redis
  );

  return { user, token, refreshToken };
};

export const postLoginUser = async (
  { email, password }: LoginUserRequest,
  app: FastifyInstance
) => {
  const lowerCaseEmail = email.toLowerCase();
  const userAlreadyExists = await getUserByEmail(lowerCaseEmail);

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

  const refreshToken = await storeRefreshToken(
    userAlreadyExists.id,
    REFRESH_TOKEN_EXPIRATION,
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
    throw new CustomError("Refresh token invalid", 401);
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
    throw new CustomError("Invalid refresh token", 401);
  }

  await deleteRefreshToken(refreshToken, app.redis);
};
