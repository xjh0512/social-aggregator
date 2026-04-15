# 部署到 Vercel

## 方式一：GitHub（推荐）

### 步骤：

1. **推送代码到 GitHub**
   ```bash
   # 在 GitHub 创建新仓库，然后：
   cd ~/social-aggregator
   git remote add origin https://github.com/你的用户名/social-aggregator.git
   git push -u origin main
   ```

2. **在 Vercel 导入**
   - 访问 https://vercel.com
   - 用 GitHub 登录
   - Import Git Repository
   - 选择刚推送的仓库
   - 点击 Deploy

3. **配置环境变量**
   部署后在项目 Settings → Environment Variables 添加：
   ```
   DATABASE_URL=你的 PostgreSQL 连接字符串
   NEXTAUTH_SECRET=生成一个随机字符串
   NEXTAUTH_URL=https://你的项目名.vercel.app
   ```

---

## 方式二：Vercel CLI

```bash
npm i -g vercel
vercel
```

按照提示操作即可。

---

## 数据库

推荐免费 PostgreSQL：
- https://neon.tech（免费 512MB）
- https://supabase.com（免费 500MB）

创建后把连接字符串填到 DATABASE_URL