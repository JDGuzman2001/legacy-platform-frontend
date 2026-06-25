import { useRef, useState, useCallback } from 'react'
import { SimliClient, generateSimliSessionToken, generateIceServers } from 'simli-client'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const SIMLI_API_KEY = import.meta.env.VITE_SIMLI_API_KEY || ''

const Status = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  READY: 'ready',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  ERROR: 'error',
}

export default function SimliChat({ profileId }) {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const simliClientRef = useRef(null)
  const chunksRef = useRef([])

  const [status, setStatus] = useState(Status.IDLE)
  const [transcript, setTranscript] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(null)

  const startSession = useCallback(async (faceId) => {
    const { session_token } = await generateSimliSessionToken({
      config: {
        faceId,
        handleSilence: true,
        maxSessionLength: 600,
        maxIdleTime: 120,
      },
      apiKey: SIMLI_API_KEY,
    })

    const iceServers = await generateIceServers(SIMLI_API_KEY)

    const client = new SimliClient(
      session_token,
      videoRef.current,
      audioRef.current,
      iceServers,
    )

    simliClientRef.current = client
    await client.start()
  }, [])

  const connect = useCallback(async () => {
    setStatus(Status.CONNECTING)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/v1/profiles/${profileId}`)
      if (!res.ok) throw new Error('Profile not found')
      const profile = await res.json()
      if (!profile.simli_face_id) throw new Error('Profile has no simli_face_id configured')

      await startSession(profile.simli_face_id)
      setStatus(Status.READY)
    } catch (err) {
      setError(err.message)
      setStatus(Status.ERROR)
    }
  }, [profileId, startSession])

  const disconnect = useCallback(async () => {
    if (simliClientRef.current) {
      await simliClientRef.current.stop()
      simliClientRef.current = null
    }
    setStatus(Status.IDLE)
    setTranscript('')
    setAnswer('')
    setError(null)
  }, [])

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunksRef.current = []
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    recorder.start()
    mediaRecorderRef.current = recorder
    setStatus(Status.RECORDING)
  }, [])

  const stopRecordingAndSend = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    recorder.onstop = async () => {
      setStatus(Status.PROCESSING)
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio_file', blob, 'audio.webm')

        const res = await fetch(`${API_BASE}/api/v1/profiles/${profileId}/simli-chat`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()

        setTranscript(data.transcript)
        setAnswer(data.answer)

        const pcmBinary = atob(data.audio_pcm_b64)
        const pcmBuffer = new Uint8Array(pcmBinary.length)
        for (let i = 0; i < pcmBinary.length; i++) {
          pcmBuffer[i] = pcmBinary.charCodeAt(i)
        }
        simliClientRef.current?.sendAudioData(pcmBuffer)

        setStatus(Status.READY)
      } catch (err) {
        setError(err.message)
        setStatus(Status.ERROR)
      }
    }

    recorder.stop()
    recorder.stream.getTracks().forEach((t) => t.stop())
  }, [profileId])

  const isActive = status !== Status.IDLE && status !== Status.ERROR

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Video feed */}
      <div className="relative w-full max-w-xl aspect-video bg-muted rounded-xl overflow-hidden shadow-md flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full"
        />
        <audio ref={audioRef} autoPlay className="hidden" />

        {/* Overlay states */}
        {status === Status.IDLE && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-muted-foreground/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Avatar not connected</p>
          </div>
        )}

        {status === Status.CONNECTING && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Connecting…</p>
            </div>
          </div>
        )}

        {status === Status.PROCESSING && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs text-foreground">Processing…</span>
            </div>
          </div>
        )}

        {status === Status.RECORDING && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="bg-destructive/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs text-white">Recording…</span>
            </div>
          </div>
        )}

        {status === Status.ERROR && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 backdrop-blur-sm px-6">
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {status === Status.IDLE && (
          <button
            onClick={connect}
            className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Connect Avatar
          </button>
        )}

        {status === Status.ERROR && (
          <button
            onClick={connect}
            className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        )}

        {status === Status.READY && (
          <button
            onMouseDown={startRecording}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4z" />
              <path d="M19 11a1 1 0 00-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7 7 0 0014 0z" />
            </svg>
            Hold to Talk
          </button>
        )}

        {status === Status.RECORDING && (
          <button
            onMouseUp={stopRecordingAndSend}
            onTouchEnd={stopRecordingAndSend}
            className="bg-destructive hover:bg-destructive/90 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 animate-pulse"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Release to Send
          </button>
        )}

        {isActive && status !== Status.RECORDING && (
          <button
            onClick={disconnect}
            className="border border-input rounded-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Transcript */}
      {(transcript || answer) && (
        <div className="w-full max-w-xl bg-muted/50 rounded-xl p-4 flex flex-col gap-3 text-sm">
          {transcript && (
            <div className="flex gap-2">
              <span className="text-muted-foreground shrink-0">You:</span>
              <p className="text-foreground">{transcript}</p>
            </div>
          )}
          {answer && (
            <div className="flex gap-2">
              <span className="text-muted-foreground shrink-0">Avatar:</span>
              <p className="text-foreground">{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
