/*
  Warnings:

  - You are about to drop the `_coursestostudents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_coursestoteachers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courses` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courses` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_coursestostudents` DROP FOREIGN KEY `_coursesTostudents_A_fkey`;

-- DropForeignKey
ALTER TABLE `_coursestostudents` DROP FOREIGN KEY `_coursesTostudents_B_fkey`;

-- DropForeignKey
ALTER TABLE `_coursestoteachers` DROP FOREIGN KEY `_coursesToteachers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_coursestoteachers` DROP FOREIGN KEY `_coursesToteachers_B_fkey`;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `courses` JSON NOT NULL;

-- AlterTable
ALTER TABLE `teachers` ADD COLUMN `courses` JSON NOT NULL;

-- DropTable
DROP TABLE `_coursestostudents`;

-- DropTable
DROP TABLE `_coursestoteachers`;
