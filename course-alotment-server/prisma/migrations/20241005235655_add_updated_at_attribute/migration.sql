/*
  Warnings:

  - Added the required column `credit_hour` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `practical_classes` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theory_classes` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `courses` ADD COLUMN `credit_hour` INTEGER NOT NULL,
    ADD COLUMN `practical_classes` INTEGER NOT NULL,
    ADD COLUMN `theory_classes` INTEGER NOT NULL;
