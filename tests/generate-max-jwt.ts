import jwt from 'jsonwebtoken'

// Configuration from .env.development
const JWT_ACCESS_TOKEN_SECRET = '6cf9d57d-7d6c-4ab5-8419-115ec872aabf'
const JWT_REFRESH_TOKEN_SECRET = 'dc39af7f-615d-48cf-bd6b-94af35e1ec84'

// Test user payload (similar to what login returns)
const alicePayload = {
  accountId: 3,
  phone: '0912345678',
  password: 'pornhub.com',
  status: 'Active',
  email: 'alice@test.com',
  role: {
    roleId: 1,
    roleName: 'Customer',
    rolePermissions: []
  },
  customer: {
    customerId: 1,
    gender: 'Male',
    bio: '',
    firstName: 'Alice',
    lastName: 'Nguyen',
    birthday: '1995-01-01',
    avatar: null,
    currentCity: null,
    currentDistrict: null,
    currentJob: null
  },
  admin: null
}

const bobPayload = {
  accountId: 4,
  phone: '0912345679',
  password: 'pornhub.com',
  status: 'Active',
  email: 'bob@test.com',
  role: {
    roleId: 1,
    roleName: 'Customer',
    rolePermissions: []
  },
  customer: {
    customerId: 2,
    gender: 'Female',
    bio: '',
    firstName: 'Bob',
    lastName: 'Tran',
    birthday: '1990-05-15',
    avatar: null,
    currentCity: null,
    currentDistrict: null,
    currentJob: null
  },
  admin: null
}

// Expiration options
const EXPIRY_OPTIONS = {
  '1 hour': 3600,
  '1 day': 86400,
  '1 week': 604800,
  '1 month': 2592000,        // 30 days
  '1 year': 31536000,        // 365 days
  '10 years': 315360000      // 10 years
}

function generateTokens(payload: object, expiresInSeconds: number) {
  const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: expiresInSeconds
  })
  
  const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: expiresInSeconds * 2  // Refresh token lasts 2x longer
  })
  
  return { accessToken, refreshToken }
}

function decodeToken(token: string) {
  const decoded = jwt.decode(token) as any
  if (decoded) {
    const exp = new Date(decoded.exp * 1000)
    const now = new Date()
    const expiresIn = Math.round((exp.getTime() - now.getTime()) / 1000)
    return {
      email: decoded.email,
      customerId: decoded.customer?.customerId,
      expiresAt: exp.toISOString(),
      expiresInSeconds: expiresIn,
      expiresInHuman: expiresIn > 31536000 
        ? `${(expiresIn / 31536000).toFixed(1)} years`
        : expiresIn > 86400 
          ? `${(expiresIn / 86400).toFixed(1)} days`
          : expiresIn > 3600 
            ? `${(expiresIn / 3600).toFixed(1)} hours`
            : `${expiresIn} seconds`
    }
  }
  return null
}

// Generate tokens for Alice
console.log('='.repeat(60))
console.log('JWT TOKEN GENERATOR - MAXIMUM LIFETIME')
console.log('='.repeat(60))

const expiresIn = EXPIRY_OPTIONS['10 years']

console.log(`\n🔑 Generating tokens with ${expiresIn / 31536000} years expiration...\n`)

const aliceTokens = generateTokens(alicePayload, expiresIn)
const bobTokens = generateTokens(bobPayload, expiresIn)

console.log('ALICE (customerId: 1)')
console.log('-'.repeat(40))
console.log(`Access Token:\n${aliceTokens.accessToken}\n`)
console.log(`Refresh Token:\n${aliceTokens.refreshToken}\n`)

const aliceDecoded = decodeToken(aliceTokens.accessToken)
console.log('Token Info:')
console.log(`  - Email: ${aliceDecoded?.email}`)
console.log(`  - Customer ID: ${aliceDecoded?.customerId}`)
console.log(`  - Expires At: ${aliceDecoded?.expiresAt}`)
console.log(`  - Expires In: ${aliceDecoded?.expiresInHuman}`)

console.log('\n' + '='.repeat(60))

console.log('\nBOB (customerId: 2)')
console.log('-'.repeat(40))
console.log(`Access Token:\n${bobTokens.accessToken}\n`)

const bobDecoded = decodeToken(bobTokens.accessToken)
console.log('Token Info:')
console.log(`  - Email: ${bobDecoded?.email}`)
console.log(`  - Customer ID: ${bobDecoded?.customerId}`)
console.log(`  - Expires At: ${bobDecoded?.expiresAt}`)
console.log(`  - Expires In: ${bobDecoded?.expiresInHuman}`)

console.log('\n' + '='.repeat(60))
console.log('\n📋 POSTMAN USAGE:')
console.log('Copy the access token and use in Authorization header:')
console.log('Authorization: Bearer <access_token>')
console.log('')

