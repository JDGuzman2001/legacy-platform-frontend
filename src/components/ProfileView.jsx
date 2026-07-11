import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useUpdateProfile } from '@/hooks/useProfileQueries'
import { cn } from '@/lib/utils'

const textareaClassName = cn(
  'w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
)

export default function ProfileView({ profile, accessToken }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name)
  const [biography, setBiography] = useState(profile.biography)
  const [personality, setPersonality] = useState(profile.personality)
  const [lifeStory, setLifeStory] = useState(profile.life_story)

  const updateProfile = useUpdateProfile(accessToken)

  function startEditing() {
    setName(profile.name)
    setBiography(profile.biography)
    setPersonality(profile.personality)
    setLifeStory(profile.life_story)
    setEditing(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await updateProfile.mutateAsync({
      profileId: profile.id,
      fields: { name, biography, personality, life_story: lifeStory },
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update this person's details.</CardDescription>
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
            {updateProfile.isError && (
              <p className="text-sm text-destructive">{updateProfile.error.message}</p>
            )}
          </CardContent>
          <CardFooter className="pt-5 gap-2">
            <Button type="submit" disabled={updateProfile.isPending} className="w-full">
              {updateProfile.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={updateProfile.isPending}
              onClick={() => setEditing(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{profile.name}</CardTitle>
        <CardDescription>Profile details</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Biography</p>
          <p className="text-sm mt-1 whitespace-pre-wrap">{profile.biography}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Personality</p>
          <p className="text-sm mt-1 whitespace-pre-wrap">{profile.personality}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Life story</p>
          <p className="text-sm mt-1 whitespace-pre-wrap">{profile.life_story}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={startEditing} className="w-full">
          Edit profile
        </Button>
      </CardFooter>
    </Card>
  )
}
