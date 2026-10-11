CREATE TABLE `vocational_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(80) NOT NULL,
	`lastName` varchar(80) NOT NULL,
	`age` int NOT NULL,
	`sex` varchar(40) NOT NULL,
	`resultProgram` varchar(180) NOT NULL,
	`resultArea` varchar(100) NOT NULL,
	`selections` json NOT NULL,
	`scoreSnapshot` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vocational_assessments_id` PRIMARY KEY(`id`)
);
