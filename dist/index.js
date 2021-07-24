"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("./utils/utils");
const registry_1 = require("./utils/registry");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const client = new discord_js_1.default.Client({
    intents: [
        discord_js_1.default.Intents.FLAGS.GUILDS,
        discord_js_1.default.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.default.Intents.FLAGS.GUILD_BANS,
        discord_js_1.default.Intents.FLAGS.GUILD_PRESENCES,
        discord_js_1.default.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.default.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
    allowedMentions: { parse: ["users", "roles"], repliedUser: false }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    client.commands = new discord_js_1.default.Collection();
    client.slashCommands = new discord_js_1.default.Collection();
    client.categories = new discord_js_1.default.Collection();
    client.guildInfoCache = new discord_js_1.default.Collection();
    client.userInfoCache = new discord_js_1.default.Collection();
    client.DBGuild = (yield Promise.resolve().then(() => __importStar(require("./models/guildSchema")))).default;
    client.DBConfig = (yield Promise.resolve().then(() => __importStar(require("./models/config")))).default;
    client.DBUser = (yield Promise.resolve().then(() => __importStar(require("./models/userSchema")))).default;
    client.serverCooldowns = new discord_js_1.default.Collection();
    client.globalCooldowns = new discord_js_1.default.Collection();
    try {
        yield mongoose_1.default.connect(`${process.env.MONGO_URI}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        const blacklistFetch = yield client.DBConfig.findByIdAndUpdate("blacklist", {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        //@ts-ignore
        client.blacklistCache = new Set(blacklistFetch.blacklisted);
        utils_1.log("SUCCESS", "./src/index.ts", "Successfully connected to the database.");
    }
    catch (e) {
        utils_1.log("ERROR", "./src/index.ts", `Error connecting to database: ${e.message}`);
        process.exit(1);
    }
    try {
        yield client.login(process.env.DISCORD_TOKEN);
        if (!client.application.owner)
            yield client.application.fetch();
        yield registry_1.registerEvents(client, "../events");
        yield registry_1.registerCommands(client, "../commands");
        yield registry_1.registerSlashCommand(client, "../slashCommands");
        utils_1.log("SUCCESS", "./src/index.ts", `Logged in as ${client.user.tag}!`);
    }
    catch (e) {
        utils_1.log("ERROR", "./src/index.ts", `Error logging in: ${e.message}`);
    }
    utils_1.log("SUCCESS", "./src/index.ts", "Successfully added all commands, categories, events, schemas, features, and connected to MongoDB.");
}))();
