export interface RoleArgument {
    // The user arg has to be a role and will automatically be converted into a role
    type: "ROLE";
    id: string;
    amount?: number;
    prompt?: string;
    // The role shouldn't be the default role of a bot
    notBot?: boolean;
}
