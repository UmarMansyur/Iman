/*
  Warnings:

  - You are about to drop the column `productUnitId` on the `PriceProductUnit` table. All the data in the column will be lost.
  - Added the required column `product_unit_id` to the `PriceProductUnit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PriceProductUnit` DROP FOREIGN KEY `PriceProductUnit_productUnitId_fkey`;

-- AlterTable
ALTER TABLE `PriceProductUnit` DROP COLUMN `productUnitId`,
    ADD COLUMN `product_unit_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PriceProductUnit` ADD CONSTRAINT `PriceProductUnit_product_unit_id_fkey` FOREIGN KEY (`product_unit_id`) REFERENCES `ProductUnit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
