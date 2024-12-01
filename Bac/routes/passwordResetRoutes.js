const express = require("express")
const router = express.Router()
const tokenController= require("../controllers/tokenController")
router.post("/generate",tokenController.generateToken)
router.post("/verify",tokenController.verifyToken)
router.post("/reset",tokenController.updatePassword)
module.exports=router