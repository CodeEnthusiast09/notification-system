-- Create databases for each service
CREATE DATABASE user_service;
CREATE DATABASE template_service;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE user_service TO notif_user;
GRANT ALL PRIVILEGES ON DATABASE template_service TO notif_user;
