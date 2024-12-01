const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/authMiddleware")
const favController = require("../controllers/favoriteController")
router.use(authMiddleware)

router.get("/",favController.getFavorites)
router.get("/ids",favController.getFavId)
router.post("/:id",favController.addFavorite)
router.delete("/:id",favController.removeFavorite)

module.exports= router