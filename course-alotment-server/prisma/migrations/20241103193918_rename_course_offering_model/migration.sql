/*
  Warnings:

  - You are about to drop the column `ch_crs` on the `courseoffering` table. All the data in the column will be lost.
  - You are about to drop the column `practicals` on the `courseoffering` table. All the data in the column will be lost.
  - You are about to drop the column `sem` on the `courseoffering` table. All the data in the column will be lost.
  - You are about to drop the column `theory_lectures` on the `courseoffering` table. All the data in the column will be lost.
  - You are about to alter the column `contact` on the `courseoffering` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `status` on the `courseoffering` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teachers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sectionData` to the `CourseOffering` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_cr_hrs` to the `CourseOffering` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `courseoffering` DROP COLUMN `ch_crs`,
    DROP COLUMN `practicals`,
    DROP COLUMN `sem`,
    DROP COLUMN `theory_lectures`,
    ADD COLUMN `lab_classes` INTEGER NULL,
    ADD COLUMN `sectionData` JSON NOT NULL,
    ADD COLUMN `theory_classes` INTEGER NULL,
    ADD COLUMN `total_cr_hrs` INTEGER NOT NULL,
    MODIFY `coursename` VARCHAR(255) NOT NULL,
    MODIFY `contact` INTEGER NULL,
    MODIFY `status` VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE `classes`;

-- DropTable
DROP TABLE `courses`;

-- DropTable
DROP TABLE `reports`;

-- DropTable
DROP TABLE `students`;

-- DropTable
DROP TABLE `teachers`;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aridno` VARCHAR(191) NOT NULL,
    `cnic` VARCHAR(191) NOT NULL,
    `degree` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `classes_info` JSON NOT NULL,
    `courses` JSON NOT NULL,
    `password` VARCHAR(191) NOT NULL DEFAULT '12345678',

    UNIQUE INDEX `Student_aridno_key`(`aridno`),
    UNIQUE INDEX `Student_cnic_key`(`cnic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Teacher` (
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

    UNIQUE INDEX `Teacher_cnic_key`(`cnic`),
    UNIQUE INDEX `Teacher_teacherid_key`(`teacherid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `classroom` VARCHAR(191) NOT NULL,
    `classtime` VARCHAR(191) NOT NULL,
    `teacher` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `course` VARCHAR(191) NOT NULL,
    `classtime_end` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `class_section` VARCHAR(191) NOT NULL,
    `aridno` VARCHAR(191) NOT NULL,
    `degree` VARCHAR(191) NOT NULL,
    `review` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Report_degree_key`(`degree`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `course_code` VARCHAR(191) NOT NULL,
    `credit_hour` INTEGER NOT NULL,
    `practical_classes` INTEGER NOT NULL,
    `theory_classes` INTEGER NOT NULL,
    `Pre_Reqs` VARCHAR(255) NULL,

    UNIQUE INDEX `Course_course_code_key`(`course_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `type` ENUM('Class', 'Lecture Theater', 'Lab') NOT NULL,
    `multimedia` BOOLEAN NOT NULL DEFAULT false,
    `totalSpace` INTEGER NOT NULL,
    `occupiedSpace` INTEGER NOT NULL,
    `totalPCs` INTEGER NULL,
    `availablePCs` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Section` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `degreeName` VARCHAR(50) NOT NULL,
    `semester` INTEGER NOT NULL,
    `section` VARCHAR(5) NOT NULL,
    `shift` VARCHAR(2) NOT NULL,
    `studentCount` INTEGER NOT NULL,
    `sectionDisplay` VARCHAR(50) NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `roomId` INTEGER NULL,
    `courseOfferingId` INTEGER NULL,

    INDEX `courseOfferingId`(`courseOfferingId`),
    INDEX `roomId`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimetableEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` VARCHAR(20) NOT NULL,
    `startTime` DATETIME(0) NOT NULL,
    `endTime` DATETIME(0) NOT NULL,
    `roomId` INTEGER NULL,
    `courseId` INTEGER NULL,
    `sectionId` INTEGER NULL,
    `teacher` VARCHAR(100) NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `courseId`(`courseId`),
    INDEX `roomId`(`roomId`),
    INDEX `sectionId`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `section_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `section_ibfk_2` FOREIGN KEY (`courseOfferingId`) REFERENCES `CourseOffering`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `TimetableEntry` ADD CONSTRAINT `timetableentry_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `TimetableEntry` ADD CONSTRAINT `timetableentry_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `CourseOffering`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `TimetableEntry` ADD CONSTRAINT `timetableentry_ibfk_3` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
