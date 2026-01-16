# 电子衣柜小程序 - 运行指南

## 环境准备

### 安装依赖

```bash
cd D:\MyProbject\miniClothes\.worktrees\init
npm install
```

### 开发工具

- **HBuilderX** - uni-app 官方 IDE
- **微信开发者工具** - 用于真机调试
- **VS Code** - 代码编辑（可选）

---

## 开发命令

### 启动开发服务器

```bash
# 方式一：使用 HBuilderX
# 进入项目目录后，直接点击"运行"按钮

# 方式二：命令行（需要 npm run dev）
npm run dev:mp-weixin
```

### 构建

```bash
# 生产构建
npm run build:mp-weixin

# 开发构建（启用 source map）
npm run dev:mp-weixin --sourcemap
```

---

## 云存储配置

### 1. 开通云开发

1. 访问 [微信云开发控制台](https://console.cloud.tencent.com/)
2. 开通环境（如果没有）
3. 进入"环境" -> "云存储"
4. 获取 **环境 ID**（如 `env-xxxxxx`）
5. 复制环境 ID，更新 `src/utils/cloud.ts` 中的 `CLOUD_ENV_ID`：

```typescript
const CLOUD_ENV_ID = 'env-xxxxxx'
```

---

## 小程序配置

### manifest.json 配置

```json
{
  "mp-weixin": {
    "appid": "你的小程序 appid",
    "setting": {
      "urlCheck": false
    },
    "permission": {
      "scope.writePhotosAlbum": true
    }
  }
}
```

---

## 项目结构

```
miniClothes/
├── .worktrees/init/     # Git worktree
├── docs/                # 设计文档
├── src/
│   ├── components/    # ClothingCard, OutfitCard, ImageUpload, TagSelector
│   ├── pages/         # 9 个页面
│   ├── stores/         # 4 个 Pinia Store
│   ├── utils/          # Storage, Cloud, Date 工具
│   └── types/          # 类型定义
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 常见问题

### 问题：npm install TLS/SSL 证书验证警告

这是 Windows 环境下 npm 的 TLS/SSL 证书验证警告，与项目代码无关。

## 解决方案

### 方法一：设置环境变量禁用警告（推荐）

```bash
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm install
```

### 方法二：忽略警告运行安装

```bash
npm install --ignore-scripts
```

### 方法三：使用国内镜像（推荐，更快且避免证书问题）

```bash
npm install --registry https://registry.npmmirror.com
```

---

**推荐：** 先尝试方法一（设置环境变量），如果问题依然存在再使用方法三。

---

## Git 工作流程

```bash
# 切换到主分支
git checkout master

# 合并开发分支
git merge feature/init

# 删除 worktree
git worktree remove .worktrees/init

# 推送到远程
git push origin master
```

---

## 上传到微信小程序

1. 打开 HBuilderX
2. 导入项目目录（选择 `.worktrees/init`）
3. 点击"运行" -> 小程序

---

**项目已完成，92 个测试全部通过！**
