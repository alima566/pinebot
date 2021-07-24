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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils/utils");
const gambling_1 = require("../../utils/gambling");
const discord_js_1 = require("discord.js");
exports.default = {
    name: "give",
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    execute({ client, message, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { channel, guild, author } = message;
            const userID = author.id;
            const channelID = channel.id;
            const guildID = guild.id;
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (channelID !== gamblingChannel) {
                    const msg = yield message.reply({
                        content: `You can only give pina coladas in <#${gamblingChannel}>!`
                    });
                    setTimeout(() => {
                        msg.delete();
                    }, 1000 * 3);
                    return message.delete();
                }
            }
            else {
                const msg = yield message.reply({
                    content: "A gambling channel needs to be set first in order for this command to be used."
                });
                setTimeout(() => {
                    msg.delete();
                }, 1000 * 3);
                return message.delete();
            }
            const mention = message.mentions.users.first();
            if (!mention) {
                return message.reply({
                    content: "Please mention a user to give your pina coladas to."
                });
            }
            if (!utils_1.isValidNumber(args[1].trim())) {
                return message.reply({ content: "Please provide a valid number of pina coladas." });
            }
            const pointsToGive = utils_1.removeCommas(args[1].trim());
            const actualPoints = yield gambling_1.getPoints(guildID, userID);
            if (actualPoints == 0) {
                return message.reply({ content: "You have no pina coladas to give!" });
            }
            if (isNaN(+pointsToGive) || !Number.isInteger(+pointsToGive)) {
                return message.reply({ content: "Please provide a valid number of pina coladas." });
            }
            if (+pointsToGive < 1) {
                return message.reply({ content: "You must give at least 1 pina colada." });
            }
            if (+pointsToGive > actualPoints) {
                return message.reply({
                    content: `You don't have enough pina coladas! You only have \`${utils_1.formatNumber(actualPoints)}\` pina colada${actualPoints !== 1 ? "s" : ""}!`
                });
            }
            if (mention.bot) {
                return message.reply({ content: "You can not give pina coladas to bots!" });
            }
            const targetID = mention.id;
            const userPoints = yield gambling_1.addPoints(guildID, userID, +pointsToGive * -1);
            const targetPoints = yield gambling_1.addPoints(guildID, targetID, +pointsToGive);
            const msgEmbed = new discord_js_1.MessageEmbed()
                .setAuthor(author.tag, author.displayAvatarURL({ dynamic: true }))
                .setColor("#85bb65")
                .setDescription(`**${author.tag}** has given **${mention.tag}** \`${utils_1.formatNumber(+pointsToGive)}\` pina colada${+pointsToGive != 1 ? "s" : ""}.`)
                .addFields({
                name: `**${author.tag}**`,
                value: `Pina Coladas: \`${utils_1.formatNumber(userPoints)}\``,
                inline: true
            }, {
                name: "**→**",
                value: "\u200b",
                inline: true
            }, {
                name: `**${mention.tag}**`,
                value: `Pina Coladas: \`${utils_1.formatNumber(targetPoints)}\``,
                inline: true
            });
            return channel.send({ embeds: [msgEmbed] });
        });
    }
};
