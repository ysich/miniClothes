<template>
  <view class="outfits-page">
    <view class="outfits-page__header">
      <view class="outfits-page__title">我的搭配</view>
      <view class="outfits-page__count">{{ totalOutfits }} 套</view>
    </view>

    <view v-if="isLoading" class="outfits-page__loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="isEmpty" class="outfits-page__empty">
      <image class="outfits-page__empty-icon" src="/static/empty.png" mode="aspectFit" />
      <text class="outfits-page__empty-text">暂无搭配</text>
      <text class="outfits-page__empty-desc">点击下方按钮创建你的第一套搭配</text>
    </view>

    <view v-else class="outfits-page__list">
      <OutfitCard
        v-for="outfit in outfitList"
        :key="outfit.id"
        :outfit="outfit"
        :show-actions="true"
        :show-date="true"
        @click="handleCardClick"
        @delete="handleDelete"
        @edit="handleEdit"
      />
    </view>

    <view class="outfits-page__fab" @click="handleAdd">
      <text class="outfits-page__fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOutfitStore } from '@/stores/outfit'
import OutfitCard from '@/components/OutfitCard.vue'
import type { Outfit } from '@/types'

const outfitStore = useOutfitStore()

const outfitList = computed(() => outfitStore.outfitList)
const isLoading = computed(() => outfitStore.isLoading)
const totalOutfits = computed(() => outfitStore.totalOutfits)

const isEmpty = computed(() => {
  return !isLoading.value && outfitList.value.length === 0
})

const handleCardClick = (outfit: Outfit) => {
  console.log('点击搭配:', outfit)
  // TODO: 跳转到搭配详情页
}

const handleEdit = (outfit: Outfit) => {
  console.log('编辑搭配:', outfit)
  // TODO: 跳转到编辑搭配页面
}

const handleAdd = () => {
  uni.navigateTo({
    url: '/pages/outfit-add/index',
  })
}

const handleDelete = (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这套搭配吗？删除后无法恢复。',
    success: (res) => {
      if (res.confirm) {
        outfitStore.deleteOutfit(id)
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        })
      }
    },
  })
}

onMounted(() => {
  outfitStore.loadFromStorage()
})
</script>

<style scoped lang="scss">
.outfits-page {
  min-height: 100vh;
  padding: 24rpx;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

.outfits-page__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.outfits-page__title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.outfits-page__count {
  font-size: 24rpx;
  color: #999999;
}

.outfits-page__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #999999;
  font-size: 28rpx;
}

.outfits-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 200rpx);
  gap: 16rpx;
}

.outfits-page__empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.5;
}

.outfits-page__empty-text {
  font-size: 32rpx;
  color: #333333;
}

.outfits-page__empty-desc {
  font-size: 24rpx;
  color: #999999;
}

.outfits-page__list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 120rpx;
}

.outfits-page__fab {
  position: fixed;
  right: 48rpx;
  bottom: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #007aff, #00c6ff);
  border-radius: 56rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.4);
  z-index: 100;
}

.outfits-page__fab-icon {
  font-size: 64rpx;
  font-weight: 300;
  color: #ffffff;
  line-height: 1;
}
</style>
