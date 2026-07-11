import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import SimliChat from './components/SimliChat'
import AuthForm from './components/AuthForm'
import CreateProfileForm from './components/CreateProfileForm'
import AvatarSetupForm from './components/AvatarSetupForm'
import ProfileView from './components/ProfileView'
import MemoriesView from './components/MemoriesView'
import { Skeleton } from './components/ui/skeleton'
import { Spinner } from './components/ui/spinner'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './components/ui/sidebar'
import { useAuth } from './context/useAuth'
import { useMyProfiles } from './hooks/useProfileQueries'

export default function App() {
  const { session, user, accessToken, loading, signOut } = useAuth()
  const [activeView, setActiveView] = useState('chat')
  const queryClient = useQueryClient()

  const {
    data: profiles = [],
    isLoading: profilesLoading,
    error,
  } = useMyProfiles(accessToken)

  function setProfiles(data) {
    queryClient.setQueryData(['profiles', 'me'], data)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Legacy Platform</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Speak with a person through their biography, memories, and personality.
          </p>
        </div>
        <AuthForm />
      </div>
    )
  }

  const profile = profiles[0] ?? null

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <p className="px-2 text-sm font-semibold tracking-tight">Legacy Platform</p>
          <p className="px-2 text-xs text-muted-foreground truncate">{user.email}</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === 'chat'}
                    onClick={() => setActiveView('chat')}
                  >
                    <span>Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === 'profile'}
                    onClick={() => setActiveView('profile')}
                  >
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === 'memories'}
                    onClick={() => setActiveView('memories')}
                  >
                    <span>Memories</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut}>
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col items-center p-6 gap-8">
          <div className="flex items-center gap-2 self-start">
            <SidebarTrigger />
          </div>

          {profilesLoading && (
            <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                <span>Loading profile…</span>
              </div>
              <Skeleton className="h-80 w-full" />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error.message}</p>}

          {!profilesLoading && !profile && (
            <CreateProfileForm
              accessToken={accessToken}
              onCreated={(created) => setProfiles([created])}
            />
          )}

          {!profilesLoading && profile && !profile.simli_face_id && (
            <AvatarSetupForm
              profileId={profile.id}
              accessToken={accessToken}
              onCompleted={(updatedProfile) => setProfiles([updatedProfile])}
            />
          )}

          {!profilesLoading && profile && profile.simli_face_id && (
            <>
              {activeView === 'profile' && <ProfileView profile={profile} accessToken={accessToken} />}
              {activeView === 'memories' && (
                <MemoriesView profileId={profile.id} accessToken={accessToken} />
              )}
              {activeView === 'chat' && (
                <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
                  <SimliChat profileId={profile.id} accessToken={accessToken} />
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
