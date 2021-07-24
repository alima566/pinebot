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
exports.isValidNumber = exports.removeCommas = exports.formatNumber = exports.getGuildInfo = exports.getUserInfo = exports.msToTime = exports.randomRange = exports.chunkArray = exports.log = exports.sendMessageToBotLog = exports.getReply = exports.paginate = exports.fetchAuditLog = exports.getGuildIcon = exports.CustomEmbed = exports.setCooldown = exports.getCooldown = exports.missingPermissions = exports.whitelist = exports.blacklist = exports.processArguments = void 0;
const discord_js_1 = __importStar(require("discord.js"));
const ms_1 = __importDefault(require("ms"));
const colors_json_1 = __importDefault(require("../config/colors.json"));
const reactions = ["⏪", "⏸️", "⏩"];
const hasAmount = ["SOMETHING", "NUMBER", "CHANNEL", "ROLE", "MEMBER"];
const consoleColors = {
    SUCCESS: "\u001b[32m",
    WARNING: "\u001b[33m",
    ERROR: "\u001b[31m"
};
const processArguments = (message, msgArgs, expectedArgs) => {
    let counter = 0;
    let amount, num, role, member, channel, attach, time;
    let flags = {};
    for (const argument of expectedArgs) {
        if (hasAmount.includes(argument.type)) {
            //@ts-ignore
            amount = argument.amount && argument.amount > 1 ? argument.amount : 1;
        }
        else {
            amount = 1;
        }
        for (let i = 0; i < amount; i++) {
            switch (argument.type) {
                case "SOMETHING":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.words &&
                        !argument.words.includes(msgArgs[counter].toLowerCase())) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.regexp && !argument.regexp.test(msgArgs[counter])) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (amount == 1) {
                        flags[argument.id] = msgArgs[counter];
                    }
                    else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(msgArgs[counter]);
                    }
                    else {
                        flags[argument.id] = [msgArgs[counter]];
                    }
                    break;
                case "NUMBER":
                    num = Number(msgArgs[counter]);
                    if (!msgArgs[counter] || isNaN(num)) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.min && argument.min > num) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.max && argument.max < num) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.toInteger) {
                        //@ts-ignore
                        num = parseInt(num);
                    }
                    if (amount == 1) {
                        flags[argument.id] = num;
                    }
                    else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(num);
                    }
                    else {
                        flags[argument.id] = [num];
                    }
                    break;
                case "CHANNEL":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    channel =
                        msgArgs[counter].startsWith("<#") && msgArgs[counter].endsWith(">")
                            ? message.guild.channels.cache.get(msgArgs[counter].slice(2, -1))
                            : message.guild.channels.cache.get(msgArgs[counter]);
                    if (!channel) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.channelTypes && !argument.channelTypes.includes(channel.type)) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (amount == 1) {
                        //@ts-ignore
                        flags[argument.id] = channel;
                    }
                    else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(channel);
                    }
                    else {
                        //@ts-ignore
                        flags[argument.id] = [channel];
                    }
                    break;
                case "ROLE":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    role =
                        msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")
                            ? message.guild.roles.cache.get(msgArgs[counter].slice(3, -1))
                            : message.guild.roles.cache.get(msgArgs[counter]);
                    if (!role) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.notBot && role.managed) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (amount == 1) {
                        flags[argument.id] = role;
                    }
                    else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(role);
                    }
                    else {
                        flags[argument.id] = [role];
                    }
                    break;
                case "AUTHOR_OR_MEMBER":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    member =
                        msgArgs[counter].startsWith("<@") ||
                            (msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))
                            ? message.guild.members.cache.get(msgArgs[counter]
                                .replace("<@", "")
                                .replace("!", "")
                                .replace(">", ""))
                            : message.guild.members.cache.get(msgArgs[counter]);
                    flags[argument.id] = !member ? message.member : member;
                    if (argument.toUser) {
                        //@ts-ignore
                        flags[argument.id] = flags[argument.id].user;
                    }
                    break;
                case "MEMBER":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    member =
                        msgArgs[counter].startsWith("<@") ||
                            (msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))
                            ? message.guild.members.cache.get(msgArgs[counter]
                                .replace("<@", "")
                                .replace("!", "")
                                .replace(">", ""))
                            : message.guild.members.cache.get(msgArgs[counter]);
                    if (!member) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    else {
                        if (argument.notBot && member.user.bot) {
                            return { invalid: true, prompt: argument.prompt };
                        }
                        if (argument.notSelf && member.id === message.author.id) {
                            return { invalid: true, prompt: argument.prompt };
                        }
                        if (argument.toUser) {
                            member = member.user;
                        }
                        if (amount == 1) {
                            flags[argument.id] = member;
                        }
                        else if (flags[argument.id]) {
                            //@ts-ignore
                            flags[argument.id].push(member);
                        }
                        else {
                            flags[argument.id] = [member];
                        }
                    }
                    break;
                case "ATTACHMENT":
                    if (message.attachments.size === 0) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    attach = message.attachments.filter((a) => {
                        let accepted = false;
                        argument.attachmentTypes.forEach((type) => {
                            if (a.proxyURL.endsWith(type)) {
                                accepted = true;
                            }
                        });
                        return accepted;
                    });
                    if (attach.size === 0) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    flags[argument.id] = attach.first();
                    break;
                case "TIME":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    time = msgArgs
                        .slice(counter)
                        .join("")
                        .match(/(\d*)(\D*)/g);
                    time.pop();
                    num = 0;
                    for (let i = 0; i < time.length; i++) {
                        try {
                            num += ms_1.default(time[i]);
                        }
                        catch (e) {
                            return { invalid: true, prompt: argument.prompt };
                        }
                    }
                    if (argument.min && num < argument.min) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    if (argument.max && num > argument.max) {
                        return { invalid: true, prompt: argument.prompt };
                    }
                    flags[argument.id] = num;
                    break;
                default:
                    console.warn(
                    //@ts-ignore
                    `processArguments: the argument type "${argument.type}" doesn't exist.`);
            }
            counter++;
        }
    }
    return flags;
};
exports.processArguments = processArguments;
/**
 * Function that adds a user to the blacklist (i.e., user can't run any commands).
 * @param {Client} client The client that the bot is logged in as.
 * @param {Snowflake} userID The userID to blacklist.
 * @returns
 */
const blacklist = (client, userID) => __awaiter(void 0, void 0, void 0, function* () {
    if (client.blacklistCache.has(userID))
        return;
    yield client.DBConfig.findByIdAndUpdate("blacklist", {
        $push: {
            blacklisted: userID
        }
    }, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    });
    client.blacklistCache.add(userID);
});
exports.blacklist = blacklist;
/**
 * Function that removes the user from the blacklist.
 * @param {Client} client The client that the bot is logged in as
 * @param {Snowflake} userID The userID to whitelist
 * @returns
 */
const whitelist = (client, userID) => __awaiter(void 0, void 0, void 0, function* () {
    if (!client.blacklistCache.has(userID))
        return;
    yield client.DBConfig.findByIdAndUpdate("blacklist", {
        $pull: {
            blacklisted: userID
        }
    }, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    });
    client.blacklistCache.delete(userID);
});
exports.whitelist = whitelist;
/**
 * Function that checks what permissions a guild member is missing.
 * @param {Discord.GuildMember} member The guild member to check permissions for
 * @param {Discord.PermissionResolvable} perms The permission(s) that the guild member is missing
 * @returns {String} A list of missing permissions
 */
const missingPermissions = (member, perms) => {
    const missingPerms = member.permissions.missing(perms).map((str) => {
        return `\`${str
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``;
    });
    return perms == "ADMINISTRATOR"
        ? "`Administrator`"
        : missingPerms.length > 1
            ? `${missingPerms.slice(0, -1).join(", ")} and ${missingPerms.slice(-1)[0]}`
            : missingPerms[0];
};
exports.missingPermissions = missingPermissions;
/**
 * Function that returns the cooldown a command has
 * @param {Client} client The client that the bot is logged in as
 * @param {Command} command The command to get the cooldown for
 * @param {Discord.Message} message The Discord message object
 * @returns {number} The command cooldown, in seconds.
 */
const getCooldown = (client, command, type) => {
    let guildInfo = client.guildInfoCache.get(type.guild.id);
    let cd = command.cooldown;
    const member = type.member;
    if (guildInfo.commandCooldowns && guildInfo.commandCooldowns[command.name]) {
        const roles = Object.keys(guildInfo.commandCooldowns[command.name]);
        const highestRole = member.roles.cache
            .filter((role) => roles.includes(role.id))
            .sort((a, b) => b.position - a.position)
            .first();
        if (highestRole) {
            cd = guildInfo.commandCooldowns[command.name][highestRole.id] / 1000;
        }
    }
    return cd;
};
exports.getCooldown = getCooldown;
/**
 * Function that sets the cooldown for a command
 * @param {Client} client The client that the bot is logged in as
 * @param {Command} command The command to set the cooldown for
 * @param {Discord.Message} message The Discord message object
 */
const setCooldown = (client, command, type) => {
    const cd = getCooldown(client, command, type);
    if (!cd)
        return;
    let cooldowns;
    if (typeof command.globalCooldown === "undefined" || command.globalCooldown) {
        if (!client.globalCooldowns.has(command.name)) {
            client.globalCooldowns.set(command.name, new discord_js_1.default.Collection());
        }
        cooldowns = client.globalCooldowns;
    }
    else {
        if (!client.serverCooldowns.has(type.guild.id)) {
            client.serverCooldowns.set(type.guild.id, new discord_js_1.default.Collection());
            cooldowns = client.serverCooldowns.get(type.guild.id);
        }
        if (!client.serverCooldowns.has(type.guild.id)) {
            client.serverCooldowns.set(type.guild.id, new discord_js_1.default.Collection());
        }
        cooldowns = client.serverCooldowns.get(type.guild.id);
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new discord_js_1.default.Collection());
        }
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = cd * 1000;
    if (type instanceof discord_js_1.default.Message) {
        timestamps.set(type.author.id, now);
        setTimeout(() => timestamps.delete(type.author.id), cooldownAmount);
    }
    else {
        timestamps.set(type.user.id, now);
        setTimeout(() => timestamps.delete(type.user.id), cooldownAmount);
    }
};
exports.setCooldown = setCooldown;
/**
 * Function that returns the custom embed for a user (i.e., the custom color that they have set).
 * @param {Object} data The client and the userID
 * @returns {MessageEmbed} The custom MessageEmbed for the user
 */
const CustomEmbed = (data) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    let userInfo = yield getUserInfo(data.client, data.userID);
    const embed = new discord_js_1.MessageEmbed()
        //@ts-ignore
        .setColor(colors_json_1.default[userInfo.embedColor]);
    return embed;
});
exports.CustomEmbed = CustomEmbed;
/**
 * Function that returns the guild icon for a guild (or the Discord logo if none).
 * @param {Guild} guild The guild to get the guild icon for
 * @returns {String} The link to the guild icon (or the Discord logo if none)
 */
const getGuildIcon = (guild) => {
    return guild.iconURL() ? guild.iconURL({ dynamic: true }) : "https://i.imgur.com/XhpH3KD.png";
};
exports.getGuildIcon = getGuildIcon;
const fetchAuditLog = (guild, auditLogAction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = guild.me) === null || _a === void 0 ? void 0 : _a.permissions.has(discord_js_1.Permissions.FLAGS.VIEW_AUDIT_LOG)) {
        return yield guild.fetchAuditLogs({
            limit: 1,
            type: auditLogAction
        });
    }
    return null;
});
exports.fetchAuditLog = fetchAuditLog;
const paginate = (message, embeds, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pageMsg = yield message.channel.send({ embeds: [embeds[0]] });
        let stop = false;
        for (const emote of reactions) {
            if (stop)
                return;
            yield pageMsg.react(emote).catch((e) => (stop = true));
        }
        let pageIndex = 0;
        let time = 30000;
        const filter = (reaction, user) => {
            return reactions.includes(reaction.emoji.name) && user.id === message.author.id;
        };
        if (options) {
            if (options.time)
                time = options.time;
        }
        if (pageMsg.deleted)
            return;
        const collector = pageMsg.createReactionCollector({ filter, time });
        collector.on("collect", (reaction, user) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield reaction.users.remove(user);
                if (reaction.emoji.name === "⏩") {
                    if (pageIndex < embeds.length - 1) {
                        pageIndex++;
                        yield pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    }
                    else {
                        pageIndex = 0;
                        yield pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    }
                }
                else if (reaction.emoji.name === "⏸️") {
                    collector.stop();
                    //await pageMsg.delete();
                }
                else if (reaction.emoji.name === "⏪") {
                    if (pageIndex > 0) {
                        pageIndex--;
                        yield pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    }
                    else {
                        pageIndex = embeds.length - 1;
                        yield pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    }
                }
            }
            catch (e) {
                return;
            }
        }));
        collector.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield pageMsg.reactions.removeAll();
            }
            catch (e) { }
        }));
    }
    catch (e) {
        return;
    }
});
exports.paginate = paginate;
const getReply = (message, options) => __awaiter(void 0, void 0, void 0, function* () {
    let time = 30000;
    let user = message.author;
    let words = [];
    if (options) {
        if (options.time)
            time = options.time;
        if (options.user)
            user = options.user;
        if (options.words)
            words = options.words;
    }
    const filter = (msg) => {
        return (msg.author.id === user.id &&
            (words.length === 0 || words.includes(msg.content.toLowerCase())) &&
            (!options || !options.regexp || options.regexp.test(msg.content)));
    };
    const msgs = yield message.channel.awaitMessages({ filter, max: 1, time });
    if (msgs.size > 0)
        return msgs.first();
    return false;
});
exports.getReply = getReply;
const sendMessageToBotLog = (client, guild, msg) => __awaiter(void 0, void 0, void 0, function* () {
    const guildInfo = yield getGuildInfo(client, guild.id);
    if (!(guildInfo === null || guildInfo === void 0 ? void 0 : guildInfo.botLoggingChannel))
        return;
    const channel = client.channels.cache.get(guildInfo === null || guildInfo === void 0 ? void 0 : guildInfo.botLoggingChannel);
    if (channel) {
        if (msg instanceof discord_js_1.default.Message) {
            channel.send({ content: `${msg}` });
        }
        else {
            channel.send({ embeds: [msg] });
        }
    }
});
exports.sendMessageToBotLog = sendMessageToBotLog;
const log = (type, path, text) => {
    console.log(`\u001b[36;1m<Bot>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`);
};
exports.log = log;
const chunkArray = (arr, size) => {
    return arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr];
};
exports.chunkArray = chunkArray;
/**
 * Function that gets a random number between a range
 * @param {number} min - The min number
 * @param {number} max - The max number
 * @returns {number} A random number between the min & max
 */
const randomRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randomRange = randomRange;
/**
 * Function to convert milliseconds into readable time
 * @param {number} ms - The time in
 * @return {string} Readable time as a string
 */
const msToTime = (ms) => {
    let time = "";
    let n = 0;
    if (ms >= 31536000000) {
        n = Math.floor(ms / 31536000000);
        time = `${n}y `;
        ms -= n * 31536000000;
    }
    if (ms >= 2592000000) {
        n = Math.floor(ms / 2592000000);
        time += `${n}mo `;
        ms -= n * 2592000000;
    }
    if (ms >= 604800000) {
        n = Math.floor(ms / 604800000);
        time += `${n}w `;
        ms -= n * 604800000;
    }
    if (ms >= 86400000) {
        n = Math.floor(ms / 86400000);
        time += `${n}d `;
        ms -= n * 86400000;
    }
    if (ms >= 3600000) {
        n = Math.floor(ms / 3600000);
        time += `${n}h `;
        ms -= n * 3600000;
    }
    if (ms >= 60000) {
        n = Math.floor(ms / 60000);
        time += `${n}m `;
        ms -= n * 60000;
    }
    n = Math.ceil(ms / 1000);
    time += n === 0 ? "" : `${n}s`;
    return time.trimEnd();
};
exports.msToTime = msToTime;
const getUserInfo = (client, userID) => __awaiter(void 0, void 0, void 0, function* () {
    let userInfo = client.userInfoCache.get(userID);
    if (!userInfo) {
        userInfo = yield client.DBUser.findByIdAndUpdate(userID, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        client.userInfoCache.set(userID, userInfo);
    }
    return userInfo;
});
exports.getUserInfo = getUserInfo;
const getGuildInfo = (client, guildID) => __awaiter(void 0, void 0, void 0, function* () {
    let guildInfo = client.guildInfoCache.get(guildID);
    if (!guildInfo) {
        guildInfo = yield client.DBGuild.findByIdAndUpdate(guildID, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        client.guildInfoCache.set(guildID, guildInfo);
    }
    return guildInfo;
});
exports.getGuildInfo = getGuildInfo;
/**
 * Function that formats and adds thousand separators to a number
 * @param {number} num - The number to format
 * @returns {string} - The formatted number, as a string, with thousands separator
 */
const formatNumber = (num) => {
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};
exports.formatNumber = formatNumber;
/**
 * Function that removes all commas from a string
 * @param {string} str - The string to remove commas from
 * @returns {string} - The string without the commas
 */
const removeCommas = (str) => {
    return str.replace(/,/g, "");
};
exports.removeCommas = removeCommas;
/**
 * Function that checks if a string is a valid number
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is a number; false otherwise
 */
const isValidNumber = (str) => {
    const numberRegExp = /^(\d*\.?\d+|\d{1,3}(,\d{3})*(\.\d+)?)$/;
    return numberRegExp.test(str);
};
exports.isValidNumber = isValidNumber;
