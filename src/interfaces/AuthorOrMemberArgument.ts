export interface AuthorOrMemberArgument {
    // If the user mentions someone, it will get the mentioned member, otherwise, it will be the message member
    type: "AUTHOR_OR_MEMBER";
    id: string;
    prompt?: string;
    // Whether or not the member should be converted into the User object
    toUser?: boolean;
}
