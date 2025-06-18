/*
  Warnings:

  - You are about to drop the column `age` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnic]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aridno` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class_section` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnic` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courses` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `age`,
    DROP COLUMN `fullname`,
    ADD COLUMN `aridno` VARCHAR(191) NOT NULL,
    ADD COLUMN `class_section` VARCHAR(191) NOT NULL,
    ADD COLUMN `cnic` INTEGER NOT NULL,
    ADD COLUMN `courses` VARCHAR(191) NOT NULL,
    ADD COLUMN `degree` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `teachers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `cnic` INTEGER NOT NULL,
    `teacherid` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `courses` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teachers_cnic_key`(`cnic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `classroom` VARCHAR(191) NOT NULL,
    `classtime` VARCHAR(191) NOT NULL,
    `teacher` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `classes_classroom_key`(`classroom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `class_section` VARCHAR(191) NOT NULL,
    `aridno` VARCHAR(191) NOT NULL,
    `degree` VARCHAR(191) NOT NULL,
    `review` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reports_degree_key`(`degree`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `students_cnic_key` ON `students`(`cnic`);
