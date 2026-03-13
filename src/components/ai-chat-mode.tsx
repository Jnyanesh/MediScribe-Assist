"use client"

import { useState } from "react"
import { Send, Brain, Lightbulb, AlertCircle, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Patient } from "@/types/medical"

interface AiChatModeProps {
    selectedPatient: Patient
    aiAvailable: boolean
}

interface ChatMessage {
    id: string
    sender: "doctor" | "ai" | "system"
    content: string
    timestamp: string
    type?: "suggestion" | "analysis" | "warning" | "info"
}

export function AiChatMode({ selectedPatient, aiAvailable }: AiChatModeProps) {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            sender: "system",
            content: "MediScribe AI is ready to assist with patient consultation.",
            timestamp: new Date().toLocaleTimeString(),
        },
        {
            id: "2",
            sender: "ai",
            content: `Hello! I'm ready to help with ${selectedPatient.name}'s consultation. I can analyze symptoms, suggest differential diagnoses, review medication interactions, and recommend appropriate tests. How can I assist you today?`,
            timestamp: new Date().toLocaleTimeString(),
            type: "info",
        },
    ])
    const [isTyping, setIsTyping] = useState(false)

    const suggestedQuestions = [
        "Analyze patient symptoms",
        "Suggest differential diagnosis",
        "Review medication interactions",
        "Recommend lab tests",
        "Check treatment guidelines",
        "Assess risk factors",
    ]

    const handleSendMessage = async () => {
        if (!message.trim() || !aiAvailable) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: "doctor",
            content: message.trim(),
            timestamp: new Date().toLocaleTimeString(),
        }

        setMessages((prev) => [...prev, userMessage])
        setMessage("")
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const aiResponses = [
                {
                    content:
                        "Based on the symptoms of chest pain and shortness of breath, I recommend considering cardiovascular and pulmonary causes. Key differentials include: 1) Acute coronary syndrome 2) Pulmonary embolism 3) Pneumonia 4) Anxiety disorder. Given the patient's history of hypertension, cardiac evaluation should be prioritized.",
                    type: "analysis" as const,
                },
                {
                    content:
                        "I suggest ordering the following tests: 1) ECG (immediate) 2) Chest X-ray 3) Complete blood count 4) Basic metabolic panel 5) Troponin levels 6) D-dimer if PE suspected. These will help rule out serious conditions.",
                    type: "suggestion" as const,
                },
                {
                    content:
                        "⚠️ Important: Given the patient's age and hypertension history, chest pain should be evaluated urgently. Consider immediate cardiac monitoring and have emergency protocols ready.",
                    type: "warning" as const,
                },
                {
                    content:
                        "The patient's current medications appear compatible. However, if starting new cardiac medications, monitor for interactions with existing hypertension treatment. Consider consulting cardiology if symptoms persist.",
                    type: "info" as const,
                },
            ]

            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
            // const aiMessage: ChatMessage = {
            //     id: (Date.now() + 1).toString(),
            //     sender: "ai",
            //     content: randomResponse.content,
            //     timestamp: new Date().toLocaleTimeString(),
            //     type: randomResponse.type,
            // }

            // setMessages((prev) => [...prev, aiMessage])
            setIsTyping(false)
        }, 2000)
    }

    const handleSuggestedQuestion = (question: string) => {
        setMessage(question)
    }

    const getMessageIcon = (type?: string) => {
        switch (type) {
            case "suggestion":
                return <Lightbulb className="w-4 h-4 text-yellow-600" />
            case "analysis":
                return <TrendingUp className="w-4 h-4 text-blue-600" />
            case "warning":
                return <AlertCircle className="w-4 h-4 text-red-600" />
            case "info":
                return <Brain className="w-4 h-4 text-purple-600" />
            default:
                return null
        }
    }

    const getMessageColor = (type?: string) => {
        switch (type) {
            case "suggestion":
                return "border-l-yellow-400 bg-yellow-50"
            case "analysis":
                return "border-l-blue-400 bg-blue-50"
            case "warning":
                return "border-l-red-400 bg-red-50"
            case "info":
                return "border-l-purple-400 bg-purple-50"
            default:
                return "border-l-slate-400 bg-slate-50"
        }
    }

    return (
        <div className="h-full flex flex-col bg-purple-50/30">
            {/* AI Status */}
            <div className="p-4 border-b border-purple-200 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-900">MediScribe AI</span>
                        </div>
                        {/*<Badge className={`${aiAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>*/}
                        {/*    {aiAvailable ? "Online" : "Offline"}*/}
                        {/*</Badge>*/}
                    </div>
                    {/*<Badge variant="outline" className="text-xs">*/}
                    {/*    GPT-4 Medical*/}
                    {/*</Badge>*/}
                </div>
            </div>

            {/* Suggested Questions */}
            <div className="p-4 border-b border-purple-200 bg-purple-50/50">
                <h4 className="text-sm font-medium text-purple-900 mb-2">Suggested Questions</h4>
                <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs bg-white hover:bg-purple-100 border-purple-200"
                            onClick={() => handleSuggestedQuestion(question)}
                        >
                            {question}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                                    msg.sender === "doctor"
                                        ? "bg-blue-600 text-white"
                                        : msg.sender === "ai"
                                            ? `bg-white border-l-4 ${getMessageColor(msg.type)}`
                                            : "bg-green-100 text-green-800 text-center border border-green-200"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium opacity-75">
                      {msg.sender === "doctor" ? "Dr. Smith" : msg.sender === "ai" ? "MediScribe AI" : "System"}
                    </span>
                                        {msg.type && getMessageIcon(msg.type)}
                                    </div>
                                    <span className="text-xs opacity-75">{msg.timestamp}</span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border-l-4 border-l-purple-400 bg-purple-50 rounded-lg p-3 shadow-sm">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                    <span className="text-sm text-purple-700">MediScribe AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-purple-200 bg-white/80 backdrop-blur-sm">
                <div className="flex space-x-2">
                    <Input
                        placeholder="Ask MediScribe AI..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                        disabled={!aiAvailable}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || !aiAvailable || isTyping}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {/*{isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}*/}
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Press Enter to send • AI responses are for reference only</p>
            </div>
        </div>
    )
}
