import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const textareaClassName = cn(
  'w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
)

export default function CreateProfileForm({ accessToken, onCreated }) {
  const [name, setName] = useState('')
  const [biography, setBiography] = useState('')
  const [personality, setPersonality] = useState('')
  const [lifeStory, setLifeStory] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/api/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          biography,
          personality,
          life_story: lifeStory,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail || 'Failed to create profile')
      }

      const profile = await res.json()
      onCreated?.(profile)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create a profile</CardTitle>
        <CardDescription>Tell us about the person you'd like to bring to this platform.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className={textareaClassName}
            placeholder="Biography"
            rows={3}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            required
          />
          <textarea
            className={textareaClassName}
            placeholder="Personality"
            rows={3}
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            required
          />
          <textarea
            className={textareaClassName}
            placeholder="Life story"
            rows={3}
            value={lifeStory}
            onChange={(e) => setLifeStory(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="pt-5">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Creating…' : 'Create profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
