/*
  Warnings:

  - Added the required column `factory_id` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `services` ADD COLUMN `factory_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `transaction_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_code` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `down_payment` DOUBLE NULL DEFAULT 0,
    `remaining_balance` DOUBLE NULL,
    `desc` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transaction_services_transaction_code_key`(`transaction_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_transaction_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_service_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `service_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaction_services` ADD CONSTRAINT `detail_transaction_services_transaction_service_id_fkey` FOREIGN KEY (`transaction_service_id`) REFERENCES `transaction_services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaction_services` ADD CONSTRAINT `detail_transaction_services_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
