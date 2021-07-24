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
    description: "Gives another user your pina coladas.",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    testOnly: true,
    options: [
        {
            name: "user",
            description: "The user you want to give your pina coladas to.",
            type: "USER",
            required: true
        },
        {
            name: "points",
            description: "The user you want to give your pina coladas to.",
            type: "STRING",
            required: true
        }
    ],
    execute({ client, interaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guildId, channel } = interaction;
            const { user } = interaction.options.get("user");
            let { value: points } = interaction.options.get("points");
            points = points;
            const guildInfo = yield utils_1.getGuildInfo(client, guildId);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (channel.id !== gamblingChannel) {
                    return yield interaction.reply({
                        content: `You can only give pina coladas in <#${gamblingChannel}>!`,
                        ephemeral: true
                    });
                }
            }
            else {
                return yield interaction.reply({
                    content: "A gambling channel needs to be set first in order for this command to be used.",
                    ephemeral: true
                });
            }
            if (!utils_1.isValidNumber(points.trim())) {
                return interaction.reply({ content: "Please provide a valid number of pina coladas." });
            }
            const pointsToGive = utils_1.removeCommas(points.trim());
            const actualPoints = yield gambling_1.getPoints(guildId, interaction.user.id);
            if (actualPoints == 0) {
                return interaction.reply({ content: "You have no pina coladas to give!" });
            }
            if (isNaN(+pointsToGive) || !Number.isInteger(+pointsToGive)) {
                return interaction.reply({ content: "Please provide a valid number of pina coladas." });
            }
            if (+pointsToGive < 1) {
                return interaction.reply({ content: "You must give at least 1 pina colada." });
            }
            if (+pointsToGive > actualPoints) {
                return interaction.reply({
                    content: `You don't have enough pina coladas! You only have \`${utils_1.formatNumber(actualPoints)}\` pina colada${actualPoints !== 1 ? "s" : ""}!`
                });
            }
            if (user.bot) {
                return interaction.reply({ content: "You can not give pina coladas to bots!" });
            }
            const targetID = user.id;
            const userPoints = yield gambling_1.addPoints(guildId, interaction.user.id, +pointsToGive * -1);
            const targetPoints = yield gambling_1.addPoints(guildId, targetID, +pointsToGive);
            const msgEmbed = new discord_js_1.MessageEmbed()
                .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
                .setColor("#85bb65")
                .setDescription(`**${interaction.user.tag}** has given **${user.tag}** \`${utils_1.formatNumber(+pointsToGive)}\` pina colada${+pointsToGive != 1 ? "s" : ""}.`)
                .addFields({
                name: `**${interaction.user.tag}**`,
                value: `Pina Coladas: \`${utils_1.formatNumber(userPoints)}\``,
                inline: true
            }, {
                name: "**→**",
                value: "\u200b",
                inline: true
            }, {
                name: `**${user.tag}**`,
                value: `Pina Coladas: \`${utils_1.formatNumber(targetPoints)}\``,
                inline: true
            });
            return interaction.reply({ embeds: [msgEmbed] });
        });
    }
};
