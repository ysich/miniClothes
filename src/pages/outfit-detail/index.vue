<template>
  <view class="outfit-detail-page">
    <!-- 图片轮播 -->
    <swiper
      v-if="outfit.images.length > 0"
      class="outfit-detail__swiper"
      :indicator-dots="outfit.images.length > 1"
      indicator-color="rgba(0, 0, 0, 0.3)"
      indicator-active-color="#007aff"
      :circular="true"
    >
      <swiper-item
        v-for="(image, index) in outfit.images"
        :key="index"
      >
        <image
          class="outfit-detail__image"
          :src="image"
          mode="aspectFill"
          @click="handleImagePreview(index)"
        />
      </swiper-item>
    </swiper>

    <!-- 无图片占位 -->
    <view v-else class="outfit-detail__placeholder">
      <text class="outfit-detail__placeholder-icon"></text>
      <text class="outfit-detail__placeholder-text">暂无图片</text>
    </view>

    <!-- 基本信息 -->
    <view class="outfit-detail__info">
      <view class="outfit-detail__name-row">
        <text class="outfit-detail__name">{{ outfit.name }}</text>
        <view class="outfit-detail__actions">
          <text
            class="outfit-detail__action"
            @click="handleEdit"
          >
            编辑
          </text>
          <text
            class="outfit-detail__action outfit-detail__action--danger"
            @click="handleDelete"
          >
            删除
          </text>
        </view>
      </view>

      <view class="outfit-detail__meta-row">
        <view class="outfit-detail__meta-item">
          <text class="outfit-detail__meta-label">创建日期</text>
          <text class="outfit-detail__meta-value">{{ formattedCreatedAt }}</text>
        </view>
        <view class="outfit-detail__meta-item">
          <text class="outfit-detail__meta-label">单品数量</text>
          <text class="outfit-detail__meta-value">{{ outfit.clothingIds.length }} 件</text>
        </view>
      </view>
    </view>

    <!-- 包含衣物列表 -->
    <view class="outfit-detail__section">
      <view class="outfit-detail__section-header">
        <text class="outfit-detail__section-title">包含衣物</text>
        <text class="outfit-detail__section-count">{{ clothingList.length }} 件</text>
      </view>

      <view v-if="clothingList.length > 0" class="outfit-detail__clothing">
        <ClothingCard
          v-for="clothing in clothingList"
          :key="clothing.id"
          :clothing="clothing"
          :show-actions="false"
          @click="handleClothingClick"
        />
      </view>

      <view v-else class="outfit-detail__empty">
        <text class="outfit-detail__empty-text">暂无衣物</text>
      </view>
    </view>

    <!-- 穿搭历史 -->
    <view class="outfit-detail__section">
      <view class="outfit-detail__section-header">
        <text class="outfit-detail__section-title">穿搭历史</text>
        <text class="outfit-detail__section-count">{{ wearHistory.length }} 次</text>
      </view>

      <view v-if="wearHistory.length > 0" class="outfit-detail__history">
        <view
          v-for="record in wearHistory"
          :key="record.id"
          class="outfit-detail__history-item"
          @click="handleHistoryClick(record)"
        >
          <view class="outfit-detail__history-date">
            <text class="outfit-detail__history-date-text">{{ formatDateDisplay(record.date) }}</text>
          </view>
          <view class="outfit-detail__history-outfits">
            <view
              v-for="historyClothing in getRecordClothing(record)"
              :key="historyClothing.id"
              class="outfit-detail__history-clothing"
            >
              <image
                v-if="historyClothing.images[0]"
                class="outfit-detail__history-clothing-img"
                :src="historyClothing.images[0]"
                mode="aspectFill"
              />
              <view v-else class="outfit-detail__history-clothing-placeholder">
                <text class="outfit-detail__history-clothing-text">{{ historyClothing.category[0] }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="outfit-detail__empty">
        <text class="outfit-detail__empty-text">暂无穿搭记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOutfitStore } from '@/stores/outfit'
import { useClothingStore } from '@/stores/clothing'
import { useCalendarStore } from '@/stores/calendar'
import type { Outfit, Clothing, CalendarWear } from '@/types'
import { formatDateDisplay } from '@/utils/date'
import ClothingCard from '@/components/ClothingCard.vue'

const outfitStore = useOutfitStore()
const clothingStore = useClothingStore()
const calendarStore = useCalendarStore()

const outfitId = ref<string>('')

const outfit = computed<Outfit>(() => {
  return outfitStore.getOutfitById(outfitId.value) || {
    id: '',
    name: '',
    clothingIds: [],
    images: [],
    createdAt: '',
    updatedAt: '',
  }
})

const formattedCreatedAt = computed(() => {
  if (!outfit.value.createdAt) return ''
  const date = new Date(outfit.value.createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const clothingList = computed<Clothing[]>(() => {
  const list: Clothing[] = []
  outfit.value.clothingIds.forEach(id => {
    const clothing = clothingStore.getClothingById(id)
    if (clothing) {
      list.push(clothing)
    }
  })
  return list
})

const wearHistory = computed(() => {
  return calendarStore.wearRecords
    .filter(record => record.outfitId === outfitId.value)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const getRecordClothing = (record: CalendarWear): Clothing[] => {
  const list: Clothing[] = []
  record.clothingIds.forEach(id => {
    const clothing = clothingStore.getClothingById(id)
    if (clothing) {
      list.push(clothing)
    }
  })
  return list
}

const handleImagePreview = (index: number) => {
  uni.previewImage({
    current: index,
    urls: outfit.value.images,
  })
}

const handleClothingClick = (clothing: Clothing) => {
  uni.navigateTo({
    url: `/pages/clothing-detail/index?id=${clothing.id}`,
  })
}

const handleEdit = () => {
  uni.navigateTo({
    url: `/pages/outfit-edit/index?id=${outfitId.value}`,
  })
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${outfit.value.name}"吗？`,
    confirmColor: '#ff3b30',
    success: res => {
      if (res.confirm) {
        outfitStore.deleteOutfit(outfitId.value)
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
  outfitStore.loadFromStorage()
  clothingStore.loadFromStorage()
  calendarStore.loadFromStorage()

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as { id?: string }
  outfitId.value = options?.id || ''

  if (!outfitId.value) {
    uni.showToast({
      title: '搭配ID不存在',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style scoped lang="scss">
.outfit-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

// 图片轮播
.outfit-detail__swiper {
  width: 100%;
  height: 750rpx;
  background-color: #ffffff;
}

.outfit-detail__image {
  width: 100%;
  height: 100%;
}

// 无图片占位
.outfit-detail__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 750rpx;
  background-color: #ffffff;
}

.outfit-detail__placeholder-icon {
  font-size: 120rpx;
  color: #e0e0e0;
}

.outfit-detail__placeholder-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999999;
}

// 基本信息
.outfit-detail__info {
  padding: 32rpx;
  margin-top: 16rpx;
  background-color: #ffffff;
}

.outfit-detail__name-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.outfit-detail__name {
  flex: 1;
  font-size: 40rpx;
  font-weight: 700;
  color: #333333;
}

.outfit-detail__actions {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.outfit-detail__action {
  font-size: 28rpx;
  color: #007aff;
}

.outfit-detail__action--danger {
  color: #ff3b30;
}

.outfit-detail__meta-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.outfit-detail__meta-item {
  display: flex;
  flex-direction: column;
}

.outfit-detail__meta-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.outfit-detail__meta-value {
  font-size: 28rpx;
  color: #333333;
}

// 区块
.outfit-detail__section {
  padding: 32rpx;
  margin-top: 16rpx;
  background-color: #ffffff;
}

.outfit-detail__section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.outfit-detail__section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.outfit-detail__section-count {
  font-size: 24rpx;
  color: #999999;
}

// 衣物列表
.outfit-detail__clothing {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

// 穿搭历史
.outfit-detail__history {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.outfit-detail__history-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.outfit-detail__history-date {
  flex-shrink: 0;
  width: 120rpx;
}

.outfit-detail__history-date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.outfit-detail__history-outfits {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  flex: 1;
  margin-left: 24rpx;
}

.outfit-detail__history-clothing {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background-color: #f0f0f0;
}

.outfit-detail__history-clothing-img {
  width: 100%;
  height: 100%;
}

.outfit-detail__history-clothing-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e8e8e8;
}

.outfit-detail__history-clothing-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #999999;
}

// 空状态
.outfit-detail__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;
}

.outfit-detail__empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
