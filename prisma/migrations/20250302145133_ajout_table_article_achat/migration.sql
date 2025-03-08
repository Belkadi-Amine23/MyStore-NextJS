/*
  Warnings:

  - You are about to drop the column `articles` on the `achat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `achat` DROP COLUMN `articles`;

-- CreateTable
CREATE TABLE `ArticleAchat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `achatId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `quantité` INTEGER NOT NULL,
    `prix` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArticleAchat` ADD CONSTRAINT `ArticleAchat_achatId_fkey` FOREIGN KEY (`achatId`) REFERENCES `Achat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleAchat` ADD CONSTRAINT `ArticleAchat_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
