import { ApplicationCommandOptionChoice, ApplicationCommandOptionType } from "discord.js";

export type SlashCommandOptions = {
    name: string;
    type: ApplicationCommandOptionType;
    description: string;
    required: boolean;
    choices?: ApplicationCommandOptionChoice[];
};
