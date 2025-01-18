-- CreateTable
CREATE TABLE `OrderBahanBakuDistributor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory` VARCHAR(191) NOT NULL,
    `factory_distributor_id` INTEGER NOT NULL,
    `distributor_id` INTEGER NOT NULL,
    `desc` TEXT NOT NULL,
    `total` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialDistributor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `factory_distributor_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailOrderBahanBakuDistributor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `material_distributor_id` INTEGER NOT NULL,
    `amount_received` DOUBLE NULL,
    `amount` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `sub_total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderBahanBakuDistributor` ADD CONSTRAINT `OrderBahanBakuDistributor_factory_distributor_id_fkey` FOREIGN KEY (`factory_distributor_id`) REFERENCES `factory_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderBahanBakuDistributor` ADD CONSTRAINT `OrderBahanBakuDistributor_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialDistributor` ADD CONSTRAINT `MaterialDistributor_factory_distributor_id_fkey` FOREIGN KEY (`factory_distributor_id`) REFERENCES `factory_distributors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialDistributor` ADD CONSTRAINT `MaterialDistributor_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailOrderBahanBakuDistributor` ADD CONSTRAINT `DetailOrderBahanBakuDistributor_material_distributor_id_fkey` FOREIGN KEY (`material_distributor_id`) REFERENCES `MaterialDistributor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
