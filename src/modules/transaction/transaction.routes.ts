import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";
import { createTransactionSchema } from "../../schema/transaction.schema";
import { decodeUserIdFromAuthToken } from "../../utils/decode-user-id-from-auth-token";
import { postCreateTransaction } from "./transaction.service";

export const transactionRoutes = async (app: FastifyInstance) => {
  app.post(
    "/transaction",
    { preHandler: [ensureAuthenticated] },
    async (request) => {
      const body = createTransactionSchema.parse(request.body);
      const userId = decodeUserIdFromAuthToken(request.headers.authorization!);

      const tranasaction = await postCreateTransaction(body, userId);

      return tranasaction;
    }
  );
};
