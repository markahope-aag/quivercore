-- Email Logs Table
-- Tracks all emails sent through the system for analytics and debugging

CREATE TYPE email_status AS ENUM ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'complained');
CREATE TYPE email_type AS ENUM ('welcome', 'trial_ending', 'payment_failed_1', 'payment_failed_2', 'payment_failed_3', 'subscription_confirmed', 'receipt', 'admin_notification', 'other');

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email identification
  resend_id TEXT, -- ID from Resend API
  email_type email_type NOT NULL,

  -- Recipient info
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for non-user emails

  -- Email content metadata
  subject TEXT NOT NULL,
  template_data JSONB, -- The data passed to the template

  -- Delivery tracking
  status email_status NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,

  -- Error tracking
  error_message TEXT,
  error_code TEXT,

  -- Analytics
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Metadata
  tags JSONB, -- Tags from Resend (category, type, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_id);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can view email logs
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (true); -- Allow system to insert logs

CREATE POLICY "System can update email logs"
  ON email_logs FOR UPDATE
  USING (true); -- Allow system to update logs (for status changes)

-- Function to update updated_at timestamp
CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for email analytics
CREATE OR REPLACE VIEW email_analytics AS
SELECT
  email_type,
  COUNT(*) AS total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_count,
  COUNT(*) FILTER (WHERE status = 'opened') AS opened_count,
  COUNT(*) FILTER (WHERE status = 'clicked') AS clicked_count,
  COUNT(*) FILTER (WHERE status = 'bounced') AS bounced_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  COUNT(*) FILTER (WHERE status = 'complained') AS complaint_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / NULLIF(COUNT(*), 0),
    2
  ) AS delivery_rate,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'opened') / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0),
    2
  ) AS open_rate,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'clicked') / NULLIF(COUNT(*) FILTER (WHERE status = 'opened'), 0),
    2
  ) AS click_through_rate,
  DATE_TRUNC('day', sent_at) AS sent_date
FROM email_logs
GROUP BY email_type, DATE_TRUNC('day', sent_at)
ORDER BY sent_date DESC, email_type;
