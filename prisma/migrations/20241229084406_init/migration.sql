-- CreateTable
CREATE TABLE `transaction_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `distributor_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `buyer` VARCHAR(191) NOT NULL,
    `buyer_address` VARCHAR(191) NOT NULL,
    `payment_method_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `ppn` DOUBLE NULL DEFAULT 0,
    `discount` DOUBLE NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `invoiceId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_transaction_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_distributor_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `discount` DOUBLE NULL DEFAULT 0,
    `sale_price` DOUBLE NOT NULL,
    `is_product` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaction_distributors` ADD CONSTRAINT `detail_transaction_distributors_transaction_distributor_id_fkey` FOREIGN KEY (`transaction_distributor_id`) REFERENCES `transaction_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
