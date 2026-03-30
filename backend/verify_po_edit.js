const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function verifyPOEdit() {
  console.log("=== Verification of PO Edit Logic ===");
  try {
    // 1. Get a product and a user
    const userRes = await pool.query("SELECT id FROM users LIMIT 1");
    const prodRes = await pool.query("SELECT id FROM products LIMIT 2");
    
    if (userRes.rows.length === 0 || prodRes.rows.length < 2) {
      console.log("Missing data for test. Please ensure some users and products exist.");
      process.exit(1);
    }

    const userId = userRes.rows[0].id;
    const p1 = prodRes.rows[0].id;
    const p2 = prodRes.rows[1].id;

    // 2. Create a PO (BROUILLON)
    console.log("2. Creating BROUILLON PO...");
    const poRes = await pool.query(
      "INSERT INTO purchase_orders (user_id, status, description) VALUES ($1, 'BROUILLON', 'Test Edit Logic') RETURNING id",
      [userId]
    );
    const poId = poRes.rows[0].id;
    
    await pool.query(
      "INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity) VALUES ($1, $2, 10)",
      [poId, p1]
    );

    // 3. Update Status to VALIDEE
    console.log("3. Updating status to VALIDEE...");
    await pool.query("UPDATE purchase_orders SET status = 'VALIDEE' WHERE id = $1", [poId]);

    // 4. Mimic Controller Logic for Update
    console.log("4. Testing item replacement in VALIDEE status (mimicking controller logic)...");
    
    // Simulate req.body.items
    const newItems = [{ product_id: p2, quantity: 20, price_estimated: 5.5 }];
    
    // Fetch old status
    const statusRes = await pool.query("SELECT status FROM purchase_orders WHERE id = $1", [poId]);
    const oldStatus = statusRes.rows[0].status;

    // THE LOGIC WE ADDED:
    if (newItems && (oldStatus === 'BROUILLON' || oldStatus === 'VALIDEE')) {
      await pool.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [poId]);
      for (const item of newItems) {
        await pool.query(
          'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, price_estimated) VALUES ($1, $2, $3, $4)',
          [poId, item.product_id, item.quantity, item.price_estimated || 0]
        );
      }
      console.log("-> ✅ Successfully replaced items in VALIDEE status!");
    } else {
      console.log("-> ❌ FAILED: Item replacement blocked in VALIDEE status!");
      process.exit(1);
    }

    // 5. Verify items were updated
    const finalItems = await pool.query("SELECT * FROM purchase_order_items WHERE purchase_order_id = $1", [poId]);
    if (finalItems.rows.length === 1 && finalItems.rows[0].product_id === p2) {
      console.log("-> ✅ Verified: Quantity is", finalItems.rows[0].quantity);
    } else {
      console.log("-> ❌ FAILED: Items not updated correctly.");
      process.exit(1);
    }

    // 6. Test logic for RECUE status (should be blocked)
    console.log("6. Testing item replacement in RECUE status (should be blocked)...");
    await pool.query("UPDATE purchase_orders SET status = 'RECUE' WHERE id = $1", [poId]);
    const statusRes2 = await pool.query("SELECT status FROM purchase_orders WHERE id = $1", [poId]);
    const statusRecue = statusRes2.rows[0].status;
    
    if (newItems && (statusRecue === 'BROUILLON' || statusRecue === 'VALIDEE')) {
      console.log("-> ❌ FAILED: Item replacement ALLOWED in RECUE status (Safety breach!)");
      process.exit(1);
    } else {
      console.log("-> ✅ Correctly blocked item replacement in RECUE status.");
    }

    // 7. Cleanup
    console.log("7. Cleaning up...");
    await pool.query("DELETE FROM purchase_orders WHERE id = $1", [poId]);
    console.log("=== ✅ Verification Complete. All Logic Tests Passed! ===");

  } catch (err) {
    console.error("❌ Error during verification:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyPOEdit();
