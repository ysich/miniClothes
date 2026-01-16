<template>
  <view class="settings-page">
    <!-- 分类管理 -->
    <view class="settings-page__section">
      <view class="settings-page__section-header">
        <text class="settings-page__section-title">分类管理</text>
        <view class="settings-page__add-btn" @click="handleAddCategory">
          <text class="settings-page__add-btn-text">+</text>
        </view>
      </view>
      <view class="settings-page__list">
        <view
          v-for="category in settingsStore.allCategories"
          :key="category.id"
          class="settings-page__item"
        >
          <view class="settings-page__item-content">
            <text class="settings-page__item-name">{{ category.name }}</text>
            <text class="settings-page__item-hint">
              {{ settingsStore.DEFAULT_CATEGORIES.some(c => c.id === category.id) ? '默认' : '自定义' }}
            </text>
          </view>
          <view v-if="!isDefaultCategory(category.id)" class="settings-page__item-actions">
            <view class="settings-page__action-btn" @click="handleEditCategory(category)">
              <text class="settings-page__action-icon">✎</text>
            </view>
            <view class="settings-page__action-btn" @click="handleDeleteCategory(category)">
              <text class="settings-page__action-icon settings-page__action-icon--delete"></text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 标签管理 -->
    <view class="settings-page__section">
      <view class="settings-page__section-header">
        <text class="settings-page__section-title">标签管理</text>
        <view class="settings-page__add-btn" @click="handleAddTag">
          <text class="settings-page__add-btn-text">+</text>
        </view>
      </view>
      <view class="settings-page__list">
        <view
          v-for="tag in settingsStore.allTags"
          :key="tag.id"
          class="settings-page__item"
        >
          <view class="settings-page__item-content">
            <view
              class="settings-page__tag-dot"
              :style="{ backgroundColor: tag.color }"
            ></view>
            <text class="settings-page__item-name">{{ tag.name }}</text>
            <text class="settings-page__item-hint">
              {{ settingsStore.DEFAULT_TAGS.some(t => t.id === tag.id) ? '默认' : '自定义' }}
            </text>
          </view>
          <view v-if="!isDefaultTag(tag.id)" class="settings-page__item-actions">
            <view class="settings-page__action-btn" @click="handleEditTag(tag)">
              <text class="settings-page__action-icon">✎</text>
            </view>
            <view class="settings-page__action-btn" @click="handleDeleteTag(tag)">
              <text class="settings-page__action-icon settings-page__action-icon--delete"></text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="settings-page__section">
      <text class="settings-page__section-title">数据管理</text>
      <view class="settings-page__list">
        <view class="settings-page__item" @click="handleClearCache">
          <view class="settings-page__item-content">
            <text class="settings-page__item-name">清空缓存</text>
            <text class="settings-page__item-desc">清除所有本地存储数据</text>
          </view>
          <text class="settings-page__arrow"></text>
        </view>
        <view class="settings-page__item" @click="handleExportData">
          <view class="settings-page__item-content">
            <text class="settings-page__item-name">导出数据</text>
            <text class="settings-page__item-desc">备份设置数据</text>
          </view>
          <text class="settings-page__arrow"></text>
        </view>
        <view class="settings-page__item" @click="handleImportData">
          <view class="settings-page__item-content">
            <text class="settings-page__item-name">恢复数据</text>
            <text class="settings-page__item-desc">从备份恢复设置</text>
          </view>
          <text class="settings-page__arrow"></text>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="settings-page__section">
      <text class="settings-page__section-title">关于</text>
      <view class="settings-page__list">
        <view class="settings-page__item settings-page__item--static">
          <view class="settings-page__item-content">
            <text class="settings-page__item-name">版本</text>
            <text class="settings-page__item-value">1.0.0</text>
          </view>
        </view>
        <view class="settings-page__item settings-page__item--static">
          <view class="settings-page__item-content">
            <text class="settings-page__item-name">最后备份</text>
            <text class="settings-page__item-value">
              {{ settingsStore.lastBackupTime ? formatDate(settingsStore.lastBackupTime) : '未备份' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类编辑弹窗 -->
    <uni-popup ref="categoryPopupRef" type="dialog">
      <uni-popup-dialog
        mode="input"
        :title="isEditingCategory ? '编辑分类' : '新增分类'"
        :value="categoryNameInput"
        placeholder="请输入分类名称"
        @confirm="handleCategoryConfirm"
      >
      </uni-popup-dialog>
    </uni-popup>

    <!-- 标签编辑弹窗 -->
    <uni-popup ref="tagPopupRef" type="dialog">
      <uni-popup-dialog
        mode="input"
        :title="isEditingTag ? '编辑标签' : '新增标签'"
        :value="tagNameInput"
        placeholder="请输入标签名称"
        @confirm="handleTagConfirm"
      >
      </uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { Category, Tag } from '@/types'

const settingsStore = useSettingsStore()

// 分类相关
const categoryPopupRef = ref()
const categoryNameInput = ref('')
const editingCategoryId = ref<string | null>(null)
const isEditingCategory = ref(false)

// 标签相关
const tagPopupRef = ref()
const tagNameInput = ref('')
const editingTagId = ref<string | null>(null)
const isEditingTag = ref(false)

// 判断是否为默认分类
const isDefaultCategory = (id: string): boolean => {
  return settingsStore.DEFAULT_CATEGORIES.some(c => c.id === id)
}

// 判断是否为默认标签
const isDefaultTag = (id: string): boolean => {
  return settingsStore.DEFAULT_TAGS.some(t => t.id === id)
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 分类操作
const handleAddCategory = () => {
  editingCategoryId.value = null
  isEditingCategory.value = false
  categoryNameInput.value = ''
  categoryPopupRef.value?.open()
}

const handleEditCategory = (category: Category) => {
  editingCategoryId.value = category.id
  isEditingCategory.value = true
  categoryNameInput.value = category.name
  categoryPopupRef.value?.open()
}

const handleDeleteCategory = (category: Category) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除分类"${category.name}"吗？`,
    success: res => {
      if (res.confirm) {
        settingsStore.deleteCategory(category.id)
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        })
      }
    },
  })
}

const handleCategoryConfirm = (value: string) => {
  if (!value || value.trim() === '') {
    uni.showToast({
      title: '分类名称不能为空',
      icon: 'none',
    })
    return
  }

  const trimmedName = value.trim()

  // 检查是否已存在同名分类
  const exists = settingsStore.allCategories.some(
    c => c.name === trimmedName && c.id !== editingCategoryId.value
  )
  if (exists) {
    uni.showToast({
      title: '该分类已存在',
      icon: 'none',
    })
    return
  }

  if (isEditingCategory.value && editingCategoryId.value) {
    settingsStore.updateCategory(editingCategoryId.value, { name: trimmedName })
  } else {
    settingsStore.addCategory(trimmedName)
  }

  uni.showToast({
    title: isEditingCategory.value ? '修改成功' : '添加成功',
    icon: 'success',
  })
}

// 标签操作
const handleAddTag = () => {
  editingTagId.value = null
  isEditingTag.value = false
  tagNameInput.value = ''
  tagPopupRef.value?.open()
}

const handleEditTag = (tag: Tag) => {
  editingTagId.value = tag.id
  isEditingTag.value = true
  tagNameInput.value = tag.name
  tagPopupRef.value?.open()
}

const handleDeleteTag = (tag: Tag) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除标签"${tag.name}"吗？`,
    success: res => {
      if (res.confirm) {
        settingsStore.deleteTag(tag.id)
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        })
      }
    },
  })
}

const handleTagConfirm = (value: string) => {
  if (!value || value.trim() === '') {
    uni.showToast({
      title: '标签名称不能为空',
      icon: 'none',
    })
    return
  }

  const trimmedName = value.trim()

  // 检查是否已存在同名标签
  const exists = settingsStore.allTags.some(
    t => t.name === trimmedName && t.id !== editingTagId.value
  )
  if (exists) {
    uni.showToast({
      title: '该标签已存在',
      icon: 'none',
    })
    return
  }

  if (isEditingTag.value && editingTagId.value) {
    settingsStore.updateTag(editingTagId.value, { name: trimmedName })
  } else {
    settingsStore.addTag(trimmedName)
  }

  uni.showToast({
    title: isEditingTag.value ? '修改成功' : '添加成功',
    icon: 'success',
  })
}

// 数据管理
const handleClearCache = () => {
  uni.showModal({
    title: '清空缓存',
    content: '确定要清空所有本地数据吗？此操作不可恢复！',
    confirmColor: '#ff3b30',
    success: res => {
      if (res.confirm) {
        settingsStore.clearCache()
        uni.showToast({
          title: '缓存已清空',
          icon: 'success',
        })
      }
    },
  })
}

const handleExportData = async () => {
  try {
    const data = await settingsStore.exportData()
    const jsonStr = JSON.stringify(data, null, 2)
    const fileName = `wardrobe_backup_${new Date().toISOString().slice(0, 10)}.json`

    // 在小程序中，可以使用剪贴板复制
    uni.setClipboardData({
      data: jsonStr,
      success: () => {
        uni.showModal({
          title: '导出成功',
          content: '备份数据已复制到剪贴板，请妥善保存',
          showCancel: false,
        })
        settingsStore.lastBackupTime = new Date().toISOString()
      },
    })
  } catch (error) {
    uni.showToast({
      title: '导出失败',
      icon: 'none',
    })
  }
}

const handleImportData = () => {
  uni.showModal({
    title: '恢复数据',
    content: '请从剪贴板粘贴备份数据',
    editable: true,
    placeholderText: '粘贴备份数据JSON',
    success: res => {
      if (res.confirm && res.content) {
        try {
          const data = JSON.parse(res.content)
          settingsStore.importData(data)
          settingsStore.lastBackupTime = new Date().toISOString()
        } catch (error) {
          uni.showToast({
            title: '数据格式错误',
            icon: 'none',
          })
        }
      }
    },
  })
}

onMounted(() => {
  settingsStore.loadFromStorage()
})
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  padding: 24rpx;
  background-color: #f5f7fa;
}

.settings-page__section {
  margin-bottom: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.settings-page__section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.settings-page__section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.settings-page__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background-color: #007aff;
  border-radius: 50%;
}

.settings-page__add-btn-text {
  font-size: 32rpx;
  color: #ffffff;
  line-height: 1;
}

.settings-page__list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.settings-page__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  min-height: 96rpx;

  &:not(.settings-page__item--static):active {
    background-color: #f5f5f5;
    margin: 0 -24rpx;
    padding-left: 24rpx;
    padding-right: 24rpx;
  }
}

.settings-page__item-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.settings-page__item-name {
  font-size: 30rpx;
  color: #333333;
}

.settings-page__item-hint {
  font-size: 24rpx;
  color: #999999;
}

.settings-page__item-desc {
  font-size: 24rpx;
  color: #999999;
}

.settings-page__item-value {
  font-size: 28rpx;
  color: #666666;
}

.settings-page__tag-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.settings-page__item-actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.settings-page__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
}

.settings-page__action-icon {
  font-size: 28rpx;
  color: #666666;

  &--delete {
    font-size: 24rpx;
  }
}

.settings-page__arrow {
  width: 16rpx;
  height: 16rpx;
  border-right: 2rpx solid #cccccc;
  border-bottom: 2rpx solid #cccccc;
  transform: rotate(-45deg);
}
</style>
