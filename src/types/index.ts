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
  /** 状态 */
  status?: 'active' | 'archived'
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
 * 标签类型
 * 表示衣物标签
 */
export interface Tag {
  /** 标签ID */
  id: string
  /** 标签名称 */
  name: string
  /** 标签颜色 */
  color: string
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
  /** 自定义标签列表 */
  tags: Tag[]
  /** 默认标签列表 */
  defaultTags: Tag[]
  /** 最后备份时间 */
  lastBackupTime?: string
}

/**
 * uni API 上传文件选项
 */
export interface UniUploadFileOptions {
  /** 上传地址 */
  url: string
  /** 要上传文件资源的路径 */
  filePath: string
  /** 文件对应的 key */
  name: string
  /** 云端文件路径 */
  cloudPath?: string
  /** HTTP 请求 Header */
  header?: Record<string, string>
  /** HTTP 请求中其他额外的 form data */
  formData?: Record<string, unknown>
}

/**
 * uni API 上传文件结果
 */
export interface UniUploadFileResult {
  /** 服务器返回的数据 */
  data: string
  /** 服务器返回的 HTTP 状态码 */
  statusCode: number
}

/**
 * uni API 上传任务
 */
export interface UniUploadTask {
  /** 监听上传进度变化 */
  onProgressUpdate: (callback: (result: UniUploadProgressUpdateResult) => void) => void
}

/**
 * uni API 上传进度更新结果
 */
export interface UniUploadProgressUpdateResult {
  /** 上传进度百分比 */
  progress: number
  /** 已经上传的数据长度 */
  totalBytesSent: number
  /** 预期需要上传的数据总长度 */
  totalBytesExpectedToSend: number
}

/**
 * uni API 删除文件选项
 */
export interface UniDeleteFileOptions {
  /** 要删除的文件列表 */
  fileList: Array<{
    /** 文件ID */
    fileID?: string
    /** 云端文件路径 */
    cloudPath?: string
  }>
}

/**
 * uni API 删除文件结果
 */
export interface UniDeleteFileResult {
  /** 文件删除结果列表 */
  fileList: Array<{
    /** 文件ID */
    fileID?: string
    /** 云端文件路径 */
    cloudPath?: string
    /** 状态码，0表示成功 */
    status: number
    /** 错误信息 */
    errMsg?: string
  }>
}

/**
 * uni API 错误信息
 */
export interface UniGeneralError {
  /** 错误信息 */
  errMsg: string
}
