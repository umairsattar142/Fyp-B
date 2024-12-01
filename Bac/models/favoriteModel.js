const mongoose = require("mongoose")
const favoriteSchema= mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        reuired:true
    },
    itemIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Item",
        required:true
    }]
})

module.exports = mongoose.model("Favorite",favoriteSchema)