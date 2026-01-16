/**
 * Clothing Store
 *
 * 管理衣物列表的状态和操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Clothing } from '@/types'

export const useClothingStore = defineStore(
  'clothing',
  () => {
    // State
    const clothingList = ref<Clothing[]>([])
    const selectedId = ref<string | null>(null)
    const isLoading = ref(false)

    // Getters
    const totalCount = computed(() => clothingList.value.length)

    const activeClothing = computed(() =>
      clothingList.value.filter(c => c.status !== 'archived')
    )

    const getClothingById = computed(() => (id: string) => {
      return clothingList.value.find(c => c.id === id) ?? null
    })

    // Actions
    const setClothingList = (list: Clothing[]) => {
      clothingList.value = list
    }

    const addClothing = (clothing: Clothing) => {
      clothingList.value.push(clothing)
    }

    const updateClothing = (id: string, updates: Partial<Clothing>) => {
      const index = clothingList.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clothingList.value[index] = {
          ...clothingList.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      }
    }

    const deleteClothing = (id: string) => {
      const index = clothingList.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clothingList.value.splice(index, 1)
      }
    }

    const loadFromStorage = async () => {
      isLoading.value = true
      try {
        const value = uni.getStorageSync('clothing-store')
        if (value && value !== '') {
          clothingList.value = value as Clothing[]
        }
      } catch (error) {
        console.error('Failed to load clothing list from storage:', error)
      } finally {
        isLoading.value = false
      }
    }

    return {
      // State
      clothingList,
      selectedId,
      isLoading,
      // Getters
      totalCount,
      activeClothing,
      getClothingById,
      // Actions
      setClothingList,
      addClothing,
      updateClothing,
      deleteClothing,
      loadFromStorage,
    }
  },
  {
    persist: {
      key: 'clothing-store',
      storage: {
        getItem: (key: string) => {
          return uni.getStorageSync(key)
        },
        setItem: (key: string, value: unknown) => {
          uni.setStorageSync(key, value)
        },
      },
      paths: ['clothingList', 'selectedId'],
    },
  }
)
