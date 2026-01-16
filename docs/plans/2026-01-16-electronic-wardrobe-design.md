# 电子衣柜小程序设计文档

## 项目概述

电子衣柜是一个面向个人的衣物管理小程序，帮助用户记录、管理自己的衣物，创建搭配组合，记录日常穿搭，并进行基础统计分析。项目采用 uni-app + Vue3 开发，后期可平滑移植到 App。

**创建日期：** 2026-01-16
**目标平台：** 微信小程序（首发），后续移植 App
**开发模式：** 纯前端，无后端服务

---

## 技术栈

### 前端框架

| 技术 | 版本 | 说明 |
|------|------|------|
| uni-app | 最新版 | 跨平台框架，一套代码多端发布 |
| Vue3 | ^3.0 | 渐进式 JavaScript 框架 |
| TypeScript | ^5.0 | 类型安全 |
| Pinia | 最新版 | 状态管理 |
| uni-ui | 最新版 | uni-app 官方 UI 组件库 |

### 存储方案

| 技术 | 用途 |
|------|------|
| 微信小程序 Storage | 存储衣物、搭配、统计数据 |
| 微信云存储 | 存储用户上传的图片 |

### 开发工具

| 工具 | 用途 |
|------|------|
| HBuilderX | uni-app 官方 IDE |
| 微信开发者工具 | 小程序调试预览 |

---

## 功能模块

### 1. 衣物管理

#### 1.1 衣物录入
- **手动录入**：品牌、名称、分类、颜色、尺码、购买日期、价格、标签
- **拍照记录**：支持上传1-3张照片
- **自动处理**：图片上传至云存储，返回 URL 存入本地

#### 1.2 衣物列表
- 列表展示（卡片/网格视图切换）
- 分类筛选（上装/下装/鞋履/配饰等）
- 标签筛选
- 搜索功能（按名称/品牌搜索）

#### 1.3 衣物详情
- 展示完整信息 + 图片
- 编辑/删除衣物
- 查看该衣物的搭配历史

---

### 2. 搭配管理

#### 2.1 创建搭配
- 从衣柜中选择多件衣物组合
- 为搭配命名
- 保存搭配组合

#### 2.2 搭配列表
- 展示所有保存的搭配
- 编辑/删除搭配

#### 2.3 日历穿搭
- 日历视图展示每日穿搭
- 选择日期，选择已有搭配或快速创建新搭配
- 查看历史穿搭记录

---

### 3. 统计分析

#### 3.1 衣物统计
- 衣物总数
- 分类占比（饼图）
- 标签分布

#### 3.2 穿搭统计
- 穿搭总次数
- 各衣物被搭配频率
- 月度穿搭记录数

---

### 4. 数据管理

#### 4.1 本地存储
- 所有数据存储在 `uni.getStorageSync()`
- 数据结构设计见下方

#### 4.2 数据备份
- 可选功能：用户主动备份数据至云存储
- 支持从云存储恢复数据

---

### 5. 设置

#### 5.1 基础设置
- 分类管理（自定义分类）
- 标签管理

#### 5.2 数据管理
- 清空缓存
- 导出数据
- 恢复数据

---

## 数据结构设计

### 衣物 (Clothing)

```typescript
interface Clothing {
  id: string;                    // UUID
  name: string;                  // 衣物名称
  brand: string;                 // 品牌
  category: string;              // 分类
  color: string;                 // 颜色
  size: string;                  // 尺码
  purchaseDate?: string;         // 购买日期 YYYY-MM-DD
  price?: number;                // 价格
  images: string[];              // 云存储图片URL数组
  tags: string[];                // 标签数组
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

### 搭配 (Outfit)

```typescript
interface Outfit {
  id: string;                     // UUID
  name: string;                  // 搭配名称
  clothingIds: string[];         // 衣物ID数组
  images: string[];              // 搭配图片（可选）
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

### 日历穿搭 (CalendarWear)

```typescript
interface CalendarWear {
  id: string;                     // UUID
  date: string;                   // 日期 YYYY-MM-DD
  outfitId?: string;              // 搭配ID（可选）
  clothingIds: string[];          // 衣物ID数组（非搭配时使用）
  createdAt: string;             // 记录时间
}
```

### 分类 (Category)

```typescript
interface Category {
  id: string;
  name: string;
  icon?: string;                 // 图标
  order: number;                  // 排序
}
```

### 用户设置 (Settings)

```typescript
interface Settings {
  categories: Category[];
  defaultCategories: Category[];  // 默认分类
  lastBackupTime?: string;        // 最后备份时间
}
```

---

## 项目结构

```
miniClothes/
├── docs/
│   └── plans/
│       └── 2026-01-16-electronic-wardrobe-design.md
├── src/
│   ├── pages/
│   │   ├── index/               # 首页（衣概览）
│   │   ├── wardrobe/            # 衣柜（衣物列表）
│   │   ├── clothing-detail/     # 衣物详情
│   │   ├── clothing-add/        # 添加衣物
│   │   ├── outfits/             # 搭配列表
│   │   ├── outfit-detail/       # 搭配详情
│   │   ├── outfit-add/          # 创建搭配
│   │   ├── calendar/            # 日历穿搭
│   │   ├── stats/               # 统计
│   │   └── settings/            # 设置
│   ├── components/
│   │   ├── ClothingCard/
│   │   ├── OutfitCard/
│   │   ├── ImageUpload/
│   │   ├── Calendar/
│   │   └── TagSelector/
│   ├── stores/
│   │   ├── clothing.ts
│   │   ├── outfit.ts
│   │   └── calendar.ts
│   ├── utils/
│   │   ├── storage.ts           # 封装Storage操作
│   │   ├── cloud.ts             # 云存储操作
│   │   └── index.ts             # 工具函数
│   ├── types/
│   │   └── index.ts             # 类型定义
│   ├── static/                  # 静态资源
│   ├── App.vue
│   ├── main.ts
│   └── manifest.json
├── package.json
└── tsconfig.json
```

---

## App移植方案

后期移植到 App 时，仅需调整：

| 项目 | 微信小程序 | App |
|------|-----------|-----|
| 框架 | uni-app | uni-app（同一套代码） |
| 存储 | uni.getStorageSync() | uni.getStorageSync() |
| 图片存储 | 微信云存储 | 阿里云OSS / 腾讯云COS |
| API调用 | wx.cloud.* | uni.cloud.* 或第三方SDK |

---

## 后续优化方向

1. **图片压缩** - 上传前压缩，节省存储空间
2. **智能分类** - 基于图片内容自动识别分类
3. **天气关联** - 根据天气推荐穿搭
4. **穿搭日签** - 生成穿搭分享图片
