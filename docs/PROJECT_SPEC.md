# 校园社交平台 (CampusLoop) - 系统详细设计说明书

## 1. 项目概述 (Project Overview)
- **项目名称**: CampusLoop (校园社交平台)
- **项目架构**: 采用 B/S (Browser/Server) 架构，前后端完全分离。
- **前端技术栈**: React 19, Vite, Tailwind CSS v4, React Router DOM v7, Socket.io-client, Lucide React (图标库), Emoji-picker-react。开发语言：TypeScript。
- **后端技术栈**: Node.js, Koa.js, Prisma ORM (连接 MySQL), Socket.io (WebSocket), JWT (JSON Web Token), bcryptjs (密码哈希加密), multer (文件上传)。开发语言：TypeScript。

## 2. 系统架构设计 (System Architecture)
系统架构分为表现层、业务逻辑层、数据访问层和持久化层四部分：
1. **表现层 (前端)**: 采用 React 构建的单页面应用 (SPA)。采用移动端优先 (Mobile-First) 的流式布局，使用 Tailwind CSS 实现高定制化的响应式 UI。核心状态依赖 React Context (如 `SocketContext`) 与 Hooks 进行管理。
2. **业务逻辑层 (后端)**: 依托 Koa 框架提供高性能的 RESTful API。针对实时聊天需求，集成 Socket.io 实现基于事件驱动的双向通信。
3. **数据访问层 (ORM)**: 使用 Prisma 作为对象关系映射层。Prisma Client 提供了类型安全的数据库操作接口，避免了直接编写 SQL 带来的注入风险，同时提供了完备的数据库迁移机制 (Migrations)。
4. **持久化层 (数据库与文件)**: 使用 MySQL 关系型数据库存储各类结构化业务数据。媒体文件（如头像、动态配图）通过本地文件系统持久化在项目根目录的 `uploads/` 文件夹下，由 `koa-static` 直接提供静态资源服务。

## 3. 核心模块与功能设计 (Module Design)
1. **认证与安全模块 (Auth)**: 基于 JWT 实现无状态会话管理。用户注册时，使用 `bcryptjs` 对密码进行加盐哈希存储；登录成功返回 JWT，前端将其存入 LocalStorage，并通过拦截器挂载在请求头 `Authorization: Bearer <token>` 中。
2. **内容流与交互模块 (Post & Interaction)**: 
   - 用户可发布图文动态，支持携带地理位置 (`location`)。
   - 核心功能：支持**匿名发布**，后端存储真实关联但前端渲染时脱敏。
   - 交互系统：将点赞 (like)、评论 (comment)、分享 (share) 统一抽象为 Interaction 实体，通过 `type` 字段区分，极大提高了数据扩展性。
3. **实时通讯模块 (Message)**:
   - 支持三种维度：私密单聊、社团群聊 (基于 `clubId`)、大厅公共聊天 (`isPublic`)。
   - 实现包含消息持久化存储与“未读/已读”状态标记。
4. **社团与活动模块 (Club & Event)**:
   - 允许用户自主创建兴趣社团并担任群主，社团内可发起线上/线下活动 (`Event`)，包含时间、地点及封面图。
5. **成就与徽章系统 (Badge)**:
   - 游戏化社交体验，内置条件触发型徽章。数据库定义了徽章的触发条件类型 (`condition_type`) 和阈值 (`condition_value`)，用户满足条件后可解锁，并在个人主页配置展示 (`is_displayed`)。
6. **发现与工具箱 (Discover & Toolbox)**:
   - 发现页提供全局用户搜索、社团搜索及按分类筛选帖子。
   - 创新功能：“纸飞机” (Paper Plane)，实现跨用户的随机、匿名轻量化匹配互动。
7. **用户社交网络 (User Network)**:
   - 实现关注与被关注机制 (Follow System)，用户个人主页可展示粉丝数、关注数，并形成个人的关系网列表。

## 4. 数据库设计 (Database Design - Prisma Schema)
系统的关系模型(ER)设计紧扣业务逻辑，核心表如下：
- **用户表 (`users`)**: 包含 `id`, `username`, `password`, `name`, `avatar`, `school`, `department`, `isVerified`, `bio`。
- **动态表 (`posts`)**: 包含 `id`, `user_id` (外键), `content`, `image`, `type`, `is_anonymous` (布尔值，控制匿名), `location`。
- **交互表 (`interactions`)**: 包含 `id`, `user_id`, `post_id`, `type`, `content`。关联用户表与动态表。
- **社团表 (`clubs`)**: 包含 `id`, `name`, `logo`, `description`, `member_count`, `owner_id` (关联创建者)。
- **活动表 (`events`)**: 包含 `id`, `title`, `image`, `date`, `location`, `description`, `club_id` (归属社团), `owner_id`。
- **消息表 (`messages`)**: 包含 `id`, `sender_id`, `receiver_id` (私聊用), `club_id` (群聊用), `content`, `is_read`, `is_public` (大厅聊天标志)。
- **用户关系表 (`follows`)**: 使用复合主键 `[follower_id, following_id]` 建立用户实体的多对多自关联。
- **徽章体系 (`badges` & `user_badges`)**: 
  - `badges`: 预设徽章字典表，包含图标、描述、条件类型等。
  - `user_badges`: 联结表，记录用户解锁时间及是否在主页展示。

## 5. 接口规范设计 (API Design)
后端采用 Koa Router 划分路由域，接口设计遵循 RESTful 风格（部分查询行为接口通过 POST/GET 灵活处理）：
- **认证域 (`/api/auth`)**: `/register` (注册), `/login` (登录), `/change-password` (修改密码)。
- **用户域 (`/api/users`)**: `/profile` (当前用户信息), `/:id` (获取指定用户信息), `/:id/posts` (Ta的动态), `/:id/follow` (关注/取消关注)。
- **动态域 (`/api/posts`)**: `/` (GET: 获取 Feed 流, POST: 发布), `/search` (搜索), `/:id/interact` (点赞/分享等操作), `/:id/comments` (评论CRUD), `/random-paper-plane` (纸飞机匹配)。
- **消息域 (`/api/messages`)**: `/public` (拉取公屏), `/:contactId` (拉取与某人的私聊), `/club/:clubId` (拉取群聊), `/` (POST: 发送消息), `/:contactId/read` (标记已读)。
- **社团域 (`/api/clubs`)** & **活动域 (`/api/events`)**: 列表获取、详情获取及创建接口 (`POST /`)。
- **徽章域 (`/api/badges`)**: `/check` (校验当前用户成就), `/:id/toggle-display` (切换挂载展示)。
- **文件域 (`/api/upload`)**: 配合 Multer 接收 FormData 中的 file，返回服务端静态资源的直接访问 URL。

## 6. 核心功能实现逻辑 (Core Implementation Logic)
1. **WebSocket 即时通讯机制**:
   - **连接鉴权**: 在 Socket 连接握手阶段 (`io.use`) 拦截请求，解析并校验客户端携带的 JWT，只有合法用户才能建立 WS 隧道。
   - **私有房间隔离**: 鉴权通过后，服务器强制令客户端加入以自己ID命名的独立房间（如 `user_${id}`），确保私信路由的绝对准确。
   - **群组动态订阅**: 客户端进入某社团聊天室时触发 `join_room` 事件订阅频道。当有新消息产生时，后端首先持久化落库至 `messages` 表，随后通过 `socket.to(roomId).emit` 广播分发，兼顾了消息的时效性与可靠性。
2. **单页应用(SPA)权限路由管控**:
   - 所有的页面切换由 `React-Router` 控制。在最外层的 `Layout` 拦截器中，主动侦测本地是否存在 token。
   - 对白名单路由（如 `/login`）放行，否则使用 `<Navigate to="/login" replace />` 进行强制跳转拦截，保证业务视图的数据安全。
3. **高复用性的数据分页与动态渲染**:
   - 动态 Feed 流由于采用了组件化设计（如 `<PostCard />`），使得在首页、分类、搜索结果页、用户个人主页均能共用同一套视图层渲染逻辑。配合后端的数据返回模型，实现了高度解耦。
