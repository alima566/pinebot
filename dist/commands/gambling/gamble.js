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
    aliases: ["roulette"],
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS"],
    arguments: [
        {
            type: "SOMETHING",
            prompt: "Please enter an amount (or all) to gamble."
        }
    ],
    execute({ client, message, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { author, channel, guild } = message;
            const userID = author.id;
            const channelID = channel.id;
            const guildID = guild.id;
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (channelID !== gamblingChannel) {
                    const msg = yield message.reply({
                        content: `Gambling is only allowed in <#${gamblingChannel}>!`
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
            const actualPoints = yield gambling_1.getPoints(guildID, userID);
            if (args[0].toLowerCase() == "all") {
                return rollDice(client, message, actualPoints, true, guildInfo);
            }
            if (!utils_1.isValidNumber(args[0].trim())) {
                return message.reply({ content: "Please provide a valid number of pina coladas." });
            }
            const pointsToGamble = utils_1.removeCommas(args[0].trim());
            if (actualPoints == 0) {
                return message.reply({ content: "You don't have any pina coladas to gamble." });
            }
            if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) {
                return message.reply({ content: "Please provide a valid number of pina coladas." });
            }
            if (+pointsToGamble < 1) {
                return message.reply({ content: "You must gamble at least 1 pina colada!" });
            }
            if (+pointsToGamble > actualPoints) {
                return message.reply({
                    content: `You don't have enough pina coladas! You only have ${utils_1.formatNumber(actualPoints)} pina colada${actualPoints !== 1 ? "s" : ""}!`
                });
            }
            return rollDice(client, message, +pointsToGamble, false, guildInfo);
        });
    }
};
const rollDice = (client, message, pointsGambled, isAllIn, guildInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const diceRoll = utils_1.randomRange(0, 100); // Roll a 100 sided die
    let pointsWon;
    if (diceRoll <= 50) {
        yield gambling_1.updateJackpotAmount(client, message.guild.id, Math.ceil(pointsGambled / 2));
        const newPoints = yield gambling_1.addPoints(message.guild.id, message.author.id, pointsGambled * -1);
        return message.reply({
            content: `You rolled ${diceRoll} and lost ${isAllIn
                ? "all of your pina coladas"
                : `\`${utils_1.formatNumber(pointsGambled)}\` pina colada${pointsGambled != 1 ? "s" : ""}`}. You now have \`${utils_1.formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`
        });
    }
    if (diceRoll > 50 && diceRoll <= 75) {
        pointsWon = pointsGambled;
        return message.reply({ content: yield winMessage(message, diceRoll, pointsWon) });
    }
    if (diceRoll > 75 && diceRoll <= 90) {
        pointsWon = pointsGambled * 2;
        return message.reply({ content: yield winMessage(message, diceRoll, pointsWon) });
    }
    if (diceRoll > 90 && diceRoll <= 99) {
        pointsWon = pointsGambled * 3;
        return message.reply({ content: yield winMessage(message, diceRoll, pointsWon) });
    }
    // Rolled 100 and win jackpot
    pointsWon = guildInfo.gambling.jackpotAmount;
    yield gambling_1.resetJackpotAmount(client, message.guild.id);
    return message.reply({ content: yield winMessage(message, diceRoll, pointsWon) });
});
const winMessage = (message, diceRoll, pointsWon) => __awaiter(void 0, void 0, void 0, function* () {
    const newPoints = yield gambling_1.addPoints(message.guild.id, message.author.id, pointsWon);
    return `You rolled ${diceRoll} and won ${diceRoll == 100 ? "the jackpot of " : ""}\`${utils_1.formatNumber(pointsWon)}\` pina colada${pointsWon != 1 ? "s" : ""}! You now have \`${utils_1.formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`;
});
