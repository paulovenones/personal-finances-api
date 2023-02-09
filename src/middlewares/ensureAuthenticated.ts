import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import jsonwebtoken from "jsonwebtoken";

import { accessTokenPrivateKey } from "../config/configuration";

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
    jsonwebtoken.verify(token, accessTokenPrivateKey);

    return done();
  } catch (err) {
    return reply.code(401).send({ message: "Token invalid" });
  }
};
