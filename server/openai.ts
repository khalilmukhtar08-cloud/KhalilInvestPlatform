import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GeneratedPost {
  caption: string;
  hashtags: string[];
}

export async function generateSocialMediaPost(
  topic: string,
  platform: string,
  tone: string = "professional"
): Promise<GeneratedPost> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please add your OPENAI_API_KEY in the Secrets tab.");
  }

  const prompt = `Generate a social media post for ${platform} about "${topic}".
The tone should be ${tone}.
The post should be engaging and appropriate for the platform.
Include relevant hashtags.

Respond with JSON in this format:
{
  "caption": "The main post text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a social media marketing expert. Generate engaging posts that are platform-appropriate and drive engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const result = JSON.parse(content);
    return {
      caption: result.caption || "",
      hashtags: result.hashtags || []
    };
  } catch (error: any) {
    console.error("OpenAI error:", error);
    throw new Error(error.message || "Failed to generate AI content");
  }
}

export async function generatePostCaption(
  context: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please add your OPENAI_API_KEY in the Secrets tab.");
  }

  const prompt = `Generate an engaging social media caption based on this context: "${context}".
Make it compelling, professional, and include relevant hashtags at the end.
Keep it concise but impactful.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a social media content creator for an investment and financial services company. Create engaging, professional content that builds trust and drives engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 512
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenAI error:", error);
    throw new Error(error.message || "Failed to generate AI caption");
  }
}

export async function generateMultipleCaptions(
  context: string,
  count: number = 3
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please add your OPENAI_API_KEY in the Secrets tab.");
  }

  const prompt = `Generate ${count} different social media captions based on this context: "${context}".
Each caption should be unique, engaging, professional, and include relevant hashtags.
Vary the tone and approach for each one.

Respond with JSON in this format:
{
  "captions": ["caption1", "caption2", "caption3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a social media content creator for an investment and financial services company. Create engaging, professional content that builds trust and drives engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const result = JSON.parse(content);
    return result.captions || [];
  } catch (error: any) {
    console.error("OpenAI error:", error);
    throw new Error(error.message || "Failed to generate AI captions");
  }
}
