import jsonwebtoken from "jsonwebtoken";

import {
  ACCESS_TOKEN_PRIVATE_KEY,
  AUTH_TOKEN_EXPIRATION,
} from "../config/configuration";

export const generateAuthenticationToken = (userId: string) => {
  const token = jsonwebtoken.sign({}, ACCESS_TOKEN_PRIVATE_KEY, {
    subject: userId,
    expiresIn: AUTH_TOKEN_EXPIRATION * 60,
  });

  return token;
};
