-- Sample DAS Solutions
INSERT INTO das_solutions (name, description, type, icon) VALUES
  ('SMARTair', 'Wireless access control with mobile and RFID credentials. Perfect for commercial buildings and high-traffic areas.', 'wireless', '🔐'),
  ('Aperio', 'Battery-powered wireless locks with real-time monitoring. Ideal for hotels, offices, and educational institutions.', 'battery', '🔋'),
  ('Access', 'Traditional access control with advanced security features. Suitable for high-security applications.', 'traditional', '🛡️'),
  ('eCLIQ', 'Electronic cylinder system with programmable keys. Perfect for retrofitting existing doors.', 'cylinder', '🔑');

-- Sample Customer Groups
INSERT INTO customer_groups (code, name, discount_percentage) VALUES
  ('platinum', 'Platinum Partner', 35),
  ('gold', 'Gold Partner', 25),
  ('silver', 'Silver Partner', 15),
  ('bronze', 'Bronze Partner', 10),
  ('government', 'Government', 30),
  ('education', 'Education', 20);

-- Sample Product Categories
INSERT INTO product_categories (name, code) VALUES
  ('Electronic Locks', 'locks'),
  ('Card Readers', 'readers'),
  ('Controllers', 'controllers'),
  ('Software', 'software'),
  ('Credentials', 'credentials'),
  ('Accessories', 'accessories');

-- Sample Products
INSERT INTO products (product_id, name, brand, category_id, short_description, long_description, gross_price, discount_group, active) VALUES
  -- SMARTair Products
  ('SM-001', 'SMARTair i-max Electronic Escutcheon', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'locks'), 'Wireless RFID/BLE enabled lock', 'High-traffic door solution with RFID and BLE connectivity. Battery powered with 60,000+ cycles.', 450.00, 'standard', true),
  ('SM-002', 'SMARTair Wall Reader', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'readers'), '13.56MHz MIFARE/iCLASS reader', 'Elegant wall-mounted reader supporting multiple RFID technologies. IP54 rated.', 280.00, 'standard', true),
  ('SM-003', 'SMARTair i-gate Padlock', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'locks'), 'IP68 rated electronic padlock', 'Weather-resistant electronic padlock with RFID and BLE. Perfect for outdoor applications.', 320.00, 'standard', true),
  ('SM-004', 'SMARTair Knob Cylinder', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'locks'), 'Electronic cylinder for retrofit', 'Easy retrofit solution for existing doors. No wiring required.', 380.00, 'standard', true),
  ('SM-005', 'SMARTair Software License', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'software'), 'Access management software', 'Comprehensive software for managing access rights, users, and audit trails.', 1200.00, 'software', true),
  
  -- Aperio Products
  ('AP-001', 'Aperio Wireless Lock', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'locks'), 'Real-time monitoring lock', 'Battery-powered wireless lock with online monitoring capabilities.', 520.00, 'standard', true),
  ('AP-002', 'Aperio Hub', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'controllers'), 'Central communication hub', 'Connects up to 64 Aperio devices to the access control system.', 650.00, 'standard', true),
  ('AP-003', 'Aperio Card Reader', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'readers'), 'Multi-technology reader', 'Supports multiple RFID technologies including MIFARE and iCLASS.', 310.00, 'standard', true),
  ('AP-004', 'Aperio Management Software', 'ASSA ABLOY', (SELECT id FROM product_categories WHERE code = 'software'), 'Enterprise access management', 'Scalable software solution for enterprise access control management.', 1500.00, 'software', true),
  
  -- Access Products
  ('AC-001', 'HID ProxPoint Plus', 'HID Global', (SELECT id FROM product_categories WHERE code = 'readers'), '125kHz proximity reader', 'Small form factor reader with multi-color LED and beeper.', 180.00, 'standard', true),
  ('AC-002', 'HID iCLASS Reader', 'HID Global', (SELECT id FROM product_categories WHERE code = 'readers'), '13.56MHz smart card reader', 'Advanced reader supporting iCLASS, MIFARE, and DESFire technologies.', 240.00, 'standard', true),
  ('AC-003', 'HID VertX Controller', 'HID Global', (SELECT id FROM product_categories WHERE code = 'controllers'), 'Network access controller', 'IP-based controller supporting up to 32 readers.', 890.00, 'standard', true),
  ('AC-004', 'HID EdgeReader', 'HID Global', (SELECT id FROM product_categories WHERE code = 'controllers'), 'IP-enabled door controller', 'Single-door controller with integrated reader and PoE support.', 420.00, 'standard', true),
  ('AC-005', 'HID Proximity Cards', 'HID Global', (SELECT id FROM product_categories WHERE code = 'credentials'), '125kHz proximity cards (pack of 10)', 'Standard proximity cards for HID access control systems.', 8.00, 'credentials', true),
  ('AC-006', 'HID iCLASS Cards', 'HID Global', (SELECT id FROM product_categories WHERE code = 'credentials'), '13.56MHz smart cards (pack of 10)', 'Advanced smart cards with multiple memory configurations.', 12.00, 'credentials', true),
  
  -- eCLIQ Products
  ('EC-001', 'eCLIQ Electronic Cylinder', 'TESA', (SELECT id FROM product_categories WHERE code = 'locks'), 'Programmable electronic cylinder', 'Retrofit electronic cylinder with programmable access rights.', 290.00, 'standard', true),
  ('EC-002', 'eCLIQ Programming Key', 'TESA', (SELECT id FROM product_categories WHERE code = 'credentials'), 'Master programming key', 'Master key for programming and managing eCLIQ systems.', 150.00, 'credentials', true),
  ('EC-003', 'eCLIQ User Key', 'TESA', (SELECT id FROM product_categories WHERE code = 'credentials'), 'Individual user key', 'Individual programmable key with specific access rights.', 85.00, 'credentials', true),
  ('EC-004', 'eCLIQ Padlock N315', 'TESA', (SELECT id FROM product_categories WHERE code = 'locks'), 'Electronic padlock with cylinder', 'Weather-resistant electronic padlock for outdoor use.', 210.00, 'standard', true),
  ('EC-005', 'eCLIQ Software', 'TESA', (SELECT id FROM product_categories WHERE code = 'software'), 'Key management software', 'Software for managing eCLIQ keys and access rights.', 800.00, 'software', true),
  ('EC-006', 'eCLIQ Programming Device', 'TESA', (SELECT id FROM product_categories WHERE code = 'accessories'), 'Hardware programming unit', 'Device for programming eCLIQ keys and cylinders.', 320.00, 'accessories', true);

-- Sample Customers
INSERT INTO customers (customer_id, account, contact, email, phone, address, discount_group_id, account_type) VALUES
  ('C001', 'TechCorp Industries', 'John Smith', 'john@techcorp.com', '+1-555-0123', '123 Business Ave, Tech City, TC 12345', (SELECT id FROM customer_groups WHERE code = 'gold'), 'end-user'),
  ('C002', 'SecureSolutions LLC', 'Sarah Johnson', 'sarah@securesol.com', '+1-555-0124', '456 Security Blvd, Safe Harbor, SH 12345', (SELECT id FROM customer_groups WHERE code = 'platinum'), 'reseller'),
  ('C003', 'City Government', 'Michael Davis', 'mdavis@city.gov', '+1-555-0125', '789 Municipal Plaza, City Hall, CH 12345', (SELECT id FROM customer_groups WHERE code = 'government'), 'government'),
  ('C004', 'University Campus', 'Lisa Chen', 'lchen@university.edu', '+1-555-0126', '321 Education Way, Campus City, CC 12345', (SELECT id FROM customer_groups WHERE code = 'education'), 'education'),
  ('C005', 'Global Enterprises', 'Robert Wilson', 'rwilson@global.com', '+1-555-0127', '654 Corporate Drive, Global Plaza, GP 12345', (SELECT id FROM customer_groups WHERE code = 'silver'), 'end-user'),
  ('C006', 'Local Business Hub', 'Emma Brown', 'emma@hub.local', '+1-555-0128', '987 Main Street, Local Town, LT 12345', (SELECT id FROM customer_groups WHERE code = 'bronze'), 'end-user');

-- Sample Discount Matrix
INSERT INTO discount_matrix (product_discount_group, customer_group_id, discount_percentage) VALUES
  ('standard', (SELECT id FROM customer_groups WHERE code = 'bronze'), 10),
  ('standard', (SELECT id FROM customer_groups WHERE code = 'silver'), 15),
  ('standard', (SELECT id FROM customer_groups WHERE code = 'gold'), 25),
  ('standard', (SELECT id FROM customer_groups WHERE code = 'platinum'), 35),
  ('standard', (SELECT id FROM customer_groups WHERE code = 'government'), 30),
  ('standard', (SELECT id FROM customer_groups WHERE code = 'education'), 20),
  ('software', (SELECT id FROM customer_groups WHERE code = 'gold'), 30),
  ('software', (SELECT id FROM customer_groups WHERE code = 'platinum'), 40),
  ('credentials', (SELECT id FROM customer_groups WHERE code = 'reseller'), 15),
  ('accessories', (SELECT id FROM customer_groups WHERE code = 'platinum'), 25);