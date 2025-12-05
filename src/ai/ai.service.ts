import { Injectable, Logger } from '@nestjs/common';
import { AskAiDto, AskAiResponseDto } from './dto/ask-ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private apiKey: string | null = null;
  private projectId: string | null = null;
  private useApiKey: boolean = false;
  private cachedModels: string[] | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the AI service based on available credentials
   */
  private initialize() {
    this.apiKey = process.env.GOOGLE_API_KEY || null;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_PROJECT_ID || null;

    if (this.apiKey) {
      this.useApiKey = true;
      this.logger.log('Initialized with API key authentication');
      return;
    }

    if (this.projectId) {
      this.initializeSDK();
    } else {
      this.logger.warn('No API key or project ID found - using mock responses');
    }
  }

  /**
   * Initializes Vertex AI SDK (for service account authentication)
   */
  private initializeSDK() {
    try {
      const { VertexAI } = require('@google-cloud/vertexai');
      const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.GOOGLE_LOCATION || 'us-central1';
      const model = process.env.VERTEX_AI_MODEL || 'gemini-1.5-flash';
      
      const vertexAI = new VertexAI({ project: this.projectId, location });
      const generativeModel = vertexAI.getGenerativeModel({ model });
      
      // Store for SDK usage
      (this as any).generativeModel = generativeModel;
      this.logger.log(`Initialized Vertex AI SDK with model: ${model}`);
    } catch (error) {
      this.logger.warn('Vertex AI SDK not available - install @google-cloud/vertexai or use API key');
    }
  }

  /**
   * Generates an AI response based on the input text and language
   */
  async generateReply(dto: AskAiDto): Promise<AskAiResponseDto> {
    if (this.useApiKey && this.apiKey) {
      return this.callGeminiAPI(dto);
    }

    if ((this as any).generativeModel) {
      return this.callVertexAISDK(dto);
    }

    return this.getMockResponse(dto);
  }

  /**
   * Calls Gemini API using API key
   */
  private async callGeminiAPI(dto: AskAiDto): Promise<AskAiResponseDto> {
    const prompt = this.buildPrompt(dto);
    const models = await this.getAvailableModels();

    for (const model of models) {
      try {
        const response = await this.generateContent(model, prompt);
        if (response) {
          return {
            inputText: dto.text,
            aiReply: response,
          };
        }
      } catch (error) {
        this.logger.debug(`Model ${model} failed, trying next...`);
        continue;
      }
    }

    this.logger.warn('All models failed, falling back to mock response');
    return this.getMockResponse(dto);
  }

  /**
   * Gets available models from Gemini API (with caching)
   */
  private async getAvailableModels(): Promise<string[]> {
    if (this.cachedModels && this.cachedModels.length > 0) {
      return this.cachedModels;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data.models?.length) {
          const models = data.models
            .map((m: any) => m.name?.replace('models/', '') || m.name)
            .filter((name: string) => name?.includes('gemini'));
          
          if (models.length > 0) {
            this.cachedModels = models;
            return models;
          }
        }
      }
    } catch (error) {
      this.logger.debug('Could not fetch available models');
    }

    // Fallback to common model names
    return ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  }

  /**
   * Generates content using a specific model
   */
  private async generateContent(model: string, prompt: string): Promise<string | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return text || null;
  }

  /**
   * Calls Vertex AI SDK (for service account authentication)
   */
  private async callVertexAISDK(dto: AskAiDto): Promise<AskAiResponseDto> {
    try {
      const prompt = this.buildPrompt(dto);
      const generativeModel = (this as any).generativeModel;
      
      const response = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const contentResponse = response.response;
      const aiReply = contentResponse.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiReply) {
        throw new Error('Invalid response structure');
      }

      return {
        inputText: dto.text,
        aiReply,
      };
    } catch (error) {
      this.logger.error('Error calling Vertex AI SDK', error);
      return this.getMockResponse(dto);
    }
  }

  /**
   * Builds a prompt with language instruction
   */
  private buildPrompt(dto: AskAiDto): string {
    return `Please respond to the following message in ${dto.language}. Keep your response natural and conversational.\n\nMessage: ${dto.text}`;
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
      aiReply,
    };
  }
}
