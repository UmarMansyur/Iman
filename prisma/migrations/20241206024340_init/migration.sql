/*
  Warnings:

  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PPN` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DeliveryTracking` DROP FOREIGN KEY `DeliveryTracking_invoice_id_fkey`;

-- DropForeignKey
ALTER TABLE `DetailInvoice` DROP FOREIGN KEY `DetailInvoice_invoice_id_fkey`;

-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_factory_id_fkey`;

-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_user_id_fkey`;

-- DropTable
DROP TABLE `Invoice`;

-- DropTable
DROP TABLE `PPN`;

-- CreateTable
CREATE TABLE `ppns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `desc` VARCHAR(191) NOT NULL,
    `percentage` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `invoice_code` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `discount` DOUBLE NULL,
    `ppn` DOUBLE NULL,
    `buyer` VARCHAR(191) NOT NULL,
    `sales_man` VARCHAR(191) NOT NULL,
    `recipient` VARCHAR(191) NOT NULL,
    `maturity_date` DATETIME(3) NOT NULL,
    `item_amount` DOUBLE NOT NULL,
    `discon_member` DOUBLE NULL,
    `buyer_address` VARCHAR(191) NOT NULL,
    `down_payment` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `sub_total` DOUBLE NOT NULL,
    `remaining_balance` DOUBLE NOT NULL,
    `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Cancelled') NOT NULL,
    `payment_method_id` INTEGER NOT NULL,

    UNIQUE INDEX `invoices_invoice_code_key`(`invoice_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `Factory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `PaymentMethod`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailInvoice` ADD CONSTRAINT `DetailInvoice_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryTracking` ADD CONSTRAINT `DeliveryTracking_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
