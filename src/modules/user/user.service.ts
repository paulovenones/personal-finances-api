import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { accessTokenPrivateKey } from "../../config/configuration";

import { CreateUserRequest, LoginUserRequest } from "../../schema/user.schema";
import { createNewUser, getUserByEmail } from "./userDataAccess";

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

export const postLoginUser = async ({ email, password }: LoginUserRequest) => {
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

  const token = jsonwebtoken.sign({}, accessTokenPrivateKey, {
    subject: userAlreadyExists.id,
    expiresIn: "20s",
  });

  return token;
};
