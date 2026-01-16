<template>
  <view class="wardrobe-page">
    <scroll-view
      class="wardrobe-page__scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
    >
      <view class="wardrobe-page__content">
        <!-- 分类筛选 Tab -->
        <view class="wardrobe-page__tabs">
          <view
            v-for="tab in categoryTabs"
            :key="tab.value"
            class="wardrobe-page__tab"
            :class="{ 'wardrobe-page__tab--active': currentCategory === tab.value }"
            @click="handleCategoryChange(tab.value)"
          >
            <text class="wardrobe-page__tab-text">{{ tab.label }}</text>
          </view>
        </view>

        <!-- 搜索框 -->
        <view class="wardrobe-page__search">
          <input
            class="wardrobe-page__search-input"
            type="text"
            :value="searchKeyword"
            placeholder="搜索名称或品牌"
            placeholder-class="wardrobe-page__search-placeholder"
            @input="handleSearchInput"
            @confirm="handleSearchConfirm"
          />
        </view>

        <!-- 标签筛选 -->
        <view v-if="availableTags.length > 0" class="wardrobe-page__tags-section">
          <view class="wardrobe-page__tags-header">
            <text class="wardrobe-page__tags-title">标签筛选</text>
            <text
              v-if="selectedTags.length > 0"
              class="wardrobe-page__tags-clear"
              @click="handleClearTags"
            >
              清空
            </text>
          </view>
          <TagSelector
            :tags="availableTags"
            :selected-tags="selectedTags"
            @update:selected-tags="handleTagsChange"
          />
        </view>

        <!-- 衣物列表 -->
        <view v-if="filteredClothingList.length > 0" class="wardrobe-page__list">
          <ClothingCard
            v-for="item in filteredClothingList"
            :key="item.id"
            :clothing="item"
            :show-tags="true"
            :show-actions="true"
            @click="handleClothingClick"
            @edit="handleEditClothing"
            @delete="handleDeleteClothing"
          />
        </view>

        <!-- 空状态 -->
        <view v-else class="wardrobe-page__empty">
          <view class="wardrobe-page__empty-icon"></view>
          <text class="wardrobe-page__empty-text">
            {{ emptyStateText }}
          </text>
          <button v-if="clothingStore.clothingList.length === 0" class="wardrobe-page__empty-btn" @click="handleAddClothing">
            添加第一件衣物
          </button>
        </view>
      </view>
    </scroll-view>

    <!-- 添加衣物按钮 -->
    <view v-if="clothingStore.clothingList.length > 0" class="wardrobe-page__fab" @click="handleAddClothing">
      <text class="wardrobe-page__fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClothingStore } from '@/stores/clothing'
import ClothingCard from '@/components/ClothingCard.vue'
import TagSelector from '@/components/TagSelector.vue'
import type { Clothing } from '@/types'

const clothingStore = useClothingStore()

const categoryTabs = [
  { label: '全部', value: 'all' },
  { label: '上装', value: '上装' },
  { label: '下装', value: '下装' },
  { label: '鞋履', value: '鞋子' },
  { label: '配饰', value: '配饰' },
]

const currentCategory = ref('all')
const searchKeyword = ref('')
const selectedTags = ref<string[]>([])
const isRefreshing = ref(false)

const availableTags = computed(() => {
  const tags = new Set<string>()
  clothingStore.activeClothing.forEach(clothing => {
    clothing.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const filteredClothingList = computed(() => {
  let list = clothingStore.activeClothing

  // 分类筛选
  if (currentCategory.value !== 'all') {
    list = list.filter(item => item.category === currentCategory.value)
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(
      item =>
        item.name.toLowerCase().includes(keyword) ||
        item.brand.toLowerCase().includes(keyword)
    )
  }

  // 标签筛选
  if (selectedTags.value.length > 0) {
    list = list.filter(item =>
      selectedTags.value.every(tag => item.tags.includes(tag))
    )
  }

  return list
})

const emptyStateText = computed(() => {
  if (clothingStore.clothingList.length === 0) {
    return '暂无衣物'
  }
  if (filteredClothingList.length === 0) {
    if (searchKeyword.value || selectedTags.value.length > 0) {
      return '没有找到符合条件的衣物'
    }
    return `${currentCategory.value === 'all' ? '' : '该分类下'}暂无衣物`
  }
  return '暂无衣物'
})

onMounted(async () => {
  await clothingStore.loadFromStorage()
})

const handleCategoryChange = (category: string) => {
  currentCategory.value = category
}

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchKeyword.value = target.value
}

const handleSearchConfirm = () => {
  // 搜索确认时的额外处理，如果需要
}

const handleTagsChange = (tags: string[]) => {
  selectedTags.value = tags
}

const handleClearTags = () => {
  selectedTags.value = []
}

const handleRefresh = async () => {
  isRefreshing.value = true
  await clothingStore.loadFromStorage()
  isRefreshing.value = false
}

const handleClothingClick = (clothing: Clothing) => {
  uni.navigateTo({
    url: `/pages/clothing/detail?id=${clothing.id}`,
  })
}

const handleEditClothing = (clothing: Clothing) => {
  uni.navigateTo({
    url: `/pages/clothing/edit?id=${clothing.id}`,
  })
}

const handleDeleteClothing = (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这件衣物吗？',
    success: res => {
      if (res.confirm) {
        clothingStore.deleteClothing(id)
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        })
      }
    },
  })
}

const handleAddClothing = () => {
  uni.navigateTo({
    url: '/pages/clothing/add',
  })
}
</script>

<style scoped lang="scss">
.wardrobe-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.wardrobe-page__scroll {
  flex: 1;
  height: 0;
}

.wardrobe-page__content {
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.wardrobe-page__tabs {
  display: flex;
  flex-direction: row;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.wardrobe-page__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.wardrobe-page__tab--active {
  background-color: #007aff;
}

.wardrobe-page__tab-text {
  font-size: 28rpx;
  color: #666666;
  transition: color 0.3s;
}

.wardrobe-page__tab--active .wardrobe-page__tab-text {
  color: #ffffff;
  font-weight: 500;
}

.wardrobe-page__search {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.wardrobe-page__search-input {
  height: 72rpx;
  font-size: 28rpx;
  color: #333333;
}

.wardrobe-page__search-placeholder {
  color: #999999;
}

.wardrobe-page__tags-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.wardrobe-page__tags-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.wardrobe-page__tags-title {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.wardrobe-page__tags-clear {
  font-size: 24rpx;
  color: #007aff;
}

.wardrobe-page__list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.wardrobe-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.wardrobe-page__empty-icon {
  width: 200rpx;
  height: 200rpx;
  background-color: #f0f0f0;
  border-radius: 50%;
  margin-bottom: 32rpx;
}

.wardrobe-page__empty-icon::after {
  content: '';
  display: block;
  width: 80rpx;
  height: 80rpx;
  margin: 60rpx auto;
  background-color: #d0d0d0;
  border-radius: 50%;
}

.wardrobe-page__empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 32rpx;
}

.wardrobe-page__empty-btn {
  padding: 16rpx 48rpx;
  background-color: #007aff;
  color: #ffffff;
  font-size: 28rpx;
  border-radius: 32rpx;
  border: none;
}

.wardrobe-page__fab {
  position: fixed;
  right: 48rpx;
  bottom: 48rpx;
  width: 112rpx;
  height: 112rpx;
  background-color: #007aff;
  border-radius: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.4);
  z-index: 100;
}

.wardrobe-page__fab-icon {
  font-size: 64rpx;
  color: #ffffff;
  font-weight: 300;
  line-height: 1;
}
</style>
