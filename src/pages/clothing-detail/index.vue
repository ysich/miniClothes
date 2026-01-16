<template>
  <view class="clothing-detail-page">
    <!-- 图片轮播 -->
    <swiper
      v-if="clothing.images.length > 0"
      class="clothing-detail__swiper"
      :indicator-dots="clothing.images.length > 1"
      indicator-color="rgba(0, 0, 0, 0.3)"
      indicator-active-color="#007aff"
      :circular="true"
    >
      <swiper-item
        v-for="(image, index) in clothing.images"
        :key="index"
      >
        <image
          class="clothing-detail__image"
          :src="image"
          mode="aspectFill"
          @click="handleImagePreview(index)"
        />
      </swiper-item>
    </swiper>

    <!-- 无图片占位 -->
    <view v-else class="clothing-detail__placeholder">
      <text class="clothing-detail__placeholder-icon"></text>
      <text class="clothing-detail__placeholder-text">暂无图片</text>
    </view>

    <!-- 基本信息 -->
    <view class="clothing-detail__info">
      <view class="clothing-detail__name-row">
        <text class="clothing-detail__name">{{ clothing.name }}</text>
        <view class="clothing-detail__actions">
          <text
            class="clothing-detail__action"
            @click="handleEdit"
          >
            编辑
          </text>
          <text
            class="clothing-detail__action clothing-detail__action--danger"
            @click="handleDelete"
          >
            删除
          </text>
        </view>
      </view>

      <view class="clothing-detail__meta-row">
        <view v-if="clothing.brand" class="clothing-detail__meta-item">
          <text class="clothing-detail__meta-label">品牌</text>
          <text class="clothing-detail__meta-value">{{ clothing.brand }}</text>
        </view>
        <view class="clothing-detail__meta-item">
          <text class="clothing-detail__meta-label">分类</text>
          <text class="clothing-detail__meta-value">{{ clothing.category }}</text>
        </view>
        <view class="clothing-detail__meta-item">
          <text class="clothing-detail__meta-label">颜色</text>
          <text class="clothing-detail__meta-value">{{ clothing.color }}</text>
        </view>
        <view class="clothing-detail__meta-item">
          <text class="clothing-detail__meta-label">尺码</text>
          <text class="clothing-detail__meta-value">{{ clothing.size }}</text>
        </view>
      </view>

      <view v-if="clothing.price" class="clothing-detail__price">
        <text class="clothing-detail__price-label">价格</text>
        <text class="clothing-detail__price-value">¥{{ clothing.price }}</text>
      </view>

      <view v-if="clothing.purchaseDate" class="clothing-detail__date">
        <text class="clothing-detail__date-label">购买日期</text>
        <text class="clothing-detail__date-value">{{ clothing.purchaseDate }}</text>
      </view>
    </view>

    <!-- 标签展示 -->
    <view v-if="clothing.tags.length > 0" class="clothing-detail__section">
      <text class="clothing-detail__section-title">标签</text>
      <view class="clothing-detail__tags">
        <view
          v-for="tag in clothing.tags"
          :key="tag"
          class="clothing-detail__tag"
        >
          <text class="clothing-detail__tag-text">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 搭配历史 -->
    <view class="clothing-detail__section">
      <view class="clothing-detail__section-header">
        <text class="clothing-detail__section-title">搭配历史</text>
        <text class="clothing-detail__section-count">{{ wearHistory.length }}次</text>
      </view>

      <view v-if="wearHistory.length > 0" class="clothing-detail__history">
        <view
          v-for="record in wearHistory"
          :key="record.id"
          class="clothing-detail__history-item"
          @click="handleHistoryClick(record)"
        >
          <view class="clothing-detail__history-date">
            <text class="clothing-detail__history-date-text">{{ formatDateDisplay(record.date) }}</text>
          </view>
          <view class="clothing-detail__history-outfits">
            <view
              v-for="outfitClothing in getRecordClothing(record)"
              :key="outfitClothing.id"
              class="clothing-detail__history-clothing"
            >
              <image
                v-if="outfitClothing.images[0]"
                class="clothing-detail__history-clothing-img"
                :src="outfitClothing.images[0]"
                mode="aspectFill"
              />
              <view v-else class="clothing-detail__history-clothing-placeholder">
                <text class="clothing-detail__history-clothing-text">{{ outfitClothing.category[0] }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="clothing-detail__empty">
        <text class="clothing-detail__empty-text">暂无搭配记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClothingStore } from '@/stores/clothing'
import { useCalendarStore } from '@/stores/calendar'
import type { Clothing, CalendarWear } from '@/types'
import { formatDateDisplay } from '@/utils/date'

const clothingStore = useClothingStore()
const calendarStore = useCalendarStore()

const clothingId = ref<string>('')

const clothing = computed<Clothing>(() => {
  return clothingStore.getClothingById(clothingId.value) || {
    id: '',
    name: '',
    brand: '',
    category: '',
    color: '',
    size: '',
    images: [],
    tags: [],
    createdAt: '',
    updatedAt: '',
  }
})

const wearHistory = computed(() => {
  return calendarStore.wearRecords.filter(record =>
    record.clothingIds.includes(clothingId.value)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const getRecordClothing = (record: CalendarWear): Clothing[] => {
  const clothingList: Clothing[] = []
  record.clothingIds.forEach(id => {
    const item = clothingStore.getClothingById(id)
    if (item) {
      clothingList.push(item)
    }
  })
  return clothingList
}

const handleImagePreview = (index: number) => {
  uni.previewImage({
    current: index,
    urls: clothing.value.images,
  })
}

const handleEdit = () => {
  uni.navigateTo({
    url: `/pages/clothing-edit/index?id=${clothingId.value}`,
  })
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${clothing.value.name}"吗？`,
    confirmColor: '#ff3b30',
    success: res => {
      if (res.confirm) {
        clothingStore.deleteClothing(clothingId.value)
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },
  })
}

const handleHistoryClick = (record: CalendarWear) => {
  uni.navigateTo({
    url: `/pages/calendar/index?date=${record.date}`,
  })
}

onMounted(() => {
  clothingStore.loadFromStorage()
  calendarStore.loadFromStorage()

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as { id?: string }
  clothingId.value = options?.id || ''

  if (!clothingId.value) {
    uni.showToast({
      title: '衣物ID不存在',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style scoped lang="scss">
.clothing-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

// 图片轮播
.clothing-detail__swiper {
  width: 100%;
  height: 750rpx;
  background-color: #ffffff;
}

.clothing-detail__image {
  width: 100%;
  height: 100%;
}

// 无图片占位
.clothing-detail__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 750rpx;
  background-color: #ffffff;
}

.clothing-detail__placeholder-icon {
  font-size: 120rpx;
  color: #e0e0e0;
}

.clothing-detail__placeholder-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999999;
}

// 基本信息
.clothing-detail__info {
  padding: 32rpx;
  margin-top: 16rpx;
  background-color: #ffffff;
}

.clothing-detail__name-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.clothing-detail__name {
  flex: 1;
  font-size: 40rpx;
  font-weight: 700;
  color: #333333;
}

.clothing-detail__actions {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.clothing-detail__action {
  font-size: 28rpx;
  color: #007aff;
}

.clothing-detail__action--danger {
  color: #ff3b30;
}

.clothing-detail__meta-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding-bottom: 24rpx;
  margin-bottom: 24rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.clothing-detail__meta-item {
  display: flex;
  flex-direction: column;
}

.clothing-detail__meta-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.clothing-detail__meta-value {
  font-size: 28rpx;
  color: #333333;
}

.clothing-detail__price {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 24rpx;
  margin-bottom: 24rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.clothing-detail__price-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #999999;
}

.clothing-detail__price-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #ff6b00;
}

.clothing-detail__date {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.clothing-detail__date-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #999999;
}

.clothing-detail__date-value {
  font-size: 28rpx;
  color: #333333;
}

// 区块
.clothing-detail__section {
  padding: 32rpx;
  margin-top: 16rpx;
  background-color: #ffffff;
}

.clothing-detail__section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.clothing-detail__section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.clothing-detail__section-count {
  font-size: 24rpx;
  color: #999999;
}

// 标签
.clothing-detail__tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.clothing-detail__tag {
  padding: 12rpx 24rpx;
  background-color: #f0f5ff;
  border-radius: 32rpx;
  border: 2rpx solid #e6f0ff;
}

.clothing-detail__tag-text {
  font-size: 26rpx;
  color: #007aff;
}

// 搭配历史
.clothing-detail__history {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.clothing-detail__history-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.clothing-detail__history-date {
  flex-shrink: 0;
  width: 120rpx;
}

.clothing-detail__history-date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.clothing-detail__history-outfits {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  flex: 1;
  margin-left: 24rpx;
}

.clothing-detail__history-clothing {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background-color: #f0f0f0;
}

.clothing-detail__history-clothing-img {
  width: 100%;
  height: 100%;
}

.clothing-detail__history-clothing-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e8e8e8;
}

.clothing-detail__history-clothing-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #999999;
}

// 空状态
.clothing-detail__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;
}

.clothing-detail__empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
