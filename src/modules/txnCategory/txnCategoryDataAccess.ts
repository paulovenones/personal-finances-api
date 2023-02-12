import { prisma } from "../../lib/prisma";

export const createNewTxnCategory = async (
  name: string,
  color: string,
  userId: string
) => {
  const txnCategory = await prisma.txnCategory.create({
    data: {
      name,
      color,
      userId,
    },
  });

  return txnCategory;
};

export const fetchUserTxnCategoryByName = async (
  name: string,
  userId: string
) => {
  const txnCategory = await prisma.txnCategory.findFirst({
    where: {
      name,
      userId,
    },
  });

  return txnCategory;
};

export const fetchTxnCategory = async (id: string) => {
  const txnCategory = await prisma.txnCategory.findFirst({
    where: {
      id,
    },
  });

  return txnCategory;
};

export const fetchAllUserTxnCategories = async (userId: string) => {
  const txnCategories = await prisma.txnCategory.findMany({
    where: {
      userId,
    },
  });

  return txnCategories;
};

export const updateTxnCategory = async (
  id: string,
  name: string,
  color: string
) => {
  const txnCategory = await prisma.txnCategory.update({
    where: {
      id,
    },
    data: {
      name,
      color,
    },
  });

  return txnCategory;
};
