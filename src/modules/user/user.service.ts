import bcrypt from "bcryptjs";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  AUTH_REFRESH_TOKEN_EXPIRATION,
  FORGOT_PASSWORD_PIN_EXPIRATION,
  VERIFY_REGISTRATION_PIN_EXPIRATION,
} from "../../config/configuration";
import { CustomError } from "../../helpers/CustomError";
import { MailDataRequired } from "@sendgrid/mail";

import {
  CompleteForgotPasswordResetRequest,
  CreateUserRequest,
  LoginUserRequest,
  VerifyForgotPasswordResetPinRequest,
  VerifyRegistrationRequest,
} from "../../schema/user.schema";
import { generateFourDigitPin } from "../../utils/generate-four-digit-pin";
import { generateAuthenticationToken } from "../../utils/generate-authentication-token";
import {
  createNewUser,
  deletePasswordResetPin,
  deleteRefreshToken,
  fetchPasswordResetPin,
  fetchRefreshTokenUserId,
  fetchVerifyRegistrationPin,
  fetchUserByEmail,
  storePasswordResetPin,
  storeRefreshToken,
  storeVerifyRegistrationPin,
  updateUserPasswordByEmail,
  fetchUserById,
} from "./userDataAccess";
import { sgMail } from "../../lib/sgMail";
import { decodeUserIdFromAuthToken } from "../../utils/decode-user-id-from-auth-token";

const REFRESH_TOKEN_EXPIRATION = AUTH_REFRESH_TOKEN_EXPIRATION * 60;

export const postCreateUser = async (
  { name, email, password, timezone }: CreateUserRequest,
  app: FastifyInstance
) => {
  const lowerCaseEmail = email.toLowerCase();
  const userAlreadyExists = await fetchUserByEmail(lowerCaseEmail);

  if (userAlreadyExists) {
    throw new CustomError("User already exists!", 409);
  }

  const passwordHash = await bcrypt.hash(password, 8);

  const generatedPin = generateFourDigitPin();
  const hashedPin = await bcrypt.hash(generatedPin, 8);

  const verifyPin = await storeVerifyRegistrationPin(
    {
      email: lowerCaseEmail,
      name,
      password: passwordHash,
      timezone,
      pin: hashedPin,
    },
    VERIFY_REGISTRATION_PIN_EXPIRATION,
    app.redis
  );

  if (!verifyPin) {
    throw new CustomError("Error on creating verification PIN", 500);
  }

  const msg: MailDataRequired = {
    from: "signup@savvycash.app",
    templateId: "d-a026c640cac548f1829502bd2f3e7714",
    personalizations: [
      {
        to: email,
        dynamicTemplateData: {
          subject: "Savvy | Verifique sua conta",
          first_name: name,
          firstDigit: generatedPin[0],
          secondDigit: generatedPin[1],
          thirdDigit: generatedPin[2],
          fourthDigit: generatedPin[3],
        },
      },
    ],
  };

  await sgMail.send(msg);
  return;
};

export const postVerifyRegistration = async (
  { email, verificationPin }: VerifyRegistrationRequest,
  app: FastifyInstance
) => {
  const verifyRegistrationPin = await fetchVerifyRegistrationPin(
    email,
    app.redis
  );

  if (!verifyRegistrationPin) {
    throw new CustomError("Invalid or expired PIN code", 401);
  }

  const verifyRegistrationPinBody = JSON.parse(verifyRegistrationPin);

  const pinMatch = await bcrypt.compare(
    verificationPin,
    verifyRegistrationPinBody.pin
  );

  if (!pinMatch) {
    throw new CustomError("Invalid or expired PIN code", 401);
  }

  const user = await createNewUser(
    verifyRegistrationPinBody.name,
    verifyRegistrationPinBody.email,
    verifyRegistrationPinBody.password,
    verifyRegistrationPinBody.timezone
  );

  const token = generateAuthenticationToken(user.id);
  const refreshToken = await storeRefreshToken(
    user.id,
    REFRESH_TOKEN_EXPIRATION,
    app.redis
  );

  return { user, token, refreshToken };
};

export const postLoginUser = async (
  { email, password }: LoginUserRequest,
  app: FastifyInstance
) => {
  const lowerCaseEmail = email.toLowerCase();
  const user = await fetchUserByEmail(lowerCaseEmail);

  if (!user) {
    throw new CustomError("Email or password incorrect", 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new CustomError("Email or password incorrect", 401);
  }

  const accessToken = generateAuthenticationToken(user.id);

  const refreshToken = await storeRefreshToken(
    user.id,
    REFRESH_TOKEN_EXPIRATION,
    app.redis
  );

  return { accessToken, refreshToken, user: { name: user.name, email } };
};

export const postRefreshUserToken = async (
  refreshToken: string,
  app: FastifyInstance
) => {
  const tokenUserId = await fetchRefreshTokenUserId(refreshToken, app.redis);

  if (!tokenUserId) {
    throw new CustomError("Refresh token invalid", 401);
  }

  const token = generateAuthenticationToken(tokenUserId);

  return token;
};

export const postLogoutUser = async (
  refreshToken: string,
  app: FastifyInstance
) => {
  const refreshTokenExists = await fetchRefreshTokenUserId(
    refreshToken,
    app.redis
  );

  if (!refreshTokenExists) {
    throw new CustomError("Invalid refresh token", 401);
  }

  await deleteRefreshToken(refreshToken, app.redis);
};

export const getForgotPassword = async (
  email: string,
  app: FastifyInstance
) => {
  const user = await fetchUserByEmail(email);

  if (!user) {
    throw new CustomError("User does not exist", 400);
  }

  const forgotPasswordPinExists = await fetchPasswordResetPin(email, app.redis);

  if (forgotPasswordPinExists) {
    await deletePasswordResetPin(email, app.redis);
  }

  const generatedPin = generateFourDigitPin();
  const hashedPin = await bcrypt.hash(generatedPin, 8);

  await storePasswordResetPin(
    email,
    hashedPin,
    FORGOT_PASSWORD_PIN_EXPIRATION,
    app.redis
  );

  const msg: MailDataRequired = {
    from: "signup@savvycash.app",
    templateId: "d-9bf44e233fba43f1a700a3976af2556d",
    personalizations: [
      {
        to: email,
        dynamicTemplateData: {
          subject: "Savvy | Redefina sua senha",
          first_name: user.name,
          firstDigit: generatedPin[0],
          secondDigit: generatedPin[1],
          thirdDigit: generatedPin[2],
          fourthDigit: generatedPin[3],
        },
      },
    ],
  };

  await sgMail.send(msg);
  return;
};

export const postVerifyForgotPasswordResetPin = async (
  { email, verificationPin }: VerifyForgotPasswordResetPinRequest,
  app: FastifyInstance
) => {
  const hashedResetPinCode = await fetchPasswordResetPin(email, app.redis);

  if (!hashedResetPinCode) {
    throw new CustomError("Invalid or expired PIN code", 400);
  }

  const pinMatch = await bcrypt.compare(verificationPin, hashedResetPinCode);

  if (!pinMatch) {
    throw new CustomError("Invalid or expired PIN code", 401);
  }

  return;
};

export const postCompleteForgotPasswordReset = async (
  { email, password, verificationPin }: CompleteForgotPasswordResetRequest,
  app: FastifyInstance
) => {
  const hashedResetPinCode = await fetchPasswordResetPin(email, app.redis);

  if (!hashedResetPinCode) {
    throw new CustomError("Invalid or expired PIN code", 400);
  }

  const pinMatch = await bcrypt.compare(verificationPin, hashedResetPinCode);

  if (!pinMatch) {
    throw new CustomError("Invalid or expired PIN code", 401);
  }

  const passwordHash = await bcrypt.hash(password, 8);

  await updateUserPasswordByEmail(passwordHash, email);
  await deletePasswordResetPin(email, app.redis);
  return;
};

export const getUserByToken = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const accessToken = request.headers.authorization;

  const userId = decodeUserIdFromAuthToken(accessToken!);

  const user = await fetchUserById(userId);

  reply
    .send({ name: user?.name, email: user?.email, timezone: user?.timezone })
    .code(200);
};
