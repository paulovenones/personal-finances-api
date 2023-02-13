import { TransactionTypes } from "../../enums/TransactionTypes";
import { CustomError } from "../../helpers/CustomError";
import {
  CreateTxnCategoryRequest,
  UpdateTxnCategoryBodyRequest,
} from "../../schema/txnCategory.schema";
import {
  createNewTxnCategory,
  fetchAllUserTxnCategories,
  fetchTxnCategory,
  fetchUserTxnCategoryByName,
  updateTxnCategory,
} from "./txnCategoryDataAccess";

export const postCreateTxnCategory = async (
  { name, color, type }: CreateTxnCategoryRequest,
  userId: string
) => {
  if (!TransactionTypes.includes(type)) {
    throw new CustomError("Transaction category type does not exist", 400);
  }

  const txnCategoryAlreadyExists = await fetchUserTxnCategoryByName(
    name,
    userId
  );

  if (txnCategoryAlreadyExists) {
    throw new CustomError("Transaction category already exists", 409);
  }

  const txnCategory = await createNewTxnCategory(name, color, type, userId);

  return txnCategory;
};

export const getAllUserTxnCategories = async (userId: string) => {
  const txnCategories = fetchAllUserTxnCategories(userId);

  return txnCategories;
};

export const putUpdateTxnCategory = async (
  id: string,
  { name, color, type }: UpdateTxnCategoryBodyRequest
) => {
  if (!TransactionTypes.includes(type)) {
    throw new CustomError("Transaction category type does not exist", 400);
  }

  const txnCategoryExists = await fetchTxnCategory(id);

  if (!txnCategoryExists) {
    throw new CustomError("Transaction category does not exist", 400);
  }

  const txnCategory = await updateTxnCategory(id, name, type, color);

  return txnCategory;
};
