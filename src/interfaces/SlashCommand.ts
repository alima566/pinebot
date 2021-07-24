import { PermissionResolvable } from "discord.js";
import { ExecuteSlash } from "../types/ExecuteSlash";
import { SlashCommandOptions } from "../types/SlashCommandOptions";

export interface SlashCommand {
    name: string;
    description: string;
    cooldown?: number;
    globalCooldown?: boolean;
    perms?: PermissionResolvable[];
    clientPerms?: PermissionResolvable[];
    devOnly?: boolean;
    someServersOnly?: boolean;
    serverOwnerOnly?: boolean;
    testOnly?: boolean;
    options?: SlashCommandOptions[];
    execute(p: ExecuteSlash): any;
}
