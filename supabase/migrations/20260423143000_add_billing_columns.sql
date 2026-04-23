alter table organizations add column if not exists stripe_customer_id text;
alter table organizations add column if not exists stripe_subscription_id text;
alter table organizations add column if not exists billing_plan text;
alter table organizations add column if not exists billing_status text;
alter table organizations add column if not exists pilot_expires_at timestamptz;
