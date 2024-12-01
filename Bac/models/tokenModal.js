const mongoose = require("mongoose")

const tokenSchema = mongoose.Schema({
    token:{type:String,reuired:true},
    email:{type:String,required:true},
    isVerified:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now}
},{timeStamps:true})

module.exports  = mongoose.model("Token",tokenSchema)
