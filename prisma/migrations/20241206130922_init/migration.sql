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
    `status` ENUM('In', 'Out') NOT NULL DEFAULT 'In',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('Kretek', 'Gabus') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `parent_id` INTEGER NULL,
    `convert_from_parent` DOUBLE NULL,
    `factoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `price_product_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_unit_id` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `sale_price` DOUBLE NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_unit_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `productId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `factory_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `morning_shift_amount` DOUBLE NULL,
    `morning_shift_time` TIME NULL,
    `afternoon_shift_amount` DOUBLE NULL,
    `afternoon_shift_time` TIME NULL,
    `type` ENUM('In', 'Out') NOT NULL DEFAULT 'In',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

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
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_code_key`(`invoice_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `discount` DOUBLE NULL DEFAULT 0,
    `sub_total` DOUBLE NOT NULL DEFAULT 0,
    `invoice_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_trackings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `cost` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_accounts` ADD CONSTRAINT `bank_accounts_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_units` ADD CONSTRAINT `material_units_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_units` ADD CONSTRAINT `material_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_stocks` ADD CONSTRAINT `material_stocks_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_stocks` ADD CONSTRAINT `material_stocks_material_unit_id_fkey` FOREIGN KEY (`material_unit_id`) REFERENCES `material_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_factoryId_fkey` FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_product_units` ADD CONSTRAINT `price_product_units_product_unit_id_fkey` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_products` ADD CONSTRAINT `stock_products_product_unit_id_fkey` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_products` ADD CONSTRAINT `stock_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_products` ADD CONSTRAINT `report_products_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_costs` ADD CONSTRAINT `report_costs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_invoices` ADD CONSTRAINT `detail_invoices_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_invoices` ADD CONSTRAINT `detail_invoices_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_trackings` ADD CONSTRAINT `delivery_trackings_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
