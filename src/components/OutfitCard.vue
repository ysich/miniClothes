<template>
  <view class="outfit-card" @click="handleClick">
    <view class="outfit-card__images">
      <view
        v-for="(image, index) in displayImages"
        :key="index"
        class="outfit-card__image-wrapper"
        :class="getImageWrapperClass(index)"
      >
        <image
          class="outfit-card__img"
          :src="image"
          mode="aspectFill"
        />
      </view>
      <view v-if="hasMoreImages" class="outfit-card__image-wrapper outfit-card__image-wrapper--more">
        <view class="outfit-card__more">
          <text class="outfit-card__more-text">+{{ outfit.images.length - MAX_DISPLAY_IMAGES }}</text>
        </view>
      </view>
    </view>

    <view class="outfit-card__content">
      <view class="outfit-card__header">
        <text class="outfit-card__name">{{ outfit.name }}</text>
        <view class="outfit-card__actions">
          <text
            v-if="showActions"
            class="outfit-card__action"
            @click.stop="handleEdit"
          >
            编辑
          </text>
          <text
            v-if="showActions"
            class="outfit-card__action outfit-card__action--danger"
            @click.stop="handleDelete"
          >
            删除
          </text>
        </view>
      </view>

      <view class="outfit-card__meta">
        <text class="outfit-card__count">{{ outfit.clothingIds.length }} 件单品</text>
        <text v-if="showDate" class="outfit-card__date">{{ formattedDate }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Outfit } from '@/types'

const MAX_DISPLAY_IMAGES = 4

interface Props {
  outfit: Outfit
  showDate?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDate: false,
  showActions: false,
})

interface Emits {
  (e: 'click', outfit: Outfit): void
  (e: 'delete', id: string): void
  (e: 'edit', outfit: Outfit): void
}

const emit = defineEmits<Emits>()

const displayImages = computed(() => {
  return props.outfit.images.slice(0, MAX_DISPLAY_IMAGES)
})

const hasMoreImages = computed(() => {
  return props.outfit.images.length > MAX_DISPLAY_IMAGES
})

const formattedDate = computed(() => {
  if (!props.showDate) return ''
  const date = new Date(props.outfit.createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const getImageWrapperClass = (index: number) => {
  const count = displayImages.value.length
  if (count === 1) return 'outfit-card__image-wrapper--single'
  if (count === 2) return 'outfit-card__image-wrapper--double'
  if (count === 3 && index === 2) return 'outfit-card__image-wrapper--last'
  return ''
}

const handleClick = () => {
  emit('click', props.outfit)
}

const handleEdit = () => {
  emit('edit', props.outfit)
}

const handleDelete = () => {
  emit('delete', props.outfit.id)
}
</script>

<style scoped lang="scss">
.outfit-card {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.outfit-card__images {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.outfit-card__image-wrapper {
  position: relative;
  width: calc((100% - 36rpx) / 4);
  padding-bottom: calc((100% - 36rpx) / 4);
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

.outfit-card__image-wrapper--single {
  width: 100%;
  padding-bottom: 100%;
}

.outfit-card__image-wrapper--double {
  width: calc((100% - 12rpx) / 2);
  padding-bottom: calc((100% - 12rpx) / 2);
}

.outfit-card__image-wrapper--last {
  width: 100%;
  padding-bottom: calc((100% - 12rpx) / 2);
}

.outfit-card__image-wrapper--more {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.outfit-card__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.outfit-card__more {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
}

.outfit-card__more-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.outfit-card__content {
  display: flex;
  flex-direction: column;
}

.outfit-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.outfit-card__name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.outfit-card__actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.outfit-card__action {
  font-size: 24rpx;
  color: #007aff;
}

.outfit-card__action--danger {
  color: #ff3b30;
}

.outfit-card__meta {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.outfit-card__count,
.outfit-card__date {
  font-size: 24rpx;
  color: #999999;
}
</style>
