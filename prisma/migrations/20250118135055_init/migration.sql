/*
  Warnings:

  - You are about to drop the column `order_code` on the `materialdistributor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `MaterialDistributor_order_code_key` ON `materialdistributor`;

-- AlterTable
ALTER TABLE `materialdistributor` DROP COLUMN `order_code`;
