import { number, object, string, TypeOf } from "zod";

const ISO_DATETIME_REGEX =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export const createTransactionSchema = object({
  name: string({ required_error: "Name is required" }),
  type: string({ required_error: "Type is required" }),
  value: number({ required_error: "Value is required" }),
  date: string({
    required_error: "Date is required",
  }).regex(ISO_DATETIME_REGEX, "Date must be a valid ISO date"),
  txnCategoryId: string({ required_error: "Txn category id is required" }).uuid(
    "Invalid txn category id format"
  ),
});

export type CreateTransactionRequest = TypeOf<typeof createTransactionSchema>;
