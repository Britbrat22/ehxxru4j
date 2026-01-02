import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Readable } from "stream";

// Initialize OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to convert Buffer to Readable stream for the API call
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// Interface for the input validation
interface VocalEnhancerInput {
  audioFile: File;
  beatStyle: string;
  noiseReductionLevel: number;
  tempo: number;
}

// Interface for the output response structure
interface VocalEnhancerOutput {
  processedAudioFile?: string;
  generatedBeatFile?: string;
  errors?: string[];
}

// Main POST function for handling transcription requests
export async function POST(req: Request) {
  console.log("Received POST request for speech-to-text transcription");

  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get("audioFile") as File | null;

    // Validate the incoming file
    if (!file) {
      console.error("No audio file provided in the request");
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }
    
    // Log the file name for reference
    console.log("Audio file received:", file.name);

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert Buffer to Readable stream for the OpenAI API
    const stream = bufferToStream(buffer);

    console.log("Sending request to OpenAI Whisper API for transcription");

    // Call OpenAI's Whisper API to get the transcription
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: stream,
      model: "whisper-1",
    });

    console.log("Transcription completed successfully");

    // Return the response with the transcription text
    const output: VocalEnhancerOutput = {
      processedAudioFile: transcriptionResponse.text,
    };

    return NextResponse.json(output, { status: 200 });
  } catch (error) {
    console.error("Error in POST handler:", error);
    // Handle unexpected errors gracefully
    return NextResponse.json(
      {
        error: "Failed to transcribe audio.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}