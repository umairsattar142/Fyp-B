const mongoose = require("mongoose")

const feedBackSchema= mongoose.Schema({
    itemId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Item"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        reuired:true
    }
})

module.exports = mongoose.model("FeedBack",feedBackSchema)