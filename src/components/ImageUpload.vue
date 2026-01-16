<template>
  <view class="image-upload">
    <view class="image-upload__list">
      <view
        v-for="(image, index) in images"
        :key="index"
        class="image-upload__item"
      >
        <image
          class="image-upload__img"
          :src="image"
          mode="aspectFill"
          @click="handlePreview(index)"
        />
        <view class="image-upload__delete" @click="handleRemove(index)">
          <text class="image-upload__delete-icon"></text>
        </view>
      </view>

      <view
        v-if="canAddMore"
        class="image-upload__add"
        @click="handleChooseImage"
      >
        <text class="image-upload__add-icon">+</text>
        <text class="image-upload__add-text">{{ uploadText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { uploadImage } from '@/utils/cloud'
import type { UploadFile } from '@/utils/cloud'

const DEFAULT_MAX_COUNT = 9
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

interface Props {
  maxCount?: number
  maxSize?: number
  modelValue?: string[]
  autoUpload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: DEFAULT_MAX_COUNT,
  maxSize: DEFAULT_MAX_SIZE,
  modelValue: () => [],
  autoUpload: true,
})

interface Emits {
  (e: 'update:modelValue', images: string[]): void
  (e: 'change', images: string[]): void
  (e: 'remove', index: number, images: string[]): void
  (e: 'upload-start', file: UploadFile): void
  (e: 'upload-progress', index: number, progress: number): void
  (e: 'upload-success', index: number, url: string): void
  (e: 'upload-fail', index: number, error: string): void
}

const emit = defineEmits<Emits>()

const images = ref<string[]>([])
const uploading = ref<Set<number>>(new Set())

const canAddMore = computed(() => {
  return images.value.length < props.maxCount
})

const uploadText = computed(() => {
  if (uploading.value.size > 0) {
    return '上传中...'
  }
  return images.value.length > 0 ? '添加' : '上传图片'
})

onMounted(() => {
  if (props.modelValue && props.modelValue.length > 0) {
    images.value = [...props.modelValue]
  }
})

const handleChooseImage = () => {
  uni.chooseImage({
    count: props.maxCount - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async res => {
      const tempFilePaths = res.tempFilePaths
      const validFiles: { path: string; size: number }[] = []

      for (const filePath of tempFilePaths) {
        try {
          const info = await new Promise<{ size: number }>((resolve, reject) => {
            uni.getFileInfo({
              filePath,
              success: resolve,
              fail: reject,
            })
          })
          if (info.size > props.maxSize) {
            uni.showToast({
              title: `图片大小不能超过${formatSize(props.maxSize)}`,
              icon: 'none',
            })
            continue
          }
          validFiles.push({ path: filePath, size: info.size })
        } catch {
          uni.showToast({
            title: '图片读取失败',
            icon: 'none',
          })
        }
      }

      if (validFiles.length === 0) {
        return
      }

      const startIndex = images.value.length

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const index = startIndex + i

        if (props.autoUpload) {
          await doUpload(index, file.path, file.size)
        } else {
          images.value.push(file.path)
          emitChange()
        }
      }
    },
  })
}

const doUpload = async (index: number, filePath: string, size: number): Promise<void> => {
  const fileName = filePath.split('/').pop() || 'image.jpg'
  const uploadFileData: UploadFile = {
    name: fileName,
    tempFilePath: filePath,
    size,
  }

  uploading.value.add(index)
  emit('upload-start', uploadFileData)

  try {
    const result = await uploadImage(uploadFileData, progress => {
      emit('upload-progress', index, progress)
    })

    if (result.success && result.data) {
      images.value[index] = result.data
      emit('upload-success', index, result.data)
      emitChange()
    } else {
      throw new Error(result.error || 'Upload failed')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败'
    emit('upload-fail', index, errorMessage)
    uni.showToast({
      title: errorMessage,
      icon: 'none',
    })
  } finally {
    uploading.value.delete(index)
  }
}

const handlePreview = (index: number) => {
  uni.previewImage({
    current: index,
    urls: images.value,
  })
}

const handleRemove = (index: number) => {
  images.value.splice(index, 1)
  emit('remove', index, images.value)
  emitChange()
}

const emitChange = () => {
  emit('update:modelValue', images.value)
  emit('change', images.value)
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + 'B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + 'KB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
  }
}

const clear = () => {
  images.value = []
  uploading.value.clear()
  emitChange()
}

const isUploading = computed(() => uploading.value.size > 0)
const getImages = () => images.value

defineExpose({
  clear,
  getImages,
  isUploading,
  uploadFile: doUpload,
})
</script>

<style scoped lang="scss">
.image-upload {
  width: 100%;
}

.image-upload__list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-upload__item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.image-upload__img {
  width: 100%;
  height: 100%;
}

.image-upload__delete {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-bottom-left-radius: 12rpx;
}

.image-upload__delete-icon {
  font-size: 32rpx;
  font-weight: 300;
  color: #ffffff;
  transform: rotate(45deg);
}

.image-upload__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #cccccc;
  border-radius: 12rpx;
  background-color: #fafafa;
}

.image-upload__add-icon {
  font-size: 64rpx;
  font-weight: 300;
  color: #999999;
  line-height: 1;
}

.image-upload__add-text {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999999;
}
</style>
