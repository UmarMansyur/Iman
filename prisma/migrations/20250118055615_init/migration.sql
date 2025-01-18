/*
  Warnings:

  - Added the required column `order_bahan_baku_distributor_id` to the `DetailOrderBahanBakuDistributor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DetailOrderBahanBakuDistributor` ADD COLUMN `order_bahan_baku_distributor_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `DetailOrderBahanBakuDistributor` ADD CONSTRAINT `DetailOrderBahanBakuDistributor_order_bahan_baku_distributo_fkey` FOREIGN KEY (`order_bahan_baku_distributor_id`) REFERENCES `OrderBahanBakuDistributor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
