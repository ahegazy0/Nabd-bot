import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import logger from "../utils/logger.js";
import User from "../models/User.js";
import adminCommands from "./adminController.js";

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN);

const sendMessage = async (telegramId, messageText) => {

    try{

        await bot.telegram.sendMessage(telegramId, messageText, {parse_mode:'Markdown'})

    } catch(error){

        logger.error(`Failed to send message to user ${telegramId}`, error);
    }
};

bot.start(async (ctx) => {

    const telegramId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name || "";
    const lastName = ctx.from.last_name || "";
    
    try{
        let user = await User.findOne({telegramId});
 
        if (!user) {
            user = await User.create({
                telegramId,
                username,
                firstName,
                lastName,
                isActive:true,
            });

            const welcomeMessage = `مرحبًا ${firstName}! 🎉 لقد اشتركت بنجاح في التنبيهات اليومية الإسلامية 🕌\n\nستصلك بإذن الله:\n- ذكر يومي\n- رسائل إيمانية\n- تذكير بالصيام (الاثنين/الخميس وأيام البيض)`;
            
            await sendMessage(telegramId, welcomeMessage);


        } else if (!user.isActive) {
            user.isActive = true;
            
            await user.save();

            const reactivateMessage = `مرحبًا بعودتك ${firstName}! 🤗 تم إعادة تفعيل اشتراكك وستصلك التذكيرات مجددًا بإذن الله 🕌`;
            
            await sendMessage(telegramId, reactivateMessage);

        } else {

                await sendMessage(telegramId, "أنت مشترك بالفعل! ✅");
            }
    }catch(error){ 

        logger.error(`Error handling /start for ${telegramId}`, error);
    }
});

bot.command("stop", async (ctx) => {

    const telegramId = ctx.from.id;

    try {
        await User.findOneAndUpdate({ telegramId: Number(telegramId) },{ isActive: false });

        await sendMessage(telegramId, "تم إلغاء اشتراكك من التنبيهات اليومية. ❌");

    } catch (error) {

        logger.error(`Error handling /stop for ${telegramId}`, error);
    }
});

bot.help(async (ctx) => {

    const firstName = ctx.from.first_name || "";

    try {
        const helpMessage = `
السلام عليكم ورحمة الله وبركاته ${firstName} 👋
يسعدنا انضمامك إالينا نفعك الله ونفع بك

إليك الأوامر المتاحة:

/start - الاشتراك في التنبيهات اليومية ✅ 
/stop - إلغاء الاشتراك ❌
/help - عرض قائمة المساعدة ℹ️

📌 ستصلك تلقائيًا:  
- حديث يومي أو تدبر آية من كتاب الله 📖
- تذكيرات بالصيام المستحب (الاثنين والخميس وأيام البيض)  🕌  
- رسالة إيمانية تسعد يومك وتذكرك بالله تعالى 🌱


نسأل الله أن يبارك في وقتك ويعينك على الطاعات 🌙
`;
        await ctx.reply(helpMessage);

    } catch (error) {

        logger.error("Error in /help command:", error);
    }
});

bot.command("contact", async (ctx) => {

    const telegramId = ctx.from.id;

    try {
        await User.findOneAndUpdate({ telegramId: Number(telegramId) },{ isActive: false });

        const message = `
📬 يمكنك التواصل معنا بشكل مجهول وآمن عبر الرابط التالي:
🔗 [أرسل رسالتك الآن](https://nabdbot.sarahah.pro)

نحن نقدر كل ملاحظاتك واقتراحاتك ونسعى دائمًا لتحسين البوت. 🤍
`;
        await sendMessage(telegramId, message);

    } catch (error) {

        logger.error(`Error handling /contact for ${telegramId}`, error);
    }
});

adminCommands(bot);

export {sendMessage, bot};