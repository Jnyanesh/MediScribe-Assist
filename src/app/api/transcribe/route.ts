import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get("audio") as Blob;
        // Whisper API language follows ISO-639-1 (e.g. 'hi' for Hindi, 'ml' for Malayalam)
        const languageCode = formData.get("language") as string || "en";

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
        }

        // Check if an OpenAI API key is available in the environment (.env)
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY. The Whisper API integration is enabled, but no key was found in the environment variables." }, 
                { status: 500 }
            );
        }

        // Prepare the payload for OpenAI's Whisper API
        const whisperFormData = new FormData();
        whisperFormData.append("file", audioFile, "recording.webm");
        whisperFormData.append("model", "whisper-1");
        
        // Strip the dialect tag (e.g., 'hi-IN' -> 'hi') because Whisper expects ISO-639-1
        whisperFormData.append("language", languageCode.split("-")[0]);

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: whisperFormData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.error.message }, { status: response.status });
        }

        const data = await response.json();
        
        // Return the successfully transcribed text!
        return NextResponse.json({ text: data.text });

    } catch (error: any) {
        console.error("Whisper API transcription error:", error);
        return NextResponse.json({ error: "Failed to transcribe audio internally." }, { status: 500 });
    }
}
