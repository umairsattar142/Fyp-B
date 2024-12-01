const userModel = require("../models/userModel")
const Token = require("../models/tokenModal")
const bcrypt=require("bcryptjs");
const { sendResetToken, resendToken } = require("../utils/email-service");
const getToken=()=>{
    return Math.floor(100000 + Math.random() * 900000);
}
const generateToken=async(req,res)=>{
    const {email}=req.body
    try {
        const user=userModel.find({email})
        if(!user){
            return res.status(400).json({message:"User with this email is not available"})
        }
        const tokenFound= await Token.findOne({email})
        const otp= getToken()
        if(tokenFound){
            tokenFound.token=otp
            await tokenFound.save()
            await resendToken(email,otp)
            res.status(200).json({message:"Token sent successfully"})
        }else{
            const token =new Token({email,token:otp})
            await sendResetToken(email,otp)
            await token.save()
            res.status(200).json({message:"Token sent successfully"})
        }
    } catch (error) {
        
    }
}

const verifyToken= async (req,res)=>{
    const {email,token}=req.body
    try {
        const foundToken =await Token.findOne({email,token})
        if(!foundToken){
            return res.status(400).json({message:"Invalid Token"})
        }
        foundToken.isVerified=true
        await foundToken.save()
        return res.status(200).json({message:"Token verfied, proceed"})
    } catch (error) {
        return res.status(500).json({error})
    }   
}

const updatePassword=async(req,res)=>{
    const {email,password,token}=req.body
    try {
        const foundToken =await Token.findOne({email,token,isVerified:true})
        if(!foundToken){
            return res.status(400).json({message:"Invalid Token"})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        await userModel.findOneAndUpdate({email},{password:hashedPassword},{new:true})
        await foundToken.deleteOne()
        return res.status(200).json({message:"Password updated successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}

module.exports ={
    generateToken,
    verifyToken,
    updatePassword
}