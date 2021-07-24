import {
    ApplicationCommandOptionChoice,
    ApplicationCommandOptionType,
    PermissionResolvable
} from "discord.js";
import { ExecuteSlash } from "../types/ExecuteSlash";

export interface SlashCommand {
    name: string;
    description: string;
    category: string;
    cooldown?: number;
    globalCooldown?: boolean;
    perms?: PermissionResolvable[];
    clientPerms?: PermissionResolvable[];
    devOnly?: boolean;
    someServersOnly?: boolean;
    serverOwnerOnly?: boolean;
    testOnly?: boolean;
    options?: [
        {
            name: string;
            type: ApplicationCommandOptionType;
            description: string;
            required: boolean;
            choices?: ApplicationCommandOptionChoice[];
        }
    ];
    execute(p: ExecuteSlash): any;
}
