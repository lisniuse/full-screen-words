# 全屏单词 (Full-Screen Words)

一款沉浸式英语单词学习应用。主界面是一整屏可点击的随机单词；点击任一单词打开释义/例句弹窗，并可进入练习模式手敲英文句子。

> **按 ESC** 呼出登录/注册、个人中心、徽章、打卡等全部辅助界面。主界面保持纯粹的全屏单词。

## ✨ 特性

- **全屏单词**：始终保持沉浸式主界面，无导航栏、无 chrome。
- **ESC 唤出面板**：登录、个人中心、徽章、打卡等通过抽屉式 Overlay 呼出。
- **账号系统**：用户名 / 密码注册登录，JWT + bcrypt。
- **答题练习**：练习模式中输入英文句子，实时校验。
- **经验值与等级**：答对得 EXP，Combo 越高奖励越多；EXP 自动晋级。
- **连续打卡**：每日打卡获得 EXP，连续打卡触发额外奖励。
- **徽章系统**：词汇量、连击、连续打卡、正确率等多类徽章。
- **OpenRouter 词典**：首次查询调用大模型，结果缓存进 SQLite。

## 🧱 技术栈

| 端 | 技术 |
| --- | --- |
| 前端 | Vite + React 18 + TypeScript + Ant Design + antd-style + Less + Zustand |
| 后端 | NestJS 10 + TypeORM + better-sqlite3 + Passport JWT + bcryptjs |
| 数据 | SQLite（本地文件） |
| 词义 | OpenRouter (`deepseek/deepseek-r1-distill-qwen-32b:free`) |

## 📁 目录结构

```
full-screen-words/
├── data/                 # 历史 JSON 词义缓存（一次性导入 SQLite）
├── docs/                 # 截图等
├── frontend/             # React 前端
│   ├── src/
│   │   ├── api/          # axios 客户端 + 类型
│   │   ├── components/   # 通用组件 (WordModal / EscOverlay / LevelHud …)
│   │   ├── features/     # 业务模块 (auth / profile / checkin)
│   │   ├── pages/        # 页面 (WordsPage)
│   │   ├── store/        # zustand
│   │   ├── styles/       # 全局 less
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── shadcnTheme.ts
│   └── vite.config.ts
├── server/               # NestJS 后端
│   ├── src/
│   │   ├── auth/         # 注册 / 登录 / JWT
│   │   ├── badges/       # 徽章定义与解锁
│   │   ├── checkin/      # 每日打卡
│   │   ├── common/       # 公共工具 (等级换算 / 装饰器)
│   │   ├── practice/     # 答题记录、EXP / Combo
│   │   ├── seed/         # data/*.json -> SQLite 迁移
│   │   ├── users/        # 用户与统计
│   │   ├── words/        # 单词查询、OpenRouter
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env.example
└── README.md
```

## 🚀 启动

### 前置依赖

- Node.js ≥ 18
- 一个 OpenRouter API Key（可选，仅在你想查询未缓存单词时需要）

### 1. 后端

```bash
cd server
cp .env.example .env
# 编辑 .env，至少填好 JWT_SECRET 与 OPENROUTER_API_KEY
npm install
npm run seed       # 可选：把 data/*.json 导入到 SQLite
npm run start:dev  # http://localhost:5321
```

`.env` 关键字段：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `PORT` | 5321 | 服务端口 |
| `JWT_SECRET` | **必填** | 至少 16 位随机字符串。缺失 / 过短 / 等于模板默认值会直接启动失败。可用 `openssl rand -hex 32` 生成 |
| `JWT_EXPIRES_IN` | 7d | Token 有效期 |
| `DATABASE_PATH` | ~/.full-screen-words/data.sqlite | SQLite 文件路径，默认到用户 home 目录（跨平台） |
| `OPENROUTER_API_KEY` | (空) | OpenRouter Key |
| `OPENROUTER_MODEL` | deepseek/... | 默认推理模型 |
| `HTTP_PROXY` | (空) | 可选代理，例如 `http://127.0.0.1:7890` |
| `CORS_ORIGIN` | http://localhost:2022 | 允许的前端源（多个逗号分隔） |
| `DEFAULT_TZ` | Asia/Shanghai | 打卡日期判定使用的时区，遵循 IANA TZ 名称 |
| `NODE_ENV` | development | 设为 `production` 时关闭 TypeORM `synchronize`，schema 变更需走迁移 |

### 生产部署关于 schema 的注意

dev 模式（默认）下 TypeORM 的 `synchronize: true` 会在每次启动时根据 entity 自动 ALTER 表，方便迭代但**绝对不要带到生产**——entity 字段误删会直接 DROP COLUMN 丢数据。

正式上线前需要：
1. `NODE_ENV=production` 关闭 synchronize；
2. 通过 TypeORM CLI 生成 / 应用迁移（`typeorm migration:generate` / `migration:run`）；
3. 备份 SQLite 文件再执行任何 schema 变更。

### 2. 前端

```bash
cd frontend
npm install
npm run dev  # http://localhost:2022
```

Vite 已配置 `/api` 代理到 `http://localhost:5321`，无需额外设置。

## 🎮 使用

1. 打开 `http://localhost:2022`，主界面是一整屏随机单词。
2. **按 `ESC`** 唤出右侧抽屉：未登录显示登录 / 注册；已登录显示个人中心 / 徽章 / 打卡。
3. 点击任意单词，弹出释义与例句；切换到 **练习模式**，对照中文敲出英文句子，回车提交。
4. 答对获得 EXP 与 Combo；登录状态下 EXP / 等级 / 徽章会实时累积。
5. 每天进入 ESC 面板 → 打卡，领取连续打卡奖励。

## 🧠 数据模型（SQLite）

| 表 | 用途 |
| --- | --- |
| `users` | 账号 (username 唯一, passwordHash) |
| `user_stats` | 每用户成长指标（EXP、combo、wordsLearned、streak…） |
| `words` | 单词词义缓存（来自 OpenRouter 或 seed） |
| `practice_records` | 每次答题流水 |
| `check_ins` | 每日打卡记录 |
| `badges` / `user_badges` | 徽章定义 / 用户解锁记录 |

## 📜 主要 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录，返回 JWT |
| GET  | `/api/auth/me` | 当前用户完整资料 |
| GET  | `/api/words/random?count=200` | 随机单词列表 |
| POST | `/api/words/info` | 查询单词释义（带 SQLite 缓存） |
| POST | `/api/practice/submit` | 提交答题（更新 EXP/Combo/徽章） |
| POST | `/api/practice/learned/:word` | 标记单词已学习（wordsLearned++） |
| GET  | `/api/checkin/status` | 打卡状态 |
| POST | `/api/checkin` | 立即打卡 |
| GET  | `/api/badges/me` | 当前用户徽章列表 |

## 📄 License

MIT
