-- Schedule automatic result fetching for EuroMillions draws
-- EuroMillions draws are on Tuesday and Friday evenings
-- We schedule the fetch for Wednesday and Saturday mornings

-- Schedule for Wednesday at 9:00 AM (after Tuesday draw)
SELECT cron.schedule(
  'fetch-euromillions-wednesday',
  '0 9 * * 3', -- Wednesday at 9:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://lfewwgyfzldkkyaymjai.supabase.co/functions/v1/fetch-euromillions-results',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZXd3Z3lmemxka2t5YXltamFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDM5OTIsImV4cCI6MjA2NTA3OTk5Mn0.LIpenpT2Ph1nsj-jhU9HXvi3XhKuJwtdEgmv1Lb94fs"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Schedule for Saturday at 9:00 AM (after Friday draw)
SELECT cron.schedule(
  'fetch-euromillions-saturday',
  '0 9 * * 6', -- Saturday at 9:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://lfewwgyfzldkkyaymjai.supabase.co/functions/v1/fetch-euromillions-results',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZXd3Z3lmemxka2t5YXltamFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDM5OTIsImV4cCI6MjA2NTA3OTk5Mn0.LIpenpT2Ph1nsj-jhU9HXvi3XhKuJwtdEgmv1Lb94fs"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Enable pg_net extension for HTTP requests if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;