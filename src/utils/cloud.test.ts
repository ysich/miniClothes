/**
 * Cloud 存储工具测试
 */

import { uploadImage, deleteImage, uploadMultipleImages, type UploadFile } from './cloud'
import type { Result } from '@/types'

const uniMock = {
  chooseImage: jest.fn(() => {
    return {
      tempFilePaths: ['temp_file_path_1'],
      errMsg: 'chooseImage:ok',
    }
  }),
  uploadFile: jest.fn((options: any) => {
    // Create task object with onProgressUpdate method
    let registeredCallback: ((result: { progress: number }) => void) | null = null

    const task = {
      onProgressUpdate: (callback: (result: { progress: number }) => void) => {
        registeredCallback = callback
      },
    }

    // Return then to support Promise chain (not used in new implementation)
    Object.assign(task, {
      then: (resolve: (value: unknown) => void) => resolve(task),
    })

    // Simulate upload progress after task is returned
    setTimeout(() => {
      const progressData = { progress: 50, totalBytesSent: 5000, totalBytesExpectedToSend: 10000 }
      if (typeof options.onProgressUpdate === 'function') {
        options.onProgressUpdate(progressData)
      }
      if (typeof registeredCallback === 'function') {
        registeredCallback({ progress: progressData.progress })
      }
    }, 10)

    setTimeout(() => {
      const progressData = { progress: 100, totalBytesSent: 10000, totalBytesExpectedToSend: 10000 }
      if (typeof options.onProgressUpdate === 'function') {
        options.onProgressUpdate(progressData)
      }
      if (typeof registeredCallback === 'function') {
        registeredCallback({ progress: progressData.progress })
      }
    }, 20)

    // Simulate upload completion
    setTimeout(() => {
      options.success?.({
        data: JSON.stringify({ fileID: 'cloud://test-env.123/abc-123.jpg', url: 'https://example.com/abc-123.jpg' }),
        statusCode: 200,
      })
    }, 30)

    return task
  }),
  getCloudEnvId: jest.fn(() => 'test-env-123'),
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(global as any).uni = uniMock
})

describe('uploadImage', () => {
  it('should upload image and return successful result with URL', async () => {
    const file: UploadFile = {
      tempFilePath: 'temp_file_path_1',
      name: 'image.jpg',
      size: 1000000,
      type: 'image/jpeg',
    }
    const result = await uploadImage(file)

    expect(result.success).toBe(true)
    expect(result.data).toBe('https://example.com/abc-123.jpg')
  })

  it('should call uploadFile with correct options', async () => {
    const file: UploadFile = {
      tempFilePath: 'temp_file_path_1',
      name: 'image.jpg',
      size: 1000000,
      type: 'image/jpeg',
    }

    await uploadImage(file)

    expect(uniMock.uploadFile).toHaveBeenCalledWith({
      url: expect.stringContaining('/upload'),
      filePath: 'temp_file_path_1',
      name: 'file',
      cloudPath: expect.stringMatching(/^clothing\/.*\.jpg$/),
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should call progress callback during upload', async () => {
    const file: UploadFile = {
      tempFilePath: 'temp_file_path_1',
      name: 'image.jpg',
      size: 1000000,
      type: 'image/jpeg',
    }
    const progressMock = jest.fn()

    await uploadImage(file, progressMock)

    // Wait for progress updates
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(progressMock).toHaveBeenCalledWith(100)
  })

  it('should handle upload error and return failed result', async () => {
    uniMock.uploadFile.mockImplementationOnce((options: any) => {
      setTimeout(() => {
        options.fail?.({ errMsg: 'uploadFile:fail' })
      }, 10)
      const task = { onProgressUpdate: jest.fn() }
      return Object.assign(task, {
        then: (resolve: any) => resolve(task),
      })
    })

    const file: UploadFile = {
      tempFilePath: 'temp_file_path_1',
      name: 'image.jpg',
      size: 1000000,
      type: 'image/jpeg',
    }

    const result = await uploadImage(file)

    expect(result.success).toBe(false)
    expect(result.error).toContain('uploadFile:fail')
  })

  it('should handle timeout error and return failed result', async () => {
    // This test uses fake timers to simulate timeout
    jest.useFakeTimers()

    uniMock.uploadFile.mockImplementationOnce(() => {
      const task = { onProgressUpdate: jest.fn() }
      return Object.assign(task, {
        then: (resolve: any) => resolve(task),
      })
    })

    const file: UploadFile = {
      tempFilePath: 'temp_file_path_1',
      name: 'image.jpg',
      size: 1000000,
      type: 'image/jpeg',
    }

    const resultPromise = uploadImage(file)

    // Fast-forward time past timeout
    jest.advanceTimersByTime(30000)

    const result = await resultPromise

    jest.useRealTimers()

    expect(result.success).toBe(false)
    expect(result.error).toContain('timeout')
  })
})

describe('deleteImage', () => {
  it('should delete image and return successful result', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.success?.({
          errMsg: 'deleteFile:ok',
          fileList: [{ status: 0 }],
        })
      }, 10)
    })

    const result = await deleteImage('https://example.com/abc-123.jpg')

    expect(result.success).toBe(true)
    expect(uniMock.deleteFile).toHaveBeenCalledWith({
      fileList: [{ cloudPath: 'abc-123.jpg' }],
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should handle delete error and return failed result', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.fail?.({ errMsg: 'deleteFile:fail' })
      }, 10)
    })

    const result = await deleteImage('https://example.com/abc-123.jpg')

    expect(result.success).toBe(false)
    expect(result.error).toContain('deleteFile:fail')
  })

  it('should handle invalid URL and return failed result', async () => {
    const result = await deleteImage('invalid-url')

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('should handle URL with query parameters', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.success?.({
          errMsg: 'deleteFile:ok',
          fileList: [{ status: 0 }],
        })
      }, 10)
    })

    const result = await deleteImage('https://example.com/abc-123.jpg?sign=xxx&token=yyy')

    expect(result.success).toBe(true)
    expect(uniMock.deleteFile).toHaveBeenCalledWith({
      fileList: [{ cloudPath: 'abc-123.jpg' }],
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should handle URL with multiple path segments', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.success?.({
          errMsg: 'deleteFile:ok',
          fileList: [{ status: 0 }],
        })
      }, 10)
    })

    const result = await deleteImage('https://example.com/path/to/abc-123.jpg')

    expect(result.success).toBe(true)
    expect(uniMock.deleteFile).toHaveBeenCalledWith({
      fileList: [{ cloudPath: 'path/to/abc-123.jpg' }],
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should handle URL with path and query parameters', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.success?.({
          errMsg: 'deleteFile:ok',
          fileList: [{ status: 0 }],
        })
      }, 10)
    })

    const result = await deleteImage('https://example.com/path/to/abc-123.jpg?sign=xxx')

    expect(result.success).toBe(true)
    expect(uniMock.deleteFile).toHaveBeenCalledWith({
      fileList: [{ cloudPath: 'path/to/abc-123.jpg' }],
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should handle cloud:// protocol URL', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.success?.({
          errMsg: 'deleteFile:ok',
          fileList: [{ status: 0 }],
        })
      }, 10)
    })

    const result = await deleteImage('cloud://env-id.123/path/to/abc-123.jpg?sign=xxx')

    expect(result.success).toBe(true)
    expect(uniMock.deleteFile).toHaveBeenCalledWith({
      fileList: [{ cloudPath: 'path/to/abc-123.jpg' }],
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should handle direct file path', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.success?.({
          errMsg: 'deleteFile:ok',
          fileList: [{ status: 0 }],
        })
      }, 10)
    })

    const result = await deleteImage('clothing/abc-123.jpg')

    expect(result.success).toBe(true)
    expect(uniMock.deleteFile).toHaveBeenCalledWith({
      fileList: [{ cloudPath: 'clothing/abc-123.jpg' }],
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should handle URL encoded characters', async () => {
    uniMock.deleteFile = jest.fn((options: any) => {
      setTimeout(() => {
        options.success?.({
          errMsg: 'deleteFile:ok',
          fileList: [{ status: 0 }],
        })
      }, 10)
    })

    const result = await deleteImage('https://example.com/abc%20def.jpg?sign=xxx')

    expect(result.success).toBe(true)
    // URL should be decoded: %20 becomes space
    expect(uniMock.deleteFile).toHaveBeenCalledWith({
      fileList: [{ cloudPath: 'abc def.jpg' }],
      success: expect.any(Function),
      fail: expect.any(Function),
    })
  })

  it('should handle empty string', async () => {
    const result = await deleteImage('')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid URL')
  })
})

describe('uploadMultipleImages', () => {
  it('should upload multiple images and return successful result with URLs', async () => {
    const files: UploadFile[] = [
      {
        tempFilePath: 'temp_file_path_1',
        name: 'image1.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
      {
        tempFilePath: 'temp_file_path_2',
        name: 'image2.jpg',
        size: 2000000,
        type: 'image/jpeg',
      },
    ]

    const result = await uploadMultipleImages(files)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(['https://example.com/abc-123.jpg', 'https://example.com/abc-123.jpg'])
  })

  it('should upload files in order', async () => {
    const files: UploadFile[] = [
      {
        tempFilePath: 'temp_1',
        name: 'a.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
      {
        tempFilePath: 'temp_2',
        name: 'b.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
      {
        tempFilePath: 'temp_3',
        name: 'c.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
    ]

    const result = await uploadMultipleImages(files)

    expect(result.success).toBe(true)
    expect(result.data?.length).toBe(3)
  })

  it('should call progress callback for each file', async () => {
    const files: UploadFile[] = [
      {
        tempFilePath: 'temp_1',
        name: 'a.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
      {
        tempFilePath: 'temp_2',
        name: 'b.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
    ]
    const progressMock = jest.fn()

    await uploadMultipleImages(files, progressMock)

    // Wait for all progress updates
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Should be called for both files
    expect(progressMock).toHaveBeenCalled()
  })

  it('should handle partial failure and return failed result', async () => {
    // First upload fails, second succeeds
    let callCount = 0
    uniMock.uploadFile = jest.fn((options: any) => {
      callCount++
      if (callCount === 1) {
        setTimeout(() => {
          options.fail?.({ errMsg: 'uploadFile:fail' })
        }, 10)
      } else {
        setTimeout(() => {
          options.success?.({
            data: JSON.stringify({ fileID: 'cloud://test-env.123/abc-123.jpg', url: 'https://example.com/abc-123.jpg' }),
            statusCode: 200,
          })
        }, 10)
      }
      const task = { onProgressUpdate: jest.fn() }
      return Object.assign(task, {
        then: (resolve: any) => resolve(task),
      })
    })

    const files: UploadFile[] = [
      {
        tempFilePath: 'temp_1',
        name: 'a.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
      {
        tempFilePath: 'temp_2',
        name: 'b.jpg',
        size: 1000000,
        type: 'image/jpeg',
      },
    ]

    const result = await uploadMultipleImages(files)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('should handle empty array and return successful result with empty array', async () => {
    const result = await uploadMultipleImages([])

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })
})
