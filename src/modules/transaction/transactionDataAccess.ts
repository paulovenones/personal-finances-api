import { prisma } from "../../lib/prisma";
import { TransactionTypes } from "../../enums/TransactionTypes";
import { CreateTransactionRequest } from "../../schema/transaction.schema";

export const createNewTransaction = async (
  transactionBody: CreateTransactionRequest,
  userId: string
) => {
  const tranasaction = await prisma.transaction.create({
    data: {
      ...transactionBody,
      userId,
    },
    include: {
      txnCategory: true,
    },
  });

  return tranasaction;
};
