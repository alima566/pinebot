export interface MemberArgument {
    // The user argument has to be a member and will automtaically be converted into a member
    type: "MEMBER";
    id: string;
    amount?: number;
    prompt?: string;
    // The member shouldn't be a bot
    notBot?: boolean;
    // The member shouldn't be the command user
    notSelf?: boolean;
    toUser?: boolean;
}
