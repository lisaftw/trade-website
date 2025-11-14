-- Add index to optimize cleanup of expired trades
CREATE INDEX IF NOT EXISTS idx_trades_created_active 
ON public.trades(created_at) 
WHERE status = 'active';

-- Add a function to automatically delete expired trades
CREATE OR REPLACE FUNCTION public.delete_expired_trades()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM trades 
  WHERE status = 'active' 
  AND created_at < NOW() - INTERVAL '12 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
