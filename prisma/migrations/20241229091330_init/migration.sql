/*
  Warnings:

  - Added the required column `distributor_id` to the `buyer_distributors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `factory_id` to the `buyer_distributors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distributor_id` to the `location_distributors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `factory_id` to the `location_distributors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `buyer_distributors` ADD COLUMN `distributor_id` INTEGER NOT NULL,
    ADD COLUMN `factory_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `location_distributors` ADD COLUMN `distributor_id` INTEGER NOT NULL,
    ADD COLUMN `factory_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `location_distributors` ADD CONSTRAINT `location_distributors_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location_distributors` ADD CONSTRAINT `location_distributors_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_distributors` ADD CONSTRAINT `buyer_distributors_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_distributors` ADD CONSTRAINT `buyer_distributors_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
