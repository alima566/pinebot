import Discord from "discord.js";
import mongoose from "mongoose";
import { log } from "./utils/utils";
import { Client } from "./Client";
import { registerCommands, registerEvents, registerSlashCommand } from "./utils/registry";
import * as dotenv from "dotenv";
dotenv.config();

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
    allowedMentions: { parse: ["users", "roles"], repliedUser: false }
}) as Client;

(async () => {
    client.commands = new Discord.Collection();
    client.slashCommands = new Discord.Collection();
    client.categories = new Discord.Collection();
    client.guildInfoCache = new Discord.Collection();
    client.userInfoCache = new Discord.Collection();

    client.DBGuild = (await import("./models/guildSchema")).default;
    client.DBConfig = (await import("./models/config")).default;
    client.DBUser = (await import("./models/userSchema")).default;

    client.serverCooldowns = new Discord.Collection();
    client.globalCooldowns = new Discord.Collection();

    try {
        await mongoose.connect(`${process.env.MONGO_URI}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        const blacklistFetch = await client.DBConfig.findByIdAndUpdate(
            "blacklist",
            {},
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        //@ts-ignore
        client.blacklistCache = new Set(blacklistFetch.blacklisted);

        log("SUCCESS", "./src/index.ts", "Successfully connected to the database.");
    } catch (e) {
        log("ERROR", "./src/index.ts", `Error connecting to database: ${e.message}`);
        process.exit(1);
    }

    try {
        await client.login(process.env.DISCORD_TOKEN);

        if (!client.application!.owner) await client.application!.fetch();

        await registerEvents(client, "../events");
        await registerCommands(client, "../commands");
        await registerSlashCommand(client, "../slashCommands");

        log("SUCCESS", "./src/index.ts", `Logged in as ${client.user!.tag}!`);
    } catch (e) {
        log("ERROR", "./src/index.ts", `Error logging in: ${e.message}`);
    }
    log(
        "SUCCESS",
        "./src/index.ts",
        "Successfully added all commands, categories, events, schemas, features, and connected to MongoDB."
    );
})();
