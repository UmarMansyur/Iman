-- CreateTable
CREATE TABLE `factory_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `factoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_distributor_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `gender` ENUM('Male', 'Female') NOT NULL,
    `date_of_birth` DATETIME(3) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `user_type` ENUM('Administrator', 'Operator') NOT NULL DEFAULT 'Operator',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `status` ENUM('Active', 'Pending', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_factories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,
    `status` ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `member_factories_factory_id_user_id_key`(`factory_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rekening` VARCHAR(191) NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `factory_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `material_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_stocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `material_unit_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `report_material_stock_id` INTEGER NULL,
    `order_material_unit_id` INTEGER NULL,
    `status` ENUM('In', 'Out') NOT NULL DEFAULT 'In',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_material_stocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_report_material_stocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `report_material_stock_id` INTEGER NOT NULL,
    `material_unit_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_material_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `total_item` DOUBLE NOT NULL DEFAULT 0,
    `total_item_received` DOUBLE NOT NULL DEFAULT 0,
    `type_preorder` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `desc` TEXT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_order_material_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_order_material_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_material_unit_id` INTEGER NOT NULL,
    `material_unit_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `amount_received` DOUBLE NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_order_detail_material_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `detail_order_material_unit_id` INTEGER NOT NULL,
    `amount_received` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `materialUnitId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('Kretek', 'Gabus') NOT NULL,
    `price` DOUBLE NOT NULL,
    `per_slop` DOUBLE NULL DEFAULT 10,
    `per_bal` DOUBLE NULL DEFAULT 200,
    `per_karton` DOUBLE NULL DEFAULT 800,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_price_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NULL,
    `factory_distributor_id` INTEGER NULL,
    `product_id` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `sale_price` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `userId` INTEGER NULL,
    `memberFactoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cost_deliveries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` ENUM('In', 'Out') NOT NULL DEFAULT 'In',
    `report_product_id` INTEGER NULL,
    `invoice_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `factory_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `morning_shift_amount` DOUBLE NULL,
    `morning_shift_time` TIME NULL,
    `morning_shift_user_id` INTEGER NULL,
    `afternoon_shift_amount` DOUBLE NULL,
    `afternoon_shift_time` TIME NULL,
    `afternoon_shift_user_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_costs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `material_id` INTEGER NOT NULL,
    `factory_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discounts` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,

    UNIQUE INDEX `discounts_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ppns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `desc` VARCHAR(191) NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,
    `bank_account_id` INTEGER NULL,
    `is_distributor` BOOLEAN NOT NULL DEFAULT false,
    `invoice_code` VARCHAR(191) NOT NULL,
    `discount` DOUBLE NULL DEFAULT 0,
    `ppn` DOUBLE NULL DEFAULT 0,
    `buyer_id` INTEGER NULL,
    `maturity_date` DATETIME(3) NULL,
    `item_amount` DOUBLE NOT NULL,
    `discon_member` DOUBLE NULL DEFAULT 0,
    `down_payment` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `sub_total` DOUBLE NOT NULL DEFAULT 0,
    `remaining_balance` DOUBLE NOT NULL DEFAULT 0,
    `payment_status` ENUM('Unpaid', 'Pending', 'Paid', 'Paid_Off', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `payment_method_id` INTEGER NOT NULL,
    `proof_of_payment` TEXT NULL,
    `proof_of_payment_2` TEXT NULL,
    `type_preorder` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `reject_reason` VARCHAR(191) NULL,

    UNIQUE INDEX `invoices_invoice_code_key`(`invoice_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NULL,
    `desc` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `discount` DOUBLE NULL DEFAULT 0,
    `sub_total` DOUBLE NOT NULL DEFAULT 0,
    `invoice_id` INTEGER NOT NULL,
    `is_product` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_order_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_trackings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sales_man` VARCHAR(191) NULL,
    `recipient` VARCHAR(191) NULL,
    `invoice_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NULL,
    `location_id` INTEGER NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `cost` DOUBLE NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `status` ENUM('Process', 'Sent', 'Done', 'Cancel') NOT NULL DEFAULT 'Process',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NOT NULL DEFAULT 0,
    `distributor_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `factoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyer_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `factoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_code` VARCHAR(191) NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `location_distributor_id` INTEGER NOT NULL,
    `status_payment` ENUM('Pending', 'Paid', 'Paid_Off', 'Failed') NOT NULL DEFAULT 'Pending',
    `status_delivery` ENUM('Process', 'Sent', 'Done', 'Cancel') NOT NULL DEFAULT 'Process',
    `payment_method_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `cost_delivery` DOUBLE NULL DEFAULT 0,
    `desc_delivery` VARCHAR(191) NULL,
    `down_payment` DOUBLE NULL DEFAULT 0,
    `remaining_balance` DOUBLE NULL DEFAULT 0,
    `ppn` DOUBLE NULL DEFAULT 0,
    `discount` DOUBLE NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `invoiceId` INTEGER NULL,
    `factoryId` INTEGER NULL,

    UNIQUE INDEX `transaction_distributors_invoice_code_key`(`invoice_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jasas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `factory_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_jasas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `factory_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `maturity_date` DATE NULL,
    `down_payment` DOUBLE NULL DEFAULT 0,
    `remaining_balance` DOUBLE NULL DEFAULT 0,
    `amount` DOUBLE NOT NULL,
    `discount` DOUBLE NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `invoiceId` INTEGER NULL,
    `jasaId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_invoice_jasas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NOT NULL,
    `jasa_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

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
    `product_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `transaction_code` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `payment_method_id` INTEGER NOT NULL,
    `down_payment` DOUBLE NULL DEFAULT 0,
    `maturity_date` DATETIME(3) NULL,
    `remaining_balance` DOUBLE NULL,
    `desc` VARCHAR(191) NOT NULL,
    `proof_of_payment` VARCHAR(191) NULL,
    `status` ENUM('Pending', 'Paid_Off', 'Paid', 'Unpaid') NOT NULL DEFAULT 'Paid',
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
    `discount` DOUBLE NULL DEFAULT 0,
    `subtotal` DOUBLE NOT NULL,
    `subtotal_discount` DOUBLE NOT NULL,
    `service_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `factory_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_bahan_baku_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory` VARCHAR(191) NOT NULL,
    `factory_distributor_id` INTEGER NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `desc` TEXT NOT NULL,
    `total` DOUBLE NOT NULL,
    `type_preorder` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `factory_distributor_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_order_bahan_baku_distributors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_bahan_baku_distributor_id` INTEGER NOT NULL,
    `material_distributor_id` INTEGER NOT NULL,
    `amount_received` DOUBLE NULL,
    `amount` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `sub_total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `factory_distributors` ADD CONSTRAINT `factory_distributors_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_distributors` ADD CONSTRAINT `member_distributors_factory_distributor_id_fkey` FOREIGN KEY (`factory_distributor_id`) REFERENCES `factory_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_distributors` ADD CONSTRAINT `member_distributors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factories` ADD CONSTRAINT `factories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_accounts` ADD CONSTRAINT `bank_accounts_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materials` ADD CONSTRAINT `materials_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_units` ADD CONSTRAINT `material_units_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_units` ADD CONSTRAINT `material_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_stocks` ADD CONSTRAINT `material_stocks_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_stocks` ADD CONSTRAINT `material_stocks_material_unit_id_fkey` FOREIGN KEY (`material_unit_id`) REFERENCES `material_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_material_stocks` ADD CONSTRAINT `report_material_stocks_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_material_stocks` ADD CONSTRAINT `report_material_stocks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_report_material_stocks` ADD CONSTRAINT `detail_report_material_stocks_report_material_stock_id_fkey` FOREIGN KEY (`report_material_stock_id`) REFERENCES `report_material_stocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_report_material_stocks` ADD CONSTRAINT `detail_report_material_stocks_material_unit_id_fkey` FOREIGN KEY (`material_unit_id`) REFERENCES `material_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_material_units` ADD CONSTRAINT `order_material_units_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_material_units` ADD CONSTRAINT `order_material_units_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_order_material_units` ADD CONSTRAINT `log_order_material_units_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_order_material_units` ADD CONSTRAINT `detail_order_material_units_order_material_unit_id_fkey` FOREIGN KEY (`order_material_unit_id`) REFERENCES `order_material_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_order_material_units` ADD CONSTRAINT `detail_order_material_units_material_unit_id_fkey` FOREIGN KEY (`material_unit_id`) REFERENCES `material_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_order_detail_material_units` ADD CONSTRAINT `log_order_detail_material_units_detail_order_material_unit__fkey` FOREIGN KEY (`detail_order_material_unit_id`) REFERENCES `detail_order_material_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_order_detail_material_units` ADD CONSTRAINT `log_order_detail_material_units_materialUnitId_fkey` FOREIGN KEY (`materialUnitId`) REFERENCES `material_units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_price_products` ADD CONSTRAINT `member_price_products_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_price_products` ADD CONSTRAINT `member_price_products_factory_distributor_id_fkey` FOREIGN KEY (`factory_distributor_id`) REFERENCES `factory_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_price_products` ADD CONSTRAINT `member_price_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_price_products` ADD CONSTRAINT `member_price_products_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_price_products` ADD CONSTRAINT `member_price_products_memberFactoryId_fkey` FOREIGN KEY (`memberFactoryId`) REFERENCES `member_factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cost_deliveries` ADD CONSTRAINT `cost_deliveries_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cost_deliveries` ADD CONSTRAINT `cost_deliveries_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_products` ADD CONSTRAINT `stock_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_products` ADD CONSTRAINT `stock_products_report_product_id_fkey` FOREIGN KEY (`report_product_id`) REFERENCES `report_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_products` ADD CONSTRAINT `stock_products_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_morning_shift_user_id_fkey` FOREIGN KEY (`morning_shift_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_afternoon_shift_user_id_fkey` FOREIGN KEY (`afternoon_shift_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyers` ADD CONSTRAINT `buyers_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_bank_account_id_fkey` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_invoices` ADD CONSTRAINT `detail_invoices_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_invoices` ADD CONSTRAINT `detail_invoices_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_order_distributors` ADD CONSTRAINT `log_order_distributors_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `locations` ADD CONSTRAINT `locations_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_trackings` ADD CONSTRAINT `delivery_trackings_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_trackings` ADD CONSTRAINT `delivery_trackings_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location_distributors` ADD CONSTRAINT `location_distributors_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location_distributors` ADD CONSTRAINT `location_distributors_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_distributors` ADD CONSTRAINT `buyer_distributors_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_distributors` ADD CONSTRAINT `buyer_distributors_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyer_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_location_distributor_id_fkey` FOREIGN KEY (`location_distributor_id`) REFERENCES `location_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jasas` ADD CONSTRAINT `jasas_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_jasas` ADD CONSTRAINT `invoice_jasas_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_jasas` ADD CONSTRAINT `invoice_jasas_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_jasas` ADD CONSTRAINT `invoice_jasas_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_jasas` ADD CONSTRAINT `invoice_jasas_jasaId_fkey` FOREIGN KEY (`jasaId`) REFERENCES `jasas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_invoice_jasas` ADD CONSTRAINT `detail_invoice_jasas_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_invoice_jasas` ADD CONSTRAINT `detail_invoice_jasas_jasa_id_fkey` FOREIGN KEY (`jasa_id`) REFERENCES `jasas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaction_distributors` ADD CONSTRAINT `detail_transaction_distributors_transaction_distributor_id_fkey` FOREIGN KEY (`transaction_distributor_id`) REFERENCES `transaction_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaction_distributors` ADD CONSTRAINT `detail_transaction_distributors_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaction_services` ADD CONSTRAINT `detail_transaction_services_transaction_service_id_fkey` FOREIGN KEY (`transaction_service_id`) REFERENCES `transaction_services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaction_services` ADD CONSTRAINT `detail_transaction_services_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_bahan_baku_distributors` ADD CONSTRAINT `order_bahan_baku_distributors_factory_distributor_id_fkey` FOREIGN KEY (`factory_distributor_id`) REFERENCES `factory_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_bahan_baku_distributors` ADD CONSTRAINT `order_bahan_baku_distributors_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_distributors` ADD CONSTRAINT `material_distributors_factory_distributor_id_fkey` FOREIGN KEY (`factory_distributor_id`) REFERENCES `factory_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_distributors` ADD CONSTRAINT `material_distributors_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_order_bahan_baku_distributors` ADD CONSTRAINT `detail_order_bahan_baku_distributors_order_bahan_baku_distr_fkey` FOREIGN KEY (`order_bahan_baku_distributor_id`) REFERENCES `order_bahan_baku_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_order_bahan_baku_distributors` ADD CONSTRAINT `detail_order_bahan_baku_distributors_material_distributor_i_fkey` FOREIGN KEY (`material_distributor_id`) REFERENCES `material_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
