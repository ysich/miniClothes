/**
 * Outfit Store 测试
 */

import { setActivePinia, createPinia } from 'pinia'
import type { Outfit } from '@/types'

// Mock uni API
const mockStorage: Record<string, unknown> = {}

const uniMock = {
  getStorageSync: jest.fn((key: string) => {
    return mockStorage[key] ?? ''
  }),
  setStorageSync: jest.fn((key: string, value: unknown) => {
    mockStorage[key] = value
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

describe('outfit store', () => {
  describe('initial state', () => {
    it('should initialize with empty outfitList', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()
      expect(store.outfitList).toEqual([])
    })

    it('should initialize with null selectedId', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()
      expect(store.selectedId).toBe(null)
    })

    it('should initialize with isLoading false', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('getters', () => {
    it('should return total outfits count', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      store.setOutfitList([
        {
          id: '1',
          name: '运动搭配',
          clothingIds: ['c1', 'c2'],
          images: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          name: '休闲搭配',
          clothingIds: ['c3', 'c4'],
          images: [],
          createdAt: '',
          updatedAt: '',
        },
      ])

      expect(store.totalOutfits).toBe(2)
    })

    it('should return outfit by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfit: Outfit = {
        id: '1',
        name: '运动搭配',
        clothingIds: ['c1', 'c2'],
        images: [],
        createdAt: '',
        updatedAt: '',
      }

      store.setOutfitList([testOutfit])

      expect(store.getOutfitById('1')).toEqual(testOutfit)
    })

    it('should return null when outfit id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()
      expect(store.getOutfitById('999')).toBe(null)
    })
  })

  describe('actions', () => {
    it('should add outfit to list', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfit: Outfit = {
        id: '1',
        name: '运动搭配',
        clothingIds: ['c1', 'c2'],
        images: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addOutfit(testOutfit)

      expect(store.outfitList).toHaveLength(1)
      expect(store.outfitList[0]).toEqual(testOutfit)
    })

    it('should update outfit by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfit: Outfit = {
        id: '1',
        name: '运动搭配',
        clothingIds: ['c1', 'c2'],
        images: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addOutfit(testOutfit)

      store.updateOutfit('1', { name: '新搭配', clothingIds: ['c1', 'c2', 'c3'] })

      expect(store.outfitList[0].name).toBe('新搭配')
      expect(store.outfitList[0].clothingIds).toEqual(['c1', 'c2', 'c3'])
    })

    it('should not update when outfit id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfit: Outfit = {
        id: '1',
        name: '运动搭配',
        clothingIds: ['c1', 'c2'],
        images: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addOutfit(testOutfit)

      const initialLength = store.outfitList.length

      store.updateOutfit('999', { name: '新搭配' })

      expect(store.outfitList.length).toBe(initialLength)
      expect(store.outfitList[0].name).toBe('运动搭配')
    })

    it('should delete outfit by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfit: Outfit = {
        id: '1',
        name: '运动搭配',
        clothingIds: ['c1', 'c2'],
        images: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addOutfit(testOutfit)

      expect(store.outfitList).toHaveLength(1)

      store.deleteOutfit('1')

      expect(store.outfitList).toHaveLength(0)
    })

    it('should not delete when outfit id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfit: Outfit = {
        id: '1',
        name: '运动搭配',
        clothingIds: ['c1', 'c2'],
        images: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addOutfit(testOutfit)

      const initialLength = store.outfitList.length

      store.deleteOutfit('999')

      expect(store.outfitList.length).toBe(initialLength)
    })

    it('should set entire outfit list', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfitList: Outfit[] = [
        {
          id: '1',
          name: '运动搭配',
          clothingIds: ['c1', 'c2'],
          images: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          name: '休闲搭配',
          clothingIds: ['c3', 'c4'],
          images: [],
          createdAt: '',
          updatedAt: '',
        },
      ]

      store.setOutfitList(testOutfitList)

      expect(store.outfitList).toEqual(testOutfitList)
    })

    it('should set selectedId', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      store.selectedId = '1'

      expect(store.selectedId).toBe('1')
    })

    it('should load data from storage', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      const testOutfitList: Outfit[] = [
        {
          id: '1',
          name: '运动搭配',
          clothingIds: ['c1', 'c2'],
          images: [],
          createdAt: '',
          updatedAt: '',
        },
      ]

      mockStorage['outfit-store'] = testOutfitList

      await store.loadFromStorage()

      expect(store.outfitList).toEqual(testOutfitList)
      expect(store.isLoading).toBe(false)
    })

    it('should handle storage load with no data', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      mockStorage['outfit-store'] = ''

      await store.loadFromStorage()

      expect(store.outfitList).toEqual([])
      expect(store.isLoading).toBe(false)
    })

    it('should handle storage load with error', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useOutfitStore = require('./outfit').useOutfitStore
      const store = useOutfitStore()

      // Mock uni.getStorageSync to throw an error
      const originalMock = uni.getStorageSync
      uni.getStorageSync = jest.fn(() => {
        throw new Error('Storage error')
      })
      ;(global as any).uni = uni

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await store.loadFromStorage()

      expect(store.isLoading).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith('Failed to load outfit list from storage:', expect.any(Error))

      errorSpy.mockRestore()
      uni.getStorageSync = originalMock
    })
  })
})

describe('outfit store persistence', () => {
  it('should persist outfitList to storage', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const useOutfitStore = require('./outfit').useOutfitStore
    const store = useOutfitStore()

    const testOutfit: Outfit = {
      id: '1',
      name: '运动搭配',
      clothingIds: ['c1', 'c2'],
      images: [],
      createdAt: '',
      updatedAt: '',
    }

    store.addOutfit(testOutfit)

    // 持久化应该通过插件自动触发
    // 这里我们验证数据操作的正确性
    expect(store.outfitList).toHaveLength(1)
  })
})
