-- Simple test for tracks and cohorts
SELECT COUNT(*) as track_count FROM tracks;

SELECT id, name FROM tracks ORDER BY name;

SELECT COUNT(*) as cohort_count FROM cohorts;

SELECT id, name FROM cohorts ORDER BY name;