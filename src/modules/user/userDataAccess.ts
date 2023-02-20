import { FastifyRedis } from "@fastify/redis";
import crypto from "crypto";

import { prisma } from "../../lib/prisma";

interface IStoreVerifyRegistrationPin {
  name: string;
  password: string;
  email: string;
  timezone: string;
  pin: string;
}

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({ where: { email } });

  return user;
};

export const createNewUser = async (
  name: string,
  email: string,
  password: string,
  timezone: string
) => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      timezone,
    },
  });

  return user;
};

export const fetchVerifyRegistrationPin = async (
  email: string,
  redis: FastifyRedis
) => {
  const verifyRegistrationPin = await redis.get(`verify_pin:${email}`);

  return verifyRegistrationPin;
};

export const storeVerifyRegistrationPin = async (
  registrationBody: IStoreVerifyRegistrationPin,
  expiresIn: number,
  redis: FastifyRedis
) => {
  const registrationPin = await redis.set(
    `verify_pin:${registrationBody.email}`,
    JSON.stringify(registrationBody),
    "EX",
    expiresIn
  );

  return registrationPin;
};

export const storeRefreshToken = async (
  userId: string,
  expiresIn: number,
  redisClient: FastifyRedis
) => {
  const refreshTokenId = crypto.randomUUID();
  await redisClient.set(
    `refresh_token:${refreshTokenId}`,
    userId,
    "EX",
    expiresIn
  );

  return refreshTokenId;
};

export const fetchRefreshTokenUserId = async (
  refreshToken: string,
  redisClient: FastifyRedis
) => {
  const refreshTokenUserId = await redisClient.get(
    `refresh_token:${refreshToken}`
  );

  return refreshTokenUserId;
};

export const deleteRefreshToken = async (
  refreshToken: string,
  redisClient: FastifyRedis
) => {
  const deletedRefreshToken = await redisClient.del(
    `refresh_token:${refreshToken}`
  );

  return deletedRefreshToken;
};
