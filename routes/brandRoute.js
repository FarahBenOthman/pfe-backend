const express=require("express")
//const { createCategory, getCategories, deleteCategory } = require("../controllers/categoryController")
const { protect, adminOnly } = require("../middleware/authMiddleware")
const { createBrand, getBrands, deleteBrand } = require("../controllers/brandController")
const router = express.Router()



//routes
router.post("/createBrand", protect, adminOnly, createBrand);
router.get("/getBrands", protect, adminOnly, getBrands);
router.delete("/:slug", protect, adminOnly, deleteBrand);

module.exports = router;