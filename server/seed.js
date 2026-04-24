import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ai_showroom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  console.log('🔧 Creating tables...');

  await pool.query(`
    DROP TABLE IF EXISTS conversion_events CASCADE;
    DROP TABLE IF EXISTS customer_analytics CASCADE;
    DROP TABLE IF EXISTS ar_tryons CASCADE;
    DROP TABLE IF EXISTS store_layouts CASCADE;
    DROP TABLE IF EXISTS product_3d_models CASCADE;
    DROP TABLE IF EXISTS ai_descriptions CASCADE;
    DROP TABLE IF EXISTS style_recommendations CASCADE;
    DROP TABLE IF EXISTS price_optimizations CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS store_themes CASCADE;
    DROP TABLE IF EXISTS promotions CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS inventory CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  // Users
  await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Products
  await pool.query(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      price DECIMAL(10,2) NOT NULL,
      image_url VARCHAR(500),
      sku VARCHAR(50) UNIQUE,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Product 3D Models
  await pool.query(`
    CREATE TABLE product_3d_models (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      model_url VARCHAR(500),
      polygon_count INTEGER,
      file_format VARCHAR(20),
      texture_maps TEXT,
      dimensions VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending',
      ai_analysis TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Store Layouts
  await pool.query(`
    CREATE TABLE store_layouts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      layout_type VARCHAR(100),
      zone_count INTEGER,
      total_area VARCHAR(50),
      color_scheme JSONB,
      description TEXT,
      ai_suggestions TEXT,
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // AR Try-ons
  await pool.query(`
    CREATE TABLE ar_tryons (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      customer_name VARCHAR(255),
      fit_accuracy DECIMAL(5,2),
      body_landmarks INTEGER,
      size_recommendation VARCHAR(20),
      style_score DECIMAL(3,1),
      ar_settings JSONB,
      ai_analysis TEXT,
      status VARCHAR(20) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Customer Analytics
  await pool.query(`
    CREATE TABLE customer_analytics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(255) NOT NULL,
      metric_value DECIMAL(15,2),
      metric_type VARCHAR(50),
      period VARCHAR(50),
      segment VARCHAR(100),
      trend VARCHAR(20),
      details JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Conversion Events
  await pool.query(`
    CREATE TABLE conversion_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      source VARCHAR(100),
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      customer_email VARCHAR(255),
      revenue DECIMAL(10,2),
      funnel_stage VARCHAR(50),
      device VARCHAR(50),
      details JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // AI Descriptions
  await pool.query(`
    CREATE TABLE ai_descriptions (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      headline VARCHAR(500),
      short_description TEXT,
      long_description TEXT,
      seo_tags TEXT,
      tone VARCHAR(50),
      ai_output TEXT,
      status VARCHAR(20) DEFAULT 'generated',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Style Recommendations
  await pool.query(`
    CREATE TABLE style_recommendations (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(255),
      style_profile VARCHAR(100),
      confidence_score DECIMAL(5,2),
      recommended_products TEXT,
      trending_combos TEXT,
      ai_output TEXT,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Price Optimizations
  await pool.query(`
    CREATE TABLE price_optimizations (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      current_price DECIMAL(10,2),
      recommended_price DECIMAL(10,2),
      market_position VARCHAR(50),
      elasticity_score DECIMAL(4,2),
      revenue_impact VARCHAR(100),
      ai_output TEXT,
      status VARCHAR(20) DEFAULT 'analyzed',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Customers
  await pool.query(`
    CREATE TABLE customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      segment VARCHAR(50),
      lifetime_value DECIMAL(10,2) DEFAULT 0,
      total_orders INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Orders
  await pool.query(`
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      shipping_address TEXT,
      payment_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Store Themes
  await pool.query(`
    CREATE TABLE store_themes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      primary_color VARCHAR(20),
      secondary_color VARCHAR(20),
      accent_color VARCHAR(20),
      font_family VARCHAR(100),
      layout_style VARCHAR(50),
      status VARCHAR(20) DEFAULT 'active',
      preview_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Promotions
  await pool.query(`
    CREATE TABLE promotions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE,
      discount_type VARCHAR(20),
      discount_value DECIMAL(10,2),
      min_purchase DECIMAL(10,2),
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      usage_limit INTEGER,
      used_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Reviews
  await pool.query(`
    CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      customer_name VARCHAR(255),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(255),
      body TEXT,
      verified_purchase BOOLEAN DEFAULT false,
      helpful_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'published',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Inventory
  await pool.query(`
    CREATE TABLE inventory (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      warehouse VARCHAR(100),
      quantity INTEGER NOT NULL,
      reserved INTEGER DEFAULT 0,
      reorder_level INTEGER DEFAULT 10,
      reorder_quantity INTEGER DEFAULT 50,
      last_restocked TIMESTAMP,
      status VARCHAR(20) DEFAULT 'in_stock',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ Tables created');

  // Seed Users
  const hashedPassword = await bcrypt.hash(process.env.DEMO_PASSWORD || 'admin123', 10);
  await pool.query(
    `INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)`,
    [process.env.DEMO_EMAIL || 'admin@showroom.com', hashedPassword, 'Admin User', 'admin']
  );
  console.log('👤 User seeded');

  // Seed Products (15 items)
  const products = [
    ['Classic Leather Jacket', 'Premium full-grain leather jacket with modern cut', 'Outerwear', 299.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 'SKU-LJ-001'],
    ['Silk Evening Dress', 'Elegant floor-length silk dress for special occasions', 'Dresses', 459.99, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 'SKU-ED-002'],
    ['Running Performance Shoes', 'Lightweight carbon-plate running shoes', 'Footwear', 189.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'SKU-RS-003'],
    ['Cashmere Sweater', 'Ultra-soft 100% cashmere crew neck sweater', 'Knitwear', 249.99, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', 'SKU-CS-004'],
    ['Designer Sunglasses', 'Polarized titanium frame aviator sunglasses', 'Accessories', 179.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', 'SKU-DS-005'],
    ['Tailored Blazer', 'Italian wool blend slim-fit blazer', 'Formal', 349.99, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 'SKU-TB-006'],
    ['Canvas Tote Bag', 'Organic cotton canvas tote with leather handles', 'Bags', 89.99, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'SKU-CT-007'],
    ['Denim Jeans Slim Fit', 'Japanese selvedge denim slim straight jeans', 'Bottoms', 159.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 'SKU-DJ-008'],
    ['Luxury Watch Automatic', 'Swiss automatic movement with sapphire crystal', 'Watches', 899.99, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', 'SKU-LW-009'],
    ['Linen Summer Shirt', 'Breathable pure linen relaxed-fit shirt', 'Shirts', 119.99, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'SKU-LS-010'],
    ['Yoga Leggings Pro', 'High-waist compression leggings with pocket', 'Activewear', 79.99, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'SKU-YL-011'],
    ['Wool Overcoat', 'Double-breasted wool-cashmere blend overcoat', 'Outerwear', 549.99, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400', 'SKU-WO-012'],
    ['Pearl Necklace Set', 'Freshwater pearl necklace with matching earrings', 'Jewelry', 199.99, 'https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=400', 'SKU-PN-013'],
    ['Hiking Boots Waterproof', 'Gore-Tex waterproof hiking boots with Vibram sole', 'Footwear', 229.99, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400', 'SKU-HB-014'],
    ['Graphic Print T-Shirt', 'Limited edition artist collaboration cotton tee', 'Casual', 49.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'SKU-GT-015'],
    ['Crossbody Mini Bag', 'Vegan leather crossbody with gold hardware', 'Bags', 129.99, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'SKU-CB-016'],
    ['Pleated Midi Skirt', 'Satin pleated midi skirt with elastic waist', 'Skirts', 109.99, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400', 'SKU-PM-017'],
    ['Bomber Jacket Nylon', 'Reversible nylon bomber with satin lining', 'Outerwear', 199.99, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', 'SKU-BJ-018'],
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, description, category, price, image_url, sku) VALUES ($1,$2,$3,$4,$5,$6)`,
      p
    );
  }
  console.log('📦 Products seeded (18 items)');

  // Seed 3D Models (15 items)
  const models3d = [
    [1, '/models/jacket.glb', 12450, 'GLB', 'Diffuse, Normal, Roughness', '30x20x15cm', 'completed'],
    [2, '/models/dress.glb', 8900, 'GLB', 'Diffuse, Normal, Metallic', '60x40x10cm', 'completed'],
    [3, '/models/shoes.glb', 15600, 'OBJ', 'Diffuse, Normal, AO', '30x12x10cm', 'completed'],
    [4, '/models/sweater.glb', 7200, 'GLB', 'Diffuse, Normal', '50x40x8cm', 'processing'],
    [5, '/models/sunglasses.glb', 4500, 'FBX', 'Diffuse, Roughness', '15x6x4cm', 'completed'],
    [6, '/models/blazer.glb', 11200, 'GLB', 'Diffuse, Normal, Roughness', '70x50x12cm', 'completed'],
    [7, '/models/tote.glb', 6800, 'GLB', 'Diffuse, Normal', '40x35x15cm', 'completed'],
    [8, '/models/jeans.glb', 9400, 'OBJ', 'Diffuse, Normal, AO', '100x35x8cm', 'processing'],
    [9, '/models/watch.glb', 18900, 'GLB', 'Diffuse, Normal, Metallic, Roughness', '5x5x2cm', 'completed'],
    [10, '/models/shirt.glb', 5600, 'GLB', 'Diffuse, Normal', '65x45x5cm', 'completed'],
    [11, '/models/leggings.glb', 7800, 'FBX', 'Diffuse, Normal', '90x30x5cm', 'pending'],
    [12, '/models/overcoat.glb', 13200, 'GLB', 'Diffuse, Normal, Roughness', '110x55x15cm', 'completed'],
    [13, '/models/necklace.glb', 22000, 'GLB', 'Diffuse, Normal, Metallic, Roughness', '20x15x2cm', 'completed'],
    [14, '/models/boots.glb', 16400, 'OBJ', 'Diffuse, Normal, AO, Roughness', '35x15x12cm', 'completed'],
    [15, '/models/tshirt.glb', 4200, 'GLB', 'Diffuse, Normal', '60x45x5cm', 'pending'],
  ];

  for (const m of models3d) {
    await pool.query(
      `INSERT INTO product_3d_models (product_id, model_url, polygon_count, file_format, texture_maps, dimensions, status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      m
    );
  }
  console.log('🧊 3D Models seeded (15 items)');

  // Seed Store Layouts (15 items)
  const layouts = [
    ['Modern Grid Showroom', 'grid', 6, '2400 sq ft', '{"primary":"#1a1a2e","accent":"#e94560","bg":"#f5f5f5"}', 'Clean grid layout with featured hero zone', 'draft'],
    ['Luxury Boutique', 'freeform', 4, '1800 sq ft', '{"primary":"#2d2d2d","accent":"#c9a96e","bg":"#faf8f5"}', 'Elegant open floor plan with ambient lighting', 'active'],
    ['Minimalist Gallery', 'gallery', 5, '3000 sq ft', '{"primary":"#ffffff","accent":"#000000","bg":"#f0f0f0"}', 'White space focused with large product displays', 'active'],
    ['Street Style Hub', 'dynamic', 8, '2800 sq ft', '{"primary":"#1e1e1e","accent":"#ff6b35","bg":"#f7f7f7"}', 'Urban inspired with interactive displays', 'draft'],
    ['Vintage Collection Room', 'room', 5, '1500 sq ft', '{"primary":"#4a3728","accent":"#d4a574","bg":"#f5efe6"}', 'Warm tones with curated vintage feel', 'active'],
    ['Tech Forward Store', 'modular', 7, '3500 sq ft', '{"primary":"#0a0a23","accent":"#00d4ff","bg":"#f2f2f2"}', 'Futuristic design with digital signage integration', 'draft'],
    ['Eco Sustainable Shop', 'organic', 4, '2000 sq ft', '{"primary":"#2d5016","accent":"#8bc34a","bg":"#f9faf5"}', 'Nature-inspired layout with sustainable materials', 'active'],
    ['Pop-Up Experience', 'popup', 3, '800 sq ft', '{"primary":"#ff1493","accent":"#ffd700","bg":"#fff5f9"}', 'High-impact compact design for events', 'active'],
    ['Department Store Floor', 'department', 12, '8000 sq ft', '{"primary":"#1b3a4b","accent":"#c5a880","bg":"#f8f6f3"}', 'Multi-section layout with clear wayfinding', 'draft'],
    ['Athleisure Showroom', 'sport', 6, '2200 sq ft', '{"primary":"#212121","accent":"#76ff03","bg":"#fafafa"}', 'Dynamic sports-inspired layout with motion zones', 'active'],
    ['Kids Wonderland', 'playful', 7, '2600 sq ft', '{"primary":"#5c2d91","accent":"#ffb74d","bg":"#fff8e1"}', 'Colorful interactive zones for family shopping', 'draft'],
    ['Bridal Suite', 'suite', 4, '1600 sq ft', '{"primary":"#f5f0eb","accent":"#b8860b","bg":"#fffef9"}', 'Intimate elegant setting for bridal collections', 'active'],
    ['Outdoor Adventure Store', 'adventure', 8, '4000 sq ft', '{"primary":"#33691e","accent":"#ff6f00","bg":"#f1f8e9"}', 'Rugged terrain-inspired with product testing areas', 'draft'],
    ['Jewelry Vault', 'vault', 3, '1000 sq ft', '{"primary":"#1a1a1a","accent":"#ffd700","bg":"#1e1e1e"}', 'Dark luxurious ambiance with spotlit displays', 'active'],
    ['Fashion Week Runway', 'runway', 5, '5000 sq ft', '{"primary":"#000000","accent":"#ffffff","bg":"#141414"}', 'Dramatic runway-inspired product presentation', 'active'],
  ];

  for (const l of layouts) {
    await pool.query(
      `INSERT INTO store_layouts (name, layout_type, zone_count, total_area, color_scheme, description, status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      l
    );
  }
  console.log('🏪 Store Layouts seeded (15 items)');

  // Seed AR Try-ons (15 items)
  const tryons = [
    [1, 'Sarah Johnson', 94.2, 17, 'M', 8.5, '{"opacity":0.95,"shadow":"medium","reflection":true}'],
    [2, 'Emily Chen', 91.8, 17, 'S', 9.0, '{"opacity":0.92,"shadow":"high","reflection":true}'],
    [3, 'Mike Williams', 96.1, 17, 'L', 7.8, '{"opacity":0.98,"shadow":"low","reflection":false}'],
    [4, 'Lisa Park', 89.5, 15, 'M', 8.2, '{"opacity":0.90,"shadow":"medium","reflection":true}'],
    [5, 'James Brown', 97.3, 17, 'OS', 9.2, '{"opacity":0.97,"shadow":"low","reflection":true}'],
    [6, 'Anna Martinez', 92.7, 17, 'S', 8.8, '{"opacity":0.94,"shadow":"medium","reflection":true}'],
    [7, 'David Lee', 88.4, 16, 'L', 7.5, '{"opacity":0.91,"shadow":"medium","reflection":false}'],
    [8, 'Rachel Kim', 95.6, 17, 'M', 9.1, '{"opacity":0.96,"shadow":"high","reflection":true}'],
    [9, 'Tom Anderson', 93.1, 17, 'XL', 8.0, '{"opacity":0.93,"shadow":"medium","reflection":true}'],
    [10, 'Sophie Taylor', 90.8, 16, 'S', 8.7, '{"opacity":0.92,"shadow":"medium","reflection":true}'],
    [11, 'Chris Wilson', 94.9, 17, 'M', 8.4, '{"opacity":0.95,"shadow":"low","reflection":false}'],
    [12, 'Maria Garcia', 91.2, 17, 'L', 7.9, '{"opacity":0.93,"shadow":"high","reflection":true}'],
    [13, 'Alex Thompson', 96.7, 17, 'OS', 9.5, '{"opacity":0.97,"shadow":"medium","reflection":true}'],
    [14, 'Jordan Davis', 93.8, 17, 'XL', 8.1, '{"opacity":0.94,"shadow":"medium","reflection":true}'],
    [15, 'Nina Patel', 92.4, 16, 'S', 8.9, '{"opacity":0.93,"shadow":"high","reflection":true}'],
  ];

  for (const t of tryons) {
    await pool.query(
      `INSERT INTO ar_tryons (product_id, customer_name, fit_accuracy, body_landmarks, size_recommendation, style_score, ar_settings) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      t
    );
  }
  console.log('👗 AR Try-ons seeded (15 items)');

  // Seed Customer Analytics (15 items)
  const analytics = [
    ['Total Revenue', 284500.00, 'revenue', 'Q4 2024', 'All', 'up', '{"change":"+12.5%","prev":252800}'],
    ['Average Order Value', 156.78, 'monetary', 'Q4 2024', 'All', 'up', '{"change":"+5.2%","prev":149.05}'],
    ['Customer Acquisition Cost', 32.50, 'cost', 'Q4 2024', 'All', 'down', '{"change":"-8.1%","prev":35.36}'],
    ['Customer Lifetime Value', 890.00, 'monetary', 'Annual', 'Premium', 'up', '{"change":"+15.3%","prev":771.73}'],
    ['Repeat Purchase Rate', 42.3, 'percentage', 'Q4 2024', 'All', 'up', '{"change":"+3.1%","prev":41.03}'],
    ['Cart Abandonment Rate', 68.5, 'percentage', 'Q4 2024', 'All', 'down', '{"change":"-2.4%","prev":70.18}'],
    ['Page Views per Session', 4.8, 'engagement', 'Q4 2024', 'All', 'up', '{"change":"+0.6","prev":4.2}'],
    ['Session Duration', 5.2, 'time_minutes', 'Q4 2024', 'All', 'up', '{"change":"+0.8min","prev":4.4}'],
    ['Mobile Conversion Rate', 3.2, 'percentage', 'Q4 2024', 'Mobile', 'up', '{"change":"+0.5%","prev":2.7}'],
    ['Desktop Conversion Rate', 4.8, 'percentage', 'Q4 2024', 'Desktop', 'stable', '{"change":"0%","prev":4.8}'],
    ['Email Open Rate', 28.5, 'percentage', 'Q4 2024', 'Email', 'up', '{"change":"+2.1%","prev":27.92}'],
    ['Social Media Traffic', 18500, 'visitors', 'Q4 2024', 'Social', 'up', '{"change":"+22%","prev":15164}'],
    ['AR Try-On Usage', 34.7, 'percentage', 'Q4 2024', 'AR Users', 'up', '{"change":"+8.5%","prev":31.98}'],
    ['3D View Engagement', 67.2, 'percentage', 'Q4 2024', '3D Users', 'up', '{"change":"+11.2%","prev":60.43}'],
    ['Net Promoter Score', 72, 'score', 'Q4 2024', 'All', 'up', '{"change":"+4","prev":68}'],
  ];

  for (const a of analytics) {
    await pool.query(
      `INSERT INTO customer_analytics (metric_name, metric_value, metric_type, period, segment, trend, details) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      a
    );
  }
  console.log('📊 Customer Analytics seeded (15 items)');

  // Seed Conversion Events (15 items)
  const conversions = [
    ['purchase', 'organic', 1, 'sarah@email.com', 299.99, 'completed', 'desktop', '{"page":"/product/1","time_to_convert":"3m"}'],
    ['add_to_cart', 'social', 3, 'mike@email.com', 189.99, 'intent', 'mobile', '{"page":"/product/3","referrer":"instagram"}'],
    ['purchase', 'email', 2, 'emily@email.com', 459.99, 'completed', 'desktop', '{"campaign":"fall_collection","coupon":"FALL20"}'],
    ['view_product', 'organic', 5, 'guest@browse.com', 0, 'awareness', 'mobile', '{"page":"/product/5","duration":"45s"}'],
    ['purchase', 'paid_search', 9, 'tom@email.com', 899.99, 'completed', 'desktop', '{"keyword":"luxury watch","campaign":"watches_q4"}'],
    ['abandon_cart', 'direct', 4, 'lisa@email.com', 249.99, 'dropped', 'mobile', '{"items":2,"step":"payment"}'],
    ['purchase', 'referral', 6, 'anna@email.com', 349.99, 'completed', 'tablet', '{"referrer":"fashionblog.com"}'],
    ['ar_tryon', 'organic', 1, 'sarah@email.com', 0, 'engagement', 'mobile', '{"duration":"2m30s","photos_taken":3}'],
    ['purchase', 'social', 7, 'david@email.com', 89.99, 'completed', 'mobile', '{"referrer":"tiktok","influencer":"@styleguru"}'],
    ['view_3d_model', 'organic', 9, 'guest2@browse.com', 0, 'engagement', 'desktop', '{"rotation_count":12,"zoom_count":5}'],
    ['purchase', 'email', 12, 'maria@email.com', 549.99, 'completed', 'desktop', '{"campaign":"winter_sale","coupon":"WINTER15"}'],
    ['signup', 'organic', null, 'newuser@email.com', 0, 'acquisition', 'mobile', '{"source":"homepage_banner"}'],
    ['purchase', 'paid_social', 10, 'sophie@email.com', 119.99, 'completed', 'mobile', '{"platform":"facebook","ad_set":"summer_linen"}'],
    ['wishlist_add', 'organic', 13, 'nina@email.com', 199.99, 'intent', 'desktop', '{"list_size":5}'],
    ['purchase', 'direct', 15, 'chris@email.com', 49.99, 'completed', 'desktop', '{"returning_customer":true}'],
  ];

  for (const c of conversions) {
    await pool.query(
      `INSERT INTO conversion_events (event_type, source, product_id, customer_email, revenue, funnel_stage, device, details) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      c
    );
  }
  console.log('🎯 Conversion Events seeded (15 items)');

  // Seed Customers (15 items)
  const customers = [
    ['Sarah Johnson', 'sarah@email.com', '+1-555-0101', 'premium', 2450.00, 8],
    ['Emily Chen', 'emily@email.com', '+1-555-0102', 'premium', 1890.00, 6],
    ['Mike Williams', 'mike@email.com', '+1-555-0103', 'regular', 560.00, 3],
    ['Lisa Park', 'lisa@email.com', '+1-555-0104', 'regular', 780.00, 4],
    ['James Brown', 'james@email.com', '+1-555-0105', 'vip', 4200.00, 15],
    ['Anna Martinez', 'anna@email.com', '+1-555-0106', 'premium', 1650.00, 7],
    ['David Lee', 'david@email.com', '+1-555-0107', 'regular', 340.00, 2],
    ['Rachel Kim', 'rachel@email.com', '+1-555-0108', 'premium', 2100.00, 9],
    ['Tom Anderson', 'tom@email.com', '+1-555-0109', 'vip', 5600.00, 18],
    ['Sophie Taylor', 'sophie@email.com', '+1-555-0110', 'regular', 420.00, 3],
    ['Chris Wilson', 'chris@email.com', '+1-555-0111', 'regular', 290.00, 2],
    ['Maria Garcia', 'maria@email.com', '+1-555-0112', 'premium', 1980.00, 8],
    ['Alex Thompson', 'alex@email.com', '+1-555-0113', 'vip', 3800.00, 12],
    ['Jordan Davis', 'jordan@email.com', '+1-555-0114', 'regular', 650.00, 4],
    ['Nina Patel', 'nina@email.com', '+1-555-0115', 'premium', 1450.00, 6],
  ];

  for (const c of customers) {
    await pool.query(
      `INSERT INTO customers (name, email, phone, segment, lifetime_value, total_orders) VALUES ($1,$2,$3,$4,$5,$6)`,
      c
    );
  }
  console.log('👥 Customers seeded (15 items)');

  // Seed Orders (15 items)
  const orders = [
    [1, 299.99, 'delivered', '123 Main St, New York, NY 10001', 'credit_card'],
    [2, 459.99, 'delivered', '456 Oak Ave, San Francisco, CA 94102', 'credit_card'],
    [1, 189.99, 'shipped', '123 Main St, New York, NY 10001', 'paypal'],
    [3, 179.99, 'processing', '789 Pine Rd, Chicago, IL 60601', 'credit_card'],
    [5, 899.99, 'delivered', '321 Elm St, Miami, FL 33101', 'credit_card'],
    [6, 349.99, 'shipped', '654 Maple Dr, Austin, TX 78701', 'debit_card'],
    [4, 249.99, 'processing', '987 Cedar Ln, Seattle, WA 98101', 'credit_card'],
    [7, 89.99, 'delivered', '147 Birch Way, Portland, OR 97201', 'paypal'],
    [8, 159.99, 'shipped', '258 Walnut St, Boston, MA 02101', 'credit_card'],
    [9, 549.99, 'delivered', '369 Spruce Ave, Denver, CO 80201', 'credit_card'],
    [10, 119.99, 'processing', '741 Ash Blvd, Nashville, TN 37201', 'debit_card'],
    [2, 199.99, 'delivered', '456 Oak Ave, San Francisco, CA 94102', 'credit_card'],
    [5, 229.99, 'shipped', '321 Elm St, Miami, FL 33101', 'paypal'],
    [3, 49.99, 'delivered', '789 Pine Rd, Chicago, IL 60601', 'credit_card'],
    [1, 129.99, 'processing', '123 Main St, New York, NY 10001', 'credit_card'],
  ];

  for (const o of orders) {
    await pool.query(
      `INSERT INTO orders (customer_id, total_amount, status, shipping_address, payment_method) VALUES ($1,$2,$3,$4,$5)`,
      o
    );
  }
  console.log('📋 Orders seeded (15 items)');

  // Seed Store Themes (15 items)
  const themes = [
    ['Midnight Luxe', '#1a1a2e', '#16213e', '#e94560', 'Playfair Display', 'luxury', 'active'],
    ['Fresh Minimal', '#ffffff', '#f8f9fa', '#2563eb', 'Inter', 'minimal', 'active'],
    ['Urban Edge', '#212121', '#424242', '#ff6b35', 'Roboto', 'modern', 'active'],
    ['Garden Bloom', '#2d5016', '#f1f8e9', '#e91e63', 'Lora', 'organic', 'draft'],
    ['Ocean Breeze', '#006064', '#e0f7fa', '#ff8f00', 'Montserrat', 'fresh', 'active'],
    ['Sunset Glow', '#bf360c', '#fff3e0', '#f57c00', 'Poppins', 'warm', 'draft'],
    ['Nordic Frost', '#455a64', '#eceff1', '#00bcd4', 'Nunito', 'scandinavian', 'active'],
    ['Golden Hour', '#4a3728', '#fdf6e3', '#d4a574', 'Cormorant', 'vintage', 'active'],
    ['Neon Nights', '#0a0a23', '#1a1a3e', '#00ff87', 'Space Grotesk', 'futuristic', 'draft'],
    ['Blush Pink', '#880e4f', '#fce4ec', '#f48fb1', 'Quicksand', 'feminine', 'active'],
    ['Forest Deep', '#1b5e20', '#e8f5e9', '#4caf50', 'Merriweather', 'nature', 'active'],
    ['Arctic White', '#263238', '#ffffff', '#90a4ae', 'Raleway', 'clean', 'active'],
    ['Royal Purple', '#4a148c', '#f3e5f5', '#ce93d8', 'Cinzel', 'regal', 'draft'],
    ['Desert Sand', '#795548', '#efebe9', '#ff7043', 'Josefin Sans', 'earthy', 'active'],
    ['Electric Blue', '#0d47a1', '#e3f2fd', '#2196f3', 'Outfit', 'tech', 'active'],
  ];

  for (const t of themes) {
    await pool.query(
      `INSERT INTO store_themes (name, primary_color, secondary_color, accent_color, font_family, layout_style, status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      t
    );
  }
  console.log('🎨 Store Themes seeded (15 items)');

  // Seed Promotions (15 items)
  const promos = [
    ['Spring Sale', 'SPRING25', 'percentage', 25.00, 50.00, '2024-03-01', '2024-04-30', 500, 234],
    ['New Customer Welcome', 'WELCOME10', 'percentage', 10.00, 0, '2024-01-01', '2024-12-31', 10000, 3456],
    ['Free Shipping Friday', 'FREESHIP', 'fixed', 15.00, 75.00, '2024-01-01', '2024-12-31', null, 8901],
    ['VIP Exclusive', 'VIP30', 'percentage', 30.00, 100.00, '2024-01-01', '2024-12-31', 200, 89],
    ['Flash Sale 50%', 'FLASH50', 'percentage', 50.00, 200.00, '2024-11-29', '2024-11-29', 100, 100],
    ['Holiday Bundle', 'HOLIDAY20', 'percentage', 20.00, 150.00, '2024-12-01', '2024-12-25', 1000, 456],
    ['Loyalty Reward', 'LOYAL15', 'percentage', 15.00, 0, '2024-01-01', '2024-12-31', null, 2340],
    ['Summer Clearance', 'SUMMER40', 'percentage', 40.00, 75.00, '2024-06-01', '2024-08-31', 800, 567],
    ['Birthday Treat', 'BDAY25', 'percentage', 25.00, 0, '2024-01-01', '2024-12-31', null, 1234],
    ['Refer a Friend', 'REFER20', 'percentage', 20.00, 50.00, '2024-01-01', '2024-12-31', null, 890],
    ['Back to School', 'SCHOOL15', 'percentage', 15.00, 40.00, '2024-08-01', '2024-09-15', 600, 345],
    ['$50 Off Premium', 'PREMIUM50', 'fixed', 50.00, 250.00, '2024-01-01', '2024-12-31', 300, 123],
    ['Weekend Special', 'WKND10', 'percentage', 10.00, 30.00, '2024-01-01', '2024-12-31', null, 5678],
    ['Early Bird Access', 'EARLY20', 'percentage', 20.00, 100.00, '2024-01-01', '2024-06-30', 400, 234],
    ['Employee Discount', 'TEAM35', 'percentage', 35.00, 0, '2024-01-01', '2024-12-31', 50, 28],
  ];

  for (const p of promos) {
    await pool.query(
      `INSERT INTO promotions (name, code, discount_type, discount_value, min_purchase, start_date, end_date, usage_limit, used_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      p
    );
  }
  console.log('🏷️  Promotions seeded (15 items)');

  // Seed Reviews (15 items)
  const reviews = [
    [1, 'Sarah J.', 5, 'Absolutely stunning!', 'The leather quality is incredible. Fits perfectly and looks even better in person.', true, 24],
    [2, 'Emily C.', 5, 'Dream dress', 'Wore this to a gala and received so many compliments. The silk is luxurious.', true, 18],
    [3, 'Mike W.', 4, 'Great running shoes', 'Very lightweight and responsive. Carbon plate makes a noticeable difference.', true, 12],
    [4, 'Lisa P.', 5, 'Softest sweater ever', 'The cashmere is unbelievably soft. Worth every penny.', true, 15],
    [5, 'James B.', 4, 'Stylish shades', 'Great polarization and the titanium frames are super light.', true, 8],
    [6, 'Anna M.', 5, 'Perfect blazer', 'Italian craftsmanship at its finest. Tailoring is impeccable.', true, 21],
    [3, 'Rachel K.', 5, 'Best running shoes!', 'Shaved 2 minutes off my 10K time. Amazing shoe.', true, 31],
    [9, 'Tom A.', 5, 'Heirloom quality', 'The automatic movement is mesmerizing. This watch will last generations.', true, 27],
    [7, 'Sophie T.', 4, 'Great everyday bag', 'Sturdy, spacious, and the leather handles add a nice touch.', true, 9],
    [1, 'David L.', 4, 'Classic style', 'Good jacket but runs slightly large. Size down if between sizes.', true, 14],
    [10, 'Maria G.', 5, 'Summer essential', 'Perfect linen shirt for warm weather. Breathable and stylish.', true, 11],
    [8, 'Alex T.', 4, 'Quality denim', 'The selvedge detail is beautiful. Broke in nicely after a few wears.', true, 7],
    [12, 'Jordan D.', 5, 'Winter warrior', 'This overcoat is incredibly warm yet not bulky. Love the double-breast design.', true, 19],
    [14, 'Nina P.', 4, 'Trail tested', 'Hiked 50 miles in these. Completely waterproof and great ankle support.', true, 16],
    [15, 'Chris W.', 5, 'Cool design', 'Love the artist collab. Great quality cotton and unique print.', true, 22],
  ];

  for (const r of reviews) {
    await pool.query(
      `INSERT INTO reviews (product_id, customer_name, rating, title, body, verified_purchase, helpful_count) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      r
    );
  }
  console.log('⭐ Reviews seeded (15 items)');

  // Seed Inventory (15 items)
  const inventory = [
    [1, 'NYC Warehouse', 150, 12, 20, 100, '2024-10-15'],
    [2, 'LA Warehouse', 45, 5, 10, 30, '2024-11-01'],
    [3, 'NYC Warehouse', 320, 28, 50, 200, '2024-10-20'],
    [4, 'Chicago Warehouse', 89, 0, 15, 50, '2024-09-30'],
    [5, 'LA Warehouse', 200, 15, 30, 100, '2024-11-05'],
    [6, 'NYC Warehouse', 67, 8, 10, 40, '2024-10-25'],
    [7, 'Chicago Warehouse', 430, 22, 50, 200, '2024-11-10'],
    [8, 'NYC Warehouse', 180, 14, 25, 100, '2024-10-18'],
    [9, 'LA Warehouse', 25, 3, 5, 15, '2024-11-01'],
    [10, 'Chicago Warehouse', 275, 0, 30, 150, '2024-10-28'],
    [11, 'NYC Warehouse', 350, 45, 50, 200, '2024-11-08'],
    [12, 'LA Warehouse', 55, 7, 10, 30, '2024-10-22'],
    [13, 'NYC Warehouse', 120, 10, 15, 50, '2024-11-03'],
    [14, 'Chicago Warehouse', 95, 0, 15, 50, '2024-10-30'],
    [15, 'NYC Warehouse', 500, 35, 75, 300, '2024-11-12'],
  ];

  for (const inv of inventory) {
    await pool.query(
      `INSERT INTO inventory (product_id, warehouse, quantity, reserved, reorder_level, reorder_quantity, last_restocked) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      inv
    );
  }
  console.log('📦 Inventory seeded (15 items)');

  // Seed AI Descriptions (15 items)
  const descriptions = [
    [1, 'Timeless Rebel: The Classic Leather Jacket', 'Premium full-grain leather jacket that transcends trends.', 'Crafted from the finest full-grain leather, this jacket embodies the perfect balance of rugged sophistication and modern style. Each piece is hand-finished with meticulous attention to detail.', 'leather jacket, premium, full-grain, classic, outerwear', 'bold'],
    [2, 'Ethereal Grace: Silk Evening Dress', 'Floor-length silk masterpiece for unforgettable nights.', 'Flowing like liquid moonlight, this silk evening dress captures the essence of timeless elegance. The careful draping and premium silk create a silhouette that moves with you.', 'silk dress, evening wear, luxury, formal, elegant', 'elegant'],
    [3, 'Speed Unleashed: Performance Running Shoes', 'Carbon-plate running shoes for record-breaking performance.', 'Engineered for speed with a revolutionary carbon-plate midsole, these running shoes deliver explosive energy return. Ultra-lightweight mesh upper ensures breathability.', 'running shoes, performance, carbon plate, lightweight, athletic', 'energetic'],
    [4, 'Cloud Nine: Cashmere Crew Neck', 'Pure cashmere luxury you can feel with every touch.', 'Wrapped in 100% Grade-A Mongolian cashmere, this sweater delivers unparalleled softness and warmth. The relaxed crew neck design makes it perfect for layering.', 'cashmere, sweater, luxury, knitwear, soft', 'cozy'],
    [5, 'Vision Elite: Titanium Aviators', 'Polarized titanium sunglasses for the discerning eye.', 'These aviator sunglasses combine aerospace-grade titanium frames with premium polarized lenses. Ultra-lightweight yet incredibly durable.', 'sunglasses, aviator, titanium, polarized, designer', 'sophisticated'],
    [6, 'Power Move: Italian Wool Blazer', 'Slim-fit blazer crafted from Italian wool blend.', 'Command any room with this impeccably tailored blazer. Made from a premium Italian wool-cashmere blend, it offers both structure and comfort.', 'blazer, italian wool, formal, tailored, slim-fit', 'professional'],
    [7, 'Earth Carry: Organic Canvas Tote', 'Sustainable style meets everyday functionality.', 'This organic cotton canvas tote proves sustainability and style go hand in hand. Reinforced leather handles and a spacious interior make it perfect for daily use.', 'tote bag, canvas, organic, sustainable, everyday', 'casual'],
    [8, 'True Blue: Japanese Selvedge Denim', 'Artisan-crafted selvedge denim for the denim purist.', 'Woven on vintage shuttle looms in Japan, this selvedge denim develops a unique patina over time. The slim straight fit offers modern styling with classic construction.', 'jeans, selvedge, japanese denim, slim fit, premium', 'authentic'],
    [9, 'Time Eternal: Swiss Automatic Watch', 'Swiss craftsmanship that tells more than time.', 'This automatic timepiece represents the pinnacle of Swiss watchmaking. A self-winding movement, sapphire crystal, and surgical-grade steel case ensure lasting precision.', 'watch, automatic, swiss, luxury, sapphire crystal', 'prestigious'],
    [10, 'Summer Soul: Pure Linen Shirt', 'Breathable linen for effortless warm-weather style.', 'Embrace the warmth with this pure linen shirt that gets softer with every wash. The relaxed fit and natural texture make it your go-to summer essential.', 'linen shirt, summer, breathable, relaxed, natural', 'relaxed'],
    [11, 'Flow State: High-Waist Yoga Leggings', 'Performance leggings that move with your practice.', 'Designed for seamless transitions from studio to street, these high-waist compression leggings offer targeted support. Hidden pocket keeps essentials secure.', 'yoga leggings, compression, high-waist, activewear, flexible', 'active'],
    [12, 'Winter Legend: Wool-Cashmere Overcoat', 'Double-breasted elegance for the coldest days.', 'This overcoat combines luxurious wool-cashmere fabric with timeless double-breasted styling. The substantial weight provides warmth without bulk.', 'overcoat, wool, cashmere, double-breasted, winter', 'commanding'],
    [13, 'Ocean Pearl: Freshwater Pearl Set', 'Luminous pearls that capture the ocean sunrise.', 'Each pearl in this set is individually selected for its luster and symmetry. The necklace and matching earrings create a coordinated look of effortless sophistication.', 'pearls, necklace, earrings, freshwater, jewelry set', 'graceful'],
    [14, 'Summit Ready: Gore-Tex Hiking Boots', 'Waterproof boots built for serious trail adventures.', 'Tackle any terrain with confidence. Gore-Tex waterproofing keeps feet dry while the Vibram sole provides exceptional grip on wet and rocky surfaces.', 'hiking boots, waterproof, gore-tex, vibram, outdoor', 'adventurous'],
    [15, 'Art Walk: Limited Edition Graphic Tee', 'Wearable art from our exclusive artist collaboration.', 'This limited edition tee features an exclusive print from our emerging artist partnership. Premium 100% organic cotton ensures comfort matches creativity.', 'graphic tee, limited edition, artist collab, cotton, casual', 'creative'],
  ];

  for (const d of descriptions) {
    await pool.query(
      `INSERT INTO ai_descriptions (product_id, headline, short_description, long_description, seo_tags, tone) VALUES ($1,$2,$3,$4,$5,$6)`,
      d
    );
  }
  console.log('✍️  AI Descriptions seeded (15 items)');

  // Seed Style Recommendations (15 items)
  const styleRecs = [
    ['Sarah Johnson', 'Modern Minimalist', 92.5, 'White Sneakers, Structured Tote, Gold Watch', 'Earth tones, Oversized layers, Geometric jewelry'],
    ['Emily Chen', 'Elegant Classic', 88.3, 'Pearl Earrings, Silk Scarf, Ballet Flats', 'Monochrome palette, Tailored pieces, Vintage accessories'],
    ['Mike Williams', 'Casual Athletic', 85.1, 'Running Shoes, Bomber Jacket, Canvas Belt', 'Athleisure mix, Bold colors, Tech accessories'],
    ['Lisa Park', 'Bohemian Chic', 90.7, 'Midi Skirt, Crossbody Bag, Layered Necklaces', 'Mixed prints, Natural fabrics, Artisan jewelry'],
    ['James Brown', 'Luxury Executive', 94.2, 'Swiss Watch, Italian Blazer, Leather Briefcase', 'Navy & charcoal base, Premium materials, Subtle branding'],
    ['Anna Martinez', 'Street Style', 87.6, 'Graphic Tee, Denim Jacket, Platform Sneakers', 'Mix high-low, Statement pieces, Vintage finds'],
    ['David Lee', 'Preppy Modern', 83.9, 'Oxford Shirt, Chinos, Boat Shoes', 'Pastel accents, Clean lines, Classic patterns'],
    ['Rachel Kim', 'Avant-Garde', 91.4, 'Asymmetric Top, Wide Pants, Sculptural Earrings', 'Experimental silhouettes, Monochrome, Architectural accessories'],
    ['Tom Anderson', 'Rugged Outdoor', 86.8, 'Hiking Boots, Flannel Shirt, Utility Vest', 'Earth tones, Durable fabrics, Functional design'],
    ['Sophie Taylor', 'Romantic Feminine', 89.2, 'Pleated Skirt, Lace Blouse, Delicate Chain', 'Soft pastels, Flowing fabrics, Floral details'],
    ['Chris Wilson', 'Tech Minimal', 82.5, 'Performance Tee, Slim Joggers, Clean Sneakers', 'Neutral palette, Technical fabrics, Smart casual'],
    ['Maria Garcia', 'Mediterranean Glam', 93.1, 'Silk Dress, Gold Cuff, Strappy Heels', 'Warm metallics, Rich textures, Bold accessories'],
    ['Alex Thompson', 'Urban Sophisticate', 90.0, 'Cashmere Coat, Slim Trousers, Chelsea Boots', 'Dark palette, Premium knits, Minimalist accessories'],
    ['Jordan Davis', 'Coastal Casual', 84.7, 'Linen Shirt, Shorts, Espadrilles', 'Blue & white, Relaxed fits, Natural materials'],
    ['Nina Patel', 'Global Fusion', 91.8, 'Embroidered Jacket, Wide Pants, Statement Ring', 'Mixed cultural elements, Rich colors, Artisan crafts'],
  ];

  for (const s of styleRecs) {
    await pool.query(
      `INSERT INTO style_recommendations (customer_name, style_profile, confidence_score, recommended_products, trending_combos) VALUES ($1,$2,$3,$4,$5)`,
      s
    );
  }
  console.log('👔 Style Recommendations seeded (15 items)');

  // Seed Price Optimizations (15 items)
  const priceOpts = [
    [1, 299.99, 319.99, 'premium', 0.73, '+8% margin, stable volume'],
    [2, 459.99, 489.99, 'luxury', 0.65, '+6.5% margin, minimal volume impact'],
    [3, 189.99, 179.99, 'competitive', 1.2, '+15% volume, -5% margin per unit'],
    [4, 249.99, 269.99, 'premium', 0.71, '+8% margin with seasonal promo'],
    [5, 179.99, 199.99, 'mid-premium', 0.82, '+11% margin, -3% volume'],
    [6, 349.99, 349.99, 'optimal', 0.77, 'At optimal price point'],
    [7, 89.99, 79.99, 'value', 1.35, '+22% volume, entry price strategy'],
    [8, 159.99, 169.99, 'mid-premium', 0.88, '+6% margin, minimal impact'],
    [9, 899.99, 949.99, 'luxury', 0.52, '+5.5% margin, inelastic demand'],
    [10, 119.99, 109.99, 'competitive', 1.15, '+12% volume for summer season'],
    [11, 79.99, 84.99, 'value-premium', 0.95, '+6% margin, stable demand'],
    [12, 549.99, 579.99, 'premium', 0.68, '+5.5% margin, winter demand peak'],
    [13, 199.99, 219.99, 'mid-premium', 0.79, '+10% margin, gift season pricing'],
    [14, 229.99, 229.99, 'optimal', 0.81, 'At optimal price point'],
    [15, 49.99, 44.99, 'penetration', 1.45, '+28% volume, limited edition urgency'],
  ];

  for (const p of priceOpts) {
    await pool.query(
      `INSERT INTO price_optimizations (product_id, current_price, recommended_price, market_position, elasticity_score, revenue_impact) VALUES ($1,$2,$3,$4,$5,$6)`,
      p
    );
  }
  console.log('💰 Price Optimizations seeded (15 items)');

  console.log('\n✅ All data seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
