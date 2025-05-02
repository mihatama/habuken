"use client"

import { useState, useEffect, useCallback } from "react"

interface UseSpeechRecognitionProps {
  onResult: (text: string) => void
}

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = "ja-JP"
        setRecognition(rec)
      } else {
        console.warn("Speech Recognition API is not supported in this browser.")
      }
    }
  }, [])

  const startRecording = useCallback(
    (id: number, onResult: (text: string) => void) => {
      if (!recognition) {
        console.warn("Speech Recognition not initialized.")
        return
      }

      setIsRecording(true)
      setActiveId(id)

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")
        onResult(transcript)
        setIsRecording(false)
        setActiveId(null)
      }

      recognition.onerror = (event: any) => {
        console.error("Recognition error:", event.error)
        setIsRecording(false)
        setActiveId(null)
      }

      recognition.onend = () => {
        setIsRecording(false)
        setActiveId(null)
      }

      recognition.start()
    },
    [recognition],
  )

  const stopRecording = useCallback(() => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsRecording(false)
      setActiveId(null)
    }
  }, [recognition, isRecording])

  return { isRecording, activeId, startRecording, stopRecording }
}
