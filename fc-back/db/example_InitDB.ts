import { account as AccountTable, user as UserTable } from './userModel.js'

export default function initDB() {
  {
    initUser()
    initAccount()
  }
}

function initUser() {
  UserTable.findOrCreate({
    where: { id: 'example-user-id-123456789' },
    defaults: {
      name: 'Example User',
      email: 'example@example.com',
      emailVerified: true,
      createdAt: new Date('2023-01-01 12:00:00.000+00'),
      updatedAt: new Date('2023-01-01 12:00:00.000+00'),
      role: 'user',
      banned: false,
      phone: '0123456789',
      image: 'https://example.com/profile.jpg',
    },
  })
}

function initAccount() {
  AccountTable.findOrCreate({
    where: { id: 'example-account-id-123456789' },
    defaults: {
      accountId: 'example-account-id-123456789',
      userId: 'example-user-id-123456789',
      providerId: 'credential',
      password:
        'example-hashed-password:example-salt-and-hash-value-would-be-much-longer-in-real-implementation',
      createdAt: new Date('2023-01-01 12:00:00.000+00'),
      updatedAt: new Date('2023-01-01 12:00:00.000+00'),
      accessToken: 'example-access-token-value',
      refreshToken: 'example-refresh-token-value',
      idToken: 'example-id-token-value',
      accessTokenExpiresAt: new Date('2023-01-02 12:00:00.000+00'),
      refreshTokenExpiresAt: new Date('2023-01-08 12:00:00.000+00'),
      scope: 'openid,profile,email',
    },
  })
}
