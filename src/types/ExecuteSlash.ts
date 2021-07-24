import { CommandInteraction } from "discord.js";
import { Client } from "../Client";

export type ExecuteSlash = {
    client: Client;
    interaction: CommandInteraction;
};
