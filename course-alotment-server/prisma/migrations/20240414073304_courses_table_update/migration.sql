/*
  Warnings:

  - Added the required column `course_code` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `courses` ADD COLUMN `course_code` VARCHAR(191) NOT NULL;
