-- AlterTable
ALTER TABLE `detail_transaction_distributors` ADD COLUMN `product_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `distributor_stocks` ADD COLUMN `invoice_code` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `detail_transaction_distributors` ADD CONSTRAINT `detail_transaction_distributors_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
