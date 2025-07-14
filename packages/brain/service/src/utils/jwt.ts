import { brainEnvConfig } from '@netko/brain-config'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export async function validateToken(token: string) {
  const Jwks = createRemoteJWKSet(new URL(`${brainEnvConfig.app.baseUrl}/auth/api/jwks`))
  const { payload } = await jwtVerify(token, Jwks, {
    issuer: brainEnvConfig.app.baseUrl,
    audience: brainEnvConfig.app.baseUrl,
  })
  return payload
}
