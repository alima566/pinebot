import { PermissionResolvable } from "discord.js";
import { ExecuteSlash } from "../types/ExecuteSlash";
import { SlashCommandBuilder } from "@discordjs/builders";

export interface SlashCommand {
    data: SlashCommandBuilder;
    cooldown?: number;
    globalCooldown?: boolean;
    perms?: PermissionResolvable[];
    clientPerms?: PermissionResolvable[];
    devOnly?: boolean;
    someServersOnly?: boolean;
    serverOwnerOnly?: boolean;
    testOnly?: boolean;
    execute(p: ExecuteSlash): any;
}
