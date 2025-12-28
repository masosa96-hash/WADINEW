-- Add ON DELETE CASCADE to messages for effortless conversation deletion
-- This constraint ensures that when a conversation is deleted, all its messages are wiped automatically.

ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

ALTER TABLE messages
ADD CONSTRAINT messages_conversation_id_fkey
FOREIGN KEY (conversation_id)
REFERENCES conversations(id)
ON DELETE CASCADE;
