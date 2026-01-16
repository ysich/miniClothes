<template>
  <view class="outfit-add">
    <!-- 搭配名称输入 -->
    <view class="outfit-add__section">
      <view class="outfit-add__label">搭配名称</view>
      <input
        v-model="outfitName"
        class="outfit-add__input"
        placeholder="请输入搭配名称"
        placeholder-class="outfit-add__input-placeholder"
      />
    </view>

    <!-- 已选衣物展示 -->
    <view v-if="selectedClothing.length > 0" class="outfit-add__section">
      <view class="outfit-add__label">
        已选衣物 ({{ selectedClothing.length }})
      </view>
      <view class="outfit-add__selected">
        <ClothingCard
          v-for="item in selectedClothing"
          :key="item.id"
          :clothing="item"
          :show-tags="false"
          @delete="handleRemoveClothing"
        />
      </view>
    </view>

    <!-- 衣物选择器 -->
    <view class="outfit-add__section">
      <view class="outfit-add__label">选择衣物</view>
      <view class="outfit-add__category-tabs">
        <view
          v-for="cat in categories"
          :key="cat"
          class="outfit-add__category-tab"
          :class="{ 'outfit-add__category-tab--active': currentCategory === cat }"
          @click="handleCategoryChange(cat)"
        >
          <text class="outfit-add__category-tab-text">{{ cat }}</text>
        </view>
      </view>
      <view class="outfit-add__list">
        <ClothingCard
          v-for="item in filteredClothing"
          :key="item.id"
          :clothing="item"
          :show-tags="false"
          @click="handleSelectClothing"
        />
        <view v-if="filteredClothing.length === 0" class="outfit-add__empty">
          <text class="outfit-add__empty-text">暂无衣物</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="outfit-add__footer">
      <button class="outfit-add__btn outfit-add__btn--cancel" @click="handleCancel">
        取消
      </button>
      <button
        class="outfit-add__btn outfit-add__btn--save"
        :disabled="!canSave"
        @click="handleSave"
      >
        保存
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClothingStore } from '@/stores/clothing'
import ClothingCard from '@/components/ClothingCard.vue'
import type { Clothing, Outfit } from '@/types'

const clothingStore = useClothingStore()

const outfitName = ref('')
const selectedClothing = ref<Clothing[]>([])
const currentCategory = ref('全部')

const categories = ref(['全部', '上装', '下装', '鞋子', '配饰'])

const filteredClothing = computed(() => {
  const list = clothingStore.activeClothing
  const selectedIds = selectedClothing.value.map(item => item.id)

  if (currentCategory.value === '全部') {
    return list.filter(item => !selectedIds.includes(item.id))
  }
  return list.filter(
    item => item.category === currentCategory.value && !selectedIds.includes(item.id)
  )
})

const canSave = computed(() => {
  return outfitName.value.trim() !== '' && selectedClothing.value.length > 0
})

const handleCategoryChange = (category: string) => {
  currentCategory.value = category
}

const handleSelectClothing = (clothing: Clothing) => {
  selectedClothing.value.push(clothing)
}

const handleRemoveClothing = (id: string) => {
  const index = selectedClothing.value.findIndex(item => item.id === id)
  if (index !== -1) {
    selectedClothing.value.splice(index, 1)
  }
}

const handleSave = () => {
  if (!canSave.value) {
    return
  }

  const outfit: Outfit = {
    id: generateId(),
    name: outfitName.value.trim(),
    clothingIds: selectedClothing.value.map(item => item.id),
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  saveOutfit(outfit)
}

const handleCancel = () => {
  uni.navigateBack()
}

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const saveOutfit = (outfit: Outfit) => {
  try {
    const outfits: Outfit[] = uni.getStorageSync('outfits') || []
    outfits.push(outfit)
    uni.setStorageSync('outfits', outfits)
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('Failed to save outfit:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error',
    })
  }
}

onMounted(() => {
  clothingStore.loadFromStorage()
})
</script>

<style scoped lang="scss">
.outfit-add {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 160rpx;
  background-color: #f5f7fa;
}

.outfit-add__section {
  margin-bottom: 32rpx;
}

.outfit-add__label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.outfit-add__input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.outfit-add__input-placeholder {
  color: #cccccc;
}

.outfit-add__selected {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.outfit-add__category-tabs {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-bottom: 24rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.outfit-add__category-tab {
  padding: 12rpx 24rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  border: 1rpx solid #e0e0e0;
}

.outfit-add__category-tab--active {
  background-color: #007aff;
  border-color: #007aff;
}

.outfit-add__category-tab-text {
  font-size: 24rpx;
  color: #666666;
}

.outfit-add__category-tab--active .outfit-add__category-tab-text {
  color: #ffffff;
}

.outfit-add__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.outfit-add__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  background-color: #ffffff;
  border-radius: 12rpx;
}

.outfit-add__empty-text {
  font-size: 28rpx;
  color: #999999;
}

.outfit-add__footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  padding: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.outfit-add__btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 12rpx;
  border: none;
}

.outfit-add__btn--cancel {
  background-color: #f5f5f5;
  color: #666666;
}

.outfit-add__btn--save {
  background-color: #007aff;
  color: #ffffff;
}

.outfit-add__btn--save[disabled] {
  background-color: #cccccc;
  color: #ffffff;
}
</style>
