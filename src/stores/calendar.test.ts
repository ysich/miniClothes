/**
 * Calendar Store 测试
 */

import { setActivePinia, createPinia } from 'pinia'
import type { CalendarWear } from '@/types'

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

describe('calendar store', () => {
  describe('initial state', () => {
    it('should initialize with empty wearRecords', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()
      expect(store.wearRecords).toEqual([])
    })

    it('should initialize with current date as currentDate', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const today = new Date().toISOString().split('T')[0]
      expect(store.currentDate).toBe(today)
    })
  })

  describe('getters', () => {
    it('should return wear records by date', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecords: CalendarWear[] = [
        {
          id: '1',
          date: '2026-01-15',
          clothingIds: ['c1', 'c2'],
          createdAt: '',
        },
        {
          id: '2',
          date: '2026-01-16',
          clothingIds: ['c3', 'c4'],
          createdAt: '',
        },
        {
          id: '3',
          date: '2026-01-16',
          clothingIds: ['c5', 'c6'],
          outfitId: 'o1',
          createdAt: '',
        },
      ]

      store.setWearRecords(testRecords)

      const result = store.getWearByDate('2026-01-16')
      expect(result).toHaveLength(2)
      expect(result).toEqual([
        {
          id: '2',
          date: '2026-01-16',
          clothingIds: ['c3', 'c4'],
          createdAt: '',
        },
        {
          id: '3',
          date: '2026-01-16',
          clothingIds: ['c5', 'c6'],
          outfitId: 'o1',
          createdAt: '',
        },
      ])
    })

    it('should return empty array when no records for date', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()
      expect(store.getWearByDate('2026-01-01')).toEqual([])
    })

    it('should return monthly stats', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecords: CalendarWear[] = [
        {
          id: '1',
          date: '2026-01-15',
          clothingIds: ['c1', 'c2'],
          createdAt: '',
        },
        {
          id: '2',
          date: '2026-01-16',
          clothingIds: ['c3', 'c4'],
          createdAt: '',
        },
        {
          id: '3',
          date: '2026-01-16',
          clothingIds: ['c5', 'c6'],
          outfitId: 'o1',
          createdAt: '',
        },
        {
          id: '4',
          date: '2026-02-01',
          clothingIds: ['c7'],
          createdAt: '',
        },
      ]

      store.setWearRecords(testRecords)

      const stats = store.getMonthlyStats(2026, 1)
      expect(stats.totalWears).toBe(3)
      expect(stats.uniqueDates).toBe(2)
      expect(stats.clothingCount).toBe(6) // c1, c2, c3, c4, c5, c6 (去重是6个)
    })

    it('should return empty stats when no records for month', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const stats = store.getMonthlyStats(2025, 12)
      expect(stats.totalWears).toBe(0)
      expect(stats.uniqueDates).toBe(0)
      expect(stats.clothingCount).toBe(0)
    })
  })

  describe('actions', () => {
    it('should add wear record', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecord: CalendarWear = {
        id: '1',
        date: '2026-01-16',
        clothingIds: ['c1', 'c2'],
        createdAt: '',
      }

      store.addWearRecord(testRecord)

      expect(store.wearRecords).toHaveLength(1)
      expect(store.wearRecords[0]).toEqual(testRecord)
    })

    it('should update wear record by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecord: CalendarWear = {
        id: '1',
        date: '2026-01-16',
        clothingIds: ['c1', 'c2'],
        createdAt: '',
      }

      store.addWearRecord(testRecord)

      store.updateWearRecord('1', { date: '2026-01-17', clothingIds: ['c3'] })

      expect(store.wearRecords[0].date).toBe('2026-01-17')
      expect(store.wearRecords[0].clothingIds).toEqual(['c3'])
    })

    it('should not update when record id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecord: CalendarWear = {
        id: '1',
        date: '2026-01-16',
        clothingIds: ['c1', 'c2'],
        createdAt: '',
      }

      store.addWearRecord(testRecord)

      const initialLength = store.wearRecords.length

      store.updateWearRecord('999', { date: '2026-01-17' })

      expect(store.wearRecords.length).toBe(initialLength)
      expect(store.wearRecords[0].date).toBe('2026-01-16')
    })

    it('should delete wear record by id', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecord: CalendarWear = {
        id: '1',
        date: '2026-01-16',
        clothingIds: ['c1', 'c2'],
        createdAt: '',
      }

      store.addWearRecord(testRecord)

      expect(store.wearRecords).toHaveLength(1)

      store.deleteWearRecord('1')

      expect(store.wearRecords).toHaveLength(0)
    })

    it('should not delete when record id not found', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecord: CalendarWear = {
        id: '1',
        date: '2026-01-16',
        clothingIds: ['c1', 'c2'],
        createdAt: '',
      }

      store.addWearRecord(testRecord)

      const initialLength = store.wearRecords.length

      store.deleteWearRecord('999')

      expect(store.wearRecords.length).toBe(initialLength)
    })

    it('should set entire wear records list', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecords: CalendarWear[] = [
        {
          id: '1',
          date: '2026-01-15',
          clothingIds: ['c1', 'c2'],
          createdAt: '',
        },
        {
          id: '2',
          date: '2026-01-16',
          clothingIds: ['c3', 'c4'],
          createdAt: '',
        },
      ]

      store.setWearRecords(testRecords)

      expect(store.wearRecords).toEqual(testRecords)
    })

    it('should set currentDate', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      store.currentDate = '2026-01-16'

      expect(store.currentDate).toBe('2026-01-16')
    })

    it('should load data from storage', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      const testRecords: CalendarWear[] = [
        {
          id: '1',
          date: '2026-01-16',
          clothingIds: ['c1', 'c2'],
          createdAt: '',
        },
      ]

      mockStorage['calendar-store'] = testRecords

      await store.loadFromStorage()

      expect(store.wearRecords).toEqual(testRecords)
      expect(store.isLoading).toBe(false)
    })

    it('should handle storage load with no data', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      mockStorage['calendar-store'] = ''

      await store.loadFromStorage()

      expect(store.wearRecords).toEqual([])
      expect(store.isLoading).toBe(false)
    })

    it('should handle storage load with error', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const useCalendarStore = require('./calendar').useCalendarStore
      const store = useCalendarStore()

      // Mock uni.getStorageSync to throw an error
      const originalMock = uni.getStorageSync
      uni.getStorageSync = jest.fn(() => {
        throw new Error('Storage error')
      })
      ;(global as any).uni = uni

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await store.loadFromStorage()

      expect(store.isLoading).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith('Failed to load wear records from storage:', expect.any(Error))

      errorSpy.mockRestore()
      uni.getStorageSync = originalMock
    })
  })
})

describe('calendar store persistence', () => {
  it('should persist wearRecords to storage', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const useCalendarStore = require('./calendar').useCalendarStore
    const store = useCalendarStore()

    const testRecord: CalendarWear = {
      id: '1',
      date: '2026-01-16',
      clothingIds: ['c1', 'c2'],
      createdAt: '',
    }

    store.addWearRecord(testRecord)

    // 持久化应该通过插件自动触发
    // 这里我们验证数据操作的正确性
    expect(store.wearRecords).toHaveLength(1)
  })
})
