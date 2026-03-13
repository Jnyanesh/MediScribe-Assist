/**
 * Sarvam AI API Utility Wrapper
 * 
 * Provides Speech-to-Text, Text-to-Speech, and Translation
 * using Sarvam AI's API with ₹1,000 free credits.
 * 
 * Falls back to free browser APIs if no key is configured.
 * 
 * Usage:
 *   Set NEXT_PUBLIC_SARVAM_API_KEY in .env.local
 */

const SARVAM_BASE = "https://api.sarvam.ai"

export function isSarvamAvailable(): boolean {
    return typeof process !== "undefined" 
        ? !!process.env.NEXT_PUBLIC_SARVAM_API_KEY
        : !!(typeof window !== "undefined" && (window as any).__SARVAM_KEY)
}

function getApiKey(): string {
    if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SARVAM_API_KEY) {
        return process.env.NEXT_PUBLIC_SARVAM_API_KEY
    }
    return ""
}

/**
 * Translate text between English and Indian languages
 * Model: sarvam-translate
 * Cost: Included in free credits
 */
export async function sarvamTranslate(
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<string> {
    const apiKey = getApiKey()
    if (!apiKey) throw new Error("Sarvam API key not configured")

    const res = await fetch(`${SARVAM_BASE}/translate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-subscription-key": apiKey,
        },
        body: JSON.stringify({
            input: text,
            source_language_code: sourceLang,
            target_language_code: targetLang,
            mode: "formal",
        }),
    })

    const data = await res.json()
    return data?.translated_text || text
}

/**
 * Text-to-Speech using Sarvam Bulbul v3
 * Supports: hi-IN, bn-IN, kn-IN, ml-IN, mr-IN, od-IN, pa-IN, ta-IN, te-IN, gu-IN, en-IN
 * Cost: ₹30 per 10,000 characters
 * Returns: base64 audio
 */
export async function sarvamTTS(
    text: string,
    targetLang: string
): Promise<string | null> {
    const apiKey = getApiKey()
    if (!apiKey) return null

    try {
        const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": apiKey,
            },
            body: JSON.stringify({
                inputs: [text],
                target_language_code: targetLang,
                speaker: "meera",  // Default female voice
                model: "bulbul:v2",
            }),
        })

        const data = await res.json()
        if (data?.audios?.[0]) {
            return data.audios[0]  // base64 encoded audio
        }
        return null
    } catch {
        return null
    }
}

/**
 * Play base64 audio in browser
 */
export function playBase64Audio(base64Audio: string) {
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`)
    audio.play()
}

/**
 * Speech-to-Text using Sarvam Saarika
 * Supports: 22 Indian languages with auto-detection
 * Cost: ₹30 per hour of audio
 */
export async function sarvamSTT(
    audioBlob: Blob,
    languageCode?: string
): Promise<{ transcript: string; language: string }> {
    const apiKey = getApiKey()
    if (!apiKey) throw new Error("Sarvam API key not configured")

    const formData = new FormData()
    formData.append("file", audioBlob, "audio.wav")
    if (languageCode) {
        formData.append("language_code", languageCode)
    }
    formData.append("model", "saarika:v2")

    const res = await fetch(`${SARVAM_BASE}/speech-to-text`, {
        method: "POST",
        headers: {
            "api-subscription-key": apiKey,
        },
        body: formData,
    })

    const data = await res.json()
    return {
        transcript: data?.transcript || "",
        language: data?.language_code || languageCode || "unknown",
    }
}
