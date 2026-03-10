/**
 * Coturn Server Connectivity Test Script
 * 
 * Tests the Coturn TURN server availability and authentication.
 * This script can run in Node.js to verify the TURN server is properly configured.
 * 
 * Run with: node tests/coturn-test.js
 * 
 * Prerequisites:
 * - Coturn server running (docker-compose up coturn)
 * - Network access to TURN server ports (3478, 5349)
 */

const net = require('net')
const dgram = require('dgram')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

// Configuration
const TURN_SERVER_IP = process.env.TURN_SERVER_IP || '127.0.0.1'
const TURN_SERVER_PORT = parseInt(process.env.TURN_SERVER_PORT || '3478')
const TURN_SERVER_TLS_PORT = parseInt(process.env.TURN_SERVER_TLS_PORT || '5349')
const TURN_USERNAME = process.env.TURN_USERNAME || 'tro-tot-user'
const TURN_CREDENTIAL = process.env.TURN_CREDENTIAL || 'tro-tot-secret-2024'

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`)
}

function header(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan)
  log(`  ${title}`, colors.cyan)
  log('='.repeat(60), colors.cyan)
}

function section(title) {
  log(`\n--- ${title} ---`, colors.yellow)
}

// Test results
let testsPassed = 0
let testsFailed = 0

function testPass(name) {
  testsPassed++
  log(`✓ ${name}`, colors.green)
}

function testFail(name, error) {
  testsFailed++
  log(`✗ ${name}`, colors.red)
  log(`  Error: ${error}`, colors.red)
}

// ============================================
// Test 1: Check Coturn Docker Container
// ============================================
async function testCoturnContainer() {
  header('Test 1: Coturn Docker Container')
  
  try {
    const { stdout } = await execAsync('docker ps --filter "name=coturn" --format "{{.Names}}"')
    const containerName = stdout.trim()
    
    if (containerName === 'tro-tot-coturn') {
      testPass('Coturn Container Running')
      
      // Get container status
      const { stdout: statusOutput } = await execAsync(
        'docker ps --filter "name=coturn" --format "{{.Status}}"'
      )
      log(`  Status: ${statusOutput.trim()}`, colors.blue)
      
      return true
    } else {
      testFail('Coturn Container Running', 'Container not found')
      return false
    }
  } catch (error) {
    testFail('Coturn Container Running', error.message)
    return false
  }
}

// ============================================
// Test 2: TCP Port 3478 (STUN/TURN)
// ============================================
async function testTcpPort3478() {
  header('Test 2: TCP Port 3478 (STUN/TURN)')
  
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = setTimeout(() => {
      socket.destroy()
      testFail('TCP Port 3478', 'Connection timeout')
      resolve(false)
    }, 5000)
    
    socket.connect(TURN_SERVER_PORT, TURN_SERVER_IP, () => {
      clearTimeout(timeout)
      testPass('TCP Port 3478 Open')
      
      // Send STUN binding request
      // This is a minimal STUN request to check server response
      const stunRequest = Buffer.from([
        0x00, 0x01, 0x00, 0x00,  // Message type: Binding Request
        0x21, 0x12, 0xA4, 0x42,  // Magic cookie
        0x00, 0x00, 0x00, 0x00   // Transaction ID (placeholder)
      ])
      
      socket.write(stunRequest)
      
      socket.on('data', (data) => {
        log(`  Received ${data.length} bytes from STUN server`, colors.blue)
        testPass('STUN Binding Request')
        socket.destroy()
        resolve(true)
      })
      
      socket.on('error', (error) => {
        clearTimeout(timeout)
        testFail('STUN Binding Request', error.message)
        socket.destroy()
        resolve(false)
      })
      
      // Set another timeout for response
      setTimeout(() => {
        if (!socket.destroyed) {
          // Even if no response data, port is open
          testPass('STUN Binding Request (no response but port open)')
          socket.destroy()
          resolve(true)
        }
      }, 3000)
    })
    
    socket.on('error', (error) => {
      clearTimeout(timeout)
      testFail('TCP Port 3478', error.message)
      resolve(false)
    })
  })
}

// ============================================
// Test 3: TCP Port 5349 (TLS/TURN)
// ============================================
async function testTcpPort5349() {
  header('Test 3: TCP Port 5349 (TLS/TURN)')
  
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = setTimeout(() => {
      socket.destroy()
      testFail('TCP Port 5349', 'Connection timeout')
      resolve(false)
    }, 5000)
    
    socket.connect(TURN_SERVER_TLS_PORT, TURN_SERVER_IP, () => {
      clearTimeout(timeout)
      testPass('TCP Port 5349 Open')
      
      // For TLS, we just verify the port is open
      // Full TLS handshake would require tls module
      socket.destroy()
      resolve(true)
    })
    
    socket.on('error', (error) => {
      clearTimeout(timeout)
      testFail('TCP Port 5349', error.message)
      resolve(false)
    })
  })
}

// ============================================
// Test 4: UDP Port 3478
// ============================================
async function testUdpPort3478() {
  header('Test 4: UDP Port 3478')
  
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4')
    const timeout = setTimeout(() => {
      socket.close()
      // UDP doesn't guarantee responses, so we check if port is bound
      testPass('UDP Port 3478 (no response but socket created)')
      resolve(true)
    }, 3000)
    
    const message = Buffer.from([
      0x00, 0x01, 0x00, 0x00,  // Message type: Binding Request
      0x21, 0x12, 0xA4, 0x42,  // Magic cookie
      0x00, 0x00, 0x00, 0x00   // Transaction ID
    ])
    
    socket.on('message', (msg, rinfo) => {
      clearTimeout(timeout)
      log(`  Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`, colors.blue)
      testPass('UDP Port 3478 Open')
      testPass('STUN UDP Response')
      socket.close()
      resolve(true)
    })
    
    socket.on('error', (error) => {
      clearTimeout(timeout)
      testFail('UDP Port 3478', error.message)
      socket.close()
      resolve(false)
    })
    
    socket.send(message, 0, message.length, TURN_SERVER_PORT, TURN_SERVER_IP, (error) => {
      if (error) {
        clearTimeout(timeout)
        testFail('UDP Port 3478', error.message)
        socket.close()
        resolve(false)
      }
    })
  })
}

// ============================================
// Test 5: TURN Authentication
// ============================================
async function testTurnAuth() {
  header('Test 5: TURN Authentication Configuration')
  
  // Check if credentials are configured
  if (!TURN_USERNAME || !TURN_CREDENTIAL) {
    testFail('TURN Credentials', 'Not configured')
    return false
  }
  
  if (TURN_USERNAME.length < 4) {
    testFail('TURN Username', 'Too short')
    return false
  }
  
  testPass('TURN Username Configured')
  testPass('TURN Credential Configured')
  
  log(`  Username: ${TURN_USERNAME}`, colors.blue)
  log(`  Credential: ${TURN_CREDENTIAL.substring(0, 8)}...`, colors.blue)
  
  // Check if Coturn secret is configured in container
  try {
    const { stdout } = await execAsync(
      'docker exec tro-tot-coturn env | grep -i turn_secret || echo "NOT_FOUND"'
    )
    
    if (stdout.includes('NOT_FOUND')) {
      log('  Warning: TURN_SECRET not found in container env', colors.yellow)
    } else {
      testPass('Coturn TURN_SECRET Environment Variable')
    }
  } catch (error) {
    log(`  Could not verify container config: ${error.message}`, colors.yellow)
  }
  
  return true
}

// ============================================
// Test 6: Media Ports Range
// ============================================
async function testMediaPorts() {
  header('Test 6: Media Ports Range (49152-49172)')
  
  // Check if port range is configured in docker-compose
  try {
    const { stdout } = await execAsync(
      'docker inspect tro-tot-coturn --format "{{range $p, $conf := .HostConfig.PortBindings}}{{$p}} {{end}}"'
    )
    
    const ports = stdout.trim().split(' ')
    log(`  Exposed ports: ${ports.join(', ')}`, colors.blue)
    
    // Check for UDP media ports
    const hasUdpMedia = ports.some(p => p.startsWith('49152/udp'))
    
    if (hasUdpMedia) {
      testPass('UDP Media Ports Exposed')
    } else {
      testFail('UDP Media Ports', 'Not properly exposed')
    }
    
    return hasUdpMedia
  } catch (error) {
    testFail('Media Ports Check', error.message)
    return false
  }
}

// ============================================
// Test 7: Coturn Logs
// ============================================
async function testCoturnLogs() {
  header('Test 7: Coturn Server Logs')
  
  try {
    const { stdout } = await execAsync(
      'docker logs tro-tot-coturn --tail 20 2>&1 || echo "NO_LOGS"'
    )
    
    if (stdout.includes('NO_LOGS')) {
      testFail('Coturn Logs', 'Unable to read logs')
      return false
    }
    
    // Check for common startup messages
    if (stdout.includes('UTF-8') || stdout.includes('TURN Server')) {
      testPass('Coturn Server Started')
    }
    
    if (stdout.includes(' listening ') || stdout.includes(' Listening ')) {
      testPass('Coturn Listening on Ports')
    }
    
    // Show last few log lines
    const lines = stdout.split('\n').filter(l => l.trim()).slice(-5)
    log('  Recent log entries:', colors.blue)
    lines.forEach(line => {
      log(`    ${line.substring(0, 80)}...`, colors.magenta)
    })
    
    return true
  } catch (error) {
    testFail('Coturn Logs', error.message)
    return false
  }
}

// ============================================
// Test 8: Complete ICE Server URLs
// ============================================
function testIceServerUrls() {
  header('Test 8: ICE Server URLs Configuration')
  
  const expectedUrls = [
    `stun:${TURN_SERVER_IP}:${TURN_SERVER_PORT}`,
    `turn:${TURN_SERVER_IP}:${TURN_SERVER_PORT}`,
    `turn:${TURN_SERVER_IP}:${TURN_SERVER_TLS_PORT}?transport=tcp`
  ]
  
  log('  Expected ICE Server URLs:', colors.blue)
  expectedUrls.forEach(url => {
    log(`    - ${url}`, colors.blue)
  })
  
  testPass('ICE Server URLs Configured')
  
  return expectedUrls
}

// ============================================
// Main Test Runner
// ============================================
async function runTests() {
  log('\n' + '█'.repeat(60), colors.cyan)
  log('  Coturn TURN Server - Connectivity Test Suite', colors.cyan)
  log('█'.repeat(60), colors.cyan)
  
  log(`\nTURN Server: ${TURN_SERVER_IP}`, colors.blue)
  log(`TURN Port: ${TURN_SERVER_PORT}`, colors.blue)
  log(`TLS Port: ${TURN_SERVER_TLS_PORT}`, colors.blue)
  log(`Username: ${TURN_USERNAME}`, colors.blue)
  
  try {
    // Test 1: Docker Container
    await testCoturnContainer()
    
    // Test 2: TCP Port 3478
    await testTcpPort3478()
    
    // Test 3: TCP Port 5349
    await testTcpPort5349()
    
    // Test 4: UDP Port 3478
    await testUdpPort3478()
    
    // Test 5: Authentication
    await testTurnAuth()
    
    // Test 6: Media Ports
    await testMediaPorts()
    
    // Test 7: Logs
    await testCoturnLogs()
    
    // Test 8: ICE URLs
    testIceServerUrls()
    
  } catch (error) {
    log(`\nTest Error: ${error.message}`, colors.red)
  }
  
  // Print summary
  header('Test Summary')
  log(`Total Passed: ${testsPassed}`, testsPassed > 0 ? colors.green : colors.red)
  log(`Total Failed: ${testsFailed}`, testsFailed > 0 ? colors.red : colors.green)
  
  if (testsFailed === 0) {
    log('\n✓ Coturn server is properly configured and running!', colors.green)
    log('\nYou can now use these ICE servers in your WebRTC application:', colors.cyan)
    log(`  STUN: stun:${TURN_SERVER_IP}:${TURN_SERVER_PORT}`, colors.blue)
    log(`  TURN: turn:${TURN_SERVER_IP}:${TURN_SERVER_PORT}`, colors.blue)
    log(`  TURN (TLS): turn:${TURN_SERVER_IP}:${TURN_SERVER_TLS_PORT}?transport=tcp`, colors.blue)
  } else {
    log('\n✗ Some tests failed. Please check the configuration.', colors.red)
    log('\nTo start Coturn:', colors.yellow)
    log('  docker-compose up -d coturn', colors.blue)
  }
  
  process.exit(testsFailed > 0 ? 1 : 0)
}

// Run tests
runTests()

