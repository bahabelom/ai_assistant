/**
 * DTO for AI ask request
 */
export class AskAiDto {
  text: string;
  language: string;
}

/**
 * DTO for AI ask response
 */
export class AskAiResponseDto {
  inputText: string;
  aiReply: string;
}

