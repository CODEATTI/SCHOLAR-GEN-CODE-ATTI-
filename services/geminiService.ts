import { GoogleGenAI, Schema, Type } from "@google/genai";
import { ProcessingResult, QuestionType, Question } from "../types";

// Mock data for fallback when API key is missing or quota fails
const MOCK_RESULT: ProcessingResult = {
  domain: "History",
  difficulty: "Intermediate",
  summary: "The Industrial Revolution marked a major turning point in history; almost every aspect of daily life was influenced in some way. In particular, average income and population began to exhibit unprecedented sustained growth. Some economists say that the major impact of the Industrial Revolution was that the standard of living for the general population began to increase consistently for the first time in history, although others have said that it did not begin to meaningfully improve until the late 19th and 20th centuries.",
  meta: {
    original_words: 1250,
    summary_words: 85,
  },
  questions: [
    {
      type: QuestionType.MCQ,
      question: "Which aspect of life was NOT mentioned as being influenced by the Industrial Revolution?",
      options: ["Average income", "Population growth", "Space exploration"],
      correct_index: 2,
      answer: "Space exploration",
      source_location: "Paragraph 1"
    },
    {
      type: QuestionType.MCQ,
      question: "According to the text, what happened to the standard of living?",
      options: ["It decreased rapidly", "It began to increase consistently", "It remained stagnant"],
      correct_index: 1,
      answer: "It began to increase consistently",
      source_location: "Paragraph 1, Sentence 2"
    },
    {
      type: QuestionType.ShortAnswer,
      question: "When do some economists argue the standard of living actually improved?",
      answer: "Late 19th and 20th centuries.",
      source_location: "Paragraph 1, final sentence"
    },
    {
      type: QuestionType.ShortAnswer,
      question: "What is considered the major impact of the revolution by proponents?",
      answer: "Sustained growth in income and population.",
      source_location: "Paragraph 1, Sentence 2"
    },
    {
      type: QuestionType.Analytical,
      question: "Analyze the conflicting views on the standard of living improvements.",
      answer: "While some argue improvement was immediate, others suggest a lag until the late 19th century.",
      source_location: "Entire selection",
      points_to_consider: ["Immediate economic data", "Social conditions", "Long-term vs short-term impact"]
    }
  ]
};

const MOCK_EXTRA_QUESTIONS: Question[] = [
  {
    type: QuestionType.MCQ,
    question: "Which social class saw the most significant rise in political power?",
    options: ["The Aristocracy", "The Middle Class (Bourgeoisie)", "The Peasantry"],
    correct_index: 1,
    answer: "The Middle Class (Bourgeoisie)",
    source_location: "Paragraph 3"
  },
  {
    type: QuestionType.MCQ,
    question: "What replaced wood as the primary energy source?",
    options: ["Coal", "Oil", "Solar"],
    correct_index: 0,
    answer: "Coal",
    source_location: "Paragraph 2"
  },
  {
    type: QuestionType.ShortAnswer,
    question: "Name one negative consequence of rapid urbanization mentioned.",
    answer: "Overcrowding and poor sanitation.",
    source_location: "Paragraph 4"
  }
];

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export type ProcessInput = string | { data: string; mimeType: string };

// Helper to construct the user content part (Text or Binary)
const getUserContentPart = (input: ProcessInput) => {
  if (typeof input === 'string') {
    return { text: input };
  } else {
    return { inlineData: { data: input.data, mimeType: input.mimeType } };
  }
};

export const processText = async (
  input: ProcessInput, 
  userDomain?: string, 
  userDifficulty?: string,
  onProgress?: (status: string) => void
): Promise<ProcessingResult> => {
  
  const client = getClient();
  
  // Deterministic fallback if no API key
  if (!client) {
    if (onProgress) onProgress('Running in demo mode (no API key found)...');
    await new Promise(r => setTimeout(r, 1500)); 
    return MOCK_RESULT;
  }

  // Use flash for speed and multimodal capabilities
  const modelName = 'gemini-2.5-flash';

  try {
    // 1. Detect Domain & Difficulty
    if (onProgress) onProgress('Analyzing content domain and difficulty...');
    
    const detectionSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        domain: { 
          type: Type.STRING,
          enum: ["Medicine", "History", "Engineering", "Computer Science", "Biology", "Law", "Economics", "Other"]
        },
        difficulty: { 
          type: Type.STRING,
          enum: ["Beginner", "Intermediate", "Advanced"]
        },
      },
      required: ["domain", "difficulty"],
    };

    const detectionPromptText = `
      You are an expert classifier. Given the content provided, identify:
      1) The most likely subject domain.
      2) The appropriate difficulty level.
    `;

    const detectionRes = await client.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: detectionPromptText },
          getUserContentPart(input)
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: detectionSchema,
      }
    });

    const detectionData = JSON.parse(detectionRes.text || "{}");
    const domain = userDomain || detectionData.domain || "General";
    const difficulty = userDifficulty || detectionData.difficulty || "Intermediate";

    // 2. Contextual Summary
    if (onProgress) onProgress(`Generating ${difficulty} summary for ${domain}...`);

    const summarySchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        original_words: { type: Type.INTEGER },
        summary_words: { type: Type.INTEGER },
      },
      required: ["summary", "original_words", "summary_words"],
    };

    const summaryPromptText = `
      You are a concise summarizer for students. Given the content provided, the detected domain '${domain}', and difficulty '${difficulty}':
      Generate a concise summary (reduce original length by ~60–75%). 
      Emphasize the information most useful to a student preparing for an exam in this domain and difficulty.
    `;

    const summaryRes = await client.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: summaryPromptText },
          getUserContentPart(input)
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: summarySchema,
      }
    });
    
    const summaryData = JSON.parse(summaryRes.text || "{}");

    // 3. Question Generation
    if (onProgress) onProgress('Creating source-backed assessment questions...');

    const questionsSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["mcq", "short", "analytical"] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correct_index: { type: Type.INTEGER },
          answer: { type: Type.STRING },
          source_location: { type: Type.STRING },
          points_to_consider: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["type", "question", "answer", "source_location"]
      }
    };

    const questionsPromptText = `
      Using only the source content provided (do not hallucinate), create exactly 5 unique assessment questions that can be answered from the text:
      - 2 MCQs (type: 'mcq'): each with "question", "options": ["A...", "B...", "C..."], "correct_index": 0..2, "answer" (the correct text), and "source_location".
      - 2 Short-answer (type: 'short'): {"question":"", "answer":"", "source_location":""}
      - 1 Analytical (type: 'analytical'): {"question":"", "answer":"", "points_to_consider":[...], "source_location":""}
      
      Ensure 'source_location' points to specific paragraphs, sections, or visual elements in the content.
    `;

    const questionsRes = await client.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: questionsPromptText },
          getUserContentPart(input)
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: questionsSchema,
      }
    });

    const questionsData = JSON.parse(questionsRes.text || "[]");

    // Fallback for word count if input is not string
    const estimatedOriginalWords = summaryData.original_words || (typeof input === 'string' ? input.split(' ').length : 0);

    return {
      domain,
      difficulty,
      summary: summaryData.summary || "Summary generation failed.",
      meta: {
        original_words: estimatedOriginalWords,
        summary_words: summaryData.summary_words || 0,
      },
      questions: questionsData.map((q: any) => ({
        ...q,
        type: q.type as QuestionType
      }))
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateMoreQuestions = async (
  input: ProcessInput,
  existingQuestions: Question[],
  domain: string,
  difficulty: string
): Promise<Question[]> => {
  const client = getClient();
  const modelName = 'gemini-2.5-flash';

  if (!client) {
    await new Promise(r => setTimeout(r, 1000));
    return MOCK_EXTRA_QUESTIONS;
  }

  const questionsSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ["mcq", "short"] },
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correct_index: { type: Type.INTEGER },
        answer: { type: Type.STRING },
        source_location: { type: Type.STRING }
      },
      required: ["type", "question", "answer", "source_location"]
    }
  };

  const prompt = `
    You are an expert examiner in ${domain} (${difficulty} level).
    Task: Create 3 NEW unique assessment questions based on the content provided.
    
    Constraints:
    1. Do NOT repeat the following existing questions or their specific answers:
    ${existingQuestions.map(q => `- ${q.question}`).join('\n')}

    2. Required Format:
    - 2 MCQs (type: 'mcq'): with options, correct_index, and source_location.
    - 1 Short Answer (type: 'short'): with answer and source_location.
    
    Return a JSON array.
  `;

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: prompt },
          getUserContentPart(input)
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: questionsSchema
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((q: any) => ({
      ...q,
      type: q.type as QuestionType
    }));
  } catch (error) {
    console.error("Error generating more questions:", error);
    throw error;
  }
};
