export interface TimeArgument {
    // The user argument has to be a time and will automatically be converted into milliseconds
    type: "TIME";
    id: string;
    prompt?: string;
    // The minimum time they should provide in milliseconds
    min?: number;
    // The maximum time they should provide in milliseconds
    max?: number;
}
