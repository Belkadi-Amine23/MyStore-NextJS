-- CreateTable
CREATE TABLE `Achat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` TEXT NOT NULL,
    `prenom` TEXT NOT NULL,
    `wilaya` TEXT NOT NULL,
    `ville` TEXT NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `totalMontant` DOUBLE NOT NULL,
    `articles` JSON NOT NULL,
    `validé` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Achat_telephone_key`(`telephone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
