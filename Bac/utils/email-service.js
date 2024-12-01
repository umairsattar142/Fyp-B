const nodemailer = require("nodemailer")
const {FORGET_EMAIL_TEMPLATE,VERIFICATION_EMAIL_TEMPLATE,RESEND_EMAIL_TOKEN_TEMPLATE}= require("./constants")
const AUTH_EMAIL= "umairsattar1346@gmail.com"
const AUTH_PASS= "havn bbnu gqxr xiyf"
const transporter = nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:AUTH_EMAIL,
        pass:AUTH_PASS
    }
})


const sendVerificationToken=async(to,token)=>{
    try{
        await transporter.sendMail({
            from:AUTH_EMAIL,
            to,
            subject:"Verification Token",
            text:VERIFICATION_EMAIL_TEMPLATE.replace("[Token]",token.toString())
        })
        return true
    }catch(error){
        console.log(error)
        return false
    }
}
const sendResetToken=async(to,token)=>{
    try{
        await transporter.sendMail({
            from:AUTH_EMAIL,
            to,
            subject:"Password Token",
            text:FORGET_EMAIL_TEMPLATE.replace("[Token]",token.toString())
        })
        return true
    }catch(error){
        console.log(error)
        return false
    }
}
const resendToken=async(to,token)=>{
    try{
        await transporter.sendMail({
            from:AUTH_EMAIL,
            to,
            subject:"Resend Token Request",
            text:RESEND_EMAIL_TOKEN_TEMPLATE.replace("[Token]",token.toString())
        })
        return true
    }catch(error){
        console.log(error)
        return false
    }
}

const notifyHighestBidder= async(to,m)=>{
    try{
        await transporter.sendMail({
            from:AUTH_EMAIL,
            to,
            subject:"Highest Bidder",
            text: (m!="" && m) ||"Congratulations! Your bid was the highest"
        })
        return true
    }catch(error){
        console.log(error)
        return false
    }
}

const notifySellerForAuctionClose=async(to,m)=>{
    try{
        await transporter.sendMail({
            from:AUTH_EMAIL,
            to,
            subject:"Highest Bidder",
            text: (m!="" && m)||"Congratulations! Your item sold was the highest."
        })
        return true
    }catch(error){
        console.log(error)
        return false
    }
}

const notifySellerForAdApproval=async(to,m)=>{
    try{
        await transporter.sendMail({
            from:AUTH_EMAIL,
            to,
            subject:"Ad Approved",
            text: (m!="" && m)||"Congratulations! Your item has been approved."
        })
        return true
    }catch(error){
        console.log(error)
        return false
    }
}




module.exports = {
    sendVerificationToken,
    sendResetToken,
    resendToken,
    notifyHighestBidder,
    notifySellerForAuctionClose,
    notifySellerForAdApproval,
};