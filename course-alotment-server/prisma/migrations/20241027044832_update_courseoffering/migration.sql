-- CreateTable
CREATE TABLE `CourseOffering` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courses` JSON NOT NULL,
    `coursename` VARCHAR(191) NOT NULL,
    `ch_crs` INTEGER NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `sem` VARCHAR(191) NOT NULL,
    `teachers` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
