export interface ChannelArgument {
    // The user arg has to be a channel and will automatically be converted into a channel
    type: "CHANNEL";
    id: string;
    amount?: number;
    prompt?: string;
    // The channel types that the provided channel can be
    channelTypes?: (
        | "DM"
        | "GROUP_DM"
        | "GUILD_TEXT"
        | "GUILD_VOICE"
        | "GUILD_CATEGORY"
        | "GUILD_NEWS"
        | "GUILD_STORE"
        | "GUILD_NEWS_THREAD"
        | "GUILD_PUBLIC_THREAD"
        | "GUILD_PRIVATE_THREAD"
        | "GUILD_STAGE_VOICE"
        | "UNKNOWN"
    )[];
}
