# 实施任务清单

**项目：** 电子衣柜小程序
**创建日期：** 2026-01-16
**文档版本：** v1.0

---

## 任务概览

| 阶段 | 任务数 | 说明 |
|------|--------|------|
| 基础设施 | 4 | 项目初始化、配置、工具封装 |
| 数据层 | 3 | 类型定义、Store |
| 组件层 | 4 | 通用组件开发 |
| 页面层 | 9 | 功能页面开发 |
| 部署优化 | 2 | 云配置、测试 |
| **合计** | **22** | - |

---

## 详细任务列表

### 阶段一：基础设施

#### 任务 1：初始化 uni-app 项目结构
- [ ] 使用 HBuilderX 或 CLI 创建 uni-app 项目
- [ ] 配置 TypeScript 支持
- [ ] 创建基础目录结构
  ```
  src/
  ├── pages/
  ├── components/
  ├── stores/
  ├── utils/
  ├── types/
  └── static/
  ```
- [ ] 配置 pages.json（页面路由）
- [ ] 配置 manifest.json（应用基础信息）

**预计时间：** 1-2 小时

---

#### 任务 2：配置开发环境
- [ ] 安装并配置 ESLint
- [ ] 安装并配置 Prettier
- [ ] 配置 .eslintrc.cjs
- [ ] 配置 .prettierrc
- [ ] 配置 tsconfig.json（严格模式）
- [ ] 配置 .editorconfig
- [ ] 配置 VSCode 工作区设置

**预计时间：** 1 小时

---

#### 任务 3：定义类型（types/index.ts）
- [ ] 定义 Clothing 接口
- [ ] 定义 Outfit 接口
- [ ] 定义 CalendarWear 接口
- [ ] 定义 Category 接口
- [ ] 定义 Settings 接口
- [ ] 导出所有类型

**预计时间：** 0.5 小时

---

#### 任务 4：创建 Storage 封装工具
- [ ] 创建 utils/storage.ts
- [ ] 封装 `uni.getStorageSync`
- [ ] 封装 `uni.setStorageSync`
- [ ] 封装 `uni.removeStorageSync`
- [ ] 添加类型安全
- [ ] 添加错误处理

**预计时间：** 0.5 小时

---

#### 任务 5：创建云存储封装工具
- [ ] 创建 utils/cloud.ts
- [ ] 封装图片上传函数
- [ ] 封装图片删除函数
- [ ] 添加进度回调支持
- [ ] 添加错误处理

**预计时间：** 1 小时

---

### 阶段二：数据层

#### 任务 6：创建 Pinia Store

##### stores/clothing.ts
- [ ] 定义 state：clothingList, selectedId, isLoading
- [ ] 定义 getters：totalCount, activeClothing, getClothingById
- [ ] 定义 actions：addClothing, updateClothing, deleteClothing, setClothingList, loadFromStorage
- [ ] 配置持久化

##### stores/outfit.ts
- [ ] 定义 state：outfitList, selectedId, isLoading
- [ ] 定义 getters：totalOutfits, getOutfitById
- [ ] 定义 actions：addOutfit, updateOutfit, deleteOutfit, setOutfitList, loadFromStorage
- [ ] 配置持久化

##### stores/calendar.ts
- [ ] 定义 state：wearRecords, currentDate
- [ ] 定义 getters：getWearByDate, getMonthlyStats
- [ ] 定义 actions：addWearRecord, updateWearRecord, deleteWearRecord, loadFromStorage
- [ ] 配置持久化

**预计时间：** 2 小时

---

### 阶段三：组件层

#### 任务 7：创建通用组件

##### components/ClothingCard.vue
- [ ] 定义 Props：clothing, showPrice, showTags
- [ ] 定义 Emits：click, delete, edit
- [ ] 实现卡片 UI（图片、名称、分类、标签）
- [ ] 添加点击事件

##### components/OutfitCard.vue
- [ ] 定义 Props：outfit, showDate
- [ ] 定义 Emits：click, delete, edit
- [ ] 实现卡片 UI（组合图片、名称）
- [ ] 添加点击事件

##### components/ImageUpload.vue
- [ ] 定义 Props：maxCount, maxSize
- [ ] 定义 Emits：change, remove
- [ ] 实现图片选择（uni.chooseImage）
- [ ] 实现图片上传
- [ ] 实现图片预览
- [ ] 实现图片删除

##### components/TagSelector.vue
- [ ] 定义 Props：tags, selectedTags, maxCount
- [ ] 定义 Emits：change
- [ ] 实现标签列表展示
- [ ] 实现标签选择/取消选择
- [ ] 实现标签搜索

**预计时间：** 3-4 小时

---

### 阶段四：页面层

#### 任务 8：开发首页
- [ ] 创建 pages/Index.vue
- [ ] 展示衣概览（衣物总数、今日穿搭）
- [ ] 快捷入口（添加衣物、查看衣柜、搭配、日历）
- [ ] 最近穿搭展示
- [ ] 导航栏配置

**预计时间：** 1.5 小时

---

#### 任务 9：开发衣柜页面
- [ ] 创建 pages/WardrobeList.vue
- [ ] 实现衣物列表展示
- [ ] 实现分类筛选（tab 切换）
- [ ] 实现标签筛选
- [ ] 实现搜索功能
- [ ] 添加"添加衣物"按钮
- [ ] 添加空状态展示

**预计时间：** 2 小时

---

#### 任务 10：开发衣物详情页
- [ ] 创建 pages/ClothingDetail.vue
- [ ] 展示衣物完整信息
- [ ] 展示衣物图片（可滑动）
- [ ] 展示标签
- [ ] 编辑/删除按钮
- [ ] 展示该衣物的搭配历史

**预计时间：** 1.5 小时

---

#### 任务 11：开发添加衣物页面
- [ ] 创建 pages/ClothingAdd.vue（编辑页复用）
- [ ] 表单：名称、品牌、分类、颜色、尺码
- [ ] 表单：购买日期、价格
- [ ] 图片上传组件
- [ ] 标签选择组件
- [ ] 表单验证
- [ ] 保存/取消按钮

**预计时间：** 2 小时

---

#### 任务 12：开发搭配列表页面
- [ ] 创建 pages/OutfitList.vue
- [ ] 实现搭配列表展示
- [ ] 添加"创建搭配"按钮
- [ ] 添加空状态展示

**预计时间：** 1 小时

---

#### 任务 13：开发搭配详情页
- [ ] 创建 pages/OutfitDetail.vue
- [ ] 展示搭配包含的衣物
- [ ] 编辑/删除按钮
- [ ] 查看该搭配的穿搭记录

**预计时间：** 1 小时

---

#### 任务 14：开发创建搭配页面
- [ ] 创建 pages/OutfitAdd.vue
- [ ] 衣物选择器（多选）
- [ ] 已选衣物展示
- [ ] 搭配名称输入
- [ ] 保存/取消按钮

**预计时间：** 1.5 小时

---

#### 任务 15：开发日历穿搭页面
- [ ] 创建 pages/Calendar.vue
- [ ] 实现日历视图（月份切换）
- [ ] 点击日期选择当天穿搭
- [ ] 快速创建穿搭（从已有搭配选择）
- [ ] 查看当天穿搭详情
- [ ] 编辑/删除穿搭记录

**预计时间：** 2.5 小时

---

#### 任务 16：开发统计页面
- [ ] 创建 pages/Stats.vue
- [ ] 衣物总数展示
- [ ] 分类占比（饼图/柱状图）
- [ ] 标签分布
- [ ] 穿搭总次数
- [ ] 各衣物被搭配频率
- [ ] 月度穿搭记录数（折线图）

**预计时间：** 2 小时

---

#### 任务 17：开发设置页面
- [ ] 创建 pages/Settings.vue
- [ ] 分类管理（新增、编辑、删除）
- [ ] 标签管理（新增、编辑、删除）
- [ ] 数据管理（清空缓存、导出、恢复）
- [ ] 关于页面

**预计时间：** 2 小时

---

### 阶段五：部署优化

#### 任务 18：配置微信云存储
- [ ] 注册微信小程序账号
- [ ] 开通云开发
- [ ] 配置云存储（创建存储桶）
- [ ] 配置安全规则
- [ ] 更新 cloud.ts 中的云环境 ID

**预计时间：** 1-2 小时

---

#### 任务 19：测试与优化
- [ ] 功能测试（各页面流程）
- [ ] 图片上传测试
- [ ] Storage 持久化测试
- [ ] 多设备兼容性测试
- [ ] 性能优化（图片压缩、懒加载）
- [ ] Bug 修复

**预计时间：** 3-4 小时

---

## 任务优先级

| 优先级 | 任务 |
|--------|------|
| P0 | 任务 1-6（基础设施 + 数据层）|
| P1 | 任务 7（通用组件）|
| P2 | 任务 8-11（衣物相关页面）|
| P3 | 任务 12-14（搭配相关页面）|
| P4 | 任务 15-17（日历、统计、设置）|
| P5 | 任务 18-19（部署优化）|

---

## 预计总工时

| 阶段 | 工时 |
|------|------|
| 基础设施 | 5 小时 |
| 数据层 | 2 小时 |
| 组件层 | 3.5 小时 |
| 页面层 | 16 小时 |
| 部署优化 | 5 小时 |
| **合计** | **31.5 小时** |

---

## 依赖关系

```
任务1 (项目初始化)
  ├─> 任务2 (配置开发环境)
  │     └─> 任务3 (类型定义)
  │           └─> 任务4 (Storage封装) ──> 任务6 (Store)
  │           └─> 任务5 (云存储封装)
  │
  ├─> 任务3 (类型定义) ──> 任务7 (组件) ──> 任务8-17 (页面)
  │
  ├─> 任务6 (Store) ──> 任务8-17 (页面)
  │
  └─> 任务18 (云存储) ──> 任务19 (测试)
```

---

## 里程碑

| 里程碑 | 完成任务 | 标志 |
|--------|----------|------|
| 基础设施完成 | 任务 1-6 | 可运行框架，Store 可用 |
| 组件库完成 | 任务 1-7 | 通用组件可用 |
| 核心功能完成 | 任务 1-11 | 衣物 CRUD 功能完整 |
| 搭配功能完成 | 任务 1-14 | 搭配 CRUD 功能完整 |
| 功能完整 | 任务 1-17 | 所有功能页面完成 |
| 可发布 | 任务 1-19 | 测试通过，可上架 |
