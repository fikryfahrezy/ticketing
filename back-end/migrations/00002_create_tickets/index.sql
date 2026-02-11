CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  message text NOT NULL,
  requester_name text,
  requester_email text,
  status text NOT NULL DEFAULT 'PENDING',
  category text,
  sentiment_score integer,
  urgency text,
  draft_response text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE tickets
  ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('PENDING', 'TRIAGED', 'RESOLVED', 'FAILED'));

ALTER TABLE tickets
  ADD CONSTRAINT tickets_category_check
  CHECK (category IS NULL OR category IN ('BILLING', 'TECHNICAL', 'FEATURE_REQUEST'));

ALTER TABLE tickets
  ADD CONSTRAINT tickets_urgency_check
  CHECK (urgency IS NULL OR urgency IN ('HIGH', 'MEDIUM', 'LOW'));

ALTER TABLE tickets
  ADD CONSTRAINT tickets_sentiment_check
  CHECK (sentiment_score IS NULL OR (sentiment_score BETWEEN 1 AND 10));

CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets (created_at DESC);
