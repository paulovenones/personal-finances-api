import { TransactionTypes } from "../../enums/TransactionTypes";
import { CustomError } from "../../helpers/CustomError";
import { CreateTransactionRequest } from "../../schema/transaction.schema";
import { createNewTransaction } from "./transactionDataAccess";

export const postCreateTransaction = async (
  transactionBody: CreateTransactionRequest,
  userId: string
) => {
  if (!TransactionTypes.includes(transactionBody.type)) {
    throw new CustomError("Transaction type does not exist", 400);
  }

  const transaction = await createNewTransaction(transactionBody, userId);

  return transaction;
};
