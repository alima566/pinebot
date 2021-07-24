import { PermissionString, Snowflake } from "discord.js";

export interface GuildInfo {
    /** This guilds prefix for the bot */
    prefix: string;

    /** The announcements channel for the guild, if set */
    announcementsChannel: Snowflake;

    /** The bot logging channel for the guild, if set */
    botLoggingChannel: Snowflake;

    /** The bot chatting channel for the guild, if set*/
    botChatChannel: Snowflake;

    /** The gambling data for the guild, if set */
    gambling: {
        gamblingChannel: Snowflake;
        gamblingLeaderboardChannel: Snowflake;
        monthlyPrize?: string;
        dailyReward: number;
        raffleChannel: Snowflake;
        rafflePoints: number;
        nitroLink?: string;
        jackpotAmount?: number;
    };

    /** The guild owner's genshin UID */
    genshinUID?: string;

    /** The guild owner's friend code */
    friendCode?: string;

    /** The guild owner's dream address */
    dreamAddress?: string;

    /** The welcome channel and text */
    welcome?: {
        channelID: string;
        text: string;
    };

    /** Array with all disabled command names */
    disabledCommands: string[];

    /** Array with all channel ID's that are disabled */
    disabledChannels: Snowflake[];

    /** Contains all the custom command permissions for a command */
    commandPerms?: { [name: string]: PermissionString[] };

    /** Contains all custom role cooldowns for a command */
    commandCooldowns?: {
        [nameOfTheCommand: string]: { [id: string]: number };
    };

    /** Contains all custom command aliases */
    commandAlias?: { [alias: string]: string };
}
