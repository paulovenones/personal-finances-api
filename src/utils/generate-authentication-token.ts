import jwt from "jsonwebtoken";

import {
  ACCESS_TOKEN_PRIVATE_KEY,
  AUTH_TOKEN_EXPIRATION,
} from "../config/configuration";

export const generateAuthenticationToken = (userId: string) => {
  const token = jwt.sign({ userId }, ACCESS_TOKEN_PRIVATE_KEY, {
    expiresIn: AUTH_TOKEN_EXPIRATION * 60,
  });

  return token;
};
