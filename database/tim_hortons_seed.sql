-- ==========================================================
--  1. S'ASSURER QUE LA COLONNE EXISTE SUR LA TABLE EXISTANTE
-- ==========================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='category') THEN
        ALTER TABLE products ADD COLUMN category VARCHAR(120) NOT NULL DEFAULT 'Non catégorisé';
    END IF;
END $$;

-- ==========================================================
--  2. NETTOYER LES ANCIENNES DONNÉES ET REVENIR A ZERO
-- ==========================================================
TRUNCATE TABLE inventory_movements CASCADE;
TRUNCATE TABLE products CASCADE;

-- On s'assure qu'un utilisateur existe
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Admin Tim Hortons', 'admin@timhortons.ca', 'dummy_hash', 'RESPONSABLE'
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- ==========================================================
--  3. INJECTER LE CATALOGUE TIM HORTONS (43 Produits)
-- ==========================================================
INSERT INTO products (name, category, unit, min_threshold) VALUES
-- ☕ Boissons chaudes
('Café original', 'Beverage', 'unité', 50),
('Dark Roast', 'Beverage', 'unité', 30),
('Café décaféiné', 'Beverage', 'unité', 20),
('Latte', 'Beverage', 'unité', 25),
('Cappuccino', 'Beverage', 'unité', 25),
('Americano', 'Beverage', 'unité', 20),
('Espresso', 'Beverage', 'unité', 40),
('Café vanille française', 'Beverage', 'unité', 30),
('Thé', 'Beverage', 'unité', 40),
('Thé vert', 'Beverage', 'unité', 30),
('Thé chai', 'Beverage', 'unité', 25),
('Chocolat chaud', 'Beverage', 'unité', 35),
('Café mocha', 'Beverage', 'unité', 20),

-- 🧊 Boissons froides
('Iced Capp', 'Beverage', 'unité', 40),
('Iced Coffee', 'Beverage', 'unité', 45),
('Cold Brew', 'Beverage', 'unité', 30),
('Frozen Lemonade', 'Beverage', 'unité', 20),
('Iced Latte', 'Beverage', 'unité', 25),
('Iced Capp Supreme', 'Beverage', 'unité', 15),
('Smoothie aux fruits', 'Beverage', 'unité', 20),
('Boissons énergétiques', 'Beverage', 'unité', 15),

-- 🍩 Beignes (Donuts)
('Boston Cream', 'Donut', 'unité', 40),
('Honey Cruller', 'Donut', 'unité', 35),
('Chocolate Dip', 'Donut', 'unité', 30),
('Vanilla Dip', 'Donut', 'unité', 25),
('Strawberry Dip', 'Donut', 'unité', 20),
('Apple Fritter', 'Donut', 'unité', 25),
('Old Fashioned Plain', 'Donut', 'unité', 30),
('Old Fashioned Glazed', 'Donut', 'unité', 40),
('Sour Cream Glazed', 'Donut', 'unité', 35),
('Double Chocolate', 'Donut', 'unité', 30),

-- 🍞 Produits de boulangerie
('Muffin aux bleuets', 'Bakery', 'unité', 25),
('Muffin chocolat', 'Bakery', 'unité', 20),
('Muffin aux fruits', 'Bakery', 'unité', 15),
('Croissant', 'Bakery', 'unité', 30),
('Croissant au fromage', 'Bakery', 'unité', 20),
('Bagel nature', 'Bakery', 'unité', 40),
('Bagel sésame', 'Bakery', 'unité', 35),
('Bagel fromage à la crème', 'Bakery', 'unité', 30),
('Pain aux bananes', 'Bakery', 'unité', 15),

-- 🥪 Sandwichs déjeuner
('Bacon Breakfast Sandwich', 'Breakfast', 'unité', 25),
('Sausage Breakfast Sandwich', 'Breakfast', 'unité', 20),
('Farmer''s Wrap', 'Breakfast', 'unité', 30),
('Grilled Breakfast Wrap', 'Breakfast', 'unité', 25),
('Omelette Breakfast Sandwich', 'Breakfast', 'unité', 15),

-- 🍗 Repas / Lunch
('Sandwich au poulet', 'Lunch', 'unité', 20),
('Wrap au poulet', 'Lunch', 'unité', 25),
('Sandwich au steak', 'Lunch', 'unité', 15),
('Chili', 'Lunch', 'portion', 20),
('Soupe du jour', 'Lunch', 'portion', 25),
('Salade César', 'Lunch', 'portion', 15),
('Salade jardin', 'Lunch', 'portion', 15),

-- 🍪 Desserts et collations
('Timbits Assortis', 'Dessert', 'boite', 50),
('Biscuit aux pépites de chocolat', 'Dessert', 'unité', 30),
('Biscuit double chocolat', 'Dessert', 'unité', 25),
('Brownie', 'Dessert', 'unité', 20),
('Barre granola', 'Dessert', 'unité', 15);

-- ==========================================================
--  4. GENERER DES MOUVEMENTS DE STOCKS (Pour les KPI)
-- ==========================================================
DO $$
DECLARE
    v_user_id INTEGER;
    v_product RECORD;
    v_qty INTEGER;
BEGIN
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    FOR v_product IN SELECT id FROM products LOOP
        v_qty := floor(random() * 90 + 10)::int;
        INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, created_at)
        VALUES (v_product.id, v_user_id, 'ENTREE', v_qty, 'Stock initial Tim Hortons', NOW() - (random() * interval '6 days'));
        
        IF random() > 0.5 THEN
            INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, created_at)
            VALUES (v_product.id, v_user_id, 'SORTIE', floor(random() * 20 + 1)::int, 'Vente', NOW() - (random() * interval '2 days'));
        END IF;

        IF random() > 0.8 THEN
            INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, created_at)
            VALUES (v_product.id, v_user_id, 'PERTE', floor(random() * 5 + 1)::int, 'Expiré/Jeté', NOW() - (random() * interval '1 days'));
        END IF;
    END LOOP;
END $$;
