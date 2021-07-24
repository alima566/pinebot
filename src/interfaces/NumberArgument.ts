export interface NumberArgument {
    // Ther user arg has to be a number and will automativall be converted into a number
    type: "NUMBER";
    id: string;
    amount?: number;
    prompt?: string;
    // The minimum that the number can be
    min?: number;
    // The maximum that the number can be
    max?: number;
    // Whether the number should be converted to an integer
    toInteger?: boolean;
}
