import * as dotenv from 'dotenv'

import { createAgent } from '@veramo/core'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'

import { Resolver } from 'did-resolver'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getDidKeyResolver } from '@veramo/did-provider-key'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { CredentialIssuerLD, LdDefaultContexts, VeramoEd25519Signature2018, VeramoEcdsaSecp256k1RecoverySignature2020 } from '@veramo/credential-ld'

import type { ICredentialIssuer, ICredentialVerifier } from '@veramo/credential-w3c'
import type { CredentialPayload, TKeyType, IDIDManager, IKeyManager, TAgent, ICredentialPlugin, IDataStore, IDataStoreORM, IVerifyResult } from '@veramo/core-types'

dotenv.config()
const env = process.env

/**
 * 資格情報の発行者
 */
const issuer = {
  did: 'did:ethr:0x03155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c',
  provider: 'did:ethr',
  controllerKeyId: '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
  keys: [
    {
      kid: '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
      kms: 'mem',
      type: <TKeyType>'Secp256k1',
      publicKeyHex: '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
      privateKeyHex: '31d1ec15ff8110442012fef0d1af918c0e09b2e2ab821bba52ecc85f8655ec63',
    },
  ],
  services: [],
}

/**
 * Agent
 */
const Agent = createAgent<IKeyManager & IDIDManager & ICredentialIssuer & ICredentialVerifier>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      // store: new MemoryKeyStore(),
      kms: {
        mem: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      store: new MemoryDIDStore(),
      providers: {
        'did:ethr': new EthrDIDProvider({ defaultKms: 'mem' }),
      },
      defaultProvider: 'did:ethr',
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getDidKeyResolver(),
        ...ethrDidResolver({ infuraProjectId: env.INFURA_PROJECT_ID }),
      }),
    }),
    new CredentialPlugin(),
    new CredentialIssuerLD({
      contextMaps: [LdDefaultContexts],
      suites: [new VeramoEd25519Signature2018(), new VeramoEcdsaSecp256k1RecoverySignature2020()],
    }),
  ],
})
const identifier = await Agent.didManagerImport(issuer)

/**
 * 認証情報を発行
 */
const credential: CredentialPayload = {
  issuer: identifier.did,
  '@context': [
    {
      '@context': {
        nothing: 'custom:example.context#blank',
      },
    },
  ],
  credentialSubject: {
    nothing: 'else matters',
  },
}
const verifiableCredential = await Agent.createVerifiableCredential({ credential, proofFormat: 'lds' })

/**
 * VC
 */
const verificationResult = await Agent.verifyCredential({ credential: verifiableCredential })

console.log(`
== issuer
${JSON.stringify(issuer, null, 2)}

== verifiableCredential
${JSON.stringify(credential, null, 2)}

== verificationResult
${JSON.stringify(verificationResult, null, 2)}
`)
