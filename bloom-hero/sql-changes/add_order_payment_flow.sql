-- Add staged customer/vendor order flow fields.
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'to_pay';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'to_ship';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'to_receive';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('online', 'cod')),
  ADD COLUMN IF NOT EXISTS receipt_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS receipt_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_order_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_updated_at ON public.orders;
CREATE TRIGGER set_order_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_customer_status
  ON public.orders (customer_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_vendor_status
  ON public.orders (vendor_id, status);
