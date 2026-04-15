# 社交媒体内容中台 - 业务方案

## 一、核心定位

一个管理多平台社交媒体账号的**内容中台系统**，帮助用户：
- 统一管理视频账号（TikTok、Instagram、YouTube、小红书等）
- 自动化内容发布工作流
- 汇总各平台数据
- （可选）独立站电商

---

## 二、目标用户

| 用户类型 | 需求 |
|---------|------|
| **个人创作者** | 简化多账号操作，专注内容创作 |
| **MCN机构** | 批量管理旗下账号，提高运营效率 |
| **电商卖家** | 同步推广内容到多平台 |

---

## 三、功能模块

### 3.1 账号管理

**功能：**
- OAuth 授权连接各平台账号
- 查看已连接账号列表和状态
- 断开/重新授权账号
- 账号基本信息展示（粉丝数、用户名等）

**支持平台：**
| 平台 | 优先级 | 说明 |
|------|--------|------|
| TikTok | P0 | 核心平台 |
| Instagram | P0 | 核心平台 |
| YouTube | P1 | 视频平台 |
| 小红书 | P1 | 种草平台 |
| Twitter/X | P2 | 社交平台 |

**数据存储：**
- 账号基本信息（用户名、头像、平台用户ID）
- OAuth Token（Access Token、Refresh Token、过期时间）
- 账号状态（正常/过期/禁用）

---

### 3.2 内容管理

**功能：**
- 创建/编辑/删除内容草稿
- 上传图片/视频素材
- 支持平台特定内容格式
- 查看已发布内容列表和状态

**内容状态：**
| 状态 | 说明 |
|------|------|
| DRAFT | 草稿 |
| SCHEDULED | 已排期 |
| PUBLISHING | 发布中 |
| PUBLISHED | 已发布 |
| FAILED | 发布失败 |

---

### 3.3 工作流

**定义：** 由多个步骤组成的自动化任务序列

**步骤类型：**
| 类型 | 功能 | 配置参数 |
|------|------|---------|
| POST | 发布内容到平台 | 账号、内容、平台 |
| DELAY | 等待一段时间 | 延迟时长 |
| CONDITION | 条件判断 | 条件表达式 |
| NOTIFY | 发送通知 | 通知方式、接收人 |

**触发方式：**
| 方式 | 说明 |
|------|------|
| manual | 手动触发 |
| scheduled | 定时触发（如每天9点） |
| webhook | API/Webhook触发 |

**工作流状态：**
| 状态 | 说明 |
|------|------|
| DRAFT | 草稿（未激活） |
| ACTIVE | 运行中 |
| PAUSED | 已暂停 |
| COMPLETED | 已完成 |

**示例流程：**
```
[开始] → [发布到TikTok] → [延迟2小时] → [发布到Instagram] → [发送通知] → [结束]
```

---

### 3.4 数据看板

**功能：**
- 汇总展示各账号关键数据
- 支持按平台/账号筛选
- 展示趋势变化

**核心指标：**
| 指标 | 说明 |
|------|------|
| followers | 粉丝数 |
| following | 关注数 |
| likes | 获赞数 |
| comments | 评论数 |
| shares | 分享数 |
| views | 播放/阅读数 |
| engagement | 互动率 |

**数据来源：**
- 各平台官方 API 获取实时数据
- 每日定时同步一次

---

### 3.5 定时发布

**功能：**
- 设置内容的发布时间
- 系统自动在指定时间执行发布
- 可取消或修改已排期内容

**排期策略：**
- 单一内容排期
- 批量排期（如周计划）

---

### 3.6 独立站（可选模块）

**定位：** 独立的电商网站，与内容中台数据互通

**方案选择：**
| 方案 | 特点 | 适用场景 |
|------|------|---------|
| Shopify Hydrogen | Shopify官方框架，性能好 | 快速搭建Shopify站 |
| Next.js Commerce | 开源，可定制 | 需要完全控制 |
| WooCommerce | WordPress生态 | 已有WordPress |

**与中台联动：**
- 内容可一键同步到独立站商品页推广
- 独立站数据可汇总到看板（可选）

---

## 四、数据流

```
用户操作
    ↓
前端界面（Next.js）
    ↓
API接口（Next.js API Routes）
    ↓
业务逻辑层（Services）
    ↓
数据层（Prisma → PostgreSQL）
    ↓
平台API（TikTok/Instagram/YouTube...）
```

---

## 五、技术架构

### 5.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 14 (App Router) | 全栈框架 |
| 后端 | Next.js API Routes | 服务端逻辑 |
| 数据库 | PostgreSQL + Prisma | 关系型数据库 + ORM |
| 认证 | NextAuth.js | OAuth登录 |
| 样式 | Tailwind CSS | 原子化CSS |
| 部署 | Vercel | 适配Next.js |

### 5.2 数据库模型

```
User（用户）
  ├── SocialAccount（社交账号）
  │     └── Post（内容）
  ├── Post（内容）
  ├── Analytics（数据）
  ├── Workflow（工作流）
  │     └── WorkflowStep（工作流步骤）
  └── ContentTemplate（内容模板）
```

---

## 六、API 设计

### 6.1 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/signin` - 用户登录
- `POST /api/auth/signout` - 退出登录

### 6.2 账号
- `GET /api/accounts` - 获取账号列表
- `DELETE /api/accounts?id=` - 删除账号
- `GET /api/auth/callback/{platform}` - OAuth回调

### 6.3 内容
- `GET /api/posts` - 获取内容列表
- `POST /api/posts` - 创建内容
- `POST /api/posts/publish` - 发布内容

### 6.4 工作流
- `GET /api/workflows` - 获取工作流列表
- `POST /api/workflows` - 创建工作流
- `GET /api/workflows/{id}` - 获取工作流详情
- `POST /api/workflows/{id}/steps` - 添加步骤
- `DELETE /api/workflows/{id}/steps/{stepId}` - 删除步骤

### 6.5 数据
- `GET /api/analytics` - 获取统计数据

---

## 七、部署方案

### 本地开发
```bash
npm install
npx prisma db push  # 同步数据库
npm run dev          # 启动开发服务器
```

### Vercel 部署
1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### 环境变量
| 变量 | 说明 |
|------|------|
| DATABASE_URL | PostgreSQL 连接字符串 |
| NEXTAUTH_SECRET | 认证密钥 |
| NEXTAUTH_URL | 网站URL |
| TIKTOK_CLIENT_KEY | TikTok API Key |
| META_APP_ID | Instagram/Meta API ID |

---

## 八、数据库（Prisma Schema）

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  accounts  SocialAccount[]
  posts     Post[]
  analytics Analytics[]
  workflows Workflow[]
}

model SocialAccount {
  id           String   @id @default(cuid())
  userId      String
  platform    Platform
  username    String
  accessToken String
  status      AccountStatus
  posts       Post[]
}

model Post {
  id          String    @id @default(cuid())
  userId     String
  accountId  String
  platform   Platform
  content    Json
  mediaUrls  String[]
  status     PostStatus
  scheduledAt DateTime?
}

model Workflow {
  id      String         @id @default(cuid())
  userId  String
  name    String
  status  WorkflowStatus
  steps   WorkflowStep[]
}

model WorkflowStep {
  id         String           @id @default(cuid())
  workflowId String
  type       WorkflowStepType
  config     Json
}
```

---

## 九、开发计划

### Phase 1 - MVP（1-2周）
- [ ] 用户注册/登录
- [ ] 账号连接（TikTok + Instagram）
- [ ] 基础内容发布

### Phase 2 - 核心功能（2-3周）
- [ ] 工作流创建和执行
- [ ] 定时发布
- [ ] 数据看板

### Phase 3 - 扩展（持续迭代）
- [ ] 更多平台接入
- [ ] 独立站集成
- [ ] 高级分析功能

---

## 十、注意事项

1. **平台API限制**
   - 各平台API权限不同，需分别申请
   - 部分平台需要审核（如TikTok企业账号）
   - Token有有效期，需要刷新机制

2. **内容格式差异**
   - 不同平台对图片/视频尺寸要求不同
   - 文案长度限制不同（如Twitter 280字）
   - 需要适配器模式处理

3. **风控考虑**
   - 避免频繁操作被平台封禁
   - 建议设置操作间隔
   - 重要操作增加确认机制

4. **数据安全**
   - OAuth Token需加密存储
   - 定期备份数据库
   - 敏感信息不暴露在前端
