export interface AttachmentArgument {
    // The message has to have an attachment
    type: "ATTACHMENT";
    id: string;
    prompt?: string;
    // The accepted attachment types
    attachmentTypes: string[];
}
