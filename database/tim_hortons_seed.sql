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
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@timhortons.ca');

INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Employé Démo', 'employe@test.com', 'dummy_hash', 'EMPLOYE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'employe@test.com');

-- ==========================================================
--  3. INJECTER LE CATALOGUE TIM HORTONS (43 Produits)
-- ==========================================================
INSERT INTO products (name, category, unit, min_threshold) VALUES
-- ☕ Boissons chaudes
('Café original', 'Boissons', 'unité', 50),
('Dark Roast', 'Boissons', 'unité', 30),
('Café décaféiné', 'Boissons', 'unité', 20),
('Latte', 'Boissons', 'unité', 25),
('Cappuccino', 'Boissons', 'unité', 25),
('Americano', 'Boissons', 'unité', 20),
('Espresso', 'Boissons', 'unité', 40),
('Café vanille française', 'Boissons', 'unité', 30),
('Thé', 'Boissons', 'unité', 40),
('Thé vert', 'Boissons', 'unité', 30),
('Thé chai', 'Boissons', 'unité', 25),
('Chocolat chaud', 'Boissons', 'unité', 35),
('Café mocha', 'Boissons', 'unité', 20),

-- 🧊 Boissons froides
('Iced Capp', 'Boissons', 'unité', 40),
('Iced Coffee', 'Boissons', 'unité', 45),
('Cold Brew', 'Boissons', 'unité', 30),
('Frozen Lemonade', 'Boissons', 'unité', 20),
('Iced Latte', 'Boissons', 'unité', 25),
('Iced Capp Supreme', 'Boissons', 'unité', 15),
('Smoothie aux fruits', 'Boissons', 'unité', 20),
('Boissons énergétiques', 'Boissons', 'unité', 15),

-- 🍩 Beignes (Donuts)
('Boston Cream', 'Beignes', 'unité', 40),
('Honey Cruller', 'Beignes', 'unité', 35),
('Chocolate Dip', 'Beignes', 'unité', 30),
('Vanilla Dip', 'Beignes', 'unité', 25),
('Strawberry Dip', 'Beignes', 'unité', 20),
('Apple Fritter', 'Beignes', 'unité', 25),
('Old Fashioned Plain', 'Beignes', 'unité', 30),
('Old Fashioned Glazed', 'Beignes', 'unité', 40),
('Sour Cream Glazed', 'Beignes', 'unité', 35),
('Double Chocolate', 'Beignes', 'unité', 30),

-- 🍞 Produits de boulangerie
('Muffin aux bleuets', 'Boulangerie', 'unité', 25),
('Muffin chocolat', 'Boulangerie', 'unité', 20),
('Muffin aux fruits', 'Boulangerie', 'unité', 15),
('Croissant', 'Boulangerie', 'unité', 30),
('Croissant au fromage', 'Boulangerie', 'unité', 20),
('Bagel nature', 'Boulangerie', 'unité', 40),
('Bagel sésame', 'Boulangerie', 'unité', 35),
('Bagel fromage à la crème', 'Boulangerie', 'unité', 30),
('Pain aux bananes', 'Boulangerie', 'unité', 15),

-- 🥪 Sandwichs déjeuner
('Bacon Breakfast Sandwich', 'Petit-déjeuner', 'unité', 25),
('Sausage Breakfast Sandwich', 'Petit-déjeuner', 'unité', 20),
('Farmer''s Wrap', 'Petit-déjeuner', 'unité', 30),
('Grilled Breakfast Wrap', 'Petit-déjeuner', 'unité', 25),
('Omelette Breakfast Sandwich', 'Petit-déjeuner', 'unité', 15),

-- 🍗 Repas / Lunch
('Sandwich au poulet', 'Dîner', 'unité', 20),
('Wrap au poulet', 'Dîner', 'unité', 25),
('Sandwich au steak', 'Dîner', 'unité', 15),
('Chili', 'Dîner', 'portion', 20),
('Soupe du jour', 'Dîner', 'portion', 25),
('Salade César', 'Dîner', 'portion', 15),
('Salade jardin', 'Dîner', 'portion', 15),

-- 🍪 Desserts et collations
('Timbits Assortis', 'Desserts', 'boite', 50),
('Biscuit aux pépites de chocolat', 'Desserts', 'unité', 30),
('Biscuit double chocolat', 'Desserts', 'unité', 25),
('Brownie', 'Desserts', 'unité', 20),
('Barre granola', 'Desserts', 'unité', 15);

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
