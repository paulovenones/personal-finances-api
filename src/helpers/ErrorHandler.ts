import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { z } from "zod";

export const errorHandler = (
  err: FastifyError,
  _: FastifyRequest,
  reply: FastifyReply
) => {
  const statusCode = err.statusCode ?? 0;

  if (statusCode >= 400 && statusCode < 500) {
    console.log(err);
  } else {
    console.error(err);
  }

  if (err instanceof z.ZodError) {
    return reply.code(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: JSON.parse(err.message),
    });
  }

  return reply.code(statusCode).send(err);
};
