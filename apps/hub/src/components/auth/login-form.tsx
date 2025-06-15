import { trpc } from '@/lib/trpc'
import { Button } from '@chad-chat/ui/components/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@chad-chat/ui/components/shadcn/card'
import { Separator } from '@radix-ui/react-separator'
import { useQuery } from '@tanstack/react-query'
import { Loader2, MessageCircle } from 'lucide-react'
import { socialProviders } from './definitions/values'

export function LoginForm() {
  const { data: providers, isLoading } = useQuery(trpc.auth.getEnabledAuthMethods.queryOptions())

  const enabledProviders = socialProviders.filter((provider) =>
    providers?.includes(provider.provider),
  )

  const getGridLayout = (count: number) => {
    if (count <= 2) return { grid: 'grid-cols-1', showText: true }
    if (count <= 4) return { grid: 'grid-cols-1 sm:grid-cols-2', showText: true }
    if (count <= 6) return { grid: 'grid-cols-1 sm:grid-cols-2', showText: false }
    return { grid: 'grid-cols-2 sm:grid-cols-3', showText: false }
  }

  const { grid, showText } = getGridLayout(1)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <MessageCircle className="h-8 w-8 text-primary-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Chad Chat</h1>
            <p className="text-muted-foreground text-balance">
              Your intelligent conversation companion
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Providers Grid */}
            <div className={`grid gap-3 ${grid}`}>
              {enabledProviders.map((provider) => {
                const Icon = provider.icon

                return (
                  <Button
                    key={provider.provider}
                    variant="outline"
                    size={showText ? 'default' : 'default'}
                    className={`h-12 transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                      showText ? 'justify-start' : 'justify-center'
                    }`}
                    onClick={provider.action}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className={`h-5 w-5 ${showText ? 'mr-3' : ''}`} />
                    )}

                    {showText && (
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{provider.name}</span>
                        {enabledProviders.length <= 2 && (
                          <span className="text-xs text-muted-foreground">
                            {provider.description}
                          </span>
                        )}
                      </div>
                    )}
                  </Button>
                )
              })}
            </div>

            <Separator />

            {/* Terms and Privacy */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                By continuing, you agree to our{' '}
                <a
                  href="#"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to Chad Chat?{' '}
            <a
              href="#"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Learn more about our platform
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
