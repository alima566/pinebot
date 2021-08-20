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
const builders_1 = require("@discordjs/builders");
const gambling_1 = require("../../utils/gambling");
const utils_1 = require("../../utils/utils");
const slotsEmoji = ["💰", "✨", "💩", "🍍"];
const multiplier = slotsEmoji.length;
exports.default = {
    data: new builders_1.SlashCommandBuilder()
        .setName("slots")
        .setDescription(`Test your luck and play the slots. Each slot win gives you ${multiplier}x the amount you gambled.`)
        .addStringOption((option) => option
        .setName("points")
        .setDescription("The amount of pina coladas (or all) to gamble.")
        .setRequired(true)),
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    execute({ client, interaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guildId, user, channel } = interaction;
            const points = interaction.options.getString("points");
            const guildInfo = yield utils_1.getGuildInfo(client, guildId);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (channel.id !== gamblingChannel) {
                    return yield interaction.reply({
                        content: `Gambling is only allowed in <#${gamblingChannel}>!`,
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
            const actualPoints = yield gambling_1.getPoints(guildId, user.id);
            if (points.toLowerCase() !== "all") {
                if (!utils_1.isValidNumber(points.trim())) {
                    return interaction.reply({
                        content: "Please provide a valid number of pina coladas."
                    });
                }
            }
            const pointsToGamble = utils_1.removeCommas(points.trim());
            if (actualPoints == 0) {
                return interaction.reply({
                    content: "You don't have any pina coladas to gamble."
                });
            }
            const slot1 = utils_1.randomRange(0, slotsEmoji.length - 1);
            const slot2 = utils_1.randomRange(0, slotsEmoji.length - 1);
            const slot3 = utils_1.randomRange(0, slotsEmoji.length - 1);
            const emote1 = slotsEmoji[slot1];
            const emote2 = slotsEmoji[slot2];
            const emote3 = slotsEmoji[slot3];
            const slotsText = `You spun ${emote1} | ${emote2} | ${emote3}`;
            let pointsWon;
            if (pointsToGamble.toLowerCase() == "all") {
                if (isSlotsWin(slot1, slot2, slot3)) {
                    pointsWon = actualPoints * multiplier;
                    return slotsWin(guildId, user.id, pointsWon, slotsText, interaction);
                }
                else {
                    yield gambling_1.updateJackpotAmount(client, guildId, Math.ceil(actualPoints / 2));
                    yield gambling_1.addPoints(guildId, user.id, actualPoints * -1);
                    return interaction.reply({
                        content: `${slotsText} and lost all of your pina coladas :sob:`
                    });
                }
            }
            if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) {
                return interaction.reply({ content: "Please provide a valid number of pina coladas." });
            }
            if (+pointsToGamble < 1) {
                return interaction.reply({ content: "You must gamble at least 1 pina colada!" });
            }
            if (+pointsToGamble > actualPoints) {
                return interaction.reply({
                    content: `You don't have enough pina coladas! You only have \`${utils_1.formatNumber(actualPoints)}\` pina colada${actualPoints !== 1 ? "s" : ""}!`
                });
            }
            if (isSlotsWin(slot1, slot2, slot3)) {
                pointsWon = +pointsToGamble * multiplier;
                return slotsWin(guildId, user.id, pointsWon, slotsText, interaction);
            }
            else {
                yield gambling_1.updateJackpotAmount(client, guildId, Math.ceil(+pointsToGamble / 2));
                const newPoints = yield gambling_1.addPoints(guildId, user.id, +pointsToGamble * -1);
                return interaction.reply({
                    content: `${slotsText} and lost \`${pointsToGamble.toLocaleString()}\` pina colada${+pointsToGamble != 1 ? "s" : ""}! You now have \`${utils_1.formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`
                });
            }
        });
    }
};
const isSlotsWin = (slot1, slot2, slot3) => {
    return slot1 == slot2 && slot2 == slot3;
};
const slotsWin = (guildID, userID, pointsWon, slotsText, interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const newPoints = yield gambling_1.addPoints(guildID, userID, pointsWon);
    return interaction.reply({
        content: `${slotsText} and won \`${utils_1.formatNumber(pointsWon)}\` pina colada${newPoints !== 1 ? "s" : ""}! You now have \`${utils_1.formatNumber(newPoints)}\` pina colada${newPoints !== 1 ? "s" : ""}.`
    });
});
