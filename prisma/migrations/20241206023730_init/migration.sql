/*
  Warnings:

  - You are about to drop the column `unitId` on the `StockProduct` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `StockProduct` DROP FOREIGN KEY `StockProduct_unitId_fkey`;

-- AlterTable
ALTER TABLE `ReportProduct` ADD COLUMN `afternoon_shift_amount` DOUBLE NULL,
    ADD COLUMN `morning_shift_amount` DOUBLE NULL;

-- AlterTable
ALTER TABLE `StockProduct` DROP COLUMN `unitId`;
