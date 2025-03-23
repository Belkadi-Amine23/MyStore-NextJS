/*
  Warnings:

  - You are about to drop the column `userId` on the `article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `article` DROP FOREIGN KEY `Article_userId_fkey`;

-- DropIndex
DROP INDEX `Article_userId_fkey` ON `article`;

-- AlterTable
ALTER TABLE `article` DROP COLUMN `userId`;
