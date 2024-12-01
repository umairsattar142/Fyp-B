const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/authMiddleware")
const feedbackController = require("../controllers/feedBackController")
router.use(authMiddleware)

router.post("/:id",feedbackController.postFeedback)
router.get("/:id",feedbackController.getAllFeedbacks)

module.exports = router