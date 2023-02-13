import { FastifyInstance } from "fastify";

import { userRoutes } from "./modules/user/user.routes";
import { txnCategoryRoutes } from "./modules/txnCategory/txnCategory.routes";
import { transactionRoutes } from "./modules/transaction/transaction.routes";

export async function appRoutes(app: FastifyInstance) {
  userRoutes(app);
  txnCategoryRoutes(app);
  transactionRoutes(app);
}
