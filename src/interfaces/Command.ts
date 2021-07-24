import { PermissionResolvable } from "discord.js";
import { ExecuteParameters } from "../types/ExecuteParameter";
import { Arguments } from "../types/Arguments";

export interface Command {
    name: string;
    aliases?: string[];
    category: string;
    cooldown?: number;
    usage?: string;
    description?: string;
    globalCooldown?: boolean;
    canNotDisable?: boolean;
    canNotSetCooldown?: boolean;
    canNotAddAlias?: boolean;
    hideCommand?: boolean;
    ignoreDisabledChannels?: boolean;
    perms?: PermissionResolvable[];
    clientPerms?: PermissionResolvable[];
    devOnly?: boolean;
    someServersOnly?: boolean;
    serverOwnerOnly?: boolean;
    testOnly?: boolean;
    arguments?: Arguments;
    execute(p: ExecuteParameters): any;
}
