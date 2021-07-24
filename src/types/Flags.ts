import { GuildChannel, GuildMember, MessageAttachment, Role, User } from "discord.js";

export type Flags = {
    [id: string]:
        | (string | number | GuildChannel | Role | GuildMember | User | MessageAttachment)
        | Array<string | number | GuildChannel | Role | GuildMember | User | MessageAttachment>;
};
