import { useState } from 'react'
import SimliChat from './components/SimliChat'

const DEMO_PROFILE_ID = import.meta.env.VITE_DEMO_PROFILE_ID || 'e7e4e34a-b5ff-4afb-ad1d-af6a612fae9e'

export default function App() {
  const [profileId, setProfileId] = useState(DEMO_PROFILE_ID)
  const [inputValue, setInputValue] = useState(DEMO_PROFILE_ID)
  const [started, setStarted] = useState(false)

  function handleStart(e) {
    e.preventDefault()
    if (inputValue.trim()) {
      setProfileId(inputValue.trim())
      setStarted(true)
    }
  }

  function handleReset() {
    setStarted(false)
    setProfileId('')
    setInputValue(DEMO_PROFILE_ID)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Legacy Platform</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Speak with a person through their biography, memories, and personality.
        </p>
      </div>

      {!started ? (
        <form onSubmit={handleStart} className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium" htmlFor="profile-id">
              Profile ID
            </label>
            <input
              id="profile-id"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter profile UUID"
              className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            Start Conversation
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
          <SimliChat profileId={profileId} />
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Change profile
          </button>
        </div>
      )}
    </div>
  )
}
