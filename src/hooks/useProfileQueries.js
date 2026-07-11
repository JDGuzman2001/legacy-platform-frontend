import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function parseErrorOrThrow(res, fallbackMessage) {
  if (res.ok) return
  const data = await res.json().catch(() => null)
  throw new Error(data?.detail || fallbackMessage)
}

export function useMyProfiles(accessToken) {
  return useQuery({
    queryKey: ['profiles', 'me'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/profiles/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      await parseErrorOrThrow(res, 'Failed to load profiles')
      return res.json()
    },
    enabled: !!accessToken,
  })
}

export function useUpdateProfile(accessToken) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ profileId, fields }) => {
      const res = await fetch(`${API_BASE}/api/v1/profiles/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(fields),
      })
      await parseErrorOrThrow(res, 'Failed to update profile')
      return res.json()
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profiles', 'me'], (prev) =>
        (prev ?? []).map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
      )
    },
  })
}

export function useMemories(profileId, accessToken) {
  return useQuery({
    queryKey: ['memories', profileId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/profiles/${profileId}/memories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      await parseErrorOrThrow(res, 'Failed to load memories')
      return res.json()
    },
    enabled: !!profileId && !!accessToken,
  })
}

export function useCreateMemory(profileId, accessToken) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ title, content }) => {
      const res = await fetch(`${API_BASE}/api/v1/profiles/${profileId}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title, content }),
      })
      await parseErrorOrThrow(res, 'Failed to add memory')
      return res.json()
    },
    onSuccess: (memory) => {
      queryClient.setQueryData(['memories', profileId], (prev) => [memory, ...(prev ?? [])])
    },
  })
}

export function useUpdateMemory(profileId, accessToken) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memoryId, fields }) => {
      const res = await fetch(`${API_BASE}/api/v1/profiles/${profileId}/memories/${memoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(fields),
      })
      await parseErrorOrThrow(res, 'Failed to update memory')
      return res.json()
    },
    onSuccess: (updatedMemory) => {
      queryClient.setQueryData(['memories', profileId], (prev) =>
        (prev ?? []).map((m) => (m.id === updatedMemory.id ? updatedMemory : m))
      )
    },
  })
}
