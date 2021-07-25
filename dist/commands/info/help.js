"use strict";
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
const utils_1 = require("../../utils/utils");
const languages_json_1 = __importDefault(require("../../config/languages.json"));
const discord_js_1 = require("discord.js");
const replacePrefix = (string, guildPrefix) => {
    return string.replace(/{PREFIX}/g, guildPrefix);
};
exports.default = {
    name: "help",
    category: "Info",
    aliases: ["h"],
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    execute({ client, message, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const guildPrefix = guildInfo.prefix;
            let userInfo = yield utils_1.getUserInfo(client, message.author.id);
            const language = userInfo.language;
            //@ts-ignore
            const languageHelp = languages_json_1.default[language].help.names;
            if (!args.length) {
                return defaultHelp(client, message, guildPrefix, languageHelp);
            }
            const queryName = args.join(" ").toLowerCase();
            const command = client.commands.get(queryName) ||
                (guildInfo.commandAlias
                    ? client.commands.get(guildInfo.commandAlias[queryName])
                    : false);
            const category = client.categories.get(queryName);
            const helpEmbed = yield utils_1.CustomEmbed({ client, userID: message.author.id });
            if (command && !command.hideCommand) {
                //@ts-ignore
                let commandHelp = languages_json_1.default[language][command.name];
                helpEmbed
                    .setTitle(command.name)
                    .setAuthor(command.category ? command.category : languageHelp.noCategory)
                    .setTimestamp()
                    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));
                if (commandHelp.description) {
                    helpEmbed.setDescription(replacePrefix(commandHelp.description, guildPrefix));
                }
                if (commandHelp.usage) {
                    helpEmbed.addField(languageHelp.usage, replacePrefix(commandHelp.usage, guildPrefix));
                }
                const customAliases = getCustomAliases(client, message.guild.id, command.name);
                let aliases = [];
                if (command.aliases && command.aliases.length !== 0) {
                    aliases = aliases.concat(command.aliases);
                }
                if (customAliases && customAliases.length !== 0) {
                    aliases = aliases.concat(customAliases);
                }
                if (aliases.length > 0) {
                    helpEmbed.addField(languageHelp.aliases, "`" + aliases.join("`, `") + "`");
                }
                if (commandHelp.examples) {
                    helpEmbed.addField(languageHelp.examples, replacePrefix(commandHelp.examples, guildPrefix));
                }
                let cd = utils_1.getCooldown(client, command, message);
                if (cd) {
                    helpEmbed.addField(languageHelp.cooldown, `${utils_1.msToTime(cd * 1000)}`);
                }
                if (client.guildInfoCache
                    .get(message.guild.id)
                    .disabledCommands.includes(command.name)) {
                    helpEmbed.setAuthor(languageHelp.isDisabled);
                }
                return message.channel.send({ embeds: [helpEmbed] });
            }
            if (category) {
                helpEmbed
                    .setTitle(`${category[0]} [${category.length - 1}]`)
                    .setTimestamp()
                    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                    .setDescription("`" + category.slice(1).join("`, `") + "`");
                return message.channel.send({ embeds: [helpEmbed] });
            }
            return defaultHelp(client, message, guildPrefix, languageHelp);
        });
    }
};
const defaultHelp = (client, message, guildPrefix, languageHelp) => __awaiter(void 0, void 0, void 0, function* () {
    const helpEmbed = (yield utils_1.CustomEmbed({ client, userID: message.author.id }))
        .setTitle(languageHelp.commandCategories)
        .setDescription(replacePrefix(languageHelp.categoriesHelp, guildPrefix))
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .addField(languageHelp.categoriesName, client.categories.map((c) => `\`${c[0]}\``).join(", "));
    message.channel.send({ embeds: [helpEmbed] });
});
const getCustomAliases = (client, guildID, commandName) => {
    const guildInfo = client.guildInfoCache.get(guildID);
    const commandAlias = guildInfo.commandAlias ? Object.entries(guildInfo.commandAlias) : [];
    const commands = new discord_js_1.Collection();
    for (let [alias, command] of commandAlias) {
        //@ts-ignore
        let aliases = commands.get(command);
        if (!aliases || aliases.length == 0) {
            aliases = [alias];
        }
        else {
            aliases.push(alias);
        }
        //@ts-ignore
        commands.set(command, aliases);
    }
    return commands.get(commandName);
};
