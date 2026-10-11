ALTER TABLE `vocational_assessments` MODIFY COLUMN `firstName` varchar(80);--> statement-breakpoint
ALTER TABLE `vocational_assessments` MODIFY COLUMN `lastName` varchar(80);--> statement-breakpoint
ALTER TABLE `vocational_assessments` MODIFY COLUMN `age` int;--> statement-breakpoint
ALTER TABLE `vocational_assessments` ADD `ageGroup` varchar(20);