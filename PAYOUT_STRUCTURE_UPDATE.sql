-- ============================================
-- PAYOUT STRUCTURE UPDATE
-- Adds fields to payments table for specialist pay and company revenue tracking
-- ============================================

-- Add new columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS hours_worked NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS mileage NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tech_pay NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS mileage_pay NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS company_revenue NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_service_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS travel_fee_amount NUMERIC(10, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN payments.hours_worked IS 'Hours worked by specialist (from duration_minutes)';
COMMENT ON COLUMN payments.mileage IS 'Total miles traveled (round trip)';
COMMENT ON COLUMN payments.tech_pay IS 'Specialist hourly pay ($30/hr)';
COMMENT ON COLUMN payments.mileage_pay IS 'Specialist travel reimbursement ($0.60/mile)';
COMMENT ON COLUMN payments.company_revenue IS 'Company revenue (total - tech_pay - mileage_pay - tax)';
COMMENT ON COLUMN payments.tax_amount IS 'Tax amount collected (7% NC tax)';
COMMENT ON COLUMN payments.base_service_amount IS 'Base service fee (before tax and travel)';
COMMENT ON COLUMN payments.travel_fee_amount IS 'Travel fee charged to client ($1.00/mile after 20 miles)';

-- Add indexes for reporting
CREATE INDEX IF NOT EXISTS idx_payments_tech_pay ON payments(tech_pay);
CREATE INDEX IF NOT EXISTS idx_payments_company_revenue ON payments(company_revenue);
CREATE INDEX IF NOT EXISTS idx_payments_tax_amount ON payments(tax_amount);

