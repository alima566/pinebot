import { SomethingArgument } from "../interfaces/SomethingArgument";
import { NumberArgument } from "../interfaces/NumberArgument";
import { ChannelArgument } from "../interfaces/ChannelArgument";
import { RoleArgument } from "../interfaces/RoleArgument";
import { AuthorOrMemberArgument } from "../interfaces/AuthorOrMemberArgument";
import { MemberArgument } from "../interfaces/MemberArgument";
import { AttachmentArgument } from "../interfaces/AttachmentArgument";
import { TimeArgument } from "../interfaces/TimeArgument";

export type Arguments = (
    | SomethingArgument
    | NumberArgument
    | ChannelArgument
    | RoleArgument
    | AuthorOrMemberArgument
    | MemberArgument
    | AttachmentArgument
    | TimeArgument
)[];
