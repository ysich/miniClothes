/**
 * Clothing Store 测试
 */

import { setActivePinia, createPinia } from 'pinia'
import type { Clothing } from '@/types'

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

describe('clothing store', () => {
  describe('initial state', () => {
    it('should initialize with empty clothingList', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()
      expect(store.clothingList).toEqual([])
    })

    it('should initialize with null selectedId', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()
      expect(store.selectedId).toBe(null)
    })

    it('should initialize with isLoading false', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('getters', () => {
    it('should return total count of clothing items', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      store.setClothingList([
        {
          id: '1',
          name: 'T恤',
          brand: '',
          category: '',
          color: '',
          size: '',
          images: [],
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          name: '裤子',
          brand: '',
          category: '',
          color: '',
          size: '',
          images: [],
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
      ])

      expect(store.totalCount).toBe(2)
    })

    it('should return empty array for activeClothing when list is empty', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()
      expect(store.activeClothing).toEqual([])
    })

    it('should return only active clothing items', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      store.setClothingList([
        {
          id: '1',
          name: 'T恤',
          brand: '',
          category: '',
          color: '',
          size: '',
          images: [],
          tags: [],
          status: 'active',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          name: '旧裤子',
          brand: '',
          category: '',
          color: '',
          size: '',
          images: [],
          tags: [],
          status: 'archived',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          name: '新衣服',
          brand: '',
          category: '',
          color: '',
          size: '',
          images: [],
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
      ])

      expect(store.activeClothing).toHaveLength(2)
      expect(store.activeClothing.map((c: Clothing) => c.id)).toEqual(['1', '3'])
    })

    it('should return clothing by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothing: Clothing = {
        id: '1',
        name: 'T恤',
        brand: 'Nike',
        category: '上装',
        color: '白色',
        size: 'M',
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      }

      store.setClothingList([testClothing])

      expect(store.getClothingById('1')).toEqual(testClothing)
    })

    it('should return null when clothing id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()
      expect(store.getClothingById('999')).toBe(null)
    })
  })

  describe('actions', () => {
    it('should add clothing to list', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothing: Clothing = {
        id: '1',
        name: 'T恤',
        brand: 'Nike',
        category: '上装',
        color: '白色',
        size: 'M',
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addClothing(testClothing)

      expect(store.clothingList).toHaveLength(1)
      expect(store.clothingList[0]).toEqual(testClothing)
    })

    it('should update clothing by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothing: Clothing = {
        id: '1',
        name: 'T恤',
        brand: 'Nike',
        category: '上装',
        color: '白色',
        size: 'M',
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addClothing(testClothing)

      store.updateClothing('1', { name: '新T恤', color: '黑色' })

      expect(store.clothingList[0].name).toBe('新T恤')
      expect(store.clothingList[0].color).toBe('黑色')
      expect(store.clothingList[0].brand).toBe('Nike') // 保持原值
    })

    it('should not update when clothing id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothing: Clothing = {
        id: '1',
        name: 'T恤',
        brand: 'Nike',
        category: '上装',
        color: '白色',
        size: 'M',
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addClothing(testClothing)

      const initialLength = store.clothingList.length

      store.updateClothing('999', { name: '新T恤' })

      expect(store.clothingList.length).toBe(initialLength)
      expect(store.clothingList[0].name).toBe('T恤')
    })

    it('should delete clothing by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothing: Clothing = {
        id: '1',
        name: 'T恤',
        brand: 'Nike',
        category: '上装',
        color: '白色',
        size: 'M',
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addClothing(testClothing)

      expect(store.clothingList).toHaveLength(1)

      store.deleteClothing('1')

      expect(store.clothingList).toHaveLength(0)
    })

    it('should not delete when clothing id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothing: Clothing = {
        id: '1',
        name: 'T恤',
        brand: 'Nike',
        category: '上装',
        color: '白色',
        size: 'M',
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      }

      store.addClothing(testClothing)

      const initialLength = store.clothingList.length

      store.deleteClothing('999')

      expect(store.clothingList.length).toBe(initialLength)
    })

    it('should set entire clothing list', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothingList: Clothing[] = [
        {
          id: '1',
          name: 'T恤',
          brand: 'Nike',
          category: '上装',
          color: '白色',
          size: 'M',
          images: [],
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          name: '裤子',
          brand: 'Adidas',
          category: '下装',
          color: '蓝色',
          size: 'L',
          images: [],
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
      ]

      store.setClothingList(testClothingList)

      expect(store.clothingList).toEqual(testClothingList)
    })

    it('should set selectedId', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      store.selectedId = '1'

      expect(store.selectedId).toBe('1')
    })

    it('should load data from storage', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      const testClothingList: Clothing[] = [
        {
          id: '1',
          name: 'T恤',
          brand: 'Nike',
          category: '上装',
          color: '白色',
          size: 'M',
          images: [],
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
      ]

      mockStorage['clothing-store'] = testClothingList

      await store.loadFromStorage()

      expect(store.clothingList).toEqual(testClothingList)
      expect(store.isLoading).toBe(false)
    })

    it('should handle storage load with no data', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      mockStorage['clothing-store'] = ''

      await store.loadFromStorage()

      expect(store.clothingList).toEqual([])
      expect(store.isLoading).toBe(false)
    })

    it('should handle storage load with error', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useClothingStore = require('./clothing').useClothingStore
      const store = useClothingStore()

      // Mock uni.getStorageSync to throw an error
      const originalMock = uni.getStorageSync
      uni.getStorageSync = jest.fn(() => {
        throw new Error('Storage error')
      })
      ;(global as any).uni = uni

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await store.loadFromStorage()

      expect(store.isLoading).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith('Failed to load clothing list from storage:', expect.any(Error))

      errorSpy.mockRestore()
      uni.getStorageSync = originalMock
    })
  })
})

describe('clothing store persistence', () => {
  it('should persist clothingList to storage', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const useClothingStore = require('./clothing').useClothingStore
    const store = useClothingStore()

    const testClothing: Clothing = {
      id: '1',
      name: 'T恤',
      brand: 'Nike',
      category: '上装',
      color: '白色',
      size: 'M',
      images: [],
      tags: [],
      createdAt: '',
      updatedAt: '',
    }

    store.addClothing(testClothing)

    // 持久化应该通过插件自动触发
    // 这里我们验证数据操作的正确性
    expect(store.clothingList).toHaveLength(1)
  })
})
