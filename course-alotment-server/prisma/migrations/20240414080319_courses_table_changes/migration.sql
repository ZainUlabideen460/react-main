/*
  Warnings:

  - A unique constraint covering the columns `[course_code]` on the table `courses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `courses_course_code_key` ON `courses`(`course_code`);
