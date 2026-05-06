CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_name TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('approved', 'rejected', 'suspended', 'unsuspended', 'login', 'logout')),
    action_title TEXT NOT NULL,
    target_id UUID,
    target_name TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}'::text[],
    quick_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    rating JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_admin_user_id_idx ON activity_logs (admin_user_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_type_idx ON activity_logs (action_type);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs (created_at DESC);

ALTER TABLE vendor_applications
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS approved_vendor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS suspended_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read activity logs" ON activity_logs;
CREATE POLICY "Admins can read activity logs"
ON activity_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
          AND users.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can insert activity logs" ON activity_logs;
CREATE POLICY "Admins can insert activity logs"
ON activity_logs
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
          AND users.role = 'admin'
    )
);