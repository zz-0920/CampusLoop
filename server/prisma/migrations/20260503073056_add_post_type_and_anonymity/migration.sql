-- AlterTable
ALTER TABLE `posts` ADD COLUMN `is_anonymous` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'normal';
