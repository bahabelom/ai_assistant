import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { AskAiDto, AskAiResponseDto } from './dto/ask-ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/ask
   * Accepts a text and language, returns an AI-generated response
   */
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async ask(@Body() askAiDto: AskAiDto): Promise<AskAiResponseDto> {
    return this.aiService.generateReply(askAiDto);
  }
}

