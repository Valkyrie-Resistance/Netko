import type { ApiKey, ModelProvider } from '@netko/brain-domain'
import { ModelProviderEnum } from '@netko/brain-domain'
import { Avatar, AvatarFallback, AvatarImage } from '@netko/ui/components/shadcn/avatar'
import { Badge } from '@netko/ui/components/shadcn/badge'
import { Button } from '@netko/ui/components/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@netko/ui/components/shadcn/card'
import { Input } from '@netko/ui/components/shadcn/input'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
// import { Separator } from '@netko/ui/components/shadcn/separator'
import {
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  Cpu,
  EyeIcon,
  EyeOffIcon,
  Key,
  Loader2Icon,
  LogOut,
  Monitor,
  Palette,
  Paperclip,
  SaveIcon,
  SlidersHorizontal,
  Sparkles,
  TrashIcon,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { authClient } from '@/lib/auth'
import { trpcHttp } from '@/lib/trpc'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute({
  component: SettingsPage,
})

type SettingsSection =
  | 'profile'
  | 'providers'
  | 'models'
  | 'ai-options'
  | 'customization'
  | 'usage'
  | 'attachments'
  | 'appearance'

const navItems: { key: SettingsSection; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'providers', label: 'Providers', icon: Key },
  { key: 'models', label: 'Models', icon: Cpu },
  { key: 'ai-options', label: 'AI Options', icon: SlidersHorizontal },
  { key: 'customization', label: 'Customization', icon: Sparkles },
  { key: 'usage', label: 'Usage Analytics', icon: BarChart3 },
  { key: 'attachments', label: 'Attachments', icon: Paperclip },
  { key: 'appearance', label: 'Appearance', icon: Palette },
]

const providerConfig = {
  [ModelProviderEnum.OPENAI]: { name: 'OpenAI', icon: '🤖' },
  [ModelProviderEnum.OPENROUTER]: { name: 'OpenRouter', icon: '🌐' },
  [ModelProviderEnum.OLLAMA]: { name: 'Ollama', icon: '🦙' },
  [ModelProviderEnum.CUSTOM]: { name: 'Custom', icon: '⚡' },
} as const

function getModelCapabilities(name: string): string[] {
  const caps: string[] = []
  if (/gpt|claude|gemini/i.test(name)) caps.push('Function Calling')
  if (/gpt|claude|gemini|llama|qwen/i.test(name)) caps.push('PDF')
  if (/vision|gpt-4o|gemini|imagen|flash imagen|llava|llama-vision|qwen2-vl/i.test(name))
    caps.push('Vision')
  if (/flash|sonnet|deepseek|reason|r1|o3|qwen|cog/i.test(name)) caps.push('Reasoning')
  if (/sdxl|flux|image|imagen/i.test(name)) caps.push('Image generation')
  return caps
}

function SettingsPage() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [active, setActive] = useState<SettingsSection>('profile')

  // BYOK state (inline)
  const { data: apiKeys = [], refetch } = useQuery(trpcHttp.apiKeys.getApiKeys.queryOptions())
  const { data: llmModels = [] } = useQuery(trpcHttp.threads.getLLMModels.queryOptions())
  const {
    data: listedSessions = [],
    refetch: refetchSessions,
    isLoading: isSessionsLoading,
  } = useQuery({
    queryKey: ['auth-sessions'],
    queryFn: async () => {
      const result = await authClient.listSessions()
      // Normalize to array in case the client returns a wrapped object
      if (Array.isArray(result)) return result
      // @ts-ignore - handle potential shapes: { sessions: [...] } or { data: [...] }
      if (result && Array.isArray(result.sessions)) return result.sessions
      // @ts-ignore - some clients return { data: [...] }
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
  })
  const [keyValues, setKeyValues] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const apiKeysByProvider = useMemo(() => {
    const map: Partial<Record<ModelProvider, ApiKey>> = {}
    apiKeys.forEach((key: ApiKey) => {
      map[key.provider as ModelProvider] = {
        ...key,
        lastUsedAt: key.lastUsedAt ? new Date(key.lastUsedAt) : null,
        createdAt: new Date(key.createdAt),
      }
    })
    return map
  }, [apiKeys])

  // Initialize inputs from query
  useEffect(() => {
    const initialValues: Record<string, string> = {}
    for (const provider of Object.values(ModelProviderEnum)) {
      const existingKey = apiKeysByProvider[provider as ModelProvider]
      initialValues[provider] = existingKey?.encryptedKey || ''
    }
    setKeyValues(initialValues)
    setChangedKeys(new Set())
  }, [apiKeysByProvider])

  const createMutation = useMutation(trpcHttp.apiKeys.createApiKey.mutationOptions())
  const updateMutation = useMutation(trpcHttp.apiKeys.updateApiKey.mutationOptions())
  const deleteMutation = useMutation(trpcHttp.apiKeys.deleteApiKey.mutationOptions())

  const handleKeyChange = (provider: ModelProvider, value: string) => {
    setKeyValues((prev) => ({ ...prev, [provider]: value }))
    const existingKey = apiKeysByProvider[provider]
    const hasChanged = value !== (existingKey?.encryptedKey || '')
    setChangedKeys((prev) => {
      const next = new Set(prev)
      if (hasChanged) next.add(provider)
      else next.delete(provider)
      return next
    })
  }

  // --- Active Sessions helpers ---
  const getClientInfo = (userAgent?: string | null) => {
    const ua = (userAgent || '').toLowerCase()
    const isFirefox = ua.includes('firefox')
    const isChrome = ua.includes('chrome') && !ua.includes('edg') && !ua.includes('chromium')
    const isEdge = ua.includes('edg')
    const isSafari = ua.includes('safari') && !ua.includes('chrome')
    const browser = isFirefox
      ? 'Firefox'
      : isEdge
        ? 'Edge'
        : isChrome
          ? 'Chrome'
          : isSafari
            ? 'Safari'
            : 'Browser'

    const isMac = ua.includes('mac os') || ua.includes('macintosh')
    const isWin = ua.includes('windows')
    const isLinux = ua.includes('linux') && !ua.includes('android')
    const os = isMac ? 'macOS' : isWin ? 'Windows' : isLinux ? 'Linux' : 'Desktop'

    return { browser, os }
  }

  const revokeSessionMutation = useMutation({
    mutationFn: async (token: string) => authClient.revokeSession({ token }),
    onSuccess: () => refetchSessions(),
  })
  const revokeOthersMutation = useMutation({
    mutationFn: async () => authClient.revokeOtherSessions(),
    onSuccess: () => refetchSessions(),
  })
  const revokeAllMutation = useMutation({
    mutationFn: async () => authClient.revokeSessions(),
    onSuccess: () => refetchSessions(),
  })

  type ListedSession = {
    id: string
    token: string
    userAgent?: string | null
    ipAddress?: string | null
    updatedAt?: Date | null
    expiresAt?: Date | null
  }

  const activeSessions = useMemo(() => {
    const currentToken = session?.token
    const normalized: ListedSession[] = Array.isArray(listedSessions)
      ? (listedSessions as ListedSession[])
      : ([] as ListedSession[])

    return normalized.map((s) => ({
      id: s.id,
      token: s.token,
      userAgent: s.userAgent ?? null,
      ip: s.ipAddress ?? null,
      updatedAt: s.updatedAt,
      expiresAt: s.expiresAt,
      isCurrent: currentToken ? s.token === currentToken : false,
    }))
  }, [listedSessions, session?.token])

  const handleProviderSaveOrDelete = async (provider: ModelProvider, action: 'save' | 'delete') => {
    setLoadingStates((prev) => ({ ...prev, [provider]: true }))
    try {
      const existingKey = apiKeysByProvider[provider]
      if (action === 'delete') {
        if (existingKey) {
          await deleteMutation.mutateAsync({ id: existingKey.id })
        }
      } else {
        const key = keyValues[provider]
        if (existingKey) {
          await updateMutation.mutateAsync({ id: existingKey.id, key })
        } else {
          await createMutation.mutateAsync({ provider, key })
        }
      }
      setChangedKeys((prev) => {
        const next = new Set(prev)
        next.delete(provider)
        return next
      })
      await refetch()
    } finally {
      setLoadingStates((prev) => ({ ...prev, [provider]: false }))
    }
  }

  return (
    <div className="relative flex w-full h-full p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/chat' })}
            className="gap-2 rounded-full border-border/60 bg-background/60 backdrop-blur-sm hover:bg-accent/40"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account preferences and configuration.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left nav */}
          <aside className="col-span-12 md:col-span-3">
            <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-2">
                <ul className="space-y-1">
                  {navItems.map(({ key, label, icon: Icon }) => (
                    <li key={key}>
                      <motion.button
                        type="button"
                        onClick={() => setActive(key)}
                        className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          active === key
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent text-foreground'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : null} {label}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* Content */}
          <main className="col-span-12 md:col-span-9 space-y-4">
            {active === 'profile' && (
              <>
                <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" /> Profile Information
                    </CardTitle>
                    <CardDescription>Your personal account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 rounded-md ring-2 ring-primary/20">
                        <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ''} />
                        <AvatarFallback className="rounded-md">
                          {user?.name?.[0] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Name</div>
                          <div className="font-medium">{user?.name ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Email</div>
                          <div className="font-medium">{user?.email ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">User ID</div>
                          <div className="font-mono text-xs opacity-80 truncate max-w-[480px]">
                            {user?.id ?? '—'}
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <BadgeCheck className="h-4 w-4" /> Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" /> Active Sessions
                    </CardTitle>
                    <CardDescription>
                      Manage your active login sessions across devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">
                        {isSessionsLoading
                          ? 'Loading sessions…'
                          : `${activeSessions.length} active session${activeSessions.length === 1 ? '' : 's'}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => revokeOthersMutation.mutate()}
                          disabled={activeSessions.length <= 1 || revokeOthersMutation.isPending}
                        >
                          Revoke others
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => revokeAllMutation.mutate()}
                          disabled={activeSessions.length === 0 || revokeAllMutation.isPending}
                        >
                          Revoke all
                        </Button>
                      </div>
                    </div>

                    {activeSessions.length === 0 && (
                      <div className="rounded-md border bg-muted/10 p-3 text-sm text-muted-foreground">
                        No active sessions.
                      </div>
                    )}

                    {activeSessions.map((s) => {
                      const info = getClientInfo(s.userAgent || undefined)
                      const lastSeen = s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—'
                      return (
                        <div
                          key={s.id}
                          className="rounded-xl border bg-muted/10 p-3 md:p-4 flex items-start justify-between hover:bg-accent/10 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium flex items-center gap-2">
                                {info.os} · {info.browser}
                                {s.isCurrent && (
                                  <Badge variant="outline" className="bg-background/40">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last seen: {lastSeen}
                                {s.ip ? ` · IP: ${s.ip}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {s.isCurrent ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => authClient.signOut()}
                              >
                                <LogOut className="h-4 w-4" /> Sign Out
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revokeSessionMutation.mutate(s.token)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                {revokeSessionMutation.isPending ? 'Revoking…' : 'Revoke'}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </>
            )}

            {active === 'models' && (
              <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Available Models</CardTitle>
                  <CardDescription>Models available from your configured providers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {llmModels.map((m) => {
                    const caps = getModelCapabilities(m.name)
                    return (
                      <div
                        key={m.id}
                        className="rounded-md border bg-muted/10 p-3 md:p-4 flex items-start justify-between hover:bg-accent/10 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <div className="font-medium">{m.displayName}</div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {caps.map((c) => (
                              <Badge key={c} variant="outline" className="bg-background/40">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          Built-in
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {active === 'providers' && (
              <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Key className="h-5 w-5" /> Providers
                    </span>
                    <span className="text-xs text-muted-foreground">Bring Your Own Key</span>
                  </CardTitle>
                  <CardDescription>Connect your preferred model providers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[ModelProviderEnum.OPENROUTER].map((provider) => {
                    const config = providerConfig[provider as keyof typeof providerConfig]
                    const existingKey = apiKeysByProvider[provider as ModelProvider]
                    const isLoading = loadingStates[provider]
                    const hasChanges = changedKeys.has(provider)

                    return (
                      <div
                        key={provider}
                        className="p-4 rounded-xl border bg-gradient-to-br from-background/80 to-background shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">{config.icon}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{config.name}</span>
                            <Badge variant="outline" className="bg-background/50">
                              Recommended
                            </Badge>
                            {existingKey && (
                              <Badge variant="outline" className="bg-background/50">
                                {existingKey.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                          <div className="relative flex-1">
                            <Input
                              type={showKeys[provider] ? 'text' : 'password'}
                              value={keyValues[provider] || ''}
                              onChange={(e) =>
                                handleKeyChange(provider as ModelProvider, e.target.value)
                              }
                              placeholder={`Enter your ${config.name} API key`}
                              className="pr-10 h-11 text-base"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full w-11"
                              onClick={() =>
                                setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
                              }
                            >
                              {showKeys[provider] ? (
                                <EyeOffIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() =>
                                handleProviderSaveOrDelete(provider as ModelProvider, 'save')
                              }
                              disabled={isLoading || !hasChanges}
                              className="gap-2"
                              variant="outline"
                            >
                              {isLoading ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                              ) : (
                                <SaveIcon className="h-4 w-4" />
                              )}
                              Save
                            </Button>
                            <Button
                              onClick={() =>
                                handleProviderSaveOrDelete(provider as ModelProvider, 'delete')
                              }
                              disabled={isLoading || !existingKey}
                              className="gap-2"
                              variant="ghost"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div className="mt-4 rounded-xl border border-dashed p-4 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">More providers coming soon</div>
                        <div className="text-xs text-muted-foreground">
                          OpenAI, Ollama, Custom, and more.
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-background/50">
                        Roadmap
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {active !== 'profile' && active !== 'providers' && active !== 'models' && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Coming soon</CardTitle>
                  <CardDescription>Nothing to see here yet—stay tuned.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We’re still wiring up this section.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
