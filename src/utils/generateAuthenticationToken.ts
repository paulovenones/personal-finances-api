import jsonwebtoken from "jsonwebtoken";

import {
  accessTokenPrivateKey,
  authTokenExpiration,
} from "../config/configuration";

export const generateAuthenticationToken = (userId: string) => {
  const token = jsonwebtoken.sign({}, accessTokenPrivateKey, {
    subject: userId,
    expiresIn: authTokenExpiration * 60,
  });

  return token;
};
