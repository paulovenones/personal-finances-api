import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import jsonwebtoken from "jsonwebtoken";

import { ACCESS_TOKEN_PRIVATE_KEY } from "../config/configuration";
import { CustomError } from "../helpers/CustomError";

export const ensureAuthenticated = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return reply.code(401).send({ message: "Token is missing" });
  }

  const [, token] = authToken.split(" ");
  try {
    jsonwebtoken.verify(token, ACCESS_TOKEN_PRIVATE_KEY);

    return done();
  } catch (err) {
    throw new CustomError("Auth token invalid or expired", 401);
  }
};
