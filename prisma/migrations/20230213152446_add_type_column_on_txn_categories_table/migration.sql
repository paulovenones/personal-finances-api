/*
  Warnings:

  - Added the required column `type` to the `txn_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "txn_categories" ADD COLUMN     "type" INTEGER NOT NULL;
