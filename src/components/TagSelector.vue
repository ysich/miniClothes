<template>
  <view class="tag-selector">
    <view class="tag-selector__search">
      <input
        class="tag-selector__input"
        type="text"
        :value="searchKeyword"
        placeholder="搜索标签"
        @input="handleSearchInput"
      />
    </view>

    <view class="tag-selector__list">
      <view
        v-for="tag in filteredTags"
        :key="tag"
        class="tag-selector__item"
        :class="{ 'tag-selector__item--selected': isSelected(tag) }"
        @click="handleTagClick(tag)"
      >
        <text class="tag-selector__tag-text">{{ tag }}</text>
        <text
          v-if="isSelected(tag)"
          class="tag-selector__check-icon"
        >
        </text>
      </view>

      <view v-if="filteredTags.length === 0" class="tag-selector__empty">
        <text class="tag-selector__empty-text">暂无标签</text>
      </view>
    </view>

    <view v-if="selectedTags.length > 0" class="tag-selector__selected">
      <text class="tag-selector__selected-label">已选：</text>
      <view class="tag-selector__selected-list">
        <view
          v-for="(tag, index) in selectedTags"
          :key="index"
          class="tag-selector__selected-item"
          @click="handleRemoveSelected(index)"
        >
          <text class="tag-selector__selected-text">{{ tag }}</text>
          <text class="tag-selector__remove-icon"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const DEFAULT_MAX_COUNT = 10

interface Props {
  tags: string[]
  selectedTags: string[]
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: DEFAULT_MAX_COUNT,
})

interface Emits {
  (e: 'update:selectedTags', tags: string[]): void
  (e: 'change', tags: string[]): void
}

const emit = defineEmits<Emits>()

const searchKeyword = ref('')

const filteredTags = computed(() => {
  if (!searchKeyword.value) {
    return props.tags
  }
  const keyword = searchKeyword.value.toLowerCase()
  return props.tags.filter(tag => tag.toLowerCase().includes(keyword))
})

const canAddMore = computed(() => {
  return props.selectedTags.length < props.maxCount
})

const isSelected = (tag: string) => {
  return props.selectedTags.includes(tag)
}

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchKeyword.value = target.value
}

const handleTagClick = (tag: string) => {
  if (isSelected(tag)) {
    handleRemoveSelected(props.selectedTags.indexOf(tag))
  } else {
    if (!canAddMore.value) {
      uni.showToast({
        title: `最多选择${props.maxCount}个标签`,
        icon: 'none',
      })
      return
    }
    const newTags = [...props.selectedTags, tag]
    emitChange(newTags)
  }
}

const handleRemoveSelected = (index: number) => {
  const newTags = [...props.selectedTags]
  newTags.splice(index, 1)
  emitChange(newTags)
}

const emitChange = (tags: string[]) => {
  emit('update:selectedTags', tags)
  emit('change', tags)
}

const clear = () => {
  searchKeyword.value = ''
  emitChange([])
}

defineExpose({
  clear,
})
</script>

<style scoped lang="scss">
.tag-selector {
  width: 100%;
}

.tag-selector__search {
  margin-bottom: 24rpx;
}

.tag-selector__input {
  width: 100%;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border: 2rpx solid transparent;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.tag-selector__input::placeholder {
  color: #999999;
}

.tag-selector__list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tag-selector__item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border: 2rpx solid transparent;
  border-radius: 32rpx;
  transition: all 0.2s;
}

.tag-selector__item--selected {
  background-color: #e6f0ff;
  border-color: #007aff;
}

.tag-selector__tag-text {
  font-size: 28rpx;
  color: #333333;
}

.tag-selector__item--selected .tag-selector__tag-text {
  color: #007aff;
}

.tag-selector__check-icon {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #007aff;
}

.tag-selector__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 48rpx 0;
}

.tag-selector__empty-text {
  font-size: 28rpx;
  color: #999999;
}

.tag-selector__selected {
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f0f0;
}

.tag-selector__selected-label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #999999;
}

.tag-selector__selected-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-selector__selected-item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #e6f0ff;
  border-radius: 32rpx;
}

.tag-selector__selected-text {
  font-size: 28rpx;
  color: #007aff;
}

.tag-selector__remove-icon {
  margin-left: 8rpx;
  font-size: 32rpx;
  font-weight: 300;
  color: #007aff;
  transform: rotate(45deg);
  line-height: 1;
}
</style>
