-- DropIndex
DROP INDEX `Achat_telephone_key` ON `achat`;

-- AlterTable
ALTER TABLE `achat` MODIFY `telephone` TEXT NOT NULL;
