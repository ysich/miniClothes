<template>
  <view class="clothing-card" @click="handleClick">
    <view class="clothing-card__image">
      <image
        v-if="firstImage"
        class="clothing-card__img"
        :src="firstImage"
        mode="aspectFill"
      />
      <view v-else class="clothing-card__placeholder">
        <text class="clothing-card__placeholder-icon">{{ categoryIcon }}</text>
      </view>
    </view>

    <view class="clothing-card__content">
      <view class="clothing-card__header">
        <text class="clothing-card__name">{{ clothing.name }}</text>
        <view class="clothing-card__actions">
          <text
            v-if="showActions"
            class="clothing-card__action"
            @click.stop="handleEdit"
          >
            编辑
          </text>
          <text
            v-if="showActions"
            class="clothing-card__action clothing-card__action--danger"
            @click.stop="handleDelete"
          >
            删除
          </text>
        </view>
      </view>

      <view class="clothing-card__meta">
        <text class="clothing-card__category">{{ clothing.category }}</text>
        <text v-if="clothing.brand" class="clothing-card__brand">{{ clothing.brand }}</text>
      </view>

      <view v-if="showPrice && clothing.price" class="clothing-card__price">
        <text class="clothing-card__price-value">¥{{ clothing.price }}</text>
      </view>

      <view v-if="showTags && clothing.tags.length > 0" class="clothing-card__tags">
        <view
          v-for="tag in displayTags"
          :key="tag"
          class="clothing-card__tag"
        >
          <text class="clothing-card__tag-text">{{ tag }}</text>
        </view>
        <view v-if="hasMoreTags" class="clothing-card__tag clothing-card__tag--more">
          <text class="clothing-card__tag-text">+{{ clothing.tags.length - MAX_DISPLAY_TAGS }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Clothing } from '@/types'

const MAX_DISPLAY_TAGS = 3

interface Props {
  clothing: Clothing
  showPrice?: boolean
  showTags?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPrice: false,
  showTags: false,
  showActions: false,
})

interface Emits {
  (e: 'click', clothing: Clothing): void
  (e: 'delete', id: string): void
  (e: 'edit', clothing: Clothing): void
}

const emit = defineEmits<Emits>()

const firstImage = computed(() => {
  return props.clothing.images?.[0] || ''
})

const categoryIcon = computed(() => {
  const category = props.clothing.category || 'unknown'
  const icons: Record<string, string> = {
    上装: '',
    下装: '',
    鞋子: '',
    配饰: '',
  }
  return icons[category] || ''
})

const displayTags = computed(() => {
  return props.clothing.tags.slice(0, MAX_DISPLAY_TAGS)
})

const hasMoreTags = computed(() => {
  return props.clothing.tags.length > MAX_DISPLAY_TAGS
})

const handleClick = () => {
  emit('click', props.clothing)
}

const handleEdit = () => {
  emit('edit', props.clothing)
}

const handleDelete = () => {
  emit('delete', props.clothing.id)
}
</script>

<style scoped lang="scss">
.clothing-card {
  display: flex;
  flex-direction: row;
  padding: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.clothing-card__image {
  flex-shrink: 0;
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

.clothing-card__img {
  width: 100%;
  height: 100%;
}

.clothing-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
}

.clothing-card__placeholder-icon {
  font-size: 48rpx;
  color: #cccccc;
}

.clothing-card__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
}

.clothing-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.clothing-card__name {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clothing-card__actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-left: 16rpx;
}

.clothing-card__action {
  font-size: 24rpx;
  color: #007aff;
}

.clothing-card__action--danger {
  color: #ff3b30;
}

.clothing-card__meta {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.clothing-card__category,
.clothing-card__brand {
  font-size: 24rpx;
  color: #999999;
}

.clothing-card__price {
  margin-bottom: 12rpx;
}

.clothing-card__price-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b00;
}

.clothing-card__tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.clothing-card__tag {
  padding: 4rpx 12rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
}

.clothing-card__tag--more {
  background-color: #e6e6e6;
}

.clothing-card__tag-text {
  font-size: 22rpx;
  color: #666666;
}
</style>
