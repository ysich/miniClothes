/**
 * Calendar Store
 *
 * 管理穿搭日历记录的状态和操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalendarWear } from '@/types'

export const useCalendarStore = defineStore(
  'calendar',
  () => {
    // State
    const wearRecords = ref<CalendarWear[]>([])
    const currentDate = ref(getTodayDate())
    const isLoading = ref(false)

    // Getters
    const getWearByDate = computed(() => (date: string) => {
      return wearRecords.value.filter(r => r.date === date)
    })

    const getMonthlyStats = computed(() => (year: number, month: number) => {
      const monthStr = month.toString().padStart(2, '0')
      const monthPrefix = `${year}-${monthStr}`

      const monthRecords = wearRecords.value.filter(r => r.date.startsWith(monthPrefix))

      const uniqueDates = new Set(monthRecords.map(r => r.date))
      const clothingSet = new Set<string>()
      monthRecords.forEach(r => {
        r.clothingIds.forEach(id => clothingSet.add(id))
      })

      return {
        totalWears: monthRecords.length,
        uniqueDates: uniqueDates.size,
        clothingCount: clothingSet.size,
      }
    })

    // Actions
    const setWearRecords = (records: CalendarWear[]) => {
      wearRecords.value = records
    }

    const addWearRecord = (record: CalendarWear) => {
      wearRecords.value.push(record)
    }

    const updateWearRecord = (id: string, updates: Partial<CalendarWear>) => {
      const index = wearRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        wearRecords.value[index] = {
          ...wearRecords.value[index],
          ...updates,
        }
      }
    }

    const deleteWearRecord = (id: string) => {
      const index = wearRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        wearRecords.value.splice(index, 1)
      }
    }

    const loadFromStorage = async () => {
      isLoading.value = true
      try {
        const value = uni.getStorageSync('calendar-store')
        if (value && value !== '') {
          wearRecords.value = value as CalendarWear[]
        }
      } catch (error) {
        console.error('Failed to load wear records from storage:', error)
      } finally {
        isLoading.value = false
      }
    }

    return {
      // State
      wearRecords,
      currentDate,
      isLoading,
      // Getters
      getWearByDate,
      getMonthlyStats,
      // Actions
      setWearRecords,
      addWearRecord,
      updateWearRecord,
      deleteWearRecord,
      loadFromStorage,
    }
  },
  {
    persist: {
      key: 'calendar-store',
      storage: {
        getItem: (key: string) => {
          return uni.getStorageSync(key)
        },
        setItem: (key: string, value: unknown) => {
          uni.setStorageSync(key, value)
        },
      },
      paths: ['wearRecords'],
    },
  }
)

/**
 * 获取今日日期字符串，格式为 YYYY-MM-DD
 */
function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
