/*
  Warnings:

  - You are about to drop the `MemberFactory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MemberFactory` DROP FOREIGN KEY `MemberFactory_factory_id_fkey`;

-- DropForeignKey
ALTER TABLE `MemberFactory` DROP FOREIGN KEY `MemberFactory_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `MemberFactory` DROP FOREIGN KEY `MemberFactory_user_id_fkey`;

-- DropTable
DROP TABLE `MemberFactory`;

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

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_factories` ADD CONSTRAINT `member_factories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
