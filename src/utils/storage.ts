/**
 * Storage 封装工具
 *
 * 提供类型安全的本地存储封装，基于 uni.getStorageSync/setStorageSync
 */

import type { Result } from '@/types'

/**
 * 获取存储的数据
 * @param key - 存储键名
 * @returns 结果对象，包含 success, data, error 字段
 */
export function getItem<T>(key: string): Result<T> {
  try {
    const value = uni.getStorageSync(key)
    // uni.getStorageSync 返回空字符串表示不存在
    if (value === '') {
      return { success: false, error: `Key "${key}" not found` }
    }
    return { success: true, data: value as T }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Storage.getItem error for key "${key}":`, error)
    return { success: false, error: errorMessage }
  }
}

/**
 * 设置存储的数据
 * @param key - 存储键名
 * @param value - 要存储的值
 * @returns 结果对象，包含 success, error 字段
 */
export function setItem<T>(key: string, value: T): Result<void> {
  try {
    uni.setStorageSync(key, value)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Storage.setItem error for key "${key}":`, error)
    return { success: false, error: errorMessage }
  }
}

/**
 * 删除存储的数据
 * @param key - 存储键名
 * @returns 结果对象，包含 success, error 字段
 */
export function removeItem(key: string): Result<void> {
  try {
    uni.removeStorageSync(key)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Storage.removeItem error for key "${key}":`, error)
    return { success: false, error: errorMessage }
  }
}

/**
 * 清空所有存储
 * @returns 结果对象，包含 success, error 字段
 */
export function clear(): Result<void> {
  try {
    uni.clearStorageSync()
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Storage.clear error:', error)
    return { success: false, error: errorMessage }
  }
}
