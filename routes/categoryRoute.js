const express=require("express")
const { createCategory, getCategories, deleteCategory } = require("../controllers/categoryController")
const { protect, adminOnly } = require("../middleware/authMiddleware")
const router = express.Router()



//routes
router.post("/createCategory", protect, adminOnly, createCategory)
router.get("/getCategories", protect, adminOnly, getCategories)
router.delete("/:slug", protect, adminOnly, deleteCategory)

module.exports = router