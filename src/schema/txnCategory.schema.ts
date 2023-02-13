import { object, string, TypeOf } from "zod";

export const createTxnCategorySchema = object({
  name: string({ required_error: "Name is required" })
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be up to 30 characters"),
  color: string({ required_error: "Color is required" }).min(
    4,
    "Color must be at least 4 characters"
  ),
  type: string({ required_error: "Type is required" }),
});

export const updateTxnCategoryParamSchema = object({
  id: string({ required_error: "Txn category id is required" }).uuid(
    "Invalid txn category id format"
  ),
});

export const updateTxnCategoryBodySchema = object({
  name: string({ required_error: "Name is required" })
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be up to 30 characters"),
  color: string({ required_error: "Color is required" }).min(
    4,
    "Color must be at least 4 characters"
  ),
  type: string({ required_error: "Type is required" }),
});

export type CreateTxnCategoryRequest = TypeOf<typeof createTxnCategorySchema>;
export type UpdateTxnCategoryBodyRequest = TypeOf<
  typeof updateTxnCategoryBodySchema
>;
