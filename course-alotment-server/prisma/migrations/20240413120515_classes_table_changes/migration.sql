/*
  Warnings:

  - Added the required column `course` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `classes` ADD COLUMN `course` VARCHAR(191) NOT NULL,
    MODIFY `semester` VARCHAR(191) NOT NULL;
