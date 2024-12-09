/*
  Warnings:

  - Added the required column `member_factory_id` to the `MemberPriceProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MemberPriceProduct` ADD COLUMN `member_factory_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MemberPriceProduct` ADD CONSTRAINT `MemberPriceProduct_member_factory_id_fkey` FOREIGN KEY (`member_factory_id`) REFERENCES `member_factories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
