/**
 * Storage 工具测试
 */

import { getItem, setItem, removeItem, clear } from './storage'
import type { Result } from '@/types'

// Mock uni API
const mockStorage: Record<string, unknown> = {}

const uniMock = {
  getStorageSync: jest.fn((key: string) => {
    return mockStorage[key] ?? ''
  }),
  setStorageSync: jest.fn((key: string, value: unknown) => {
    mockStorage[key] = value
  }),
  removeStorageSync: jest.fn((key: string) => {
    delete mockStorage[key]
  }),
  clearStorageSync: jest.fn(() => {
    Object.keys(mockStorage).forEach(key => {
      delete mockStorage[key]
    })
  }),
}

beforeEach(() => {
  // 清空 mock storage
  Object.keys(mockStorage).forEach(key => {
    delete mockStorage[key]
  })
  // 清空所有 mock 调用记录
  jest.clearAllMocks()
  // 设置全局 uni
  ;(global as any).uni = uniMock
})

describe('getItem', () => {
  it('should return failed result when key does not exist', () => {
    const result = getItem<string>('non_existent_key')
    expect(result).toEqual({
      success: false,
      error: 'Key "non_existent_key" not found',
    })
  })

  it('should return successful result with correct type', () => {
    mockStorage['test_key'] = 'test_value'
    const result = getItem<string>('test_key')
    expect(result).toEqual({
      success: true,
      data: 'test_value',
    })
  })

  it('should return failed result when storage returns empty string', () => {
    mockStorage['empty_key'] = ''
    const result = getItem<string>('empty_key')
    expect(result).toEqual({
      success: false,
      error: 'Key "empty_key" not found',
    })
  })

  it('should parse and return object value', () => {
    const testObj = { name: 'test', age: 18 }
    mockStorage['obj_key'] = testObj
    const result = getItem<{ name: string; age: number }>('obj_key')
    expect(result).toEqual({
      success: true,
      data: testObj,
    })
  })

  it('should parse and return array value', () => {
    const testArr = [1, 2, 3]
    mockStorage['arr_key'] = testArr
    const result = getItem<number[]>('arr_key')
    expect(result).toEqual({
      success: true,
      data: testArr,
    })
  })

  it('should handle number value', () => {
    mockStorage['num_key'] = 42
    const result = getItem<number>('num_key')
    expect(result).toEqual({
      success: true,
      data: 42,
    })
  })

  it('should handle boolean value', () => {
    mockStorage['bool_key'] = true
    const result = getItem<boolean>('bool_key')
    expect(result).toEqual({
      success: true,
      data: true,
    })
  })
})

describe('setItem', () => {
  it('should set string value and return successful result', () => {
    const result = setItem('string_key', 'hello')
    expect(result).toEqual({ success: true })
    expect(uniMock.setStorageSync).toHaveBeenCalledWith('string_key', 'hello')
  })

  it('should set object value and return successful result', () => {
    const testObj = { id: '1', name: 'test' }
    const result = setItem('obj_key', testObj)
    expect(result).toEqual({ success: true })
    expect(uniMock.setStorageSync).toHaveBeenCalledWith('obj_key', testObj)
  })

  it('should set number value and return successful result', () => {
    const result = setItem('num_key', 123)
    expect(result).toEqual({ success: true })
    expect(uniMock.setStorageSync).toHaveBeenCalledWith('num_key', 123)
  })

  it('should set boolean value and return successful result', () => {
    const result = setItem('bool_key', false)
    expect(result).toEqual({ success: true })
    expect(uniMock.setStorageSync).toHaveBeenCalledWith('bool_key', false)
  })

  it('should handle error and return failed result', () => {
    uniMock.setStorageSync.mockImplementationOnce(() => {
      throw new Error('Storage full')
    })
    const result = setItem('error_key', 'value')
    expect(result).toEqual({
      success: false,
      error: 'Storage full',
    })
  })
})

describe('removeItem', () => {
  beforeEach(() => {
    mockStorage['to_remove'] = 'value'
  })

  it('should remove item and return successful result', () => {
    const result = removeItem('to_remove')
    expect(result).toEqual({ success: true })
    expect(uniMock.removeStorageSync).toHaveBeenCalledWith('to_remove')
  })

  it('should remove non-existent item and return successful result', () => {
    const result = removeItem('non_existent')
    expect(result).toEqual({ success: true })
    expect(uniMock.removeStorageSync).toHaveBeenCalledWith('non_existent')
  })

  it('should handle error and return failed result', () => {
    uniMock.removeStorageSync.mockImplementationOnce(() => {
      throw new Error('Storage error')
    })
    const result = removeItem('error_key')
    expect(result).toEqual({
      success: false,
      error: 'Storage error',
    })
  })
})

describe('clear', () => {
  beforeEach(() => {
    mockStorage['key1'] = 'value1'
    mockStorage['key2'] = 'value2'
    mockStorage['key3'] = { data: 'test' }
  })

  it('should clear all storage and return successful result', () => {
    const result = clear()
    expect(result).toEqual({ success: true })
    expect(uniMock.clearStorageSync).toHaveBeenCalled()
  })

  it('should handle error and return failed result', () => {
    uniMock.clearStorageSync.mockImplementationOnce(() => {
      throw new Error('Storage error')
    })
    const result = clear()
    expect(result).toEqual({
      success: false,
      error: 'Storage error',
    })
  })
})

describe('integration', () => {
  it('should work with complete storage cycle', () => {
    // Set
    expect(setItem('user', { name: 'Alice', age: 25 })).toEqual({
      success: true,
    })
    expect(mockStorage['user']).toEqual({ name: 'Alice', age: 25 })

    // Get
    expect(getItem<{ name: string; age: number }>('user')).toEqual({
      success: true,
      data: { name: 'Alice', age: 25 },
    })

    // Update
    expect(setItem('user', { name: 'Alice', age: 26 })).toEqual({
      success: true,
    })
    expect(getItem<{ name: string; age: number }>('user')).toEqual({
      success: true,
      data: { name: 'Alice', age: 26 },
    })

    // Remove
    expect(removeItem('user')).toEqual({ success: true })
    expect(getItem('user')).toEqual({
      success: false,
      error: 'Key "user" not found',
    })

    // Clear
    expect(setItem('temp1', 'value1')).toEqual({ success: true })
    expect(setItem('temp2', 'value2')).toEqual({ success: true })
    expect(clear()).toEqual({ success: true })
    expect(getItem('temp1')).toEqual({
      success: false,
      error: 'Key "temp1" not found',
    })
    expect(getItem('temp2')).toEqual({
      success: false,
      error: 'Key "temp2" not found',
    })
  })
})

describe('Result type', () => {
  it('should have correct Result type structure', () => {
    const successResult: Result<string> = {
      success: true,
      data: 'test',
    }
    const failedResult: Result<string> = {
      success: false,
      error: 'error',
    }

    expect(successResult.success).toBe(true)
    expect(successResult.data).toBe('test')
    expect(failedResult.success).toBe(false)
    expect(failedResult.error).toBe('error')
  })
})
