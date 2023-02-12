import jwt, { Jwt } from "jsonwebtoken";
import { CustomError } from "../helpers/CustomError";

type DecodedJwtPayload = {
  userId: string;
  iat: number;
  exp: number;
};

export const decodeUserIdFromAuthToken = (token?: string) => {
  if (!token) {
    throw new CustomError("Auth token is required", 401);
  }
  const [, handledToken] = token.split(" ");

  const options = {
    complete: true,
  };

  const decodedToken = jwt.decode(handledToken, options) as Jwt;

  const { userId } = decodedToken.payload as DecodedJwtPayload;

  return userId;
};
