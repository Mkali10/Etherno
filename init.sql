CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  subscription_active BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (email, password, subscription_active, role) VALUES 
('admin@etheron.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, 'admin')
ON CONFLICT (email) DO NOTHING;
