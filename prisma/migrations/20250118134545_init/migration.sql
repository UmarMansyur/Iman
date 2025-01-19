/*
  Warnings:

  - A unique constraint covering the columns `[order_code]` on the table `MaterialDistributor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_code` to the `MaterialDistributor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `materialdistributor` ADD COLUMN `order_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `MaterialDistributor_order_code_key` ON `MaterialDistributor`(`order_code`);
