/**
 * Jest Setup File
 * Global test configuration and mocks
 */

import 'reflect-metadata'

// Mock console.error to reduce noise in tests
const originalError = console.error
console.error = (...args: any[]) => {
  // Ignore specific warnings during tests
  const message = args[0]
  if (typeof message === 'string' && message.includes('Warning:')) {
    return
  }
  originalError.call(console, ...args)
}

// Global test timeout
jest.setTimeout(10000)

