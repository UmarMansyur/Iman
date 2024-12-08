-- AlterTable
ALTER TABLE `ppns` ADD COLUMN `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active';
