/*
  Warnings:

  - The values [Kretek,Gabus] on the enum `products_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `products` MODIFY `type` ENUM('SKM', 'SKT', 'SPM') NOT NULL;
