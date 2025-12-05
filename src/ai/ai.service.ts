import { Injectable } from '@nestjs/common';
import { AskAiDto, AskAiResponseDto } from './dto/ask-ai.dto';

@Injectable()
export class AiService {
  /**
   * Generates an AI response based on the input text and language
   * Currently returns a mock response. Replace with actual Vertex AI integration.
   */
  async generateReply(dto: AskAiDto): Promise<AskAiResponseDto> {
    // Check if Vertex AI is configured
    const useVertexAI = process.env.VERTEX_AI_ENABLED === 'true';

    if (useVertexAI) {
      return this.callVertexAI(dto);
    } else {
      return this.getMockResponse(dto);
    }
  }

  /**
   * Calls Vertex AI API to generate a response
   * TODO: Implement actual Vertex AI integration
   */
  private async callVertexAI(dto: AskAiDto): Promise<AskAiResponseDto> {
    // Placeholder for Vertex AI integration
    // Example structure:
    // const vertexAI = new VertexAI({...});
    // const response = await vertexAI.generateText({...});
    
    // For now, return mock response
    return this.getMockResponse(dto);
  }

  /**
   * Returns a mock response for testing purposes
   */
  private getMockResponse(dto: AskAiDto): AskAiResponseDto {
    const languageResponses: Record<string, string> = {
      en: `I received your message: "${dto.text}". This is a mock AI response in English.`,
      es: `Recibí tu mensaje: "${dto.text}". Esta es una respuesta de IA simulada en español.`,
      fr: `J'ai reçu votre message: "${dto.text}". Ceci est une réponse IA simulée en français.`,
      de: `Ich habe Ihre Nachricht erhalten: "${dto.text}". Dies ist eine simulierte KI-Antwort auf Deutsch.`,
      it: `Ho ricevuto il tuo messaggio: "${dto.text}". Questa è una risposta AI simulata in italiano.`,
      pt: `Recebi sua mensagem: "${dto.text}". Esta é uma resposta de IA simulada em português.`,
      ja: `メッセージを受け取りました: "${dto.text}". これは日本語のモックAI応答です。`,
      zh: `我收到了您的消息: "${dto.text}". 这是中文的模拟AI回复。`,
    };

    const aiReply =
      languageResponses[dto.language.toLowerCase()] ||
      `I received your message: "${dto.text}". This is a mock AI response. (Language: ${dto.language})`;

    return {
      inputText: dto.text,
      aiReply: aiReply,
    };
  }
}

