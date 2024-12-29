/*
  Warnings:

  - A unique constraint covering the columns `[invoice_code]` on the table `transaction_distributors` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoice_code` to the `transaction_distributors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction_distributors` ADD COLUMN `invoice_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `transaction_distributors_invoice_code_key` ON `transaction_distributors`(`invoice_code`);
