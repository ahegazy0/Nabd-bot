import dotenv from 'dotenv';
import express from 'express';
import connectDB from './src/services/database.js';
import logger from './src/utils/logger.js';
import {bot, sendMessage}  from './src/controllers/botController.js';
import scheduleDailyBroadcast from './src/services/scheduler.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL;

const startApp = async () => {
    try {

        await connectDB();

        const app = express();

        app.get('/health', (req, res) => {
            res.status(200).send("✅ Bot is alive!");
        });

        app.use(bot.webhookCallback('/webhook'));

        app.listen(PORT, async () => {
            logger.info(`🚀 Server running on port ${PORT}`);

            if (!URL) {
                logger.error("❌ RENDER_EXTERNAL_URL is not set in env");
                return;
            }

            try {
                await bot.telegram.setWebhook(`${URL}/webhook`);
                logger.info(`✅ Webhook set to ${URL}/webhook`);
            } catch (err) {
                logger.error("❌ Failed to set webhook", err);
            }
        });

        scheduleDailyBroadcast(sendMessage);

        logger.info("Islamic Reminder Bot is up and running ");

    } catch (error) {
        logger.error("Error starting the application:", error);

        process.exit(1);
    }
};

process.once("SIGINT", () => {
    logger.info("SIGINT received. Shutting down gracefully...");
    process.exit(0);
});

process.once("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    process.exit(0);
});

startApp();