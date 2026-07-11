import { useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 120

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function AvatarSetupForm({ profileId, accessToken, onCompleted }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('idle')
  const cancelledRef = useRef(false)

  function handleFileChange(e) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return

    setError(null)
    cancelledRef.current = false

    try {
      setPhase('uploading')
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(`${API_BASE}/api/v1/profiles/${profileId}/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail || 'Failed to submit avatar photo')
      }

      const { face_id } = await res.json()

      setPhase('processing')
      for (let i = 0; i < MAX_POLLS; i++) {
        if (cancelledRef.current) return
        await wait(POLL_INTERVAL_MS)

        const statusRes = await fetch(
          `${API_BASE}/api/v1/profiles/${profileId}/avatar/status?face_id=${encodeURIComponent(face_id)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        if (!statusRes.ok) {
          const data = await statusRes.json().catch(() => null)
          throw new Error(data?.detail || 'Failed to check avatar status')
        }

        const { status, profile } = await statusRes.json()
        if (status === 'completed' && profile) {
          setPhase('done')
          onCompleted?.(profile)
          return
        }
        if (status === 'failed' || status === 'error') {
          throw new Error('Avatar generation failed')
        }
      }

      throw new Error('Avatar generation timed out. Try checking back later.')
    } catch (err) {
      setError(err.message)
      setPhase('idle')
    }
  }

  const submitting = phase === 'uploading' || phase === 'processing'

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set up an avatar</CardTitle>
        <CardDescription>Upload a photo to generate this profile's talking avatar.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={submitting}
            required
            className="text-sm text-muted-foreground file:mr-3 file:rounded-3xl file:border-0 file:bg-input/50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
          />
          {previewUrl && (
            <img src={previewUrl} alt="Avatar preview" className="w-full max-h-64 object-cover rounded-2xl" />
          )}
          {phase === 'processing' && (
            <p className="text-sm text-muted-foreground">Generating avatar… this can take a while.</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!file || submitting} className="w-full">
            {phase === 'uploading' ? 'Uploading…' : phase === 'processing' ? 'Processing…' : 'Generate avatar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
