"use client"

import { useState, useEffect, useCallback } from "react"

interface UseSpeechRecognitionReturn {
  isRecording: boolean
  activeId: number | null
  startRecording: (id: number, onResult: (text: string) => void) => void
  stopRecording: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      const newRecognition = new SpeechRecognition()
      newRecognition.continuous = true
      newRecognition.interimResults = true
      newRecognition.lang = "ja-JP"
      setRecognition(newRecognition)
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [])

  // Start recording
  const startRecording = useCallback(
    (id: number, onResult: (text: string) => void) => {
      if (!recognition) {
        console.warn("Speech recognition is not supported in this browser")
        return
      }

      setIsRecording(true)
      setActiveId(id)

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")

        if (event.results[0].isFinal) {
          onResult(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsRecording(false)
        setActiveId(null)
      }

      recognition.onend = () => {
        if (isRecording) {
          recognition.start()
        }
      }

      recognition.start()
    },
    [recognition, isRecording],
  )

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop()
    }
    setIsRecording(false)
    setActiveId(null)
  }, [recognition])

  return {
    isRecording,
    activeId,
    startRecording,
    stopRecording,
  }
}
