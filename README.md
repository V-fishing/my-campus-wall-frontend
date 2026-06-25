# Campus Wall 前端

校园墙 C 端用户前端，面向高校学生的校园社交与信息交流平台。

- **主端**：微信小程序
- **兼容**：H5
- **一套代码，多端运行**：基于 uni-app 3 + Vue 3 + TypeScript + Vite

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 跨端框架 | uni-app 3（Vue 3.4 Composition API） |
| 构建工具 | Vite 5.2 |
| 类型系统 | TypeScript 4.9 |
| 状态管理 | Pinia 2 |
| 样式方案 | Tailwind CSS 3 + Sass + weapp-tailwindcss |
| 单元测试 | Vitest |

---

## 核心功能

- **圈子首页**：帖子信息流、分类筛选、热帖 Banner、虚拟滚动
- **发现页**：频道、附近学校、分类搜索
- **AI 学长**：对话问答、配图找帖、AI 发帖草稿流
- **私信**：WebSocket 实时消息、历史消息分页、消息撤回
- **个人中心**：资料编辑、学生认证、我的帖子/收藏/点赞/粉丝

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地环境

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# 后端地址（H5 可用 localhost；微信真机/模拟器请使用局域网 IP）
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080

# 微信小程序 appid（敏感信息，请勿提交到仓库）
MP_WEIXIN_APPID=your-mp-appid-here
```

> `.env.local` 已被 `.gitignore` 忽略，不会进入版本控制。

### 3. 运行微信小程序

```bash
npm run dev:mp-weixin
```

用微信开发者工具导入 `dist/dev/mp-weixin`。

### 4. 运行 H5

```bash
npm run dev:h5
```

---

## 微信小程序 appid 注入说明

`src/manifest.json` 和 `project.config.json` 中的 `appid` 属于敏感信息，已移出源码：

- 仓库中只保留模板文件（`.template`）和注入脚本 `scripts/inject-appid.js`
- 实际 `appid` 放在本地 `.env.local` 的 `MP_WEIXIN_APPID`
- 所有 `dev` / `build` 脚本会先执行 `npm run prepare-config`，自动注入 appid 后启动构建

因此，首次 clone 后必须创建 `.env.local` 并填入真实 appid，否则构建产物将不包含 appid。

---

## 常用命令

```bash
# 微信小程序
npm run dev:mp-weixin
npm run build:mp-weixin

# H5
npm run dev:h5
npm run build:h5

# 类型检查
npm run type-check

# 单元测试
npm test
```

---

## 项目结构

```
my-campus-wall-frontend/
├── scripts/                 # 构建辅助脚本
│   └── inject-appid.js      # 将 appid 注入 manifest / project.config
├── src/
│   ├── App.vue              # 根组件、全局样式
│   ├── main.ts              # 应用入口
│   ├── pages.json           # 页面路由与 TabBar
│   ├── manifest.json        # 由模板注入生成（gitignored）
│   ├── project.config.json  # 由模板注入生成（gitignored）
│   ├── api/                 # 接口定义
│   ├── components/          # 公共组件
│   ├── composables/         # 可复用逻辑
│   ├── config/              # 环境配置
│   ├── pages/               # 页面
│   ├── static/              # 静态资源
│   ├── stores/              # Pinia 状态
│   └── utils/               # 工具函数
├── .env.example             # 环境变量模板
├── .env.local               # 本地环境变量（gitignored）
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.cjs
```

---

## 开发约定

- 网络请求统一走 `src/utils/request.js`，新接口加到 `src/api/`
- 改路由/新增页面时先更新 `src/pages.json`
- 微信小程序样式优先使用 Tailwind 原子类（经 `weapp-tailwindcss` 转换）
- 提交信息采用 Conventional Commits

---

## 后端契约

- 后端服务：`campus_wall`（Java Spring Boot）
- 基址：`VITE_API_BASE_URL`
- 统一响应：`Result<T> = { code, message, data }`，成功 `code === 200`
- 鉴权：`Authorization: Bearer <token>`
- WebSocket：`${VITE_WS_BASE_URL}/ws/chat/{userId}`

---

## 注意事项

- 不要在源码中硬编码 appid、密钥、Token 等敏感信息
- 不要提交 `.env.local` 和生成的 `manifest.json` / `project.config.json`
- 微信真机调试时，后端地址必须是局域网 IP，不能用 `localhost`
