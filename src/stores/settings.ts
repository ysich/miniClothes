/**
 * Settings Store
 *
 * 管理用户设置、分类和标签的状态和操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, Tag, Settings } from '@/types'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '上装', order: 1 },
  { id: 'cat-2', name: '下装', order: 2 },
  { id: 'cat-3', name: '鞋子', order: 3 },
  { id: 'cat-4', name: '配饰', order: 4 },
]

const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-1', name: '日常', color: '#007aff', order: 1 },
  { id: 'tag-2', name: '工作', color: '#5856d6', order: 2 },
  { id: 'tag-3', name: '运动', color: '#ff9500', order: 3 },
  { id: 'tag-4', name: '正式', color: '#ff2d55', order: 4 },
  { id: 'tag-5', name: '休闲', color: '#34c759', order: 5 },
]

const TAG_COLORS = [
  '#007aff', '#5856d6', '#ff9500', '#ff2d55', '#34c759', '#ffcc00', '#ff3b30',
  '#8e8e93', '#00c7be', '#af52de',
]

export const useSettingsStore = defineStore(
  'settings',
  () => {
    // State
    const customCategories = ref<Category[]>([])
    const customTags = ref<Tag[]>([])
    const lastBackupTime = ref<string | null>(null)
    const isLoading = ref(false)

    // Getters
    const allCategories = computed(() => {
      const combined = [...DEFAULT_CATEGORIES]
      customCategories.value.forEach(customCat => {
        const existingIndex = combined.findIndex(c => c.name === customCat.name)
        if (existingIndex === -1) {
          combined.push(customCat)
        } else {
          combined[existingIndex] = customCat
        }
      })
      return combined.sort((a, b) => a.order - b.order)
    })

    const allTags = computed(() => {
      const combined = [...DEFAULT_TAGS]
      customTags.value.forEach(customTag => {
        const existingIndex = combined.findIndex(t => t.name === customTag.name)
        if (existingIndex === -1) {
          combined.push(customTag)
        } else {
          combined[existingIndex] = customTag
        }
      })
      return combined.sort((a, b) => a.order - b.order)
    })

    const categoryNames = computed(() => allCategories.value.map(c => c.name))

    const tagNames = computed(() => allTags.value.map(t => t.name))

    const getTagColor = computed(() => (tagName: string) => {
      const tag = allTags.value.find(t => t.name === tagName)
      return tag?.color ?? '#007aff'
    })

    // Actions - Categories
    const addCategory = (name: string) => {
      const id = `cat-${Date.now()}`
      const newCategory: Category = {
        id,
        name,
        order: customCategories.value.length + DEFAULT_CATEGORIES.length + 1,
      }
      customCategories.value.push(newCategory)
      return newCategory
    }

    const updateCategory = (id: string, updates: Partial<Category>) => {
      const index = customCategories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customCategories.value[index] = {
          ...customCategories.value[index],
          ...updates,
        }
      }
    }

    const deleteCategory = (id: string) => {
      const index = customCategories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customCategories.value.splice(index, 1)
      }
    }

    const moveCategory = (fromIndex: number, toIndex: number) => {
      const item = customCategories.value.splice(fromIndex, 1)[0]
      customCategories.value.splice(toIndex, 0, item)
      customCategories.value.forEach((cat, index) => {
        cat.order = index + 1
      })
    }

    // Actions - Tags
    const addTag = (name: string, color?: string) => {
      const id = `tag-${Date.now()}`
      const tagColor = color ?? TAG_COLORS[customTags.value.length % TAG_COLORS.length]
      const newTag: Tag = {
        id,
        name,
        color: tagColor,
        order: customTags.value.length + DEFAULT_TAGS.length + 1,
      }
      customTags.value.push(newTag)
      return newTag
    }

    const updateTag = (id: string, updates: Partial<Tag>) => {
      const index = customTags.value.findIndex(t => t.id === id)
      if (index !== -1) {
        customTags.value[index] = {
          ...customTags.value[index],
          ...updates,
        }
      }
    }

    const deleteTag = (id: string) => {
      const index = customTags.value.findIndex(t => t.id === id)
      if (index !== -1) {
        customTags.value.splice(index, 1)
      }
    }

    const moveTag = (fromIndex: number, toIndex: number) => {
      const item = customTags.value.splice(fromIndex, 1)[0]
      customTags.value.splice(toIndex, 0, item)
      customTags.value.forEach((tag, index) => {
        tag.order = index + 1
      })
    }

    // Actions - Data Management
    const clearCache = () => {
      uni.clearStorageSync()
      lastBackupTime.value = null
      customCategories.value = []
      customTags.value = []
    }

    const exportData = async () => {
      try {
        const data: Settings = {
          categories: customCategories.value,
          defaultCategories: DEFAULT_CATEGORIES,
          tags: customTags.value,
          defaultTags: DEFAULT_TAGS,
          lastBackupTime: lastBackupTime.value ?? undefined,
        }
        return data
      } catch (error) {
        console.error('Failed to export data:', error)
        throw new Error('导出数据失败')
      }
    }

    const importData = async (data: Settings) => {
      try {
        if (data.categories) {
          customCategories.value = data.categories
        }
        if (data.tags) {
          customTags.value = data.tags
        }
        if (data.lastBackupTime) {
          lastBackupTime.value = data.lastBackupTime
        }
        uni.showToast({
          title: '数据导入成功',
          icon: 'success',
        })
      } catch (error) {
        console.error('Failed to import data:', error)
        throw new Error('导入数据失败')
      }
    }

    const loadFromStorage = async () => {
      isLoading.value = true
      try {
        const value = uni.getStorageSync('settings-store')
        if (value && typeof value === 'object') {
          if (value.customCategories) {
            customCategories.value = value.customCategories
          }
          if (value.customTags) {
            customTags.value = value.customTags
          }
          if (value.lastBackupTime) {
            lastBackupTime.value = value.lastBackupTime
          }
        }
      } catch (error) {
        console.error('Failed to load settings from storage:', error)
      } finally {
        isLoading.value = false
      }
    }

    return {
      // State
      customCategories,
      customTags,
      lastBackupTime,
      isLoading,
      // Getters
      allCategories,
      allTags,
      categoryNames,
      tagNames,
      getTagColor,
      // Actions - Categories
      addCategory,
      updateCategory,
      deleteCategory,
      moveCategory,
      // Actions - Tags
      addTag,
      updateTag,
      deleteTag,
      moveTag,
      // Actions - Data Management
      clearCache,
      exportData,
      importData,
      loadFromStorage,
      // Constants
      DEFAULT_CATEGORIES,
      DEFAULT_TAGS,
      TAG_COLORS,
    }
  },
  {
    persist: {
      key: 'settings-store',
      storage: {
        getItem: (key: string) => {
          return uni.getStorageSync(key)
        },
        setItem: (key: string, value: unknown) => {
          uni.setStorageSync(key, value)
        },
      },
      paths: ['customCategories', 'customTags', 'lastBackupTime'],
    },
  }
)
