import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import jsonwebtoken from "jsonwebtoken";
import {
  accessTokenPrivateKey,
  authRefreshTokenExpiration,
} from "../../config/configuration";

import { CreateUserRequest, LoginUserRequest } from "../../schema/user.schema";
import { generateAuthenticationToken } from "../../utils/generateAuthenticationToken";
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
}: CreateUserRequest) => {
  const userAlreadyExists = await getUserByEmail(email);

  if (userAlreadyExists) {
    throw new Error("User already exists!");
  }

  const passwordHash = await bcrypt.hash(password, 8);

  const user = await createNewUser(name, email, passwordHash);

  return user;
};

export const postLoginUser = async (
  { email, password }: LoginUserRequest,
  app: FastifyInstance
) => {
  const userAlreadyExists = await getUserByEmail(email);

  if (!userAlreadyExists) {
    throw new Error("Email or password incorrect");
  }

  const passwordMatch = await bcrypt.compare(
    password,
    userAlreadyExists.password
  );

  if (!passwordMatch) {
    throw new Error("Email or password incorrect");
  }

  const token = generateAuthenticationToken(userAlreadyExists.id);

  const expiresIn = authRefreshTokenExpiration * 60;

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
    throw new Error("Refresh token invalid");
  }

  const token = generateAuthenticationToken(tokenUserId);

  return token;
};

export const postLogoutUser = async (
  refreshToken: string,
  app: FastifyInstance
) => {
  const isLoggedOut = await deleteRefreshToken(refreshToken, app.redis);

  if (!isLoggedOut) {
    throw new Error("Error during logout");
  }
};
