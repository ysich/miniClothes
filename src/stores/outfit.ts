/**
 * Outfit Store
 *
 * 管理搭配列表的状态和操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Outfit } from '@/types'

export const useOutfitStore = defineStore(
  'outfit',
  () => {
    // State
    const outfitList = ref<Outfit[]>([])
    const selectedId = ref<string | null>(null)
    const isLoading = ref(false)

    // Getters
    const totalOutfits = computed(() => outfitList.value.length)

    const getOutfitById = computed(() => (id: string) => {
      return outfitList.value.find(o => o.id === id) ?? null
    })

    // Actions
    const setOutfitList = (list: Outfit[]) => {
      outfitList.value = list
    }

    const addOutfit = (outfit: Outfit) => {
      outfitList.value.push(outfit)
    }

    const updateOutfit = (id: string, updates: Partial<Outfit>) => {
      const index = outfitList.value.findIndex(o => o.id === id)
      if (index !== -1) {
        outfitList.value[index] = {
          ...outfitList.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      }
    }

    const deleteOutfit = (id: string) => {
      const index = outfitList.value.findIndex(o => o.id === id)
      if (index !== -1) {
        outfitList.value.splice(index, 1)
      }
    }

    const loadFromStorage = async () => {
      isLoading.value = true
      try {
        const value = uni.getStorageSync('outfit-store')
        if (value && value !== '') {
          outfitList.value = value as Outfit[]
        }
      } catch (error) {
        console.error('Failed to load outfit list from storage:', error)
      } finally {
        isLoading.value = false
      }
    }

    return {
      // State
      outfitList,
      selectedId,
      isLoading,
      // Getters
      totalOutfits,
      getOutfitById,
      // Actions
      setOutfitList,
      addOutfit,
      updateOutfit,
      deleteOutfit,
      loadFromStorage,
    }
  },
  {
    persist: {
      key: 'outfit-store',
      storage: {
        getItem: (key: string) => {
          return uni.getStorageSync(key)
        },
        setItem: (key: string, value: unknown) => {
          uni.setStorageSync(key, value)
        },
      },
      paths: ['outfitList', 'selectedId'],
    },
  }
)
