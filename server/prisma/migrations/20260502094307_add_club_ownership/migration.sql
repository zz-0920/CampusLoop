/*
  Warnings:

  - Added the required column `owner_id` to the `clubs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clubs` ADD COLUMN `owner_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `posts` MODIFY `image` TEXT NULL;

-- AddForeignKey
ALTER TABLE `clubs` ADD CONSTRAINT `clubs_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
