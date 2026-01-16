/**
 * 电子衣柜小程序类型定义
 *
 * 本文件定义了项目中使用的所有核心数据类型
 */

/**
 * 结果类型
 * 表示操作的结果，包含成功状态、数据和错误信息
 */
export interface Result<T> {
  /** 是否成功 */
  success: boolean
  /** 返回的数据，成功时有值 */
  data?: T
  /** 错误信息，失败时有值 */
  error?: string
}

/**
 * 衣物类型
 * 表示用户衣柜中的一件衣物
 */
export interface Clothing {
  /** UUID，唯一标识 */
  id: string
  /** 衣物名称 */
  name: string
  /** 品牌 */
  brand: string
  /** 分类 */
  category: string
  /** 颜色 */
  color: string
  /** 尺码 */
  size: string
  /** 购买日期，格式 YYYY-MM-DD */
  purchaseDate?: string
  /** 价格 */
  price?: number
  /** 云存储图片URL数组 */
  images: string[]
  /** 标签数组 */
  tags: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 搭配类型
 * 表示一个衣物搭配组合
 */
export interface Outfit {
  /** UUID，唯一标识 */
  id: string
  /** 搭配名称 */
  name: string
  /** 衣物ID数组 */
  clothingIds: string[]
  /** 搭配图片URL数组 */
  images: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 日历穿搭类型
 * 表示某一天的穿搭记录
 */
export interface CalendarWear {
  /** UUID，唯一标识 */
  id: string
  /** 日期，格式 YYYY-MM-DD */
  date: string
  /** 搭配ID，可选 */
  outfitId?: string
  /** 衣物ID数组 */
  clothingIds: string[]
  /** 记录时间 */
  createdAt: string
}

/**
 * 分类类型
 * 表示衣物分类
 */
export interface Category {
  /** 分类ID */
  id: string
  /** 分类名称 */
  name: string
  /** 图标，可选 */
  icon?: string
  /** 排序序号 */
  order: number
}

/**
 * 用户设置类型
 * 表示用户的个人设置
 */
export interface Settings {
  /** 自定义分类列表 */
  categories: Category[]
  /** 默认分类列表 */
  defaultCategories: Category[]
  /** 最后备份时间 */
  lastBackupTime?: string
}
