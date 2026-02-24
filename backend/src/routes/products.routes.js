const router = require("express").Router();
const {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/products.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All product routes are protected
router.use(authMiddleware);

router.get("/", getProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;