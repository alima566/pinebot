import { UserInfo } from "./interfaces/UserInfo";
import { GuildInfo } from "./interfaces/GuildInfo";
import { Command } from "./interfaces/Command";
import Discord, { ClientApplication, Snowflake } from "discord.js";
import { Model } from "mongoose";
import { SlashCommand } from "./interfaces/SlashCommand";

export declare class Client extends Discord.Client {
    /** A collection containing all regular commands */
    public commands: Discord.Collection<string, Command>;

    /** A collection containing all slash commands */
    public slashCommands: Discord.Collection<string, SlashCommand>;

    /** A collection containing all categories and the commands inside that category */
    public categories: Discord.Collection<string, string[]>;

    /** A collection containing all cached guildInfo */
    public guildInfoCache: Discord.Collection<Discord.Snowflake, GuildInfo>;

    /** A collection containing all cached userInfo */
    public userInfoCache: Discord.Collection<Discord.Snowflake, UserInfo>;

    /** A set containing all Discord IDs of blacklisted users */
    public blacklistCache: Set<Discord.Snowflake>;

    /** A reference to the guild schema */
    public DBGuild: Model<GuildInfo>;

    /** A reference to the config schema */
    public DBConfig: Model<object>;

    /** A reference to the user schema */
    public DBUser: Model<UserInfo>;

    /** A reference to the client application */
    public application: ClientApplication;

    /** A collection containing all stored server cooldowns */
    public serverCooldowns: Discord.Collection<
        Snowflake,
        Discord.Collection<string, Discord.Collection<Snowflake, number>>
    >;

    /** A collection containing all stored global cooldowns */
    public globalCooldowns: Discord.Collection<string, Discord.Collection<Snowflake, number>>;
}
