/**
 * Cloud 存储封装工具
 *
 * 提供云存储图片上传、删除等功能
 */

import type {
  Result,
  UniUploadFileOptions,
  UniUploadFileResult,
  UniUploadTask,
  UniUploadProgressUpdateResult,
  UniDeleteFileOptions,
  UniDeleteFileResult,
  UniGeneralError,
} from '@/types'

/**
 * 云环境ID配置
 * 小程序环境不支持 process.env，直接使用默认值
 */
export const CLOUD_ENV_ID = 'default'

/**
 * 云存储上传URL
 */
const CLOUD_UPLOAD_URL = `https://${CLOUD_ENV_ID}.tcb.qcloud.la/upload`

/**
 * 上传超时时间（毫秒）
 */
const UPLOAD_TIMEOUT = 30000

/**
 * uni.uploadFile 完整选项类型
 */
interface UploadFileCompleteOptions extends UniUploadFileOptions {
  success: (result: UniUploadFileResult) => void
  fail: (error: UniGeneralError) => void
}

/**
 * uni.deleteFile 完整选项类型
 */
interface DeleteFileCompleteOptions extends UniDeleteFileOptions {
  success: (result: UniDeleteFileResult) => void
  fail: (error: UniGeneralError) => void
}

/**
 * 上传文件对象类型
 */
interface UploadFile {
  name: string
  tempFilePath?: string
  size?: number
  type?: string
}

/**
 * 从 URL 中提取云存储文件路径
 *
 * 支持的 URL 格式：
 * - https://example.com/abc-123.jpg
 * - https://example.com/path/to/abc-123.jpg
 * - https://example.com/abc-123.jpg?sign=xxx
 * - https://example.com/path/to/abc-123.jpg?sign=xxx&other=yyy
 * - cloud://env-id.bucket/abc-123.jpg
 * - 直接的文件路径字符串
 *
 * @param url - 图片 URL 或文件路径
 * @returns 提取的云存储文件路径（已解码），如果无法提取则返回空字符串
 */
function extractCloudPath(url: string): string {
  // 处理空字符串
  if (!url) {
    return ''
  }

  // 如果不是 URL 格式，直接返回（假设已经是 cloudPath）
  if (!url.includes('://')) {
    // 检查是否包含查询参数
    const queryIndex = url.indexOf('?')
    let path = queryIndex === -1 ? url : url.slice(0, queryIndex)
    // 尝试解码，如果失败则返回原字符串
    try {
      return decodeURIComponent(path)
    } catch {
      return path
    }
  }

  try {
    // 使用 URL API 解析
    const parsed = new URL(url)
    // 获取 pathname 并解码
    let pathname = parsed.pathname

    // 移除开头的斜杠（如果存在）
    if (pathname.startsWith('/')) {
      pathname = pathname.slice(1)
    }

    // 解码 URL 编码的字符
    try {
      return decodeURIComponent(pathname)
    } catch {
      // 解码失败时返回原路径
      return pathname
    }
  } catch {
    // 如果 URL 解析失败，使用正则表达式作为后备方案
    // 匹配 protocol://[host]/path/to/file[.ext][?query]
    const match = url.match(/^[^:]+:\/\/[^/]+\/(.+?)(?:\?.*)?$/)
    if (!match) {
      return ''
    }
    // 尝试解码，如果失败则返回原字符串
    try {
      return decodeURIComponent(match[1])
    } catch {
      return match[1]
    }
  }
}

/**
 * 上传图片到云存储
 * @param file - 文件对象
 * @param onProgress - 进度回调函数，接收进度百分比（0-100）
 * @returns 结果对象，包含 success, data (URL), error 字段
 */
export async function uploadImage(
  file: UploadFile,
  onProgress?: (progress: number) => void
): Promise<Result<string>> {
  try {
    // 生成云存储路径：clothing/时间戳-随机数.扩展名
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    const ext = file.name.split('.').pop() || 'jpg'
    const cloudPath = `clothing/${timestamp}-${random}.${ext}`

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve({
          success: false,
          error: `Upload timeout after ${UPLOAD_TIMEOUT}ms`,
        })
      }, UPLOAD_TIMEOUT)

      // 构建上传选项
      const uploadOptions: UploadFileCompleteOptions = {
        url: CLOUD_UPLOAD_URL,
        filePath: file.tempFilePath || file.name,
        name: 'file',
        cloudPath,
        success: (res: UniUploadFileResult) => {
          clearTimeout(timer)
          try {
            const data = JSON.parse(res.data) as { fileID?: string; url?: string; message?: string }
            if (res.statusCode === 200 && data.url) {
              resolve({ success: true, data: data.url })
            } else {
              resolve({
                success: false,
                error: data.message || 'Upload failed',
              })
            }
          } catch {
            resolve({
              success: false,
              error: 'Invalid response data',
            })
          }
        },
        fail: (err: UniGeneralError) => {
          clearTimeout(timer)
          resolve({
            success: false,
            error: err.errMsg || 'Upload failed',
          })
        },
      }

      // 先调用 uni.uploadFile 获取 task
      const task = uni.uploadFile(uploadOptions) as UniUploadTask

      // 立即注册进度回调，避免遗漏早期进度事件
      if (onProgress) {
        task.onProgressUpdate((res: UniUploadProgressUpdateResult) => {
          onProgress(res.progress)
        })
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Cloud.uploadImage error:', error)
    return { success: false, error: errorMessage }
  }
}

/**
 * 从云存储删除图片
 * @param url - 图片URL
 * @returns 结果对象，包含 success, error 字段
 */
export async function deleteImage(url: string): Promise<Result<void>> {
  try {
    // 从URL中提取文件路径
    const cloudPath = extractCloudPath(url)

    if (!cloudPath) {
      return { success: false, error: 'Invalid URL' }
    }

    return new Promise((resolve) => {
      const deleteOptions: DeleteFileCompleteOptions = {
        fileList: [{ cloudPath }],
        success: (res: UniDeleteFileResult) => {
          if (res.fileList?.[0]?.status === 0) {
            resolve({ success: true })
          } else {
            resolve({
              success: false,
              error: res.fileList?.[0]?.errMsg || 'Delete failed',
            })
          }
        },
        fail: (err: UniGeneralError) => {
          resolve({
            success: false,
            error: err.errMsg || 'Delete failed',
          })
        },
      }

      uni.deleteFile(deleteOptions)
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Cloud.deleteImage error:', error)
    return { success: false, error: errorMessage }
  }
}

/**
 * 批量上传图片到云存储
 * @param files - 文件数组
 * @param onProgress - 进度回调函数，接收（索引，进度百分比）
 * @returns 结果对象，包含 success, data (URL数组), error 字段
 */
export async function uploadMultipleImages(
  files: UploadFile[],
  onProgress?: (index: number, progress: number) => void
): Promise<Result<string[]>> {
  if (files.length === 0) {
    return { success: true, data: [] }
  }

  try {
    const results: (string | null)[] = new Array(files.length)
    let hasError = false
    let errorMessage = ''

    // 并发上传所有文件
    const uploadPromises = files.map(async (file, index) => {
      const result = await uploadImage(file, (progress) => {
        onProgress?.(index, progress)
      })
      if (result.success) {
        results[index] = result.data ?? null
      } else {
        hasError = true
        errorMessage = result.error ?? 'Upload failed'
        results[index] = null
      }
    })

    await Promise.all(uploadPromises)

    // 如果有失败，返回失败结果
    if (hasError) {
      return { success: false, error: errorMessage }
    }

    // 过滤掉null值（理论上不应该有，因为前面已经检查hasError）
    const urls = results.filter((url): url is string => url !== null)
    return { success: true, data: urls }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Cloud.uploadMultipleImages error:', error)
    return { success: false, error: errorMessage }
  }
}

// 导出 UploadFile 类型供外部使用
export type { UploadFile }
