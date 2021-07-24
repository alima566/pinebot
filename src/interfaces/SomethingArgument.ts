export interface SomethingArgument {
    // The user argument can be anything (i.e., a word or a URL - anything)
    type: "SOMETHING";
    id: string;
    // The amount of args
    amount?: number;
    // The message to send if the user doesn't provide the correct args
    prompt?: string;
    // An array of words that the user can send
    words?: string[];
    // The user arg should match this certain regular expression
    regexp?: RegExp;
}
