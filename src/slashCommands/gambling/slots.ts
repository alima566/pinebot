import { SlashCommand } from "../../interfaces/SlashCommand";
import { addPoints, getPoints, updateJackpotAmount } from "../../utils/gambling";
import {
    getGuildInfo,
    randomRange,
    formatNumber,
    removeCommas,
    isValidNumber
} from "../../utils/utils";
import { CommandInteraction, Snowflake } from "discord.js";

const slotsEmoji: string[] = ["💰", "✨", "💩", "🍍"];
const multiplier = slotsEmoji.length;

export default {
    name: "slots",
    description: `Test your luck and play the slots. Each slot win gives you ${multiplier}x the amount you gambled.`,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: [
        {
            name: "points",
            description: "The amount of pina coladas (or all) to gamble.",
            type: "STRING",
            required: true
        }
    ],
    async execute({ client, interaction }) {
        const { guildId, user, channel } = interaction;
        const points = interaction.options.getString("points")!;

        const guildInfo = await getGuildInfo(client, guildId!);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (channel!.id !== gamblingChannel) {
                return await interaction.reply({
                    content: `Gambling is only allowed in <#${gamblingChannel}>!`,
                    ephemeral: true
                });
            }
        } else {
            return await interaction.reply({
                content:
                    "A gambling channel needs to be set first in order for this command to be used.",
                ephemeral: true
            });
        }

        const actualPoints = await getPoints(guildId!, user.id);
        if (points.toLowerCase() !== "all") {
            if (!isValidNumber(points.trim())) {
                return interaction.reply({
                    content: "Please provide a valid number of pina coladas."
                });
            }
        }

        const pointsToGamble = removeCommas(points.trim());
        if (actualPoints == 0) {
            return interaction.reply({
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
                return slotsWin(guildId!, user.id, pointsWon, slotsText, interaction);
            } else {
                await updateJackpotAmount(client, guildId!, Math.ceil(actualPoints / 2));
                await addPoints(guildId!, user.id, actualPoints * -1);
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
                content: `You don't have enough pina coladas! You only have \`${formatNumber(
                    actualPoints
                )}\` pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }

        if (isSlotsWin(slot1, slot2, slot3)) {
            pointsWon = +pointsToGamble * multiplier;
            return slotsWin(guildId!, user.id, pointsWon, slotsText, interaction);
        } else {
            await updateJackpotAmount(client, guildId!, Math.ceil(+pointsToGamble / 2));
            const newPoints = await addPoints(guildId!, user.id, +pointsToGamble * -1);
            return interaction.reply({
                content: `${slotsText} and lost \`${pointsToGamble.toLocaleString()}\` pina colada${
                    +pointsToGamble != 1 ? "s" : ""
                }! You now have \`${formatNumber(newPoints)}\` pina colada${
                    newPoints != 1 ? "s" : ""
                }.`
            });
        }
    }
} as SlashCommand;

const isSlotsWin = (slot1: number, slot2: number, slot3: number) => {
    return slot1 == slot2 && slot2 == slot3;
};

const slotsWin = async (
    guildID: Snowflake,
    userID: Snowflake,
    pointsWon: number,
    slotsText: string,
    interaction: CommandInteraction
) => {
    const newPoints = await addPoints(guildID!, userID, pointsWon);
    return interaction.reply({
        content: `${slotsText} and won \`${formatNumber(pointsWon)}\` pina colada${
            newPoints !== 1 ? "s" : ""
        }! You now have \`${formatNumber(newPoints)}\` pina colada${newPoints !== 1 ? "s" : ""}.`
    });
};
