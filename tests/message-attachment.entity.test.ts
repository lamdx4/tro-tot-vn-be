/**
 * Message Attachment Feature - Unit Tests
 * Tests for message attachment entity, service, and socket handlers
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { MessageAttachment } from '../src/domains/entities/message-attachment.entity'
import { Message } from '../src/domains/entities/message.entity'
import { AttachmentType } from '../src/domains/entities/enum/value-object'

// Mock dependencies
jest.mock('../src/infras/repositories/message-attachment.repository')
jest.mock('../src/infras/repositories/message.repository')
jest.mock('../src/services/google-drive.service')

describe('MessageAttachment Entity', () => {
  let attachment: MessageAttachment

  beforeEach(() => {
    attachment = new MessageAttachment()
  })

  it('should create a message attachment with all properties', () => {
    attachment.attachmentId = 1
    attachment.messageId = 10
    attachment.fileName = 'test-image.jpg'
    attachment.fileUrl = '/uploads/messages/1234567890-test-image.jpg'
    attachment.fileType = AttachmentType.IMAGE
    attachment.fileSize = 1024000
    attachment.mimeType = 'image/jpeg'
    attachment.cloudFileId = 'abc123xyz'
    attachment.createdAt = new Date()

    expect(attachment.attachmentId).toBe(1)
    expect(attachment.messageId).toBe(10)
    expect(attachment.fileName).toBe('test-image.jpg')
    expect(attachment.fileUrl).toBe('/uploads/messages/1234567890-test-image.jpg')
    expect(attachment.fileType).toBe(AttachmentType.IMAGE)
    expect(attachment.fileSize).toBe(1024000)
    expect(attachment.mimeType).toBe('image/jpeg')
    expect(attachment.cloudFileId).toBe('abc123xyz')
  })

  it('should have correct file types', () => {
    expect(AttachmentType.IMAGE).toBe('Image')
    expect(AttachmentType.VIDEO).toBe('Video')
    expect(AttachmentType.FILE).toBe('File')
  })

  it('should allow optional fileSize and mimeType', () => {
    attachment.attachmentId = 2
    attachment.messageId = 20
    attachment.fileName = 'document.pdf'
    attachment.fileUrl = '/uploads/messages/doc.pdf'
    attachment.fileType = AttachmentType.FILE
    // fileSize and mimeType are optional

    expect(attachment.fileSize).toBeUndefined()
    expect(attachment.mimeType).toBeUndefined()
  })
})

describe('Message Entity with Attachments', () => {
  let message: Message

  beforeEach(() => {
    message = new Message()
    message.messageId = 1
    message.conversationId = 10
    message.senderId = 100
    message.content = 'Check out this image!'
    message.messageType = 'Image'
    message.status = 'Sent'
    message.createdAt = new Date()
  })

  it('should have attachments relationship', () => {
    const attachment = new MessageAttachment()
    attachment.attachmentId = 1
    attachment.messageId = message.messageId
    attachment.fileName = 'photo.jpg'
    attachment.fileUrl = '/uploads/photo.jpg'
    attachment.fileType = AttachmentType.IMAGE
    attachment.mimeType = 'image/jpeg'

    message.attachments = [attachment]

    expect(message.attachments).toBeDefined()
    expect(message.attachments.length).toBe(1)
    expect(message.attachments[0].fileName).toBe('photo.jpg')
  })

  it('should handle multiple attachments', () => {
    const attachment1 = new MessageAttachment()
    attachment1.attachmentId = 1
    attachment1.fileName = 'image1.jpg'
    attachment1.fileType = AttachmentType.IMAGE

    const attachment2 = new MessageAttachment()
    attachment2.attachmentId = 2
    attachment2.fileName = 'image2.jpg'
    attachment2.fileType = AttachmentType.IMAGE

    message.attachments = [attachment1, attachment2]

    expect(message.attachments.length).toBe(2)
  })
})

describe('AttachmentType Enum', () => {
  it('should have Image, Video, and File types', () => {
    expect(Object.keys(AttachmentType)).toContain('IMAGE')
    expect(Object.keys(AttachmentType)).toContain('VIDEO')
    expect(Object.keys(AttachmentType)).toContain('FILE')
  })

  it('should have correct string values', () => {
    expect(AttachmentType.IMAGE).toBe('Image')
    expect(AttachmentType.VIDEO).toBe('Video')
    expect(AttachmentType.FILE).toBe('File')
  })
})

