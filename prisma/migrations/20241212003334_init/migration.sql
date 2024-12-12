-- AlterTable
ALTER TABLE `invoices` MODIFY `payment_status` ENUM('Pending', 'Paid', 'Paid_Off', 'Failed', 'Cancelled') NOT NULL;
