import { brainEnvConfig } from '@netko/claw-config'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export async function validateToken(token: string) {
  const Jwks = createRemoteJWKSet(new URL(`${brainEnvConfig.app.baseUrl}/api/auth/jwks`))
  const { payload } = await jwtVerify(token, Jwks, {
    issuer: brainEnvConfig.app.baseUrl,
    audience: brainEnvConfig.app.baseUrl,
  })
  return payload
}
