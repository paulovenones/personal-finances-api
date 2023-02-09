import { prisma } from "../../lib/prisma";

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({ where: { email } });

  return user;
};

export const createNewUser = async (
  name: string,
  email: string,
  password: string
) => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  return user;
};
