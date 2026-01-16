<template>
  <view class="clothing-add-page">
    <view class="clothing-add-page__content">
      <!-- 图片上传 -->
      <view class="clothing-add-page__section">
        <view class="clothing-add-page__section-title">
          <text class="clothing-add-page__required">*</text>
          <text class="clothing-add-page__section-title-text">衣物图片</text>
        </view>
        <ImageUpload
          v-model="formData.images"
          :max-count="MAX_IMAGE_COUNT"
          :max-size="MAX_IMAGE_SIZE"
          @upload-success="handleImageUploadSuccess"
          @upload-fail="handleImageUploadFail"
        />
        <text v-if="errors.images" class="clothing-add-page__error">
          {{ errors.images }}
        </text>
      </view>

      <!-- 基本信息 -->
      <view class="clothing-add-page__section">
        <view class="clothing-add-page__section-title">
          <text class="clothing-add-page__required">*</text>
          <text class="clothing-add-page__section-title-text">基本信息</text>
        </view>

        <!-- 名称 -->
        <view class="clothing-add-page__form-item">
          <view class="clothing-add-page__label">
            <text class="clothing-add-page__required">*</text>
            <text class="clothing-add-page__label-text">名称</text>
          </view>
          <input
            v-model="formData.name"
            class="clothing-add-page__input"
            :class="{ 'clothing-add-page__input--error': errors.name }"
            placeholder="请输入衣物名称"
            placeholder-class="clothing-add-page__input-placeholder"
            @blur="validateName"
          />
          <text v-if="errors.name" class="clothing-add-page__error">
            {{ errors.name }}
          </text>
        </view>

        <!-- 品牌 -->
        <view class="clothing-add-page__form-item">
          <view class="clothing-add-page__label">
            <text class="clothing-add-page__required">*</text>
            <text class="clothing-add-page__label-text">品牌</text>
          </view>
          <input
            v-model="formData.brand"
            class="clothing-add-page__input"
            :class="{ 'clothing-add-page__input--error': errors.brand }"
            placeholder="请输入品牌"
            placeholder-class="clothing-add-page__input-placeholder"
            @blur="validateBrand"
          />
          <text v-if="errors.brand" class="clothing-add-page__error">
            {{ errors.brand }}
          </text>
        </view>

        <!-- 分类 -->
        <view class="clothing-add-page__form-item">
          <view class="clothing-add-page__label">
            <text class="clothing-add-page__required">*</text>
            <text class="clothing-add-page__label-text">分类</text>
          </view>
          <picker
            mode="selector"
            :range="CATEGORY_OPTIONS"
            :value="categoryIndex"
            @change="handleCategoryChange"
          >
            <view
              class="clothing-add-page__picker"
              :class="{ 'clothing-add-page__picker--error': errors.category }"
            >
              <text
                class="clothing-add-page__picker-text"
                :class="{ 'clothing-add-page__picker-text--placeholder': !formData.category }"
              >
                {{ formData.category || '请选择分类' }}
              </text>
              <text class="clothing-add-page__picker-icon"></text>
            </view>
          </picker>
          <text v-if="errors.category" class="clothing-add-page__error">
            {{ errors.category }}
          </text>
        </view>

        <!-- 颜色 -->
        <view class="clothing-add-page__form-item">
          <view class="clothing-add-page__label">
            <text class="clothing-add-page__required">*</text>
            <text class="clothing-add-page__label-text">颜色</text>
          </view>
          <picker
            mode="selector"
            :range="COLOR_OPTIONS"
            :value="colorIndex"
            @change="handleColorChange"
          >
            <view
              class="clothing-add-page__picker"
              :class="{ 'clothing-add-page__picker--error': errors.color }"
            >
              <text
                class="clothing-add-page__picker-text"
                :class="{ 'clothing-add-page__picker-text--placeholder': !formData.color }"
              >
                {{ formData.color || '请选择颜色' }}
              </text>
              <text class="clothing-add-page__picker-icon"></text>
            </view>
          </picker>
          <text v-if="errors.color" class="clothing-add-page__error">
            {{ errors.color }}
          </text>
        </view>

        <!-- 尺码 -->
        <view class="clothing-add-page__form-item">
          <view class="clothing-add-page__label">
            <text class="clothing-add-page__required">*</text>
            <text class="clothing-add-page__label-text">尺码</text>
          </view>
          <picker
            mode="selector"
            :range="SIZE_OPTIONS"
            :value="sizeIndex"
            @change="handleSizeChange"
          >
            <view
              class="clothing-add-page__picker"
              :class="{ 'clothing-add-page__picker--error': errors.size }"
            >
              <text
                class="clothing-add-page__picker-text"
                :class="{ 'clothing-add-page__picker-text--placeholder': !formData.size }"
              >
                {{ formData.size || '请选择尺码' }}
              </text>
              <text class="clothing-add-page__picker-icon"></text>
            </view>
          </picker>
          <text v-if="errors.size" class="clothing-add-page__error">
            {{ errors.size }}
          </text>
        </view>
      </view>

      <!-- 购买信息 -->
      <view class="clothing-add-page__section">
        <view class="clothing-add-page__section-title">
          <text class="clothing-add-page__section-title-text">购买信息</text>
        </view>

        <!-- 购买日期 -->
        <view class="clothing-add-page__form-item">
          <view class="clothing-add-page__label">
            <text class="clothing-add-page__label-text">购买日期</text>
          </view>
          <picker
            mode="date"
            :end="getTodayDate()"
            :value="formData.purchaseDate"
            @change="handlePurchaseDateChange"
          >
            <view class="clothing-add-page__picker">
              <text
                class="clothing-add-page__picker-text"
                :class="{ 'clothing-add-page__picker-text--placeholder': !formData.purchaseDate }"
              >
                {{ formData.purchaseDate || '请选择购买日期' }}
              </text>
              <text class="clothing-add-page__picker-icon"></text>
            </view>
          </picker>
        </view>

        <!-- 价格 -->
        <view class="clothing-add-page__form-item">
          <view class="clothing-add-page__label">
            <text class="clothing-add-page__label-text">价格</text>
          </view>
          <view class="clothing-add-page__price-wrapper">
            <text class="clothing-add-page__price-symbol">¥</text>
            <input
              v-model="priceInput"
              class="clothing-add-page__input clothing-add-page__input--price"
              type="digit"
              placeholder="0.00"
              placeholder-class="clothing-add-page__input-placeholder"
              @blur="formatPrice"
            />
          </view>
        </view>
      </view>

      <!-- 标签选择 -->
      <view class="clothing-add-page__section">
        <view class="clothing-add-page__section-title">
          <text class="clothing-add-page__section-title-text">标签</text>
        </view>
        <TagSelector
          :tags="TAG_OPTIONS"
          :selected-tags="formData.tags"
          @update:selected-tags="handleTagsChange"
        />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="clothing-add-page__footer">
      <button class="clothing-add-page__button clothing-add-page__button--cancel" @click="handleCancel">
        取消
      </button>
      <button
        class="clothing-add-page__button clothing-add-page__button--save"
        :disabled="isSubmitting"
        :class="{ 'clothing-add-page__button--disabled': isSubmitting }"
        @click="handleSave"
      >
        {{ isSubmitting ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useClothingStore } from '@/stores/clothing'
import ImageUpload from '@/components/ImageUpload.vue'
import TagSelector from '@/components/TagSelector.vue'
import { getTodayDate } from '@/utils/date'
import type { Clothing } from '@/types'

const MAX_IMAGE_COUNT = 9
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_TAG_COUNT = 10

const CATEGORY_OPTIONS = ['上装', '下装', '外套', '鞋履', '配饰', '内衣', '其他']
const COLOR_OPTIONS = [
  '黑色',
  '白色',
  '灰色',
  '红色',
  '粉色',
  '橙色',
  '黄色',
  '绿色',
  '蓝色',
  '紫色',
  '棕色',
  '卡其色',
  '米色',
  '花色',
  '其他',
]
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '均码', '其他']
const TAG_OPTIONS = [
  '日常',
  '通勤',
  '约会',
  '运动',
  '休闲',
  '正式',
  '度假',
  '聚会',
  '春季',
  '夏季',
  '秋季',
  '冬季',
  '新品',
  '经典',
  '百搭',
]

const clothingStore = useClothingStore()

const isSubmitting = ref(false)
const priceInput = ref('')

const formData = reactive({
  name: '',
  brand: '',
  category: '',
  color: '',
  size: '',
  purchaseDate: '',
  price: undefined as number | undefined,
  images: [] as string[],
  tags: [] as string[],
})

const errors = reactive({
  images: '',
  name: '',
  brand: '',
  category: '',
  color: '',
  size: '',
})

const categoryIndex = computed(() => {
  return CATEGORY_OPTIONS.findIndex(item => item === formData.category)
})

const colorIndex = computed(() => {
  return COLOR_OPTIONS.findIndex(item => item === formData.color)
})

const sizeIndex = computed(() => {
  return SIZE_OPTIONS.findIndex(item => item === formData.size)
})

const validateName = () => {
  if (!formData.name.trim()) {
    errors.name = '请输入衣物名称'
    return false
  }
  if (formData.name.trim().length > 50) {
    errors.name = '衣物名称不能超过50个字符'
    return false
  }
  errors.name = ''
  return true
}

const validateBrand = () => {
  if (!formData.brand.trim()) {
    errors.brand = '请输入品牌'
    return false
  }
  if (formData.brand.trim().length > 30) {
    errors.brand = '品牌名称不能超过30个字符'
    return false
  }
  errors.brand = ''
  return true
}

const validateCategory = () => {
  if (!formData.category) {
    errors.category = '请选择分类'
    return false
  }
  errors.category = ''
  return true
}

const validateColor = () => {
  if (!formData.color) {
    errors.color = '请选择颜色'
    return false
  }
  errors.color = ''
  return true
}

const validateSize = () => {
  if (!formData.size) {
    errors.size = '请选择尺码'
    return false
  }
  errors.size = ''
  return true
}

const validateImages = () => {
  if (formData.images.length === 0) {
    errors.images = '请至少上传一张图片'
    return false
  }
  errors.images = ''
  return true
}

const validateAll = () => {
  const isNameValid = validateName()
  const isBrandValid = validateBrand()
  const isCategoryValid = validateCategory()
  const isColorValid = validateColor()
  const isSizeValid = validateSize()
  const isImagesValid = validateImages()
  return isNameValid && isBrandValid && isCategoryValid && isColorValid && isSizeValid && isImagesValid
}

const handleCategoryChange = (event: UniAppPickerChangeEvent) => {
  const index = Number(event.detail.value)
  formData.category = CATEGORY_OPTIONS[index]
  if (formData.category) {
    errors.category = ''
  }
}

const handleColorChange = (event: UniAppPickerChangeEvent) => {
  const index = Number(event.detail.value)
  formData.color = COLOR_OPTIONS[index]
  if (formData.color) {
    errors.color = ''
  }
}

const handleSizeChange = (event: UniAppPickerChangeEvent) => {
  const index = Number(event.detail.value)
  formData.size = SIZE_OPTIONS[index]
  if (formData.size) {
    errors.size = ''
  }
}

const handlePurchaseDateChange = (event: UniAppPickerChangeEvent) => {
  formData.purchaseDate = event.detail.value
}

const handleTagsChange = (tags: string[]) => {
  formData.tags = tags
}

const formatPrice = () => {
  if (!priceInput.value) {
    formData.price = undefined
    return
  }
  const parsed = parseFloat(priceInput.value)
  if (!isNaN(parsed) && parsed >= 0) {
    formData.price = parsed
  }
}

const handleImageUploadSuccess = () => {
  if (formData.images.length > 0) {
    errors.images = ''
  }
}

const handleImageUploadFail = (_index: number, error: string) => {
  uni.showToast({
    title: error || '图片上传失败',
    icon: 'none',
  })
}

const handleSave = async () => {
  if (!validateAll()) {
    return
  }

  isSubmitting.value = true

  try {
    const now = new Date().toISOString()

    const newClothing: Clothing = {
      id: generateUUID(),
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      color: formData.color,
      size: formData.size,
      purchaseDate: formData.purchaseDate || undefined,
      price: formData.price,
      images: formData.images,
      tags: formData.tags,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }

    clothingStore.addClothing(newClothing)

    uni.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 1500,
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('Failed to save clothing:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none',
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消添加吗？已填写的内容将不会保存',
    success: res => {
      if (res.confirm) {
        uni.navigateBack()
      }
    },
  })
}

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
</script>

<style scoped lang="scss">
.clothing-add-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.clothing-add-page__content {
  flex: 1;
  padding: 32rpx;
  padding-bottom: 180rpx;
}

.clothing-add-page__section {
  margin-bottom: 48rpx;
}

.clothing-add-page__section-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 24rpx;
}

.clothing-add-page__section-title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.clothing-add-page__required {
  color: #ff4d4f;
  font-size: 32rpx;
  margin-right: 4rpx;
}

.clothing-add-page__form-item {
  margin-bottom: 32rpx;
}

.clothing-add-page__label {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12rpx;
}

.clothing-add-page__label-text {
  font-size: 28rpx;
  color: #333333;
}

.clothing-add-page__input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #ffffff;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.clothing-add-page__input:focus {
  border-color: #007aff;
}

.clothing-add-page__input--error {
  border-color: #ff4d4f;
}

.clothing-add-page__input--price {
  padding-left: 0;
  border: none;
  background-color: transparent;
}

.clothing-add-page__input-placeholder {
  color: #999999;
}

.clothing-add-page__picker {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #ffffff;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  transition: border-color 0.2s;
}

.clothing-add-page__picker--error {
  border-color: #ff4d4f;
}

.clothing-add-page__picker-text {
  font-size: 28rpx;
  color: #333333;
}

.clothing-add-page__picker-text--placeholder {
  color: #999999;
}

.clothing-add-page__picker-icon {
  width: 12rpx;
  height: 12rpx;
  border-right: 2rpx solid #999999;
  border-bottom: 2rpx solid #999999;
  transform: rotate(45deg);
}

.clothing-add-page__price-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #ffffff;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
}

.clothing-add-page__price-symbol {
  font-size: 28rpx;
  color: #333333;
  margin-right: 8rpx;
}

.clothing-add-page__error {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #ff4d4f;
}

.clothing-add-page__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  box-sizing: border-box;
}

.clothing-add-page__button {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
}

.clothing-add-page__button::after {
  border: none;
}

.clothing-add-page__button--cancel {
  background-color: #f5f5f5;
  color: #666666;
}

.clothing-add-page__button--save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.clothing-add-page__button--disabled {
  opacity: 0.6;
}
</style>
