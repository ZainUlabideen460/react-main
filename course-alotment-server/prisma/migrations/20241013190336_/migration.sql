/*
  Warnings:

  - You are about to drop the `_teachercourses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_teachercourses` DROP FOREIGN KEY `_TeacherCourses_A_fkey`;

-- DropForeignKey
ALTER TABLE `_teachercourses` DROP FOREIGN KEY `_TeacherCourses_B_fkey`;

-- DropTable
DROP TABLE `_teachercourses`;

-- DropTable
DROP TABLE `course`;

-- DropTable
DROP TABLE `teacher`;

-- CreateTable
CREATE TABLE `teachers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `cnic` VARCHAR(191) NOT NULL,
    `teacherid` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `courses` JSON NOT NULL,
    `password` VARCHAR(191) NOT NULL DEFAULT '12345678',
    `courseTitle` VARCHAR(255) NOT NULL,
    `creditHours` VARCHAR(255) NOT NULL,
    `semester` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `teachers_cnic_key`(`cnic`),
    UNIQUE INDEX `teachers_teacherid_key`(`teacherid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `course_code` VARCHAR(191) NOT NULL,
    `credit_hour` INTEGER NOT NULL,
    `practical_classes` INTEGER NOT NULL,
    `theory_classes` INTEGER NOT NULL,

    UNIQUE INDEX `courses_course_code_key`(`course_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
