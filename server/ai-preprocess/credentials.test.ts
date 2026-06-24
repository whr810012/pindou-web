import { describe, expect, it } from 'vitest'
import { parseJimengCredentials, resolveJimengCredentials } from './credentials'

describe('parseJimengCredentials', () => {
  it('parses AccessKey.txt format', () => {
    const input = `AccessKeyId: AKLTTEST123
SecretAccessKey: secret-value-here`
    const cred = parseJimengCredentials(input)
    expect(cred).toEqual({
      type: 'aksk',
      accessKeyId: 'AKLTTEST123',
      secretAccessKey: 'secret-value-here',
    })
  })

  it('parses AKLT single-line format', () => {
    const cred = parseJimengCredentials('AKLTABC:my-secret')
    expect(cred).toEqual({
      type: 'aksk',
      accessKeyId: 'AKLTABC',
      secretAccessKey: 'my-secret',
    })
  })

  it('parses ApiKey.txt format', () => {
    const cred = parseJimengCredentials('API Key: ark-key-value-123')
    expect(cred).toEqual({ type: 'bearer', apiKey: 'ark-key-value-123' })
  })

  it('strips Bearer prefix from api key', () => {
    const cred = parseJimengCredentials('Bearer ark-key-value-123')
    expect(cred).toEqual({ type: 'bearer', apiKey: 'ark-key-value-123' })
  })

  it('treats other strings as bearer api key', () => {
    const cred = parseJimengCredentials('sk-ark-api-key-123')
    expect(cred).toEqual({ type: 'bearer', apiKey: 'sk-ark-api-key-123' })
  })

  it('parses AccessKey.txt with CRLF', () => {
    const input =
      'AccessKeyId: AKLTTEST123\r\nSecretAccessKey: secret-value-here\r\n'
    const cred = parseJimengCredentials(input)
    expect(cred).toEqual({
      type: 'aksk',
      accessKeyId: 'AKLTTEST123',
      secretAccessKey: 'secret-value-here',
    })
  })

  it('does not treat multiline access key file as bearer', () => {
    const cred = parseJimengCredentials('AccessKeyId: x\nnot-a-valid-format')
    expect(cred).toBeNull()
  })

  it('parses concatenated duplicate SecretAccessKey on one line', () => {
    const input =
      'AccessKeyId: AKLTNEW123\nSecretAccessKey: secret-new==SecretAccessKey: secret-old=='
    const cred = parseJimengCredentials(input)
    expect(cred).toEqual({
      type: 'aksk',
      accessKeyId: 'AKLTNEW123',
      secretAccessKey: 'secret-new==',
    })
  })

  it('prefers body credentials over env aksk', () => {
    const cred = resolveJimengCredentials('API Key: ark-from-body', {
      accessKeyId: 'AKLTENV',
      secretAccessKey: 'secret-env',
    })
    expect(cred).toEqual({ type: 'bearer', apiKey: 'ark-from-body' })
  })
})
