-- AlterTable
ALTER TABLE `article` MODIFY `titre` TEXT NOT NULL,
    MODIFY `description` TEXT NOT NULL,
    MODIFY `famille` TEXT NOT NULL,
    MODIFY `imageUrl` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `famille` MODIFY `type` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `name` TEXT NOT NULL,
    MODIFY `password` TEXT NOT NULL,
    MODIFY `role` TEXT NOT NULL;
