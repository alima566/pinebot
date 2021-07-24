import { Command } from "../../interfaces/Command";
import {
    getGuildInfo,
    formatNumber,
    randomRange,
    isValidNumber,
    removeCommas
} from "../../utils/utils";
import { Message } from "discord.js";
import {
    getPoints,
    addPoints,
    updateJackpotAmount,
    resetJackpotAmount
} from "../../utils/gambling";
import { Client } from "../../Client";
import { GuildInfo } from "../../interfaces/GuildInfo";

export default {
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
    async execute({ client, message, args }) {
        const { author, channel, guild } = message;
        const userID = author.id;
        const channelID = channel.id;
        const guildID = guild!.id;

        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (channelID !== gamblingChannel) {
                const msg = await message.reply({
                    content: `Gambling is only allowed in <#${gamblingChannel}>!`
                });
                setTimeout(() => {
                    msg.delete();
                }, 1000 * 3);
                return message.delete();
            }
        } else {
            const msg = await message.reply({
                content:
                    "A gambling channel needs to be set first in order for this command to be used."
            });
            setTimeout(() => {
                msg.delete();
            }, 1000 * 3);
            return message.delete();
        }

        const actualPoints = await getPoints(guildID, userID);
        if (args[0].toLowerCase() == "all") {
            return rollDice(client, message, actualPoints, true, guildInfo);
        }

        if (!isValidNumber(args[0].trim())) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        const pointsToGamble = removeCommas(args[0].trim());

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
                content: `You don't have enough pina coladas! You only have ${formatNumber(
                    actualPoints
                )} pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }
        return rollDice(client, message, +pointsToGamble, false, guildInfo);
    }
} as Command;

const rollDice = async (
    client: Client,
    message: Message,
    pointsGambled: number,
    isAllIn: boolean,
    guildInfo: GuildInfo
) => {
    const diceRoll = randomRange(0, 100); // Roll a 100 sided die
    let pointsWon: number;
    if (diceRoll <= 50) {
        await updateJackpotAmount(client, message.guild!.id!, Math.ceil(pointsGambled / 2));
        const newPoints = await addPoints(
            message.guild!.id!,
            message.author.id,
            pointsGambled * -1
        );
        return message.reply({
            content: `You rolled ${diceRoll} and lost ${
                isAllIn
                    ? "all of your pina coladas"
                    : `\`${formatNumber(pointsGambled)}\` pina colada${
                          pointsGambled != 1 ? "s" : ""
                      }`
            }. You now have \`${formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`
        });
    }

    if (diceRoll > 50 && diceRoll <= 75) {
        pointsWon = pointsGambled;
        return message.reply({ content: await winMessage(message, diceRoll, pointsWon) });
    }

    if (diceRoll > 75 && diceRoll <= 90) {
        pointsWon = pointsGambled * 2;
        return message.reply({ content: await winMessage(message, diceRoll, pointsWon) });
    }

    if (diceRoll > 90 && diceRoll <= 99) {
        pointsWon = pointsGambled * 3;
        return message.reply({ content: await winMessage(message, diceRoll, pointsWon) });
    }

    // Rolled 100 and win jackpot
    pointsWon = guildInfo.gambling.jackpotAmount!;
    await resetJackpotAmount(client, message.guild!.id!);
    return message.reply({ content: await winMessage(message, diceRoll, pointsWon) });
};

const winMessage = async (message: Message, diceRoll: number, pointsWon: number) => {
    const newPoints = await addPoints(message.guild!.id!, message.author.id, pointsWon);
    return `You rolled ${diceRoll} and won ${
        diceRoll == 100 ? "the jackpot of " : ""
    }\`${formatNumber(pointsWon)}\` pina colada${
        pointsWon != 1 ? "s" : ""
    }! You now have \`${formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`;
};
