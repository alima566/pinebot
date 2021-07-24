import Discord, {
    Guild,
    MessageEmbed,
    Permissions,
    GuildAuditLogsActions,
    Snowflake,
    GuildMember
} from "discord.js";
import ms from "ms";
import { Client } from "../Client";
import { Arguments } from "../types/Arguments";
import { Flags } from "../types/Flags";
import { Command } from "../interfaces/Command";
import embedColors from "../config/colors.json";
import { SlashCommand } from "../interfaces/SlashCommand";

const reactions = ["⏪", "⏸️", "⏩"];
const hasAmount = ["SOMETHING", "NUMBER", "CHANNEL", "ROLE", "MEMBER"];
const consoleColors = {
    SUCCESS: "\u001b[32m",
    WARNING: "\u001b[33m",
    ERROR: "\u001b[31m"
};

const processArguments = (message: Discord.Message, msgArgs: string[], expectedArgs: Arguments) => {
    let counter = 0;
    let amount, num, role, member, channel, attach, time;
    let flags: Flags = {};

    for (const argument of expectedArgs) {
        if (hasAmount.includes(argument.type)) {
            //@ts-ignore
            amount = argument.amount && argument.amount > 1 ? argument.amount : 1;
        } else {
            amount = 1;
        }

        for (let i = 0; i < amount; i++) {
            switch (argument.type) {
                case "SOMETHING":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    if (
                        argument.words &&
                        !argument.words.includes(msgArgs[counter].toLowerCase())
                    ) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    if (argument.regexp && !argument.regexp.test(msgArgs[counter])) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    if (amount == 1) {
                        flags[argument.id] = msgArgs[counter];
                    } else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(msgArgs[counter]);
                    } else {
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
                    } else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(num);
                    } else {
                        flags[argument.id] = [num];
                    }
                    break;

                case "CHANNEL":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    channel =
                        msgArgs[counter].startsWith("<#") && msgArgs[counter].endsWith(">")
                            ? message.guild!.channels.cache.get(
                                  msgArgs[counter].slice(2, -1) as Snowflake
                              )
                            : message.guild!.channels.cache.get(msgArgs[counter] as Snowflake);

                    if (!channel) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    if (argument.channelTypes && !argument.channelTypes.includes(channel.type)) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    if (amount == 1) {
                        //@ts-ignore
                        flags[argument.id] = channel;
                    } else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(channel);
                    } else {
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
                            ? message.guild!.roles.cache.get(
                                  msgArgs[counter].slice(3, -1) as Snowflake
                              )
                            : message.guild!.roles.cache.get(msgArgs[counter] as Snowflake);

                    if (!role) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    if (argument.notBot && role.managed) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    if (amount == 1) {
                        flags[argument.id] = role;
                    } else if (flags[argument.id]) {
                        //@ts-ignore
                        flags[argument.id].push(role);
                    } else {
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
                            ? message.guild!.members.cache.get(
                                  msgArgs[counter]
                                      .replace("<@", "")
                                      .replace("!", "")
                                      .replace(">", "") as Snowflake
                              )
                            : message.guild!.members.cache.get(msgArgs[counter] as Snowflake);

                    flags[argument.id] = !member ? message.member! : member;

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
                            ? message.guild!.members.cache.get(
                                  msgArgs[counter]
                                      .replace("<@", "")
                                      .replace("!", "")
                                      .replace(">", "") as Snowflake
                              )
                            : message.guild!.members.cache.get(msgArgs[counter] as Snowflake);

                    if (!member) {
                        return { invalid: true, prompt: argument.prompt };
                    } else {
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
                        } else if (flags[argument.id]) {
                            //@ts-ignore
                            flags[argument.id].push(member);
                        } else {
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

                    flags[argument.id] = attach.first()!;
                    break;

                case "TIME":
                    if (!msgArgs[counter]) {
                        return { invalid: true, prompt: argument.prompt };
                    }

                    time = msgArgs
                        .slice(counter)
                        .join("")
                        .match(/(\d*)(\D*)/g);
                    time!.pop();

                    num = 0;
                    for (let i = 0; i < time!.length; i++) {
                        try {
                            num += ms(time![i]);
                        } catch (e) {
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
                        `processArguments: the argument type "${argument.type}" doesn't exist.`
                    );
            }
            counter++;
        }
    }

    return flags;
};

/**
 * Function that adds a user to the blacklist (i.e., user can't run any commands).
 * @param {Client} client The client that the bot is logged in as.
 * @param {Snowflake} userID The userID to blacklist.
 * @returns
 */
const blacklist = async (client: Client, userID: Snowflake) => {
    if (client.blacklistCache.has(userID)) return;
    await client.DBConfig.findByIdAndUpdate(
        "blacklist",
        {
            $push: {
                blacklisted: userID
            }
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );
    client.blacklistCache.add(userID);
};

/**
 * Function that removes the user from the blacklist.
 * @param {Client} client The client that the bot is logged in as
 * @param {Snowflake} userID The userID to whitelist
 * @returns
 */
const whitelist = async (client: Client, userID: Snowflake): Promise<void> => {
    if (!client.blacklistCache.has(userID)) return;
    await client.DBConfig.findByIdAndUpdate(
        "blacklist",
        {
            $pull: {
                blacklisted: userID
            }
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );
    client.blacklistCache.delete(userID);
};

/**
 * Function that checks what permissions a guild member is missing.
 * @param {Discord.GuildMember} member The guild member to check permissions for
 * @param {Discord.PermissionResolvable} perms The permission(s) that the guild member is missing
 * @returns {String} A list of missing permissions
 */
const missingPermissions = (member: Discord.GuildMember, perms: Discord.PermissionResolvable) => {
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

/**
 * Function that returns the cooldown a command has
 * @param {Client} client The client that the bot is logged in as
 * @param {Command} command The command to get the cooldown for
 * @param {Discord.Message} message The Discord message object
 * @returns {number} The command cooldown, in seconds.
 */
const getCooldown = (
    client: Client,
    command: Command | SlashCommand,
    type: Discord.Message | Discord.Interaction
) => {
    let guildInfo = client.guildInfoCache.get(type.guild!.id);
    let cd = command.cooldown;
    const member = type.member as GuildMember;
    if (guildInfo!.commandCooldowns && guildInfo!.commandCooldowns[command.name]) {
        const roles = Object.keys(guildInfo!.commandCooldowns[command.name]);
        const highestRole = member!.roles.cache
            .filter((role) => roles.includes(role.id))
            .sort((a, b) => b.position - a.position)
            .first();
        if (highestRole) {
            cd = guildInfo!.commandCooldowns[command.name][highestRole.id] / 1000;
        }
    }
    return cd;
};

/**
 * Function that sets the cooldown for a command
 * @param {Client} client The client that the bot is logged in as
 * @param {Command} command The command to set the cooldown for
 * @param {Discord.Message} message The Discord message object
 */
const setCooldown = (
    client: Client,
    command: Command | SlashCommand,
    type: Discord.Message | Discord.Interaction
) => {
    const cd = getCooldown(client, command, type);
    if (!cd) return;

    let cooldowns;
    if (typeof command.globalCooldown === "undefined" || command.globalCooldown) {
        if (!client.globalCooldowns.has(command.name)) {
            client.globalCooldowns.set(command.name, new Discord.Collection());
        }
        cooldowns = client.globalCooldowns;
    } else {
        if (!client.serverCooldowns.has(type.guild!.id)) {
            client.serverCooldowns.set(type.guild!.id, new Discord.Collection());
            cooldowns = client.serverCooldowns.get(type.guild!.id);
        }
        if (!client.serverCooldowns.has(type.guild!.id)) {
            client.serverCooldowns.set(type.guild!.id, new Discord.Collection());
        }
        cooldowns = client.serverCooldowns.get(type.guild!.id);
        if (!cooldowns!.has(command.name)) {
            cooldowns!.set(command.name, new Discord.Collection());
        }
    }

    const now = Date.now();
    const timestamps = cooldowns!.get(command.name);
    const cooldownAmount = cd * 1000;

    if (type instanceof Discord.Message) {
        timestamps!.set(type.author.id, now);
        setTimeout(() => timestamps!.delete(type.author.id), cooldownAmount);
    } else {
        timestamps!.set(type.user.id, now);
        setTimeout(() => timestamps!.delete(type.user.id), cooldownAmount);
    }
};

/**
 * Function that returns the custom embed for a user (i.e., the custom color that they have set).
 * @param {Object} data The client and the userID
 * @returns {MessageEmbed} The custom MessageEmbed for the user
 */
const CustomEmbed = async (data: Object) => {
    //@ts-ignore
    let userInfo = await getUserInfo(data.client, data.userID);
    const embed = new MessageEmbed()
        //@ts-ignore
        .setColor(embedColors[userInfo.embedColor]);

    return embed;
};

/**
 * Function that returns the guild icon for a guild (or the Discord logo if none).
 * @param {Guild} guild The guild to get the guild icon for
 * @returns {String} The link to the guild icon (or the Discord logo if none)
 */
const getGuildIcon = (guild: Discord.Guild): string | null => {
    return guild.iconURL() ? guild.iconURL({ dynamic: true }) : "https://i.imgur.com/XhpH3KD.png";
};

const fetchAuditLog = async (
    guild: Guild,
    auditLogAction: number | keyof GuildAuditLogsActions
) => {
    if (guild!.me?.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) {
        return await guild!.fetchAuditLogs({
            limit: 1,
            type: auditLogAction
        });
    }
    return null;
};

const paginate = async (
    message: Discord.Message,
    embeds: MessageEmbed[],
    options: { time: number }
) => {
    try {
        const pageMsg = await message.channel.send({ embeds: [embeds[0]] });
        let stop = false;

        for (const emote of reactions) {
            if (stop) return;
            await pageMsg.react(emote).catch((e) => (stop = true));
        }

        let pageIndex = 0;
        let time = 30000;
        const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
            return reactions.includes(reaction.emoji.name!) && user.id === message.author.id;
        };

        if (options) {
            if (options.time) time = options.time;
        }

        if (pageMsg.deleted) return;

        const collector = pageMsg.createReactionCollector({ filter, time });
        collector.on("collect", async (reaction, user) => {
            try {
                await reaction.users.remove(user);
                if (reaction.emoji.name === "⏩") {
                    if (pageIndex < embeds.length - 1) {
                        pageIndex++;
                        await pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    } else {
                        pageIndex = 0;
                        await pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    }
                } else if (reaction.emoji.name === "⏸️") {
                    collector.stop();
                    //await pageMsg.delete();
                } else if (reaction.emoji.name === "⏪") {
                    if (pageIndex > 0) {
                        pageIndex--;
                        await pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    } else {
                        pageIndex = embeds.length - 1;
                        await pageMsg.edit({ embeds: [embeds[pageIndex]] });
                    }
                }
            } catch (e) {
                return;
            }
        });

        collector.on("end", async () => {
            try {
                await pageMsg.reactions.removeAll();
            } catch (e) {}
        });
    } catch (e) {
        return;
    }
};

const getReply = async (
    message: Discord.Message,
    options?: {
        time?: number;
        user?: Discord.User;
        words?: string[];
        regexp?: RegExp;
    }
) => {
    let time = 30000;
    let user = message.author;
    let words: string[] = [];
    if (options) {
        if (options.time) time = options.time;
        if (options.user) user = options.user;
        if (options.words) words = options.words;
    }

    const filter = (msg: Discord.Message) => {
        return (
            msg.author.id === user.id &&
            (words.length === 0 || words.includes(msg.content.toLowerCase())) &&
            (!options || !options.regexp || options.regexp.test(msg.content))
        );
    };

    const msgs = await message.channel.awaitMessages({ filter, max: 1, time });
    if (msgs.size > 0) return msgs.first();
    return false;
};

const sendMessageToBotLog = async (
    client: Client,
    guild: Guild,
    msg: Discord.Message | MessageEmbed
) => {
    const guildInfo = await getGuildInfo(client, guild.id!);
    if (!guildInfo?.botLoggingChannel) return;

    const channel = client.channels.cache.get(
        guildInfo?.botLoggingChannel as Snowflake
    ) as Discord.TextChannel;
    if (channel) {
        if (msg instanceof Discord.Message) {
            channel.send({ content: `${msg}` });
        } else {
            channel.send({ embeds: [msg] });
        }
    }
};

const log = (type: "SUCCESS" | "ERROR" | "WARNING", path: string, text: string) => {
    console.log(
        `\u001b[36;1m<Bot>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`
    );
};

const chunkArray = (arr: any[], size: number): any => {
    return arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr];
};

/**
 * Function that gets a random number between a range
 * @param {number} min - The min number
 * @param {number} max - The max number
 * @returns {number} A random number between the min & max
 */
const randomRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Function to convert milliseconds into readable time
 * @param {number} ms - The time in
 * @return {string} Readable time as a string
 */
const msToTime = (ms: number) => {
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

const getUserInfo = async (client: Client, userID: Snowflake) => {
    let userInfo = client.userInfoCache.get(userID);

    if (!userInfo) {
        userInfo = await client.DBUser.findByIdAndUpdate(
            userID,
            {},
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        client.userInfoCache.set(userID, userInfo);
    }

    return userInfo;
};

const getGuildInfo = async (client: Client, guildID: Snowflake) => {
    let guildInfo = client.guildInfoCache.get(guildID);

    if (!guildInfo) {
        guildInfo = await client.DBGuild.findByIdAndUpdate(
            guildID,
            {},
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        client.guildInfoCache.set(guildID, guildInfo);
    }

    return guildInfo;
};

/**
 * Function that formats and adds thousand separators to a number
 * @param {number} num - The number to format
 * @returns {string} - The formatted number, as a string, with thousands separator
 */
const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Function that removes all commas from a string
 * @param {string} str - The string to remove commas from
 * @returns {string} - The string without the commas
 */
const removeCommas = (str: string) => {
    return str.replace(/,/g, "");
};

/**
 * Function that checks if a string is a valid number
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is a number; false otherwise
 */
const isValidNumber = (str: string) => {
    const numberRegExp = /^(\d*\.?\d+|\d{1,3}(,\d{3})*(\.\d+)?)$/;
    return numberRegExp.test(str);
};

export {
    processArguments,
    blacklist,
    whitelist,
    missingPermissions,
    getCooldown,
    setCooldown,
    CustomEmbed,
    getGuildIcon,
    fetchAuditLog,
    paginate,
    getReply,
    sendMessageToBotLog,
    log,
    chunkArray,
    randomRange,
    msToTime,
    getUserInfo,
    getGuildInfo,
    formatNumber,
    removeCommas,
    isValidNumber
};
