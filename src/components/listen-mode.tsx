"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Patient } from "@/types/medical"
import { Mic, MicOff, Globe, Stethoscope, User, Volume2, VolumeX, Send, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ListenModeProps {
    selectedPatient: Patient
    isRecording: boolean
    onToggleRecording: () => void
    onResetSession: () => void
}

interface ChatMessage {
    id: string
    speaker: "system" | "patient" | "doctor"
    text: string
    translation?: string
    timestamp: string
    langCode?: string
}

const LANGUAGES: Record<string, string> = {
    "en-IN": "English (Patient)",
    "hi-IN": "Hindi",
    "kn-IN": "Kannada",
    "te-IN": "Telugu",
    "ml-IN": "Malayalam",
    "ta-IN": "Tamil",
    "bn-IN": "Bengali",
    "mr-IN": "Marathi",
    "gu-IN": "Gujarati",
}

// Maps BCP-47 language prefix to SpeechSynthesis voice language
const TTS_LANG_MAP: Record<string, string> = {
    "en": "en-US",
    "hi": "hi-IN",
    "kn": "kn-IN",
    "te": "te-IN",
    "ml": "ml-IN",
    "ta": "ta-IN",
    "bn": "bn-IN",
    "mr": "mr-IN",
    "gu": "gu-IN",
}

// In-memory translation cache to avoid redundant API calls and save credits
const translationCache = new Map<string, string>()

// Free translation using MyMemory API (no key needed, 5000 words/day)
// With caching: same phrase is never translated twice!
async function translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    // Don't translate if same language
    if (fromLang === toLang) return text
    
    // Check cache first
    const cacheKey = `${fromLang}|${toLang}|${text.toLowerCase().trim()}`
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!
    }
    
    try {
        const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
        )
        const data = await res.json()
        if (data?.responseData?.translatedText) {
            const translated = data.responseData.translatedText
            translationCache.set(cacheKey, translated) // Cache it!
            return translated
        }
        return "(Translation unavailable)"
    } catch {
        return "(Translation unavailable offline)"
    }
}

// Speak translated text aloud using browser TTS (free, no API key)
function speakText(text: string, langCode: string, enabled: boolean) {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = TTS_LANG_MAP[langCode] || langCode
    utterance.rate = 0.9
    utterance.pitch = 1.0
    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.lang.startsWith(langCode))
    if (match) utterance.voice = match
    window.speechSynthesis.speak(utterance)
}

export function ListenMode({ selectedPatient, isRecording, onToggleRecording, onResetSession }: ListenModeProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            speaker: "system",
            text: "Consultation started. Use the Doctor mic (English) or Patient mic (regional language). You can also type text below if mic is unavailable.",
            timestamp: new Date().toLocaleTimeString(),
        },
    ])
    
    const [doctorLang, setDoctorLang] = useState("en-IN")
    const [patientLang, setPatientLang] = useState("hi-IN")
    const [liveTranscript, setLiveTranscript] = useState("")
    const [activeSpeaker, setActiveSpeaker] = useState<"doctor" | "patient" | null>(null)
    const [ttsEnabled, setTtsEnabled] = useState(true)
    const [showTextInput, setShowTextInput] = useState(false)
    const [textInput, setTextInput] = useState("")
    const [textSpeaker, setTextSpeaker] = useState<"doctor" | "patient">("doctor")
    
    const recognitionRef = useRef<any>(null)
    const activeSpeakerRef = useRef<"doctor" | "patient" | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Keep ref in sync
    useEffect(() => {
        activeSpeakerRef.current = activeSpeaker
    }, [activeSpeaker])

    // Load voices
    useEffect(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.getVoices()
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
        }
    }, [])

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, liveTranscript])

    // Cleanup recognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop() } catch(e) {}
                recognitionRef.current = null
            }
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    // Process a final transcript (from mic OR text input)
    const processTranscript = useCallback((transcript: string, speaker: "doctor" | "patient") => {
        const doctorLangCode = doctorLang.split("-")[0]
        const patientLangCode = patientLang.split("-")[0]
        const langCode = speaker === "doctor" ? doctorLangCode : patientLangCode
        const msgId = Date.now().toString() + Math.random()
        
        setMessages(prev => [...prev, {
            id: msgId,
            speaker,
            text: transcript,
            translation: doctorLangCode === patientLangCode ? undefined : "⏳ Translating...",
            timestamp: new Date().toLocaleTimeString(),
            langCode,
        }])

        // Save to localStorage for SummaryMode
        const existing = localStorage.getItem("current_transcript") || ""
        const label = speaker === "doctor" ? "Doctor" : "Patient"
        localStorage.setItem("current_transcript", existing + `\n[${label}]: ` + transcript)

        // Skip translation if both speak same language
        if (doctorLangCode === patientLangCode) return

        // Translate + TTS
        const fromLang = speaker === "doctor" ? doctorLangCode : patientLangCode
        const toLang = speaker === "doctor" ? patientLangCode : doctorLangCode
        
        translateText(transcript, fromLang, toLang).then(translated => {
            setMessages(prev => prev.map(m => 
                m.id === msgId ? { ...m, translation: translated } : m
            ))
            speakText(translated, toLang, ttsEnabled)
        })
    }, [doctorLang, patientLang, ttsEnabled])

    const startListening = useCallback((speaker: "doctor" | "patient") => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop() } catch(e) {}
            recognitionRef.current = null
        }

        if (typeof window === "undefined") return

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                speaker: "system",
                text: "⚠️ Speech API not available. Use the text input below instead (click ⌨️).",
                timestamp: new Date().toLocaleTimeString(),
            }])
            setShowTextInput(true)
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = speaker === "doctor" ? doctorLang : patientLang

        recognition.onresult = (event: any) => {
            let interimText = ""
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    setLiveTranscript("")
                    processTranscript(transcript, speaker)
                } else {
                    interimText += transcript
                }
            }
            if (interimText) {
                setLiveTranscript(interimText)
            }
        }

        recognition.onend = () => {
            if (activeSpeakerRef.current === speaker && recognitionRef.current) {
                setTimeout(() => {
                    try {
                        if (activeSpeakerRef.current === speaker && recognitionRef.current) {
                            recognitionRef.current.start()
                        }
                    } catch(e) {}
                }, 300)
            }
        }

        recognition.onerror = (event: any) => {
            if (event.error === "aborted" || event.error === "no-speech") return
            if (event.error === "not-allowed") {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    speaker: "system",
                    text: "🚫 Microphone blocked! Use the text input (⌨️) or allow mic permissions in your browser.",
                    timestamp: new Date().toLocaleTimeString(),
                }])
                setShowTextInput(true)
                stopListening()
            }
        }

        recognitionRef.current = recognition
        setActiveSpeaker(speaker)
        setLiveTranscript("")

        try {
            recognition.start()
        } catch (e) {
            console.error("Failed to start recognition:", e)
        }
    }, [patientLang, processTranscript])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop() } catch(e) {}
            recognitionRef.current = null
        }
        setActiveSpeaker(null)
        setLiveTranscript("")
    }, [])

    const toggleSpeaker = (speaker: "doctor" | "patient") => {
        if (activeSpeaker === speaker) {
            stopListening()
        } else {
            startListening(speaker)
        }
    }

    // Handle text input submission (fallback when mic doesn't work)
    const handleTextSubmit = () => {
        if (!textInput.trim()) return
        processTranscript(textInput.trim(), textSpeaker)
        setTextInput("")
    }

    return (
        <div className="relative h-full flex flex-col bg-gradient-to-b from-slate-50 to-blue-50/30">
            {/* Header - Dual Language Selectors */}
            <div className="p-3 border-b bg-white/90 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    {/* Doctor Language */}
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">Doctor</span>
                        <Select value={doctorLang} onValueChange={setDoctorLang} disabled={activeSpeaker !== null}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(LANGUAGES).map(([code, name]) => (
                                    <SelectItem key={code} value={code}>{name.replace(" (Patient)", "")}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Controls */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setTtsEnabled(!ttsEnabled)}
                            className={`rounded-full w-8 h-8 p-0 ${ttsEnabled ? "text-blue-600" : "text-slate-400"}`}
                            title={ttsEnabled ? "Voice output ON" : "Voice output OFF"}>
                            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowTextInput(!showTextInput)}
                            className={`rounded-full w-8 h-8 p-0 ${showTextInput ? "text-blue-600 bg-blue-50" : "text-slate-400"}`}
                            title="Toggle text input">
                            <Keyboard className="w-4 h-4" />
                        </Button>
                    </div>
                    {/* Patient Language */}
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Patient</span>
                        <Select value={patientLang} onValueChange={setPatientLang} disabled={activeSpeaker !== null}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(LANGUAGES).map(([code, name]) => (
                                    <SelectItem key={code} value={code}>{name.replace(" (Patient)", "")}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-40" ref={scrollRef}>
                <div className="space-y-4 max-w-2xl mx-auto">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${
                            message.speaker === "system" ? "justify-center" : 
                            message.speaker === "doctor" ? "justify-end" : "justify-start"
                        }`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                                message.speaker === "system" 
                                    ? "bg-amber-50 text-amber-800 text-center text-sm border-amber-100" : 
                                message.speaker === "doctor" 
                                    ? "bg-blue-500 text-white border-blue-400 rounded-br-md" : 
                                    "bg-white text-slate-800 border-slate-200 rounded-bl-md shadow-md"
                            }`}>
                                {message.speaker !== "system" && (
                                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                                        message.speaker === "doctor" ? "border-blue-400/30" : "border-slate-100"
                                    }`}>
                                        {message.speaker === "doctor" 
                                            ? <Stethoscope className="w-4 h-4" /> 
                                            : <User className="w-4 h-4 text-emerald-600" />
                                        }
                                        <span className={`text-xs font-bold uppercase tracking-wider ${
                                            message.speaker === "doctor" ? "text-blue-100" : "text-emerald-600"
                                        }`}>
                                            {message.speaker === "doctor" ? `Doctor (${LANGUAGES[doctorLang]?.replace(" (Patient)", "") || "English"})` : `Patient (${LANGUAGES[patientLang]?.replace(" (Patient)", "") || "Regional"})`}
                                        </span>
                                        <span className={`text-xs ml-auto ${
                                            message.speaker === "doctor" ? "text-blue-200" : "opacity-40"
                                        }`}>{message.timestamp}</span>
                                    </div>
                                )}
                                <div className="text-[15px] leading-relaxed">
                                    {message.text}
                                </div>
                                {message.translation && (
                                    <div className={`text-sm mt-3 pt-3 border-t border-dashed rounded-lg p-2.5 flex items-start gap-2 ${
                                        message.speaker === "doctor" 
                                            ? "border-blue-400/30 bg-blue-600/30 text-blue-100 italic" 
                                            : "border-slate-200 bg-slate-50 text-slate-600 italic"
                                    }`}>
                                        <Globe className="w-3.5 h-3.5 mt-0.5 opacity-60 flex-shrink-0" />
                                        <span className="leading-relaxed">{message.translation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {liveTranscript && (
                        <div className={`flex ${activeSpeaker === "doctor" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border animate-pulse ${
                                activeSpeaker === "doctor" 
                                    ? "bg-blue-400/80 text-white border-blue-300 rounded-br-md" 
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 rounded-bl-md"
                            }`}>
                                <div className="text-[15px] italic">{liveTranscript}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Text Input Fallback (shown when keyboard icon clicked) */}
            {showTextInput && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-xl px-4 py-3 rounded-xl bg-white shadow-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500">Type as:</span>
                        <Button
                            size="sm"
                            variant={textSpeaker === "doctor" ? "default" : "outline"}
                            className="text-xs h-7 px-3"
                            onClick={() => setTextSpeaker("doctor")}
                        >
                            🩺 Doctor
                        </Button>
                        <Button
                            size="sm"
                            variant={textSpeaker === "patient" ? "default" : "outline"}
                            className="text-xs h-7 px-3"
                            onClick={() => setTextSpeaker("patient")}
                        >
                            👤 Patient
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
                            placeholder={textSpeaker === "doctor" ? `Type in ${LANGUAGES[doctorLang]?.replace(" (Patient)", "") || "English"}...` : `Type in ${LANGUAGES[patientLang]?.replace(" (Patient)", "") || "regional language"}...`}
                            className="flex-1"
                        />
                        <Button onClick={handleTextSubmit} disabled={!textInput.trim()} className="bg-blue-600 hover:bg-blue-700">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dual Microphone Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white/95 shadow-xl backdrop-blur-sm border border-slate-200">
                <div className="flex items-center gap-6">
                    {/* Doctor Mic */}
                    <div className="flex flex-col items-center gap-1">
                        <Button
                            onClick={() => toggleSpeaker("doctor")}
                            size="lg"
                            className={`rounded-full w-14 h-14 transition-all duration-200 ${
                                activeSpeaker === "doctor" 
                                    ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200" 
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {activeSpeaker === "doctor" ? <MicOff className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                        </Button>
                        <span className={`text-xs font-semibold ${activeSpeaker === "doctor" ? "text-red-600" : "text-blue-700"}`}>
                            {activeSpeaker === "doctor" ? "Stop" : "Doctor"}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="h-12 w-px bg-slate-200" />

                    {/* Patient Mic */}
                    <div className="flex flex-col items-center gap-1">
                        <Button
                            onClick={() => toggleSpeaker("patient")}
                            size="lg"
                            className={`rounded-full w-14 h-14 transition-all duration-200 ${
                                activeSpeaker === "patient" 
                                    ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200" 
                                    : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                        >
                            {activeSpeaker === "patient" ? <MicOff className="w-6 h-6" /> : <User className="w-6 h-6" />}
                        </Button>
                        <span className={`text-xs font-semibold ${activeSpeaker === "patient" ? "text-red-600" : "text-emerald-700"}`}>
                            {activeSpeaker === "patient" ? "Stop" : "Patient"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
