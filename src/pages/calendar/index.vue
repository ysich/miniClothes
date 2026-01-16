<template>
  <view class="calendar-page">
    <!-- 月份切换 -->
    <view class="calendar-page__header">
      <view class="calendar-page__month-selector">
        <text class="calendar-page__month-nav" @click="handlePrevMonth">
          <text class="calendar-page__nav-icon">&lt;</text>
        </text>
        <text class="calendar-page__month-text">{{ currentMonthText }}</text>
        <text class="calendar-page__month-nav" @click="handleNextMonth">
          <text class="calendar-page__nav-icon">&gt;</text>
        </text>
      </view>
      <view class="calendar-page__stats">
        <text class="calendar-page__stats-text">{{ monthStatsText }}</text>
      </view>
    </view>

    <!-- 星期标题 -->
    <view class="calendar-page__weekdays">
      <text
        v-for="weekday in weekdays"
        :key="weekday"
        class="calendar-page__weekday"
      >
        {{ weekday }}
      </text>
    </view>

    <!-- 日历网格 -->
    <view class="calendar-page__days">
      <view
        v-for="day in calendarDays"
        :key="day.date"
        class="calendar-page__day"
        :class="{
          'calendar-page__day--other-month': day.isOtherMonth,
          'calendar-page__day--today': day.isToday,
          'calendar-page__day--selected': day.date === selectedDate,
          'calendar-page__day--has-wear': day.hasWear,
        }"
        @click="handleDayClick(day)"
      >
        <text class="calendar-page__day-text">{{ day.dayNum }}</text>
        <view v-if="day.hasWear" class="calendar-page__day-dot"></view>
      </view>
    </view>

    <!-- 日期穿搭面板 -->
    <view v-if="showPanel" class="calendar-page__panel-mask" @click="handlePanelClose"></view>
    <view
      v-if="showPanel"
      class="calendar-page__panel"
      :class="{ 'calendar-page__panel--show': showPanel }"
    >
      <view class="calendar-page__panel-header">
        <text class="calendar-page__panel-date">{{ selectedDateDisplay }}</text>
        <text class="calendar-page__panel-close" @click="handlePanelClose"></text>
      </view>

      <!-- 穿搭记录列表 -->
      <view v-if="dayWears.length > 0" class="calendar-page__wear-list">
        <view
          v-for="wear in dayWears"
          :key="wear.id"
          class="calendar-page__wear-item"
        >
          <view class="calendar-page__wear-items">
            <view
              v-for="clothing in getWearClothing(wear)"
              :key="clothing.id"
              class="calendar-page__wear-clothing"
            >
              <image
                v-if="clothing.images[0]"
                class="calendar-page__wear-clothing-img"
                :src="clothing.images[0]"
                mode="aspectFill"
              />
              <view v-else class="calendar-page__wear-clothing-placeholder">
                <text class="calendar-page__wear-clothing-text">{{ clothing.category[0] }}</text>
              </view>
            </view>
          </view>
          <view class="calendar-page__wear-actions">
            <text class="calendar-page__wear-delete" @click="handleDeleteWear(wear.id)">
              删除
            </text>
          </view>
        </view>
      </view>

      <!-- 快速添加穿搭 -->
      <view class="calendar-page__add-section">
        <text class="calendar-page__add-title">快速添加穿搭</text>
        <view class="calendar-page__outfit-list">
          <view
            v-for="outfit in availableOutfits"
            :key="outfit.id"
            class="calendar-page__outfit-item"
            @click="handleAddOutfit(outfit)"
          >
            <view class="calendar-page__outfit-images">
              <image
                v-for="(img, idx) in outfit.images.slice(0, 3)"
                :key="idx"
                class="calendar-page__outfit-img"
                :src="img"
                mode="aspectFill"
              />
              <view
                v-if="outfit.images.length === 0"
                class="calendar-page__outfit-placeholder"
              >
                <text class="calendar-page__outfit-placeholder-text">
                  {{ outfit.name[0] }}
                </text>
              </view>
            </view>
            <text class="calendar-page__outfit-name">{{ outfit.name }}</text>
          </view>
        </view>
        <view class="calendar-page__add-clothing" @click="handleAddClothing">
          <text class="calendar-page__add-clothing-text">+ 添加单品</text>
        </view>
      </view>
    </view>

    <!-- 空状态提示 -->
    <view v-if="calendarStore.wearRecords.length === 0 && !showPanel" class="calendar-page__empty">
      <view class="calendar-page__empty-icon"></view>
      <text class="calendar-page__empty-text">暂无穿搭记录</text>
      <text class="calendar-page__empty-hint">点击日期开始记录穿搭</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClothingStore } from '@/stores/clothing'
import { useOutfitStore } from '@/stores/outfit'
import { useCalendarStore } from '@/stores/calendar'
import type { CalendarWear, Clothing, Outfit } from '@/types'
import { getTodayDate, formatDateDisplay, formatDateToLocal } from '@/utils/date'

// Props - 从 URL 获取初始日期
const props = defineProps<{
  date?: string
}>()

// Store
const clothingStore = useClothingStore()
const outfitStore = useOutfitStore()
const calendarStore = useCalendarStore()

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 当前显示的月份
const currentYear = ref<number>(new Date().getFullYear())
const currentMonth = ref<number>(new Date().getMonth() + 1)

// 选中的日期
const selectedDate = ref<string>(getTodayDate())

// 是否显示面板
const showPanel = ref<boolean>(false)

// 当前月份文本
const currentMonthText = computed(() => {
  return `${currentYear.value}年${currentMonth.value}月`
})

// 月份统计文本
const monthStatsText = computed(() => {
  const stats = calendarStore.getMonthlyStats(currentYear.value, currentMonth.value)
  return `穿搭${stats.uniqueDates}天 · 衣物${stats.clothingCount}件`
})

// 日历日期列表
const calendarDays = computed(() => {
  const days: Array<{
    date: string
    dayNum: number
    isOtherMonth: boolean
    isToday: boolean
    hasWear: boolean
  }> = []

  // 获取当月第一天和最后一天
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)

  // 当月第一天是星期几
  const firstDayOfWeek = firstDay.getDay()

  // 上个月的日期
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const date = formatDateToLocal(
      new Date(currentYear.value, currentMonth.value - 2, dayNum)
    )
    days.push({
      date,
      dayNum,
      isOtherMonth: true,
      isToday: false,
      hasWear: calendarStore.getWearByDate(date).length > 0,
    })
  }

  // 当月的日期
  const today = getTodayDate()
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = formatDateToLocal(new Date(currentYear.value, currentMonth.value - 1, i))
    days.push({
      date,
      dayNum: i,
      isOtherMonth: false,
      isToday: date === today,
      hasWear: calendarStore.getWearByDate(date).length > 0,
    })
  }

  // 下个月的日期（补齐6行）
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = formatDateToLocal(new Date(currentYear.value, currentMonth.value, i))
    days.push({
      date,
      dayNum: i,
      isOtherMonth: true,
      isToday: false,
      hasWear: calendarStore.getWearByDate(date).length > 0,
    })
  }

  return days
})

// 选中日期显示
const selectedDateDisplay = computed(() => {
  return formatDateDisplay(selectedDate.value)
})

// 当天的穿搭记录
const dayWears = computed(() => {
  return calendarStore.getWearByDate(selectedDate.value)
})

// 可用的搭配列表（未在该日期使用的）
const availableOutfits = computed(() => {
  const usedOutfitIds = dayWears.value.map(w => w.outfitId).filter(Boolean) as string[]
  return outfitStore.outfitList.filter(o => !usedOutfitIds.includes(o.id))
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

// 上个月
const handlePrevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

// 下个月
const handleNextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

// 点击日期
const handleDayClick = (day: {
  date: string
  dayNum: number
  isOtherMonth: boolean
  isToday: boolean
  hasWear: boolean
}) => {
  if (day.isOtherMonth) {
    const date = new Date(day.date)
    currentYear.value = date.getFullYear()
    currentMonth.value = date.getMonth() + 1
  }
  selectedDate.value = day.date
  showPanel.value = true
}

// 关闭面板
const handlePanelClose = () => {
  showPanel.value = false
}

// 添加搭配
const handleAddOutfit = (outfit: Outfit) => {
  const wear: CalendarWear = {
    id: `wear_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    date: selectedDate.value,
    outfitId: outfit.id,
    clothingIds: outfit.clothingIds,
    createdAt: new Date().toISOString(),
  }
  calendarStore.addWearRecord(wear)
}

// 添加单品（跳转到单品选择页面）
const handleAddClothing = () => {
  // TODO: 跳转到单品选择页面
  uni.showToast({
    title: '单品选择功能开发中',
    icon: 'none',
  })
}

// 删除穿搭记录
const handleDeleteWear = (wearId: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条穿搭记录吗？',
    success: res => {
      if (res.confirm) {
        calendarStore.deleteWearRecord(wearId)
      }
    },
  })
}

// 初始化
onMounted(() => {
  clothingStore.loadFromStorage()
  outfitStore.loadFromStorage()
  calendarStore.loadFromStorage()

  // 如果有传入日期参数，跳转到该日期
  if (props.date) {
    const date = new Date(props.date)
    currentYear.value = date.getFullYear()
    currentMonth.value = date.getMonth() + 1
    selectedDate.value = props.date
  }
})
</script>

<style scoped lang="scss">
.calendar-page {
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f5f7fa;
}

// 月份切换
.calendar-page__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.calendar-page__month-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32rpx;
}

.calendar-page__month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.calendar-page__nav-icon {
  font-size: 32rpx;
  font-weight: 600;
  color: #666666;
}

.calendar-page__month-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.calendar-page__stats {
  padding: 12rpx 24rpx;
  background-color: #ffffff;
  border-radius: 32rpx;
}

.calendar-page__stats-text {
  font-size: 24rpx;
  color: #999999;
}

// 星期标题
.calendar-page__weekdays {
  display: flex;
  flex-direction: row;
  margin-bottom: 16rpx;
}

.calendar-page__weekday {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999999;
}

// 日历网格
.calendar-page__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
  background-color: #ffffff;
  padding: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.calendar-page__day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.calendar-page__day--other-month {
  opacity: 0.3;
}

.calendar-page__day--today {
  background-color: #e6f7ff;
}

.calendar-page__day--selected {
  background-color: #007aff;
}

.calendar-page__day--selected .calendar-page__day-text {
  color: #ffffff;
}

.calendar-page__day--has-wear {
  background-color: #fff7e6;
}

.calendar-page__day--has-wear.calendar-page__day--today {
  background-color: #fff0f6;
}

.calendar-page__day-text {
  font-size: 28rpx;
  color: #333333;
}

.calendar-page__day--has-wear .calendar-page__day-text {
  color: #fa8c16;
}

.calendar-page__day-dot {
  position: absolute;
  bottom: 8rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #fa8c16;
}

// 底部面板遮罩
.calendar-page__panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.5);
}

// 底部面板
.calendar-page__panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  max-height: 70vh;
  background-color: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.calendar-page__panel--show {
  transform: translateY(0);
}

.calendar-page__panel-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.calendar-page__panel-date {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.calendar-page__panel-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.calendar-page__panel-close::before,
.calendar-page__panel-close::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24rpx;
  height: 2rpx;
  background-color: #999999;
}

.calendar-page__panel-close::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.calendar-page__panel-close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

// 穿搭记录列表
.calendar-page__wear-list {
  max-height: 240rpx;
  padding: 24rpx 32rpx;
  overflow-y: auto;
}

.calendar-page__wear-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
}

.calendar-page__wear-item:last-child {
  margin-bottom: 0;
}

.calendar-page__wear-items {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
}

.calendar-page__wear-clothing {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

.calendar-page__wear-clothing-img {
  width: 100%;
  height: 100%;
}

.calendar-page__wear-clothing-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e8e8e8;
}

.calendar-page__wear-clothing-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #999999;
}

.calendar-page__wear-actions {
  flex-shrink: 0;
}

.calendar-page__wear-delete {
  font-size: 24rpx;
  color: #ff4d4f;
}

// 快速添加穿搭
.calendar-page__add-section {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.calendar-page__add-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.calendar-page__outfit-list {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;
  margin-bottom: 16rpx;
}

.calendar-page__outfit-item {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 160rpx;
  padding: 16rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
}

.calendar-page__outfit-images {
  display: flex;
  flex-direction: row;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.calendar-page__outfit-img {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
}

.calendar-page__outfit-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  background-color: #e8e8e8;
}

.calendar-page__outfit-placeholder-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #999999;
}

.calendar-page__outfit-name {
  font-size: 24rpx;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-page__add-clothing {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background-color: #f0f5ff;
  border-radius: 16rpx;
  border: 1rpx dashed #007aff;
}

.calendar-page__add-clothing-text {
  font-size: 28rpx;
  color: #007aff;
}

// 空状态
.calendar-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.calendar-page__empty-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.calendar-page__empty-text {
  font-size: 28rpx;
  color: #999999;
}

.calendar-page__empty-hint {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #cccccc;
}
</style>
