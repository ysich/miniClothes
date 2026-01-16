<template>
  <view class="stats-page">
    <!-- 衣物总数 -->
    <view class="stats-page__section">
      <view class="stats-page__card">
        <view class="stats-page__card-content">
          <text class="stats-page__card-value">{{ clothingStore.totalCount }}</text>
          <text class="stats-page__card-label">衣物总数</text>
        </view>
        <view class="stats-page__card-icon stats-page__card-icon--total">
          <text class="stats-page__icon-text"></text>
        </view>
      </view>
    </view>

    <!-- 分类占比 -->
    <view class="stats-page__section">
      <view class="stats-page__section-title">
        <text class="stats-page__section-title-text">分类占比</text>
      </view>
      <view v-if="categoryData.length > 0" class="stats-page__chart-container">
        <view class="stats-page__pie-chart">
          <view
            v-for="(item, index) in categoryData"
            :key="item.name"
            class="stats-page__pie-segment"
            :style="{
              background: categoryColors[index % categoryColors.length],
              '--start-angle': `${item.startAngle}deg`,
              '--end-angle': `${item.endAngle}deg`,
            }"
          />
          <view class="stats-page__pie-center">
            <text class="stats-page__pie-center-text">{{ clothingStore.totalCount }}</text>
          </view>
        </view>
        <view class="stats-page__legend">
          <view
            v-for="(item, index) in categoryData"
            :key="item.name"
            class="stats-page__legend-item"
          >
            <view
              class="stats-page__legend-color"
              :style="{
                backgroundColor: categoryColors[index % categoryColors.length],
              }"
            />
            <text class="stats-page__legend-name">{{ item.name }}</text>
            <text class="stats-page__legend-count">{{ item.count }}</text>
            <text class="stats-page__legend-percent">{{ item.percent }}%</text>
          </view>
        </view>
      </view>
      <view v-else class="stats-page__empty">
        <text class="stats-page__empty-text">暂无数据</text>
      </view>
    </view>

    <!-- 穿搭统计 -->
    <view class="stats-page__section">
      <view class="stats-page__section-title">
        <text class="stats-page__section-title-text">穿搭统计</text>
      </view>
      <view class="stats-page__stats-grid">
        <view class="stats-page__stat-item">
          <text class="stats-page__stat-value">{{ totalWearCount }}</text>
          <text class="stats-page__stat-label">穿搭总次数</text>
        </view>
        <view class="stats-page__stat-item">
          <text class="stats-page__stat-value">{{ monthlyRecordCount }}</text>
          <text class="stats-page__stat-label">本月记录数</text>
        </view>
      </view>
    </view>

    <!-- 高频衣物 -->
    <view class="stats-page__section">
      <view class="stats-page__section-title">
        <text class="stats-page__section-title-text">高频衣物 TOP 10</text>
      </view>
      <view v-if="topWornClothing.length > 0" class="stats-page__top-list">
        <view
          v-for="(item, index) in topWornClothing"
          :key="item.clothing.id"
          class="stats-page__top-item"
          @click="navigateToClothing(item.clothing.id)"
        >
          <view class="stats-page__top-rank" :class="`stats-page__top-rank--${index + 1}`">
            <text class="stats-page__top-rank-text">{{ index + 1 }}</text>
          </view>
          <view v-if="item.clothing.images[0]" class="stats-page__top-image">
            <image
              class="stats-page__top-image-img"
              :src="item.clothing.images[0]"
              mode="aspectFill"
            />
          </view>
          <view v-else class="stats-page__top-placeholder">
            <text class="stats-page__top-placeholder-text">{{ item.clothing.category[0] }}</text>
          </view>
          <view class="stats-page__top-info">
            <text class="stats-page__top-name">{{ item.clothing.name }}</text>
            <text class="stats-page__top-category">{{ item.clothing.category }}</text>
          </view>
          <view class="stats-page__top-count">
            <text class="stats-page__top-count-value">{{ item.count }}</text>
            <text class="stats-page__top-count-label">次</text>
          </view>
        </view>
      </view>
      <view v-else class="stats-page__empty">
        <text class="stats-page__empty-text">暂无穿搭记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClothingStore } from '@/stores/clothing'
import { useCalendarStore } from '@/stores/calendar'
import type { Clothing } from '@/types'

const clothingStore = useClothingStore()
const calendarStore = useCalendarStore()

// 饼图颜色
const categoryColors = [
  '#667eea',
  '#f093fb',
  '#f5576c',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#fa709a',
  '#fee140',
]

// 分类数据
interface CategoryData {
  name: string
  count: number
  percent: number
  startAngle: number
  endAngle: number
}

const categoryData = computed<CategoryData[]>(() => {
  const total = clothingStore.totalCount
  if (total === 0) return []

  const categoryMap = new Map<string, number>()
  clothingStore.clothingList.forEach(clothing => {
    const count = categoryMap.get(clothing.category) ?? 0
    categoryMap.set(clothing.category, count + 1)
  })

  let startAngle = 0
  const result: CategoryData[] = []
  categoryMap.forEach((count, name) => {
    const percent = Math.round((count / total) * 100)
    const angle = (count / total) * 360
    result.push({
      name,
      count,
      percent,
      startAngle,
      endAngle: startAngle + angle,
    })
    startAngle += angle
  })

  return result.sort((a, b) => b.count - a.count)
})

// 穿搭总次数
const totalWearCount = computed(() => {
  return calendarStore.wearRecords.length
})

// 本月记录数
const monthlyRecordCount = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return calendarStore.getMonthlyStats(year, month).uniqueDates
})

// 高频衣物 TOP 10
interface TopWornItem {
  clothing: Clothing
  count: number
}

const topWornClothing = computed<TopWornItem[]>(() => {
  const countMap = new Map<string, number>()

  calendarStore.wearRecords.forEach(record => {
    record.clothingIds.forEach(id => {
      const count = countMap.get(id) ?? 0
      countMap.set(id, count + 1)
    })
  })

  const result: TopWornItem[] = []
  countMap.forEach((count, id) => {
    const clothing = clothingStore.getClothingById(id)
    if (clothing) {
      result.push({ clothing, count })
    }
  })

  return result.sort((a, b) => b.count - a.count).slice(0, 10)
})

// 跳转到衣物详情
const navigateToClothing = (id: string) => {
  uni.navigateTo({
    url: `/pages/clothing-detail/index?id=${id}`,
  })
}

// 初始化加载数据
onMounted(() => {
  clothingStore.loadFromStorage()
  calendarStore.loadFromStorage()
})
</script>

<style scoped lang="scss">
.stats-page {
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f5f7fa;
}

.stats-page__section {
  margin-bottom: 32rpx;
}

.stats-page__section-title {
  margin-bottom: 24rpx;
}

.stats-page__section-title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

// 衣物总数卡片
.stats-page__card {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.stats-page__card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-page__card-value {
  font-size: 64rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.stats-page__card-label {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.stats-page__card-icon {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  opacity: 0.2;
}

.stats-page__icon-text {
  font-size: 48rpx;
}

// 饼图容器
.stats-page__chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stats-page__pie-chart {
  position: relative;
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
}

.stats-page__pie-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(
    50% 50%,
    50% 0%,
    calc(50% + 100% * sin(var(--end-angle))) calc(50% - 100% * cos(var(--end-angle))),
    calc(50% + 100% * sin(var(--start-angle))) calc(50% - 100% * cos(var(--start-angle)))
  );
}

.stats-page__pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180rpx;
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 50%;
}

.stats-page__pie-center-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #333333;
}

.stats-page__legend {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 32rpx;
}

.stats-page__legend-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.stats-page__legend-item:last-child {
  border-bottom: none;
}

.stats-page__legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 4rpx;
}

.stats-page__legend-name {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #333333;
}

.stats-page__legend-count {
  margin-right: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #666666;
}

.stats-page__legend-percent {
  font-size: 28rpx;
  font-weight: 600;
  color: #999999;
}

// 穿搭统计网格
.stats-page__stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.stats-page__stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stats-page__stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.stats-page__stat-label {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #999999;
}

// 高频衣物列表
.stats-page__top-list {
  display: flex;
  flex-direction: column;
  padding: 16rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stats-page__top-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.stats-page__top-item:last-child {
  border-bottom: none;
}

.stats-page__top-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.stats-page__top-rank--1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

.stats-page__top-rank--2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
}

.stats-page__top-rank--3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e8a86c 100%);
}

.stats-page__top-rank-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #ffffff;
}

.stats-page__top-image {
  margin-left: 24rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.stats-page__top-image-img {
  width: 100%;
  height: 100%;
}

.stats-page__top-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 24rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  background-color: #e8e8e8;
}

.stats-page__top-placeholder-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #999999;
}

.stats-page__top-info {
  display: flex;
  flex-direction: column;
  margin-left: 24rpx;
  flex: 1;
}

.stats-page__top-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.stats-page__top-category {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999999;
}

.stats-page__top-count {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.stats-page__top-count-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #667eea;
}

.stats-page__top-count-label {
  margin-left: 4rpx;
  font-size: 24rpx;
  color: #999999;
}

// 空状态
.stats-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stats-page__empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
