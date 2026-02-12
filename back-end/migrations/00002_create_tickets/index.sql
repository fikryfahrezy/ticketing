CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE tickets_status AS ENUM ('PENDING', 'TRIAGED', 'RESOLVED', 'FAILED');
CREATE TYPE tickets_category AS ENUM ('BILLING', 'TECHNICAL', 'FEATURE_REQUEST');
CREATE TYPE tickets_urgency AS ENUM ('HIGH', 'MEDIUM', 'LOW');

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  message text NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  status tickets_status NOT NULL DEFAULT 'PENDING',
  category tickets_category,
  sentiment_score integer,
  urgency tickets_urgency,
  draft_response text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE tickets
  ADD CONSTRAINT tickets_sentiment_check
  CHECK (sentiment_score IS NULL OR (sentiment_score BETWEEN 1 AND 10));

CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets (created_at DESC);
