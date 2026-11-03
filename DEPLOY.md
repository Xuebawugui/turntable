# 部署指南：GitHub → Vercel → Upstash Redis

按顺序做即可。全程在浏览器里完成，除了第一次 push 代码要在本机终端执行。

---

## 第一步：上传到 GitHub

### 1. 在 GitHub 新建仓库

1. 打开 [https://github.com/new](https://github.com/new)
2. **Repository name**：例如 `double11-lucky-wheel`
3. 选 **Private** 或 **Public**（建议 Private）
4. **不要**勾选 “Add a README”（本地已有代码）
5. 点 **Create repository**

### 2. 在本机项目目录提交并推送

在 PowerShell 里（路径改成你的）：

```powershell
cd c:\Users\wugui1314\Desktop\work\items\route

git init
git add .
git commit -m "Initial commit: 11.11 lucky wheel"

git branch -M main
git remote add origin https://github.com/你的用户名/double11-lucky-wheel.git
git push -u origin main
```

第一次 push 会要求登录 GitHub（浏览器或 Personal Access Token）。

> 若远程已有内容导致 push 失败，说明创建仓库时勾选了 README，到 GitHub 删掉该文件或按 GitHub 页上的提示 pull 再 push。

---

## 第二步：Vercel 导入 GitHub 仓库

1. 打开 [https://vercel.com](https://vercel.com) 并用 GitHub 账号登录
2. 点 **Add New…** → **Project**
3. **Import Git Repository** 里找到刚 push 的仓库 → **Import**
4. **Framework Preset** 应为 **Next.js**（一般自动识别）
5. **Root Directory**：保持 `./`（仓库根目录就是项目）
6. 先 **不要** 改 Environment Variables，直接点 **Deploy**
7. 等 1～2 分钟，出现 **Congratulations** 和 `xxx.vercel.app` 链接

此时站点能打开，但 **Redis 还没接**，库存和防重复在正式环境可能不完整。

---

## 第三步：在 Vercel 里接 Upstash Redis（Storage）

1. 打开 Vercel 里这个项目的 **Dashboard**（不是 Deployment 详情页）
2. 顶部菜单点 **Storage**
3. 点 **Create Database** 或 **Connect Store**
4. 选择 **Upstash** → **Upstash Redis**
5. 按提示：
   - 选 **Create new Upstash Redis database**（新建）
   - **Region** 选离法国用户近的，例如 **Europe (Frankfurt)** 或 **Paris**（有的话）
   - 数据库名字随意，例如 `lucky-wheel-prod`
6. 选 **Connect to Project**，勾选当前这个 Next.js 项目
7. 环境勾选 **Production**（建议 **Preview** 也勾上，方便测试）
8. 点 **Create / Connect**

Vercel 会自动给项目加上：

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### 第四步：重新部署（必做）

环境变量是在首次 Deploy **之后** 才加的，需要再部署一次才生效：

1. 打开 **Deployments**
2. 最新一条 deployment 右侧 **⋯** → **Redeploy**
3. 勾选 **Use existing Build Cache** 即可 → **Redeploy**

---

## 第五步：验证

1. 打开 `https://你的项目.vercel.app`
2. 顶部 **Remaining stock** 应显示各档 **X left**
3. 用法国手机号试抽一次，再刷新页面，对应库存应 **减 1**
4. 同一号码再抽，应提示已用过

---

## 常见问题

| 问题 | 处理 |
|------|------|
| Storage 里找不到 Upstash | 用 **Integrations** 搜 “Upstash Redis”，或 [Vercel Marketplace Upstash](https://vercel.com/integrations/upstash) |
| 库存一直不减 | 确认 Redeploy 过；Settings → Environment Variables 里能看到两个 `UPSTASH_*` |
| 本地也想连 Redis | 在 Upstash Console 复制 REST URL/Token，写到项目 `.env.local`（不要提交到 Git） |

---

## 以后改代码怎么更新线上？

```powershell
git add .
git commit -m "描述你的修改"
git push
```

Vercel 会自动从 GitHub 拉代码并重新部署（默认每次 push 到 `main` 都会 Deploy）。
