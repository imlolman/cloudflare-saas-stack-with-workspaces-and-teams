-- Add lastAccessedAt column with default value of current timestamp
ALTER TABLE `workspace_member` ADD `lastAccessedAt` integer NOT NULL DEFAULT 0;

-- Update existing records to use their joinedAt timestamp as initial lastAccessedAt
UPDATE `workspace_member` SET `lastAccessedAt` = `joinedAt`;