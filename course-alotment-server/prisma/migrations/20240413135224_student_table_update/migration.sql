/*
  Warnings:

  - You are about to drop the column `class_section` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `courses` on the `students` table. All the data in the column will be lost.
  - Added the required column `course_class` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `class_section`,
    DROP COLUMN `courses`,
    ADD COLUMN `course_class` JSON NOT NULL,
    ADD COLUMN `section` VARCHAR(191) NOT NULL,
    ADD COLUMN `semester` VARCHAR(191) NOT NULL,
    ADD COLUMN `shift` VARCHAR(191) NOT NULL;
