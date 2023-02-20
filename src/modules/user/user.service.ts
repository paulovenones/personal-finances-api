import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import {
  AUTH_REFRESH_TOKEN_EXPIRATION,
  SENDGRID_API_KEY,
  VERIFY_REGISTRATION_PIN_EXPIRATION,
} from "../../config/configuration";
import { CustomError } from "../../helpers/CustomError";
import sgMail, { MailDataRequired } from "@sendgrid/mail";

import {
  CreateUserRequest,
  LoginUserRequest,
  VerifyRegistrationRequest,
} from "../../schema/user.schema";
import { generateFourDigitPin } from "../../utils/generate-four-digit-pin";
import { generateAuthenticationToken } from "../../utils/generate-authentication-token";
import {
  createNewUser,
  deleteRefreshToken,
  fetchRefreshTokenUserId,
  fetchVerifyRegistrationPin,
  getUserByEmail,
  storeRefreshToken,
  storeVerifyRegistrationPin,
} from "./userDataAccess";

const REFRESH_TOKEN_EXPIRATION = AUTH_REFRESH_TOKEN_EXPIRATION * 60;

export const postCreateUser = async (
  { name, email, password, timezone }: CreateUserRequest,
  app: FastifyInstance
) => {
  const lowerCaseEmail = email.toLowerCase();
  const userAlreadyExists = await getUserByEmail(lowerCaseEmail);

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

  sgMail.setApiKey(SENDGRID_API_KEY);
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
    throw new CustomError("Invalid verify registration PIN", 401);
  }

  const verifyRegistrationPinBody = JSON.parse(verifyRegistrationPin);

  const pinMatch = await bcrypt.compare(
    verificationPin,
    verifyRegistrationPinBody.pin
  );

  if (!pinMatch) {
    throw new CustomError("Invalid verify registration PIN", 401);
  }

  const user = await createNewUser(
    verifyRegistrationPinBody.name,
    email,
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
  const userAlreadyExists = await getUserByEmail(lowerCaseEmail);

  if (!userAlreadyExists) {
    throw new CustomError("Email or password incorrect", 401);
  }

  const passwordMatch = await bcrypt.compare(
    password,
    userAlreadyExists.password
  );

  if (!passwordMatch) {
    throw new CustomError("Email or password incorrect", 401);
  }

  const token = generateAuthenticationToken(userAlreadyExists.id);

  const refreshToken = await storeRefreshToken(
    userAlreadyExists.id,
    REFRESH_TOKEN_EXPIRATION,
    app.redis
  );

  return { token, refreshToken };
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
