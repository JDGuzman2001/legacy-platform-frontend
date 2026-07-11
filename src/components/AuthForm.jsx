import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function AuthForm() {
  const { signInWithPassword, signUp } = useAuth()
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const { error } = mode === 'sign-in'
      ? await signInWithPassword(email, password)
      : await signUp(email, password)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    if (mode === 'sign-up') {
      setInfo('Check your email to confirm your account, then sign in.')
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{mode === 'sign-in' ? 'Sign in' : 'Create an account'}</CardTitle>
        <CardDescription>
          {mode === 'sign-in' ? 'Sign in to access your profiles.' : 'Sign up to create your first profile.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-muted-foreground">{info}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-stretch pt-5">
          <Button type="submit" disabled={submitting}>
            {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
              setError(null)
              setInfo(null)
            }}
          >
            {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
