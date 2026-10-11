ALTER TABLE `vocational_assessments` ADD `locality` varchar(120) DEFAULT 'No informado' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocational_assessments` ADD `educationStatus` varchar(100) DEFAULT 'No informado' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocational_assessments` ADD `discoverySource` varchar(100) DEFAULT 'No informado' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocational_assessments` ADD `dataConsent` boolean DEFAULT false NOT NULL;
