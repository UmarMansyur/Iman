/*
  Warnings:

  - Added the required column `factory_id` to the `transaction_distributors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction_distributors` ADD COLUMN `factory_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `transaction_distributors` ADD CONSTRAINT `transaction_distributors_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
