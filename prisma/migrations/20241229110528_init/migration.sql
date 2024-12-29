-- AlterTable
ALTER TABLE `transaction_distributors` ADD COLUMN `down_payment` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `remaining_balance` DOUBLE NULL DEFAULT 0;
