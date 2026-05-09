-- Vendor application data
CREATE TABLE IF NOT EXISTS vendor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    shop_name TEXT,
    shop_address TEXT,
    email TEXT,
    phone_number TEXT,
    vendor_type vendor_type,
    business_submission_timing TEXT CHECK (business_submission_timing IN ('now', 'later')),
    primary_business_document_type TEXT,
    primary_business_document_url TEXT,
    government_id_type TEXT,
    government_id_document_url TEXT,
    taxpayer_identification_number TEXT,
    vat_registration_status TEXT CHECK (vat_registration_status IN ('vat-registered', 'non-vat-registered')),
    bir_certificate_url TEXT,
    submit_sworn_declaration BOOLEAN,
    submission_status TEXT NOT NULL DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted')),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_vendor_applications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_applications_updated_at ON vendor_applications;

CREATE TRIGGER vendor_applications_updated_at
BEFORE UPDATE ON vendor_applications
FOR EACH ROW
EXECUTE FUNCTION set_vendor_applications_updated_at();
