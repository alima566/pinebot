import { SlashCommand } from "../../interfaces/SlashCommand";
import {
    getGuildInfo,
    formatNumber,
    randomRange,
    isValidNumber,
    removeCommas
} from "../../utils/utils";
import {
    getPoints,
    addPoints,
    updateJackpotAmount,
    resetJackpotAmount
} from "../../utils/gambling";
import { Client } from "../../Client";
import { GuildInfo } from "../../interfaces/GuildInfo";
import { CommandInteraction } from "discord.js";

export default {
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
    async execute({ client, interaction }) {
        const { guildId, user, channel } = interaction;
        const points = interaction.options.getString("points");

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
        if (points!.toLowerCase() == "all") {
            return rollDice(client, interaction, actualPoints, true, guildInfo);
        }

        if (!isValidNumber(points!.trim())) {
            return interaction.reply({
                content: "Please provide a valid number of pina coladas."
            });
        }

        const pointsToGamble = removeCommas(points!.trim());

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
                content: `You don't have enough pina coladas! You only have ${formatNumber(
                    actualPoints
                )} pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }
        return rollDice(client, interaction, +pointsToGamble, false, guildInfo);
    }
} as SlashCommand;

const rollDice = async (
    client: Client,
    interaction: CommandInteraction,
    pointsGambled: number,
    isAllIn: boolean,
    guildInfo: GuildInfo
) => {
    const diceRoll = randomRange(0, 100); // Roll a 100 sided die
    let pointsWon: number;
    if (diceRoll <= 50) {
        await updateJackpotAmount(client, interaction.guild!.id!, Math.ceil(pointsGambled / 2));
        const newPoints = await addPoints(
            interaction.guild!.id!,
            interaction.user.id,
            pointsGambled * -1
        );
        return interaction.reply({
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
        return interaction.reply({ content: await winMessage(interaction, diceRoll, pointsWon) });
    }

    if (diceRoll > 75 && diceRoll <= 90) {
        pointsWon = pointsGambled * 2;
        return interaction.reply({ content: await winMessage(interaction, diceRoll, pointsWon) });
    }

    if (diceRoll > 90 && diceRoll <= 99) {
        pointsWon = pointsGambled * 3;
        return interaction.reply({ content: await winMessage(interaction, diceRoll, pointsWon) });
    }

    // Rolled 100 and win jackpot
    pointsWon = guildInfo.gambling.jackpotAmount!;
    await resetJackpotAmount(client, interaction.guild!.id!);
    return interaction.reply({ content: await winMessage(interaction, diceRoll, pointsWon) });
};

const winMessage = async (interaction: CommandInteraction, diceRoll: number, pointsWon: number) => {
    const newPoints = await addPoints(interaction.guild!.id!, interaction.user.id, pointsWon);
    return `You rolled ${diceRoll} and won ${
        diceRoll == 100 ? "the jackpot of " : ""
    }\`${formatNumber(pointsWon)}\` pina colada${
        pointsWon != 1 ? "s" : ""
    }! You now have \`${formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`;
};
