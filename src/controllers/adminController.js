import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";
import BroadLog from "../models/BroadLog.js";
import logger from "../utils/logger.js";

const admins = process.env.ADMINS ? process.env.ADMINS.split(",").map(id => Number(id)) : [];

const isAdmin = (ctx) => admins.includes(ctx.from.id);

const adminCommands = (bot) => {

    bot.command(process.env.COMMAND8, async (ctx) => {
        if (!isAdmin(ctx)) return ctx.reply("❌ You are not authorized.");

        const users = await User.countDocuments();

        const activeUsers = await User.countDocuments({ isActive: true });

        const messages = await Message.countDocuments();

        const broadcasts = await BroadLog.countDocuments();

        ctx.reply(`📊 Stats:
            Users: ${users}
            Active Users: ${activeUsers}
            Messages: ${messages}
            Broadcasts: ${broadcasts}`
        );
    });

    bot.command(process.env.COMMAND4, async (ctx) => {

        if (!isAdmin(ctx)) return ctx.reply("❌ You are not authorized.");

        const args = ctx.message.text.split(" ");

        const type = args[1];

        const content = args.slice(2).join(" ");
        const formattedContent = `\`${content}\``;

        if (!type || !content) return ctx.reply("Usage: /addmsg <type> <content>");

        try {
            const msg = new Message({ type, content: formattedContent});

            await msg.save();

            ctx.reply(`✅ Message added with type: ${type} | ID: ${msg._id}`);

        } catch (err) {
            ctx.reply("❌ Error adding message.");

            logger.error(err);
        }
    });

    bot.command(process.env.COMMAND5, async (ctx) => {

        if (!isAdmin(ctx)) return ctx.reply("❌ You are not authorized.");

        const args = ctx.message.text.split(" ");

        const id = args[1];

        if (!id) return ctx.reply("Usage: /delmsg <id>");

        try {
            await Message.findByIdAndDelete(id);

            ctx.reply(`✅ Message ${id} deleted.`);

        } catch (err) {
            ctx.reply("❌ Error deleting message.");

            logger.error(err);
        }
    });

    bot.command(process.env.COMMAND6, async (ctx) => {
        if (!isAdmin(ctx)) return ctx.reply("❌ You are not authorized.");

        const users = await User.find().select("telegramId username firstName lastName isActive").lean();

        let list = users.map((u) =>`ID: ${u.telegramId} | User: @${u.username || u.firstName + " " + (u.lastName || "")} | Active: ${u.isActive}`).join("\n");
        
        if (!list) list = "No users found.";
        
        ctx.reply(list);
    });

    bot.command(process.env.COMMAND7, async (ctx) => {
        if (!isAdmin(ctx)) return ctx.reply("❌ You are not authorized.");

        const args = ctx.message.text.split(" ");

        const telegramId = args[1];

        if (!telegramId) return ctx.reply("Usage: /optout <userId>");

        try {
            const user = await User.findOneAndUpdate({ telegramId: Number(telegramId) },{ isActive: false });

            if (!user) return ctx.reply("❌ User not found.");

            ctx.reply(`✅ User ${telegramId} is now inactive.`);

        } catch (err) {
            ctx.reply("❌ Error updating user.");

            logger.error(err);
        }
    });

    bot.command(process.env.COMMAND2, async (ctx) => {
        if (!isAdmin(ctx)) return ctx.reply("❌ You are not authorized");

        const args = ctx.message.text.split(" ");
        const content = args.slice(1).join(" ");
        const formattedContent = `${content}`;
        
        if (!content) return ctx.reply("Usage: /broadcast <message>");

        try {
            const users = await User.find({ isActive: true }).select("telegramId -_id");
            let successCount = 0;

            const broadcastId = new mongoose.Types.ObjectId();

            for (const u of users) {
                try {
                    const sent = await ctx.telegram.sendMessage(u.telegramId, formattedContent);
                    successCount++;
                } catch (err) {
                    logger.error(`Failed to send broadcast to ${u.telegramId}: ${err.message}`);
                }
            }

            ctx.reply(`✅ Broadcast sent to ${successCount} users.\n📌 Broadcast ID: ${broadcastId}`);

        } catch (err) {
            ctx.reply("❌ Error sending broadcast.");
            logger.error(err);
        }
    });

    bot.command(process.env.COMMAND3, async (ctx) => {
        if (!isAdmin(ctx)) return ctx.reply("❌ You are not authorized.");

        const args = ctx.message.text.split(" ");
        const broadcastId = args[1];

        if (!broadcastId) return ctx.reply("Usage: /delbroadcast <broadcastId>");

        try {
            const logs = await BroadLog.find({ broadcastId });

            if (!logs.length) return ctx.reply("❌ Broadcast not found.");

            let deleteCount = 0;

            for (const log of logs) {
                try {
                    await ctx.telegram.deleteMessage(log.telegramId, log.telegramMessageId);
                    deleteCount++;
                } catch (err) {
                    logger.warn(`Failed to delete message for user ${log.telegramId}: ${err.message}`);
                }
            }

            ctx.reply(`✅ Broadcast ${broadcastId} deleted from ${deleteCount} users.`);

            await BroadLog.deleteMany({ broadcastId });

        } catch (err) {
            ctx.reply("❌ Error deleting broadcast.");

            logger.error(err);
        }
    });
};

export default adminCommands;