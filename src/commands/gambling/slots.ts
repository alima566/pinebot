import { Command } from "../../interfaces/Command";
import { addPoints, getPoints, updateJackpotAmount } from "../../utils/gambling";
import {
    getGuildInfo,
    randomRange,
    formatNumber,
    removeCommas,
    isValidNumber
} from "../../utils/utils";
import { Message, Snowflake } from "discord.js";

const slotsEmoji: string[] = ["💰", "✨", "💩", "🍍"];
const multiplier = slotsEmoji.length;

export default {
    name: "slots",
    aliases: ["slot"],
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
    arguments: [
        {
            type: "SOMETHING",
            prompt: "Please enter an amount (or all) to gamble."
        }
    ],
    async execute({ client, message, args }) {
        const { author, channel, guild } = message;
        const guildInfo = await getGuildInfo(client, guild!.id);
        const gamblingChannel = guildInfo.gambling.gamblingChannel;

        if (gamblingChannel) {
            if (channel.id !== gamblingChannel) {
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

        const actualPoints = await getPoints(guild!.id, author.id);
        if (args[0].toLowerCase() !== "all") {
            if (!isValidNumber(args[0].trim())) {
                return message.reply({
                    content: "Please provide a valid number of pina coladas."
                });
            }
        }

        const pointsToGamble = removeCommas(args[0].trim());
        if (actualPoints == 0) {
            return message.reply({
                content: "You don't have any pina coladas to gamble."
            });
        }

        const slot1 = randomRange(0, slotsEmoji.length - 1);
        const slot2 = randomRange(0, slotsEmoji.length - 1);
        const slot3 = randomRange(0, slotsEmoji.length - 1);

        const emote1 = slotsEmoji[slot1];
        const emote2 = slotsEmoji[slot2];
        const emote3 = slotsEmoji[slot3];

        const slotsText = `You spun ${emote1} | ${emote2} | ${emote3}`;
        let pointsWon;

        if (pointsToGamble.toLowerCase() == "all") {
            if (isSlotsWin(slot1, slot2, slot3)) {
                pointsWon = actualPoints * multiplier;
                return slotsWin(guild!.id, author.id, pointsWon, slotsText, message);
            } else {
                await updateJackpotAmount(client, guild!.id, Math.ceil(actualPoints / 2));
                await addPoints(guild!.id, author.id, actualPoints * -1);
                return message.reply({
                    content: `${slotsText} and lost all of your pina coladas :sob:`
                });
            }
        }

        if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        if (+pointsToGamble < 1) {
            return message.reply({ content: "You must gamble at least 1 pina colada!" });
        }

        if (+pointsToGamble > actualPoints) {
            return message.reply({
                content: `You don't have enough pina coladas! You only have \`${formatNumber(
                    actualPoints
                )}\` pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }

        if (isSlotsWin(slot1, slot2, slot3)) {
            pointsWon = +pointsToGamble * multiplier;
            return slotsWin(guild!.id, author.id, pointsWon, slotsText, message);
        } else {
            await updateJackpotAmount(client, guild!.id, Math.ceil(+pointsToGamble / 2));
            const newPoints = await addPoints(guild!.id, author.id, +pointsToGamble * -1);
            return message.reply({
                content: `${slotsText} and lost \`${pointsToGamble.toLocaleString()}\` pina colada${
                    +pointsToGamble != 1 ? "s" : ""
                }! You now have \`${formatNumber(newPoints)}\` pina colada${
                    newPoints != 1 ? "s" : ""
                }.`
            });
        }
    }
} as Command;

const isSlotsWin = (slot1: number, slot2: number, slot3: number) => {
    return slot1 == slot2 && slot2 == slot3;
};

const slotsWin = async (
    guildID: Snowflake,
    userID: Snowflake,
    pointsWon: number,
    slotsText: string,
    message: Message
) => {
    const newPoints = await addPoints(guildID!, userID, pointsWon);
    return message.reply({
        content: `${slotsText} and won \`${formatNumber(pointsWon)}\` pina colada${
            newPoints !== 1 ? "s" : ""
        }! You now have \`${formatNumber(newPoints)}\` pina colada${newPoints !== 1 ? "s" : ""}.`
    });
};
