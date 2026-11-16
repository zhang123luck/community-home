# 社区家园（翡翠花园小区）

移动端社区邻里互助服务应用：居民端小程序风格界面 + 物业管理后台。
技术栈：Vue 3 + Vite + Tailwind CSS v4，后端 Express（可选）。

## 两种运行方式

### 一、纯静态（GitHub Pages，推荐手机直接访问）

无后端，数据存在浏览器 localStorage 里，部署后永久有效、电脑不用开机。

```bash
npm install
npm run build:static   # 产物输出到 site/
```

GitHub Pages 由 `.github/workflows/pages.yml` 自动构建发布：推送到 `main` 分支后，
在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions** 即可。

访问地址：`https://<你的GitHub用户名>.github.io/<仓库名>/`
管理后台：`https://<你的GitHub用户名>.github.io/<仓库名>/admin.html`
账号 `root` / 密码 `12345`

> 静态版限制：数据只存在当前设备的浏览器，换手机或清缓存会回到初始示例数据；
> 后台登录是前端校验，仅供演示，不能当作真实权限系统。

### 二、本地开发（带真实后端）

```bash
npm install
npm run dev:all        # 前端 http://localhost:5173 + 后端 http://localhost:3001
```

Windows 用户可直接双击 `启动.bat`。

### 三、单端口生产运行（自有服务器 / 云托管）

```bash
npm install
npm run build          # 打包到 site/
npm start              # Express 同时托管页面与 /api 接口，端口读 PORT 环境变量
```

## 目录结构

```
index.html              居民端入口
admin.html              物业管理后台入口
src/
  api.js                请求封装（静态模式自动切换到本地数据层）
  data/mock.js          页面静态示例数据
  data/localStore.js    静态模式的 localStorage 数据层
  pages/                首页、服务、合作、我的、报修、投票
  components/           底部导航、SOS 按钮、物业建议弹窗
  admin/                物业管理后台（登录 + 公告/报修/投票/建议）
server/
  index.js              Express 接口 + 静态托管
  db.js                 JSON 文件读写
  data/db.json          数据文件
```

## 接口一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | /api/admin/login | 管理员登录（root/12345） |
| GET | /api/announcements | 公告列表（`?all=1` 取全部） |
| POST/PATCH/DELETE | /api/announcements(/:id) | 发布 / 上下架 / 删除公告 |
| GET/POST | /api/repairs | 报修列表 / 居民提交报修 |
| PATCH | /api/repairs/:id | 物业修改处理状态 |
| GET/POST | /api/votes | 投票列表 / 发起投票 |
| POST | /api/votes/:id/vote | 居民投票 |
| PATCH | /api/votes/:id | 结束或重新开启投票 |
| GET/POST | /api/suggestions | 建议列表（后台）/ 居民提交建议 |
| PATCH | /api/suggestions/:id | 修改状态、填写回复 |
