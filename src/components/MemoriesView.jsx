import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { useMemories, useCreateMemory, useUpdateMemory } from '@/hooks/useProfileQueries'
import { cn } from '@/lib/utils'

const textareaClassName = cn(
  'w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
)

function MemoryCard({ memory, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(memory.title)
  const [content, setContent] = useState(memory.content)

  function startEditing() {
    setTitle(memory.title)
    setContent(memory.content)
    setEditing(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSave({ title, content })
    setEditing(false)
  }

  if (editing) {
    return (
      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-3 pt-6">
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className={textareaClassName}
              placeholder="Content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
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
    <Card>
      <CardHeader>
        <CardTitle>{memory.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{memory.content}</p>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="outline" onClick={startEditing} className="w-full">
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function MemoriesView({ profileId, accessToken }) {
  const { data: memories = [], isLoading, error: loadError } = useMemories(profileId, accessToken)
  const createMemory = useCreateMemory(profileId, accessToken)
  const updateMemory = useUpdateMemory(profileId, accessToken)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    await createMemory.mutateAsync({ title, content })
    setTitle('')
    setContent('')
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add a memory</CardTitle>
          <CardDescription>Add a new memory for this profile.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className={textareaClassName}
              placeholder="Content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            {createMemory.isError && (
              <p className="text-sm text-destructive">{createMemory.error.message}</p>
            )}
          </CardContent>
          <CardFooter className="pt-5">
            <Button type="submit" disabled={createMemory.isPending} className="w-full">
              {createMemory.isPending ? 'Adding…' : 'Add memory'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          <span>Loading memories…</span>
        </div>
      )}

      {loadError && <p className="text-sm text-destructive">{loadError.message}</p>}

      {!isLoading && memories.length === 0 && (
        <p className="text-sm text-muted-foreground">No memories yet.</p>
      )}

      {!isLoading &&
        memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            saving={updateMemory.isPending}
            onSave={(fields) => updateMemory.mutateAsync({ memoryId: memory.id, fields })}
          />
        ))}
    </div>
  )
}
