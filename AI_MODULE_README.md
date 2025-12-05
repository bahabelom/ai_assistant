# AI Module Documentation

This module provides an AI-powered endpoint that accepts text and language inputs and returns AI-generated responses.

## Endpoint

**POST** `/ai/ask`

## Request Body

```json
{
  "text": "Your question or message here",
  "language": "en"
}
```

### Parameters

- `text` (string, required): The input text/question to process
- `language` (string, required): The language code (e.g., "en", "es", "fr", "de", "it", "pt", "ja", "zh")

## Response

```json
{
  "inputText": "Your question or message here",
  "aiReply": "AI-generated response in the specified language"
}
```

## Testing Examples

### Using cURL

#### English Example
```bash
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is artificial intelligence?",
    "language": "en"
  }'
```

#### Spanish Example
```bash
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{
    "text": "¿Qué es la inteligencia artificial?",
    "language": "es"
  }'
```

#### French Example
```bash
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Qu'est-ce que l'intelligence artificielle?",
    "language": "fr"
  }'
```

### Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:3000/ai/ask`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (select "raw" and "JSON"):
   ```json
   {
     "text": "Hello, how are you?",
     "language": "en"
   }
   ```
5. Click **Send**

### Expected Response

```json
{
  "inputText": "Hello, how are you?",
  "aiReply": "I received your message: \"Hello, how are you?\". This is a mock AI response in English."
}
```

## Project Structure

```
src/
  ai/
    ├── dto/
    │   └── ask-ai.dto.ts      # Data Transfer Objects for request/response
    ├── ai.controller.ts        # Controller handling HTTP requests
    ├── ai.service.ts           # Service containing business logic
    └── ai.module.ts            # Module definition
```

## Current Implementation

The module currently returns **mock responses** for testing purposes. The service includes:

- Mock responses in multiple languages (English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese)
- Placeholder for Vertex AI integration
- Clean, beginner-friendly code structure

## Enabling Vertex AI Integration

To enable actual Vertex AI integration:

1. Install Vertex AI SDK:
   ```bash
   npm install @google-cloud/aiplatform
   ```

2. Set environment variable:
   ```bash
   VERTEX_AI_ENABLED=true
   ```

3. Configure Vertex AI credentials (follow Google Cloud documentation)

4. Update the `callVertexAI` method in `ai.service.ts` with actual implementation

## Running the Application

1. Start the development server:
   ```bash
   npm run start:dev
   ```

2. The server will run on `http://localhost:3000` (or the port specified in your environment)

3. Test the endpoint using any of the examples above

## Error Handling

The endpoint currently uses basic NestJS validation. For production use, consider adding:

- Input validation decorators (`@IsString()`, `@IsNotEmpty()`)
- Custom exception filters
- Error logging
- Rate limiting

