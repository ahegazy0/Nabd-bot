import pLimit from "p-limit";
import {sendMessage} from "../controllers/botController.js";
import BroadLog from "../models/BroadLog.js";
import logger from "../utils/logger.js";

const limit = pLimit(25); 

export const broadcastMessage = async (users, message, type, sentBy = 0) => {
    logger.info(`Starting broadcast: type=${type}, users=${users.length}`);

    const results = await Promise.all(
        users.map((user, index) =>
            limit(async () => {
                try {
                    await new Promise((res) => setTimeout(res, index * 50));

                    await sendMessage(user.telegramId, message.content);

                    await BroadLog.create({
                        messageId: message._id || null,
                        content: message.content,
                        sentAt: new Date(),
                        status: "success",
                        sentBy,
                        userCount: users.length,
                    });

                    return { userId: user._id, status: "success" };
                } catch (err) {
                    logger.error(`Failed to send message to ${user.telegramId}: ${err.message}`);

                    await BroadLog.create({
                        messageId: message._id || null,
                        content: message.content,
                        sentAt: new Date(),
                        status: "failed",
                        sentBy,
                        userCount: users.length,
                    });

                    return { userId: user._id, status: "failed" };
                }
            })
        )
    );

    logger.info(`Broadcast completed: type=${type}, success=${results.filter(r => r.status === "success").length}`);

    return results;
};
