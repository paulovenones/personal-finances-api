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

export const postCreateTxnCategory = async ({
  name,
  color,
  userId,
}: CreateTxnCategoryRequest) => {
  const txnCategoryAlreadyExists = await fetchUserTxnCategoryByName(
    name,
    userId
  );

  if (txnCategoryAlreadyExists) {
    throw new CustomError("Transaction category already exists", 409);
  }

  const txnCategory = await createNewTxnCategory(name, color, userId);

  return txnCategory;
};

export const getAllUserTxnCategories = async (userId: string) => {
  const txnCategories = fetchAllUserTxnCategories(userId);

  return txnCategories;
};

export const putUpdateTxnCategory = async (
  id: string,
  { name, color }: UpdateTxnCategoryBodyRequest
) => {
  const txnCategoryExists = await fetchTxnCategory(id);

  if (!txnCategoryExists) {
    throw new CustomError("Transaction category does not exist", 400);
  }

  const txnCategory = await updateTxnCategory(id, name, color);

  return txnCategory;
};
