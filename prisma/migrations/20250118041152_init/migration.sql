/*
  Warnings:

  - Added the required column `type_preorder` to the `OrderBahanBakuDistributor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderBahanBakuDistributor` ADD COLUMN `type_preorder` BOOLEAN NOT NULL;
