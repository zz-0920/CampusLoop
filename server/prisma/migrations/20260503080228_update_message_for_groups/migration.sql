-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_receiver_id_fkey`;

-- AlterTable
ALTER TABLE `messages` ADD COLUMN `club_id` INTEGER NULL,
    ADD COLUMN `is_public` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `receiver_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
