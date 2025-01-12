/*
  Warnings:

  - You are about to drop the column `factory_id` on the `buyer_distributors` table. All the data in the column will be lost.
  - You are about to drop the column `factory_id` on the `location_distributors` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `buyer_distributors` DROP FOREIGN KEY `buyer_distributors_factory_id_fkey`;

-- DropForeignKey
ALTER TABLE `location_distributors` DROP FOREIGN KEY `location_distributors_factory_id_fkey`;

-- DropIndex
DROP INDEX `buyer_distributors_factory_id_fkey` ON `buyer_distributors`;

-- DropIndex
DROP INDEX `location_distributors_factory_id_fkey` ON `location_distributors`;

-- AlterTable
ALTER TABLE `buyer_distributors` DROP COLUMN `factory_id`,
    ADD COLUMN `factoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `buyers` MODIFY `factory_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `location_distributors` DROP COLUMN `factory_id`,
    ADD COLUMN `factoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `location_distributors` ADD CONSTRAINT `location_distributors_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_distributors` ADD CONSTRAINT `buyer_distributors_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
