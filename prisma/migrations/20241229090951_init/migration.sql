/*
  Warnings:

  - You are about to drop the column `buyer` on the `transaction_distributors` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_address` on the `transaction_distributors` table. All the data in the column will be lost.
  - Added the required column `location_distributor_id` to the `transaction_distributors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction_distributors` DROP COLUMN `buyer`,
    DROP COLUMN `buyer_address`,
    ADD COLUMN `location_distributor_id` INTEGER NOT NULL,
    ADD COLUMN `status_delivery` ENUM('Process', 'Sent', 'Done', 'Cancel') NOT NULL DEFAULT 'Process',
    ADD COLUMN `status_payment` ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending';

-- CreateTable
CREATE TABLE `location_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyer_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyer_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_location_distributor_id_fkey` FOREIGN KEY (`location_distributor_id`) REFERENCES `location_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
