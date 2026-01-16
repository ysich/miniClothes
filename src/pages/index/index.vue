<template>
  <view class="index-page">
    <!-- 衣概览 -->
    <view class="index-page__overview">
      <view class="index-page__overview-card">
        <view class="index-page__overview-content">
          <text class="index-page__overview-value">{{ clothingStore.totalCount }}</text>
          <text class="index-page__overview-label">衣物总数</text>
        </view>
        <view class="index-page__overview-icon index-page__overview-icon--clothing">
          <text class="index-page__icon-text"></text>
        </view>
      </view>
      <view class="index-page__overview-card">
        <view class="index-page__overview-content">
          <text class="index-page__overview-value">{{ todayWearCount }}</text>
          <text class="index-page__overview-label">今日穿搭</text>
        </view>
        <view class="index-page__overview-icon index-page__overview-icon--today">
          <text class="index-page__icon-text"></text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="index-page__section">
      <view class="index-page__section-title">
        <text class="index-page__section-title-text">快捷入口</text>
      </view>
      <view class="index-page__quick-actions">
        <view
          v-for="action in quickActions"
          :key="action.id"
          class="index-page__action"
          @click="navigateTo(action.path)"
        >
          <view class="index-page__action-icon" :class="`index-page__action-icon--${action.id}`">
            <text class="index-page__action-icon-text">{{ action.icon }}</text>
          </view>
          <text class="index-page__action-text">{{ action.label }}</text>
        </view>
      </view>
    </view>

    <!-- 最近穿搭 -->
    <view class="index-page__section">
      <view class="index-page__section-header">
        <text class="index-page__section-title-text">最近穿搭</text>
        <text
          v-if="recentWears.length > 0"
          class="index-page__section-more"
          @click="navigateTo('/pages/calendar/index')"
        >
          查看全部
        </text>
      </view>
      <view v-if="recentWears.length > 0" class="index-page__recent-wears">
        <view
          v-for="wear in recentWears"
          :key="wear.id"
          class="index-page__wear-item"
          @click="handleWearClick(wear)"
        >
          <view class="index-page__wear-date">
            <text class="index-page__wear-date-text">{{ formatDateDisplay(wear.date) }}</text>
          </view>
          <view class="index-page__wear-items">
            <view
              v-for="clothing in getWearClothing(wear)"
              :key="clothing.id"
              class="index-page__wear-clothing"
            >
              <image
                v-if="clothing.images[0]"
                class="index-page__wear-clothing-img"
                :src="clothing.images[0]"
                mode="aspectFill"
              />
              <view v-else class="index-page__wear-clothing-placeholder">
                <text class="index-page__wear-clothing-text">{{ clothing.category[0] }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="index-page__empty">
        <text class="index-page__empty-text">暂无穿搭记录</text>
        <text class="index-page__empty-hint">去日历页添加今日穿搭吧</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClothingStore } from '@/stores/clothing'
import { useOutfitStore } from '@/stores/outfit'
import { useCalendarStore } from '@/stores/calendar'
import type { CalendarWear, Clothing } from '@/types'
import { getTodayDate, formatDateDisplay } from '@/utils/date'

const clothingStore = useClothingStore()
const outfitStore = useOutfitStore()
const calendarStore = useCalendarStore()

// 快捷入口配置
interface QuickAction {
  id: 'add' | 'wardrobe' | 'outfit' | 'calendar'
  label: string
  icon: string
  path: string
}

const quickActions: QuickAction[] = [
  { id: 'add', label: '添加衣物', icon: '+', path: '/pages/clothing-add/index' },
  { id: 'wardrobe', label: '查看衣柜', icon: '', path: '/pages/wardrobe/index' },
  { id: 'outfit', label: '搭配', icon: '', path: '/pages/outfits/index' },
  { id: 'calendar', label: '日历', icon: '', path: '/pages/calendar/index' },
]

// 今日穿搭数量
const todayWearCount = computed(() => {
  const today = getTodayDate()
  return calendarStore.wearRecords.filter(r => r.date === today).length
})

// 最近穿搭（最近7天）
const recentWears = computed(() => {
  const sorted = [...calendarStore.wearRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sorted.slice(0, 7)
})

// 获取穿搭记录中的衣物
const getWearClothing = (wear: CalendarWear): Clothing[] => {
  const clothingList: Clothing[] = []
  wear.clothingIds.forEach(id => {
    const clothing = clothingStore.getClothingById(id)
    if (clothing) {
      clothingList.push(clothing)
    }
  })
  return clothingList
}

// 穿搭项点击
const handleWearClick = (wear: CalendarWear) => {
  uni.navigateTo({
    url: `/pages/calendar/index?date=${wear.date}`,
  })
}

// 页面跳转
const navigateTo = (path: string) => {
  uni.navigateTo({
    url: path,
  })
}

// 初始化加载数据
onMounted(() => {
  clothingStore.loadFromStorage()
  outfitStore.loadFromStorage()
  calendarStore.loadFromStorage()
})
</script>

<style scoped lang="scss">
.index-page {
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f5f7fa;
}

// 衣概览
.index-page__overview {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.index-page__overview-card {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.index-page__overview-card:last-child {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
}

.index-page__overview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.index-page__overview-value {
  font-size: 56rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.index-page__overview-label {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.index-page__overview-icon {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  opacity: 0.2;
}

.index-page__icon-text {
  font-size: 48rpx;
}

// 通用区块
.index-page__section {
  margin-bottom: 32rpx;
}

.index-page__section-title {
  margin-bottom: 24rpx;
}

.index-page__section-title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.index-page__section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.index-page__section-more {
  font-size: 26rpx;
  color: #007aff;
}

// 快捷入口
.index-page__quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.index-page__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.index-page__action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 12rpx;
  border-radius: 50%;
  background-color: #f0f5ff;
}

.index-page__action-icon--add {
  background-color: #e6f7ff;
}

.index-page__action-icon--wardrobe {
  background-color: #fff7e6;
}

.index-page__action-icon--outfit {
  background-color: #f6ffed;
}

.index-page__action-icon--calendar {
  background-color: #fff0f6;
}

.index-page__action-icon-text {
  font-size: 48rpx;
  color: #007aff;
}

.index-page__action-text {
  font-size: 24rpx;
  color: #666666;
}

// 最近穿搭
.index-page__recent-wears {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.index-page__wear-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.index-page__wear-date {
  flex-shrink: 0;
  width: 120rpx;
}

.index-page__wear-date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.index-page__wear-items {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  flex: 1;
  margin-left: 24rpx;
}

.index-page__wear-clothing {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

.index-page__wear-clothing-img {
  width: 100%;
  height: 100%;
}

.index-page__wear-clothing-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e8e8e8;
}

.index-page__wear-clothing-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #999999;
}

// 空状态
.index-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.index-page__empty-text {
  font-size: 28rpx;
  color: #999999;
}

.index-page__empty-hint {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #cccccc;
}
</style>
