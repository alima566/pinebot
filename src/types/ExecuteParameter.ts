import { Message, Interaction } from "discord.js";
import { Flags } from "./Flags";
import { Client } from "../Client";

export type ExecuteParameters = {
    client: Client;
    message: Message;
    args: string[];
    flags: Flags;
};
