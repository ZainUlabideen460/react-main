/*
  Warnings:

  - You are about to drop the column `courses` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `courses` on the `teachers` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `courses`,
    DROP COLUMN `updateAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `teachers` DROP COLUMN `courses`;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_coursesTostudents` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_coursesTostudents_AB_unique`(`A`, `B`),
    INDEX `_coursesTostudents_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_coursesToteachers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_coursesToteachers_AB_unique`(`A`, `B`),
    INDEX `_coursesToteachers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_coursesTostudents` ADD CONSTRAINT `_coursesTostudents_A_fkey` FOREIGN KEY (`A`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_coursesTostudents` ADD CONSTRAINT `_coursesTostudents_B_fkey` FOREIGN KEY (`B`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_coursesToteachers` ADD CONSTRAINT `_coursesToteachers_A_fkey` FOREIGN KEY (`A`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_coursesToteachers` ADD CONSTRAINT `_coursesToteachers_B_fkey` FOREIGN KEY (`B`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
