/**
 * Date Utility Functions
 *
 * 提供日期相关的工具函数
 */

/**
 * 获取今日日期字符串，格式为 YYYY-MM-DD
 */
export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将日期转换为本地格式的 YYYY-MM-DD 字符串，避免时区问题
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期显示，今天显示"今天"，昨天显示"昨天"，其他显示"月日"
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if (dateStr === getTodayDate()) {
    return '今天'
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === formatDateToLocal(yesterday)) {
    return '昨天'
  }

  return `${month}月${day}日`
}
