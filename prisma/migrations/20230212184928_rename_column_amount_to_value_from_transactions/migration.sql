/*
  Warnings:

  - You are about to drop the column `amount` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "amount",
ADD COLUMN     "value" DECIMAL(65,30) NOT NULL DEFAULT 0;
