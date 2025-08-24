const crypto = require('crypto');

// توليد رمز OTP عشوائي
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// إرسال OTP عبر SMS (هذا مثال بسيط، في بيئة الإنتاج يجب استخدام خدمة SMS حقيقية)
async function sendOTP(phone, otp) {
    console.log(`Sending OTP ${otp} to ${phone}`);
    
    // في بيئة الإنتاج، استخدم خدمة مثل Twilio أو غيرها
    // مثال:
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //     body: `رمز التحقق الخاص بك هو: ${otp}`,
    //     from: '+967 782030088',
    //     to: phone
    // });
    
    return true;
}

module.exports = {
    generateOTP,
    sendOTP
};