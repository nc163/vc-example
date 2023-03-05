import * as dotenv from 'dotenv'

import { createAgent } from '@veramo/core'

import { Resolver } from 'did-resolver'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getDidKeyResolver } from '@veramo/did-provider-key'
import { CredentialPlugin } from '@veramo/credential-w3c'

import type { ICredentialIssuer, ICredentialVerifier } from '@veramo/credential-w3c'
import type { IDIDManager, IKeyManager } from '@veramo/core-types'

dotenv.config()
const env = process.env

/**
 * Agent
 */
const Agent = createAgent<IKeyManager & IDIDManager & ICredentialIssuer & ICredentialVerifier>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getDidKeyResolver(),
        ...ethrDidResolver({ infuraProjectId: env.INFURA_PROJECT_ID }),
      }),
    }),
    new CredentialPlugin(),
  ],
})

/**
 * verifiableCredential
 */
const verifiableCredential = {
  credentialSubject: {
    name: 'nc163',
    id: 'did:ethr:0x9CB8d9E29De0eCa19B8eD8c141ba542aC78C49f3',
  },
  issuer: {
    id: 'did:ethr:0x03155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c',
  },
  type: ['VerifiableCredential'],
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  issuanceDate: '2023-03-05T03:54:17.000Z',
  proof: {
    type: 'JwtProof2020',
    jwt: 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJuYzE2MyJ9fSwic3ViIjoiZGlkOmV0aHI6MHg5Q0I4ZDlFMjlEZTBlQ2ExOUI4ZUQ4YzE0MWJhNTQyYUM3OEM0OWYzIiwibmJmIjoxNjc3OTg4NDU3LCJpc3MiOiJkaWQ6ZXRocjoweDAzMTU1ZWUwY2JlZmVlY2Q4MGRlNjNhNjJiNGVkOGYwZjk3YWMyMmE1OGY3NmEyNjU5MDNiOWFjYWI3OWJmMDE4YyJ9.Rkozdm9mmjy1xpOQ_d2H6ASndAzGRXfC_9N5yCwLefUDkdQmz0ua9UotTVQ1qkXywdyxKcIyCXAMYB_BwlcysQ',
  },
}

// 検証
const verificationResult = await Agent.verifyCredential({ credential: verifiableCredential })

console.log(`
== verificationResult
${JSON.stringify(verificationResult, null, 2)}
`)
