import jwt, { Jwt } from "jsonwebtoken";

type DecodedJwtPayload = {
  userId: string;
  iat: number;
  exp: number;
};

export const decodeUserIdFromAuthToken = (token: string) => {
  const [, handledToken] = token.split(" ");

  const options = {
    complete: true,
  };

  const decodedToken = jwt.decode(handledToken, options) as Jwt;

  const { userId } = decodedToken.payload as DecodedJwtPayload;

  return userId;
};
