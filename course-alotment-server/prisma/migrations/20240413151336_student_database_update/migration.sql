/*
  Warnings:

  - You are about to drop the column `course_class` on the `students` table. All the data in the column will be lost.
  - Added the required column `classes_info` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courses` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `course_class`,
    ADD COLUMN `classes_info` JSON NOT NULL,
    ADD COLUMN `courses` JSON NOT NULL;
