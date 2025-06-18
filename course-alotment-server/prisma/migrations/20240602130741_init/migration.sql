/*
  Warnings:

  - A unique constraint covering the columns `[aridno]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherid]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classtime_end` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `classes` ADD COLUMN `classtime_end` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `students_aridno_key` ON `students`(`aridno`);

-- CreateIndex
CREATE UNIQUE INDEX `teachers_teacherid_key` ON `teachers`(`teacherid`);
