import { Injectable, Logger } from '@nestjs/common';
import { AskAiDto, AskAiResponseDto } from './dto/ask-ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private vertexAI: any = null;
  private generativeModel: any = null;

  constructor() {
    this.initializeVertexAI();
  }

  /**
   * Initializes Vertex AI client if credentials are configured
   */
  private initializeVertexAI() {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const model = process.env.VERTEX_AI_MODEL || 'gemini-1.5-flash';

    if (!projectId) {
      this.logger.log('Vertex AI not configured - using mock responses');
      return;
    }

    try {
      // Dynamic import to handle cases where package is not installed
      const { VertexAI } = require('@google-cloud/vertexai');
      this.vertexAI = new VertexAI({ project: projectId, location });
      this.generativeModel = this.vertexAI.getGenerativeModel({ model });
      this.logger.log(`Vertex AI initialized with model: ${model}`);
    } catch (error) {
      this.logger.warn('Vertex AI package not found - install @google-cloud/vertexai to enable');
      this.logger.warn('Using mock responses instead');
    }
  }

  /**
   * Generates an AI response based on the input text and language
   */
  async generateReply(dto: AskAiDto): Promise<AskAiResponseDto> {
    if (this.generativeModel) {
      return this.callVertexAI(dto);
    } else {
      return this.getMockResponse(dto);
    }
  }

  /**
   * Calls Vertex AI API to generate a response
   */
  private async callVertexAI(dto: AskAiDto): Promise<AskAiResponseDto> {
    try {
      // Create a prompt that instructs the model to respond in the specified language
      const prompt = `Please respond to the following message in ${dto.language}. Keep your response natural and conversational.\n\nMessage: ${dto.text}`;

      const request = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      const response = await this.generativeModel.generateContent(request);
      const contentResponse = await response.response;

      if (
        contentResponse.candidates &&
        contentResponse.candidates[0] &&
        contentResponse.candidates[0].content &&
        contentResponse.candidates[0].content.parts &&
        contentResponse.candidates[0].content.parts[0]
      ) {
        const aiReply = contentResponse.candidates[0].content.parts[0].text;

        return {
          inputText: dto.text,
          aiReply: aiReply,
        };
      } else {
        throw new Error('Invalid response structure from Vertex AI');
      }
    } catch (error) {
      this.logger.error('Error calling Vertex AI:', error);
      // Fallback to mock response on error
      this.logger.warn('Falling back to mock response');
      return this.getMockResponse(dto);
    }
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

