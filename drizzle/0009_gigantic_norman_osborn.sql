CREATE TABLE `vocational_admin_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(40) NOT NULL,
	`outcome` varchar(24) NOT NULL,
	`metadata` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vocational_admin_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vocational_assessments` DROP COLUMN `discoverySource`;