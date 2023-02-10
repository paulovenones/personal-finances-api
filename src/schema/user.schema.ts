import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  name: string({ required_error: "Name is required" }),
  email: string({ required_error: "Email is required" }).email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(8, "Password must at least 8 characters")
    .max(32, "Password must be up to 32 characters"),
  passwordConfirm: string({ required_error: "Please confirm your password" }),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Passwords do not match",
});

export const loginUserSchema = object({
  email: string({ required_error: "Email is required" }).email(
    "Invalid email or password"
  ),
  password: string({ required_error: "Password is required" }).min(
    8,
    "Invalid email or password"
  ),
});

export const logoutUserSchema = object({
  refresh_token: string({ required_error: "Refresh token is required" }).uuid(
    "Invalid refresh token"
  ),
});

export const refreshUserTokenSchema = object({
  refresh_token: string({ required_error: "Refresh token is required" }).uuid(
    "Invalid refresh token"
  ),
});

export type CreateUserRequest = TypeOf<typeof createUserSchema>;
export type LoginUserRequest = TypeOf<typeof loginUserSchema>;