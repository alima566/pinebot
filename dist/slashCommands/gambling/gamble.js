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
exports.default = {
    name: "gamble",
    description: "Test your luck and gamble your pina coladas.",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: [
        {
            name: "points",
            description: "The amount of pina coladas (or all) to gamble.",
            type: "STRING",
            required: true
        }
    ],
    execute({ client, interaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guildId, user, channel } = interaction;
            let { value: points } = interaction.options.get("points");
            points = points;
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
            if (points.toLowerCase() == "all") {
                return rollDice(client, interaction, actualPoints, true, guildInfo);
            }
            if (!utils_1.isValidNumber(points.trim())) {
                return interaction.reply({
                    content: "Please provide a valid number of pina coladas."
                });
            }
            const pointsToGamble = utils_1.removeCommas(points.trim());
            if (actualPoints == 0) {
                return interaction.reply({
                    content: "You don't have any pina coladas to gamble."
                });
            }
            if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) {
                return interaction.reply({
                    content: "Please provide a valid number of pina coladas."
                });
            }
            if (+pointsToGamble < 1) {
                return interaction.reply({
                    content: "You must gamble at least 1 pina colada!",
                    ephemeral: true
                });
            }
            if (+pointsToGamble > actualPoints) {
                return interaction.reply({
                    content: `You don't have enough pina coladas! You only have ${utils_1.formatNumber(actualPoints)} pina colada${actualPoints !== 1 ? "s" : ""}!`
                });
            }
            return rollDice(client, interaction, +pointsToGamble, false, guildInfo);
        });
    }
};
const rollDice = (client, interaction, pointsGambled, isAllIn, guildInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const diceRoll = utils_1.randomRange(0, 100); // Roll a 100 sided die
    let pointsWon;
    if (diceRoll <= 50) {
        yield gambling_1.updateJackpotAmount(client, interaction.guild.id, Math.ceil(pointsGambled / 2));
        const newPoints = yield gambling_1.addPoints(interaction.guild.id, interaction.user.id, pointsGambled * -1);
        return interaction.reply({
            content: `You rolled ${diceRoll} and lost ${isAllIn
                ? "all of your pina coladas"
                : `\`${utils_1.formatNumber(pointsGambled)}\` pina colada${pointsGambled != 1 ? "s" : ""}`}. You now have \`${utils_1.formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`
        });
    }
    if (diceRoll > 50 && diceRoll <= 75) {
        pointsWon = pointsGambled;
        return interaction.reply({ content: yield winMessage(interaction, diceRoll, pointsWon) });
    }
    if (diceRoll > 75 && diceRoll <= 90) {
        pointsWon = pointsGambled * 2;
        return interaction.reply({ content: yield winMessage(interaction, diceRoll, pointsWon) });
    }
    if (diceRoll > 90 && diceRoll <= 99) {
        pointsWon = pointsGambled * 3;
        return interaction.reply({ content: yield winMessage(interaction, diceRoll, pointsWon) });
    }
    // Rolled 100 and win jackpot
    pointsWon = guildInfo.gambling.jackpotAmount;
    yield gambling_1.resetJackpotAmount(client, interaction.guild.id);
    return interaction.reply({ content: yield winMessage(interaction, diceRoll, pointsWon) });
});
const winMessage = (interaction, diceRoll, pointsWon) => __awaiter(void 0, void 0, void 0, function* () {
    const newPoints = yield gambling_1.addPoints(interaction.guild.id, interaction.user.id, pointsWon);
    return `You rolled ${diceRoll} and won ${diceRoll == 100 ? "the jackpot of " : ""}\`${utils_1.formatNumber(pointsWon)}\` pina colada${pointsWon != 1 ? "s" : ""}! You now have \`${utils_1.formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`;
});
