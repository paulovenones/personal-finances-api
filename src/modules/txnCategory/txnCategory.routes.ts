import { FastifyInstance } from "fastify";

import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";
import {
  createTxnCategorySchema,
  updateTxnCategoryBodySchema,
  updateTxnCategoryParamSchema,
} from "../../schema/txnCategory.schema";
import { decodeUserIdFromAuthToken } from "../../utils/decode-user-id-from-auth-token";
import {
  getAllUserTxnCategories,
  postCreateTxnCategory,
  putUpdateTxnCategory,
} from "./txnCategory.service";

export const txnCategoryRoutes = async (app: FastifyInstance) => {
  app.post(
    "/txn-category",
    { preHandler: [ensureAuthenticated] },
    async (request) => {
      const body = createTxnCategorySchema.parse(request.body);
      const userId = decodeUserIdFromAuthToken(request.headers.authorization!);

      const txnCategory = await postCreateTxnCategory(body, userId);

      return txnCategory;
    }
  );

  app.get(
    "/txn-category",
    { preHandler: [ensureAuthenticated] },
    async (request) => {
      const userId = decodeUserIdFromAuthToken(request.headers.authorization!);
      const txnCategories = await getAllUserTxnCategories(userId);

      return { txnCategories };
    }
  );

  app.put(
    "/txn-category/:id",
    { preHandler: [ensureAuthenticated] },
    async (request) => {
      const { id } = updateTxnCategoryParamSchema.parse(request.params);
      const body = updateTxnCategoryBodySchema.parse(request.body);

      const txnCategory = await putUpdateTxnCategory(id, body);

      return txnCategory;
    }
  );
};
