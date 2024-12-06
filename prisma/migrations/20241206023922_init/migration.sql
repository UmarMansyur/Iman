-- AlterTable
ALTER TABLE `ReportProduct` ADD COLUMN `type` ENUM('In', 'Out') NOT NULL DEFAULT 'In';
