/*
  Warnings:

  - You are about to drop the column `factory_id` on the `transaction_distributors` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaction_distributors` DROP FOREIGN KEY `transaction_distributors_factory_id_fkey`;

-- DropIndex
DROP INDEX `transaction_distributors_factory_id_fkey` ON `transaction_distributors`;

-- AlterTable
ALTER TABLE `transaction_distributors` DROP COLUMN `factory_id`,
    ADD COLUMN `factoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
