# 代码规范文档

**项目：** 电子衣柜小程序
**创建日期：** 2026-01-16

---

## 目录

1. [代码风格](#代码风格)
2. [命名规范](#命名规范)
3. [文件组织](#文件组织)
4. [组件规范](#组件规范)
5. [TypeScript 规范](#typescript-规范)
6. [Vue3 规范](#vue3-规范)
7. [Pinia Store 规范](#pinia-store-规范)
8. [工具函数规范](#工具函数规范)
9. [注释规范](#注释规范)
10. [Git 提交规范](#git-提交规范)

---

## 代码风格

### 工具配置

| 工具 | 版本 | 用途 |
|------|------|------|
| ESLint | 最新版 | 代码检查 |
| Prettier | 最新版 | 代码格式化 |

### 基本规则

- **缩进**：2 空格
- **引号**：单引号 `'`
- **分号**：不使用
- **尾随逗号**：ES5 风格（对象/数组最后一项不加逗号）
- **行宽**：100 字符

### 配置文件示例

**.eslintrc.cjs**
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

**.prettierrc**
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "arrowParens": "always"
}
```

---

## 命名规范

### 变量/函数：camelCase

```typescript
// ✅ 正确
const myClothing = getClothing()
const selectedItems = []
const isLoading = false

function getUserData() {}
const formatDate = (date: string) => {}

// ❌ 错误
const my_clothing = get_clothing()
const selected_items = []
```

### 常量：UPPER_SNAKE_CASE

```typescript
// ✅ 正确
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const DEFAULT_CATEGORY = '上装'
const STORAGE_KEY = 'wardrobe_data'

// ❌ 错误
const maxImageSize = 5 * 1024 * 1024
const default_category = '上装'
```

### 接口/类型：PascalCase

```typescript
// ✅ 正确
interface Clothing {
  id: string
  name: string
}

type ClothingStatus = 'active' | 'archived'

// ❌ 错误
interface clothing {}
type clothing_status = 'active' | 'archived'
```

### 枚举：PascalCase

```typescript
// ✅ 正确
enum CategoryType {
  Upper = 'upper',
  Lower = 'lower',
  Shoes = 'shoes',
}
```

---

## 文件组织

### 文件命名：PascalCase

```
src/
├── pages/
│   ├── WardrobeList.vue       ✅
│   ├── ClothingDetail.vue     ✅
│   └── wardrobe-list.vue      ❌
├── components/
│   ├── ClothingCard.vue       ✅
│   └── ImageUpload.vue        ✅
├── stores/
│   ├── clothing.ts            ✅
│   └── ClothingStore.ts       ❌
└── types/
    └── index.ts               ✅
```

### 目录结构

```
feature-name/
├── [FeatureName].vue          # 主页面/组件
├── components/                # 子组件（如复杂时需要）
│   └── SubComponent.vue
├── types.ts                   # 类型定义（仅本模块用）
└── utils.ts                   # 工具函数（仅本模块用）
```

---

## 组件规范

### 组件定义

```vue
<script setup lang="ts">
// 1. 导入（第三方库 -> 组件 -> 工具 -> 类型）
import { ref, computed } from 'vue'
import ClothingCard from '@/components/ClothingCard.vue'
import { formatDate } from '@/utils/date'
import type { Clothing } from '@/types'

// 2. Props 定义
interface Props {
  clothing: Clothing
  showPrice?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showPrice: false,
})

// 3. Emits 定义
interface Emits {
  (e: 'delete', id: string): void
  (e: 'select', item: Clothing): void
}
const emit = defineEmits<Emits>()

// 4. 响应式数据
const isLoading = ref(false)
const selectedTags = ref<string[]>([])

// 5. 计算属性
const formattedPrice = computed(() => {
  return props.clothing.price ? `¥${props.clothing.price}` : '-'
})

// 6. 方法
const handleDelete = () => {
  emit('delete', props.clothing.id)
}

const loadMore = async () => {
  isLoading.value = true
  // ...
}
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped lang="scss">
/* 样式内容 */
</style>
```

### Props 命名

```typescript
// ✅ 正确：使用 kebab-case 在模板中，camelCase 在 JS 中
interface Props {
  clothingName: string        // 模板中使用 :clothing-name
  isLoading?: boolean
  onConfirm?: () => void
}
```

### 事件命名

```typescript
// ✅ 正确：事件名用 kebab-case
interface Emits {
  (e: 'clothing-delete', id: string): void
  (e: 'item-select', item: Clothing): void
}
```

---

## TypeScript 规范

### 严格模式配置

**tsconfig.json**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### 类型定义

```typescript
// ✅ 正确：明确类型
const clothing: Clothing = {
  id: '123',
  name: 'T恤',
}

const count: number = 0
const isLoading: boolean = false

// ❌ 错误：隐式 any
const clothing = {
  id: '123',
  name: 'T恤',
}
```

### 可选属性

```typescript
interface Clothing {
  id: string
  name: string
  price?: number           // 可选属性
}

// ✅ 正确：处理可选属性
const displayPrice = clothing.price ?? '-'

// ✅ 正确：使用可选链
const brandName = clothing.brand?.name ?? '未知品牌'
```

### 类型推断

```typescript
// ✅ 推荐：使用类型推断（简单情况）
const count = 0                     // 自动推断为 number
const items = []                    // ❌ 会被推断为 never[] 或 any[]
const items: Clothing[] = []       // ✅ 明确类型
```

---

## Vue3 规范

### 使用 `<script setup>`

```vue
<script setup lang="ts">
// ✅ 正确：使用 setup 语法糖
import { ref } from 'vue'

const count = ref(0)
</script>

<script lang="ts">
// ❌ 不推荐：使用标准写法
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)
    return { count }
  },
})
</script>
```

### ref vs reactive

```typescript
// ✅ ref：用于基本类型、需要单独响应式的值
const count = ref(0)
const isLoading = ref(false)

// ✅ reactive：用于对象、数组
const formData = reactive({
  name: '',
  age: 0,
})

// ✅ reactive：多个相关的响应式值
const clothing = reactive<Clothing>({
  id: '',
  name: '',
})
```

### v-for 必须带 key

```vue
<!-- ✅ 正确 -->
<ClothingCard
  v-for="item in clothingList"
  :key="item.id"
  :clothing="item"
/>

<!-- ❌ 错误 -->
<ClothingCard
  v-for="item in clothingList"
  :clothing="item"
/>
```

### 避免 v-if 和 v-for 同时使用

```vue
<!-- ✅ 正确：使用计算属性 -->
<template>
  <ClothingCard
    v-for="item in activeClothingList"
    :key="item.id"
    :clothing="item"
  />
</template>

<script setup lang="ts">
const activeClothingList = computed(() =>
  clothingList.value.filter(item => item.status === 'active')
)
</script>

<!-- ❌ 错误 -->
<template>
  <ClothingCard
    v-for="item in clothingList"
    v-if="item.status === 'active'"
    :key="item.id"
    :clothing="item"
  />
</template>
```

---

## Pinia Store 规范

### Store 结构

```typescript
// stores/clothing.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Clothing } from '@/types'

export const useClothingStore = defineStore(
  'clothing',
  () => {
    // 1. state
    const clothingList = ref<Clothing[]>([])
    const selectedId = ref<string | null>(null)
    const isLoading = ref(false)

    // 2. getters
    const totalCount = computed(() => clothingList.value.length)

    const activeClothing = computed(() =>
      clothingList.value.filter(c => c.status === 'active')
    )

    // 3. actions
    const setClothingList = (list: Clothing[]) => {
      clothingList.value = list
    }

    const addClothing = (clothing: Clothing) => {
      clothingList.value.push(clothing)
    }

    const updateClothing = (id: string, updates: Partial<Clothing>) => {
      const index = clothingList.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clothingList.value[index] = { ...clothingList.value[index], ...updates }
      }
    }

    const deleteClothing = (id: string) => {
      const index = clothingList.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clothingList.value.splice(index, 1)
      }
    }

    const loadFromStorage = async () => {
      isLoading.value = true
      try {
        const data = uni.getStorageSync('clothing_list')
        if (data) {
          clothingList.value = data
        }
      } finally {
        isLoading.value = false
      }
    }

    // 4. 返回需要暴露的内容
    return {
      // state
      clothingList,
      selectedId,
      isLoading,
      // getters
      totalCount,
      activeClothing,
      // actions
      setClothingList,
      addClothing,
      updateClothing,
      deleteClothing,
      loadFromStorage,
    }
  },
  {
    // 持久化配置
    persist: {
      key: 'clothing-store',
      storage: {
        getItem: uni.getStorageSync,
        setItem: uni.setStorageSync,
      },
    },
  }
)
```

---

## 工具函数规范

### 函数命名

```typescript
// ✅ 动词开头，清晰表达意图
function getClothing() {}
function formatDate(date: Date) {}
function validateClothing(data: Clothing): boolean {}
function uploadImage(file: File): Promise<string> {}

// ❌ 命名不清晰
function clothing() {}
function date() {}
function check(data: Clothing) {}
```

### 纯函数优先

```typescript
// ✅ 纯函数：无副作用，相同输入相同输出
function formatDate(date: Date, format = 'YYYY-MM-DD'): string {
  // ...
}

function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[¥,]/g, '')) || 0
}

// ❌ 有副作用的函数
function formatDateAndSave(date: Date): void {
  const formatted = formatDate(date)
  uni.setStorageSync('last_date', formatted)  // 副作用
}
```

### 错误处理

```typescript
// ✅ 明确错误处理
async function uploadImage(file: File): Promise<string> {
  try {
    const result = await uni.uploadFile({ /* ... */ })
    return result.data.url
  } catch (error) {
    console.error('上传图片失败:', error)
    throw new Error('图片上传失败，请重试')
  }
}

// ✅ 返回结果对象（成功/失败都正常返回）
type Result<T> = {
  success: boolean
  data?: T
  error?: string
}

function validateClothing(data: Clothing): Result<Clothing> {
  if (!data.name) {
    return { success: false, error: '衣物名称不能为空' }
  }
  return { success: true, data }
}
```

---

## 注释规范

### JSDoc 注释

```typescript
/**
 * 根据ID获取衣物信息
 * @param id - 衣物唯一标识
 * @returns 衣物对象，不存在时返回 null
 * @throws {Error} 当 id 为空时抛出错误
 */
function getClothingById(id: string): Clothing | null {
  if (!id) throw new Error('id 不能为空')
  // ...
}
```

### 单行注释

```typescript
// ✅ 解释"为什么"，而不是"是什么"
// 使用云存储上传是因为需要跨设备同步
const useCloudStorage = true

// ❌ 注释重复代码
// 设置 loading 为 true
isLoading.value = true
```

### TODO 注释

```typescript
// TODO: 待优化 - 图片压缩功能
function uploadImage() {
  // ...
}

// FIXME: 已知问题 - 某些机型下选择器显示异常
function showPicker() {
  // ...
}
```

---

## Git 提交规范

### Commit 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 bug |
| docs | 文档更新 |
| style | 代码格式（不影响功能）|
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具相关 |

### 示例

```bash
# 新功能
feat(clothing): 添加衣物批量删除功能

# 修复
fix(calendar): 修复日历日期显示错误问题

# 重构
refactor(storage): 优化 storage 封装，统一错误处理

# 文档
docs(readme): 更新项目依赖说明
```

---

## 其他规范

### 导入顺序

```typescript
// 1. Vue 相关
import { ref, computed, onMounted } from 'vue'

// 2. 第三方库
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

// 3. 组件
import ClothingCard from '@/components/ClothingCard.vue'

// 4. Store
import { useClothingStore } from '@/stores/clothing'

// 5. 工具函数
import { formatDate } from '@/utils/date'

// 6. 类型
import type { Clothing } from '@/types'
```

### 空行规范

```typescript
// ✅ 函数之间空一行
function getA() {}
function getB() {}

// ✅ 逻辑块之间空一行
if (condition) {
  // code
}

// 分隔不同逻辑

for (const item of items) {
  // code
}
```
