"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
}

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false)
  const [activeId, setActiveId] = useState<string | number | null>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  // 音声認識の停止
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      setActiveId(null)
      toast({
        title: "音声認識停止",
        description: "音声認識を停止しました。",
      })
    }
  }, [toast])

  // 音声認識の開始
  const startRecording = useCallback(
    (id: string | number, onTranscript: (text: string) => void) => {
      if (!("webkitSpeechRecognition" in window)) {
        toast({
          title: "非対応",
          description: "お使いのブラウザは音声認識をサポートしていません。",
          variant: "destructive",
        })
        return
      }

      try {
        // 既に録音中の場合は停止
        if (isRecording) {
          stopRecording()
        }

        // 新しい音声認識インスタンスを作成
        const SpeechRecognition = window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.lang = "ja-JP"
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }

          if (finalTranscript) {
            onTranscript(finalTranscript)
          }
        }

        recognitionRef.current.onerror = () => {
          setIsRecording(false)
          setActiveId(null)
          toast({
            title: "音声認識エラー",
            description: "音声認識中にエラーが発生しました。",
            variant: "destructive",
          })
        }

        recognitionRef.current.start()
        setIsRecording(true)
        setActiveId(id)
        toast({
          title: "音声認識開始",
          description: "音声認識を開始しました。話してください。",
        })
      } catch (error) {
        console.error("音声認識の初期化エラー:", error)
        toast({
          title: "音声認識エラー",
          description: "音声認識の初期化に失敗しました。",
          variant: "destructive",
        })
      }
    },
    [isRecording, stopRecording, toast],
  )

  // コンポーネントがアンマウントされるときに音声認識を停止
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    isRecording,
    activeId,
    startRecording,
    stopRecording,
  }
}
