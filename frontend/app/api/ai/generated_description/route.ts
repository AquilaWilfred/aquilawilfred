import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, tech, category, githubUrl } = await req.json();

    // Simple example – replace with your real AI call (OpenAI, Grok, etc.)
    const prompt = `Write a short professional project description (max 30 words) and a longer detailed description for a ${category} project called "${title}". Tech stack: ${tech?.join(", ")}.`;

    // TODO: Call your AI provider here
    // For now returning a placeholder
    const description = `A production-ready ${category.toLowerCase()} solution built with ${tech?.slice(0, 3).join(", ") || "modern technologies"}.`;
    const longDesc = `${description} This project demonstrates clean architecture, scalable design, and real-world best practices.`;

    return NextResponse.json({ description, longDesc });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}