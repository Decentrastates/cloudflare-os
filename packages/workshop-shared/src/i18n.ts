export type UiLocale = 'en' | 'zh-CN' | 'zh-TW'

type MetadataCatalog = Readonly<Record<string, string>>

const zhCN: MetadataCatalog = {
  // Built-in output formats and their promoted blueprints.
  'App': '应用',
  'Apps': '应用',
  'Doc': '文档',
  'Docs': '文档',
  'Sheet': '表格',
  'Sheets': '表格',
  'Slides': '幻灯片',
  'Workspace Docs': '工作区文档',
  'Workspace Sheets': '工作区表格',
  'Workspace Slides': '工作区幻灯片',
  'Use to write, format, and edit rich text documents interactively or with natural language.':
    '通过交互操作或自然语言编写、格式化和编辑富文本文档。',
  'Use to write, format, and edit spreadsheets interactively or with natural language.':
    '通过交互操作或自然语言编写、格式化和编辑电子表格。',
  'Use to build slide decks with your corporate style interactively or with natural language. Once you create your own slides, add connections to build slides with text and charts powered by real data.':
    '通过交互操作或自然语言，按企业风格制作幻灯片。创建自己的幻灯片后，可添加连接，使用真实数据生成文字和图表。',

  // Generic connector names and vendor taglines. Product brand names intentionally fall back.
  'Email': '电子邮件',
  'Home Assistant': '家庭助理',
  'MCP Server': 'MCP 服务器',
  'Context': '上下文',
  'Scheduled Tasks': '计划任务',
  'Read and write your Confluence pages and spaces': '读取和编辑 Confluence 页面与空间',
  'Trigger gadgets from incoming email': '通过收到的电子邮件触发工作组件',
  'Triage issues, review PRs, and manage repos': '分类处理议题、审查拉取请求并管理仓库',
  'Draft replies, edit docs, read sheets, manage calendars, and analyze data':
    '起草回复、编辑文档、读取表格、管理日历并分析数据',
  'Control your smart home, read sensor state, and edit Lovelace dashboards.':
    '控制智能家居、读取传感器状态并编辑 Lovelace 仪表板。',
  'Triage, create, and update issues': '分类处理、创建和更新议题',
  'Connect any Model Context Protocol server': '连接任意模型上下文协议服务器',
  'Read and write your Notion pages and databases': '读取和编辑 Notion 页面与数据库',
  'Read channels, DMs, and threads': '读取频道、私信和会话串',
  'Manage playlists, your library, and playback': '管理播放列表、媒体库和播放',
  'Query Postgres, inspect schema, and manage projects': '查询 Postgres、检查架构并管理项目',
  'Search and enrich B2B company & contact intelligence': '搜索并丰富 B2B 公司与联系人情报',
  'Author and consult shared context collections': '编写和查阅共享上下文集合',
  'Run workspace tasks on a schedule': '按计划运行工作区任务',
  'Sign in with Cloudflare': '使用 Cloudflare 登录',
  'Context & Skills': '上下文与技能',
  'Scheduled': '计划任务',
  'Connect your Atlassian Confluence site to let Cloudflare OS search, read, and edit the pages, blog posts, and spaces you share. Build agents that draft documentation, organize knowledge bases, or keep pages up to date.':
    '连接 Atlassian Confluence 站点，让 Cloudflare OS 搜索、读取和编辑你共享的页面、博客文章与空间。可用于构建起草文档、整理知识库或持续更新页面的智能体。',
  'Give Cloudflare OS an email address it can receive messages from. Useful for triage agents, ticket-from-email workflows, or anything driven by mail.':
    '为 Cloudflare OS 提供一个可接收邮件的地址。适用于分类处理智能体、邮件转工单流程以及任何由邮件驱动的工作。',
  'Connect your GitHub account so Cloudflare OS can read and update issues, pull requests, and reviews on the repositories you choose.':
    '连接 GitHub 账户，让 Cloudflare OS 读取和更新你所选仓库中的议题、拉取请求与审查。',
  'Connect your Google account to give Cloudflare OS access to Gmail, Google Docs, Google Sheets, Google Calendar, and BigQuery. Build agents that triage email, draft and edit documents, read spreadsheets, find focus time, schedule meetings, or run analytics queries on your data.':
    '连接 Google 账户，让 Cloudflare OS 访问 Gmail、Google 文档、Google 表格、Google 日历和 BigQuery。可用于构建邮件分类、文档起草与编辑、表格读取、专注时间查找、会议安排或数据分析智能体。',
  'Connect your Home Assistant instance so Cloudflare OS can read entity state, call services to control devices, edit dashboards, and render templates. Build agents that automate your home, alert on sensor changes, or generate custom dashboards.':
    '连接 Home Assistant 实例，让 Cloudflare OS 读取实体状态、调用服务控制设备、编辑仪表板并渲染模板。可用于构建家庭自动化、传感器变化提醒或自定义仪表板智能体。',
  'Connect your Linear account so Cloudflare OS can read and manage issues, projects, and comments across the teams you choose.':
    '连接 Linear 账户，让 Cloudflare OS 读取和管理你所选团队中的议题、项目与评论。',
  'Connect a Model Context Protocol server and use its tools from a Gadget. Reads happen straight away. Anything that writes waits for your approval.':
    '连接模型上下文协议服务器，并在工作组件中使用其工具。读取操作会直接执行，任何写入操作都等待你的批准。',
  'Connect your Notion workspace to let Cloudflare OS search, read, and edit the pages and databases you share. Build agents that draft documents, organize notes, or manage database records.':
    '连接 Notion 工作区，让 Cloudflare OS 搜索、读取和编辑你共享的页面与数据库。可用于构建文档起草、笔记整理或数据库记录管理智能体。',
  'Connect your Slack account to give Cloudflare OS read-only access to the workspaces, channels, direct messages, and threads you can see. Build agents that summarize conversations, monitor channels, or search across your Slack history.':
    '连接 Slack 账户，让 Cloudflare OS 只读访问你可见的工作区、频道、私信与会话串。可用于构建对话摘要、频道监控或 Slack 历史搜索智能体。',
  'Connect your Spotify account so Cloudflare OS can search the catalog, read and edit your library and playlists, and control playback on your devices. Grant whole-account access or scope a Gadget to a single playlist.':
    '连接 Spotify 账户，让 Cloudflare OS 搜索目录、读取和编辑媒体库与播放列表，并控制设备播放。可授予整个账户访问权限，也可将工作组件限定到单个播放列表。',
  'Connect your Supabase account so Cloudflare OS can run SQL against your project databases, explore schema, and inspect edge functions and storage for the projects you choose.':
    '连接 Supabase 账户，让 Cloudflare OS 在所选项目数据库上运行 SQL、探索架构，并检查边缘函数与存储。',
  'Connect your ZoomInfo account so Cloudflare OS can resolve filter values, search companies, contacts, intent signals, scoops, and news, and enrich matched records into full detail. Search is free; enrichment consumes ZoomInfo credits. Build agents that assemble target account lists, research accounts, and prioritize outreach on buying signals.':
    '连接 ZoomInfo 账户，让 Cloudflare OS 解析筛选值，搜索公司、联系人、意向信号、独家信息与新闻，并将匹配记录丰富为完整资料。搜索免费，资料丰富会消耗 ZoomInfo 额度。可用于构建目标账户清单、账户研究及购买信号优先触达智能体。',
  'The Context Library lets you and your team author collections of context documents that agents can consult to learn how to perform tasks. It is always available — no connection needed.':
    '上下文资料库可供你和团队编写上下文文档集合，智能体可查阅这些内容来学习如何执行任务。它始终可用，无需连接。',
  'Register recurring and one-shot workspace tasks.': '注册重复执行或单次执行的工作区任务。',
  'Sign in with your Cloudflare account. Usage beyond the free tier can be billed to your own Cloudflare AI Gateway credits.':
    '使用 Cloudflare 账户登录。超出免费额度的使用量可从你自己的 Cloudflare AI Gateway 额度中结算。',

  // Connector-supported resource types shown in pickers and administration.
  'Confluence Site': 'Confluence 站点',
  'Search, browse, and edit any space or page on a Confluence site.':
    '搜索、浏览和编辑 Confluence 站点中的任意空间或页面。',
  'Confluence Space': 'Confluence 空间',
  'Read and edit the pages and blog posts in a single Confluence space.':
    '读取和编辑单个 Confluence 空间中的页面与博客文章。',
  'Confluence Page or Blog Post': 'Confluence 页面或博客文章',
  'Read and edit a specific Confluence page or blog post (and its child pages).':
    '读取和编辑指定的 Confluence 页面或博客文章（及其子页面）。',
  'Email Mailbox': '电子邮箱',
  'Send and receive emails.': '发送和接收电子邮件。',
  'GitHub Repository': 'GitHub 仓库',
  'Read and manage issues, pull requests, reviews, and discussions in a GitHub repository.':
    '读取和管理 GitHub 仓库中的议题、拉取请求、审查和讨论。',
  'GitHub Issue': 'GitHub 议题',
  'Read and manage a specific GitHub issue.': '读取和管理指定的 GitHub 议题。',
  'GitHub Pull Request': 'GitHub 拉取请求',
  'Read and manage a specific GitHub pull request and its review threads.':
    '读取和管理指定的 GitHub 拉取请求及其审查会话串。',
  'Gmail Mailbox': 'Gmail 邮箱',
  'Read emails and apply labels.': '读取电子邮件并应用标签。',
  'Google Doc': 'Google 文档',
  'Read and edit documents you choose.': '读取和编辑你选择的文档。',
  'Google Spreadsheet': 'Google 电子表格',
  'Read values from a spreadsheet you choose.': '读取你选择的电子表格中的数据。',
  'Google Calendar': 'Google 日历',
  'Read and manage a Google Calendar.': '读取和管理 Google 日历。',
  'Choose a Google Cloud project, then optionally narrow access to a dataset or table.':
    '选择 Google Cloud 项目，并可进一步将访问范围缩小到数据集或表。',
  'Access to a Home Assistant instance: every area, device, entity, and dashboard.':
    '访问 Home Assistant 实例中的所有区域、设备、实体和仪表板。',
  'Home Assistant Area': 'Home Assistant 区域',
  'Access to a single Home Assistant area (room): its devices and entities only.':
    '仅访问单个 Home Assistant 区域（房间）中的设备和实体。',
  'Home Assistant Label': 'Home Assistant 标签',
  'Access to all Home Assistant entities carrying a particular label.':
    '访问带有指定标签的所有 Home Assistant 实体。',
  'Home Assistant Device': 'Home Assistant 设备',
  'Access to a single physical device and the entities it provides.':
    '访问单个物理设备及其提供的实体。',
  'Home Assistant Entity': 'Home Assistant 实体',
  'Access to a single Home Assistant entity (light, sensor, switch, etc).':
    '访问单个 Home Assistant 实体（灯、传感器、开关等）。',
  'Linear Workspace': 'Linear 工作区',
  'Read and manage every team and issue in a Linear workspace. This is the broadest option — connect a single team or issue instead to limit what a Gadget can access.':
    '读取和管理 Linear 工作区中的所有团队和议题。这是范围最广的选项；如需限制工作组件的访问范围，请改为连接单个团队或议题。',
  'Linear Team': 'Linear 团队',
  'Read and manage the issues, labels, states, and cycles of a single Linear team.':
    '读取和管理单个 Linear 团队的议题、标签、状态和周期。',
  'Linear Issue': 'Linear 议题',
  'Read and manage a single Linear issue and its comments.': '读取和管理单个 Linear 议题及其评论。',
  'Any MCP server': '任意 MCP 服务器',
  'An MCP endpoint you supply. Tools are discovered automatically, and writes need approval.':
    '由你提供的 MCP 端点。系统会自动发现工具，写入操作需要批准。',
  'Notion Workspace': 'Notion 工作区',
  'Search, read, and edit any page or database shared with this connection.':
    '搜索、读取和编辑与此连接共享的任意页面或数据库。',
  'Notion Page or Database': 'Notion 页面或数据库',
  'Read and edit a specific Notion page or database (and its rows).':
    '读取和编辑指定的 Notion 页面或数据库（及其数据行）。',
  'Slack Workspace': 'Slack 工作区',
  'Read channels, direct messages, members, and search across the whole connected workspace. The workspace is auto-detected from the connected account — no URL or ID need be supplied.':
    '读取整个已连接工作区的频道、私信和成员，并可进行搜索。系统会从已连接账户自动识别工作区，无需提供网址或 ID。',
  'Slack Conversation': 'Slack 会话',
  'Read a single channel, direct message, or group DM.': '读取单个频道、私信或群组私信。',
  'Slack Thread': 'Slack 会话串',
  'Read a single message thread and its replies.': '读取单个消息会话串及其回复。',
  'Spotify Account': 'Spotify 账户',
  'Whole-account access: profile, catalog search, your library, your playlists, and playback control.':
    '访问整个账户：个人资料、目录搜索、媒体库、播放列表和播放控制。',
  'Spotify Playlist': 'Spotify 播放列表',
  'Read and edit a single Spotify playlist.': '读取和编辑单个 Spotify 播放列表。',
  'Supabase Project': 'Supabase 项目',
  "Query and manage a project's Postgres database, and inspect its edge functions and storage.":
    '查询和管理项目的 Postgres 数据库，并检查其边缘函数和存储。',
  'Supabase Organization': 'Supabase 组织',
  'Discover and manage every project in a Supabase organization.': '查找和管理 Supabase 组织中的所有项目。',
  'ZoomInfo Account': 'ZoomInfo 账户',
  'Whole-account access: lookup, company/contact/intent/scoop/news search, record enrichment (consumes credits), recommendations, and account intelligence — subject to entitlements.':
    '访问整个账户：查询、公司/联系人/意向/独家信息/新闻搜索、记录丰富（消耗额度）、推荐和账户情报，具体取决于授权范围。',
}

const zhTW: MetadataCatalog = {
  'App': '應用程式',
  'Apps': '應用程式',
  'Doc': '文件',
  'Docs': '文件',
  'Sheet': '試算表',
  'Sheets': '試算表',
  'Slides': '簡報',
  'Workspace Docs': '工作區文件',
  'Workspace Sheets': '工作區試算表',
  'Workspace Slides': '工作區簡報',
  'Use to write, format, and edit rich text documents interactively or with natural language.':
    '透過互動操作或自然語言撰寫、格式化及編輯富文字文件。',
  'Use to write, format, and edit spreadsheets interactively or with natural language.':
    '透過互動操作或自然語言撰寫、格式化及編輯試算表。',
  'Use to build slide decks with your corporate style interactively or with natural language. Once you create your own slides, add connections to build slides with text and charts powered by real data.':
    '透過互動操作或自然語言，依企業風格製作簡報。建立自己的簡報後，可新增連線，使用真實資料產生文字與圖表。',
  'Email': '電子郵件',
  'Home Assistant': '家庭助理',
  'MCP Server': 'MCP 伺服器',
  'Context': '內容庫',
  'Scheduled Tasks': '排程工作',
  'Read and write your Confluence pages and spaces': '讀取及編輯 Confluence 頁面與空間',
  'Trigger gadgets from incoming email': '透過收到的電子郵件觸發工作元件',
  'Triage issues, review PRs, and manage repos': '分類處理議題、審查拉取請求並管理儲存庫',
  'Draft replies, edit docs, read sheets, manage calendars, and analyze data':
    '起草回覆、編輯文件、讀取試算表、管理日曆並分析資料',
  'Control your smart home, read sensor state, and edit Lovelace dashboards.':
    '控制智慧家庭、讀取感測器狀態並編輯 Lovelace 儀表板。',
  'Triage, create, and update issues': '分類處理、建立及更新議題',
  'Connect any Model Context Protocol server': '連接任意模型內容協定伺服器',
  'Read and write your Notion pages and databases': '讀取及編輯 Notion 頁面與資料庫',
  'Read channels, DMs, and threads': '讀取頻道、私訊及討論串',
  'Manage playlists, your library, and playback': '管理播放清單、媒體庫及播放',
  'Query Postgres, inspect schema, and manage projects': '查詢 Postgres、檢查結構描述並管理專案',
  'Search and enrich B2B company & contact intelligence': '搜尋並豐富 B2B 公司與聯絡人情報',
  'Author and consult shared context collections': '編寫及查閱共享內容集合',
  'Run workspace tasks on a schedule': '依排程執行工作區工作',
  'Sign in with Cloudflare': '使用 Cloudflare 登入',
  'Context & Skills': '內容與技能',
  'Scheduled': '排程工作',
  'Connect your Atlassian Confluence site to let Cloudflare OS search, read, and edit the pages, blog posts, and spaces you share. Build agents that draft documentation, organize knowledge bases, or keep pages up to date.':
    '連接 Atlassian Confluence 網站，讓 Cloudflare OS 搜尋、讀取及編輯你共享的頁面、部落格文章與空間。可用於建立起草文件、整理知識庫或持續更新頁面的代理程式。',
  'Give Cloudflare OS an email address it can receive messages from. Useful for triage agents, ticket-from-email workflows, or anything driven by mail.':
    '為 Cloudflare OS 提供一個可接收郵件的地址。適用於分類處理代理程式、郵件轉工單流程，以及任何由郵件驅動的工作。',
  'Connect your GitHub account so Cloudflare OS can read and update issues, pull requests, and reviews on the repositories you choose.':
    '連接 GitHub 帳戶，讓 Cloudflare OS 讀取及更新你所選儲存庫中的議題、拉取請求與審查。',
  'Connect your Google account to give Cloudflare OS access to Gmail, Google Docs, Google Sheets, Google Calendar, and BigQuery. Build agents that triage email, draft and edit documents, read spreadsheets, find focus time, schedule meetings, or run analytics queries on your data.':
    '連接 Google 帳戶，讓 Cloudflare OS 存取 Gmail、Google 文件、Google 試算表、Google 日曆及 BigQuery。可用於建立郵件分類、文件起草與編輯、試算表讀取、專注時間查找、會議安排或資料分析代理程式。',
  'Connect your Home Assistant instance so Cloudflare OS can read entity state, call services to control devices, edit dashboards, and render templates. Build agents that automate your home, alert on sensor changes, or generate custom dashboards.':
    '連接 Home Assistant 執行個體，讓 Cloudflare OS 讀取實體狀態、呼叫服務控制裝置、編輯儀表板並轉譯範本。可用於建立家庭自動化、感測器變化提醒或自訂儀表板代理程式。',
  'Connect your Linear account so Cloudflare OS can read and manage issues, projects, and comments across the teams you choose.':
    '連接 Linear 帳戶，讓 Cloudflare OS 讀取及管理你所選團隊中的議題、專案與留言。',
  'Connect a Model Context Protocol server and use its tools from a Gadget. Reads happen straight away. Anything that writes waits for your approval.':
    '連接模型內容協定伺服器，並在工作元件中使用其工具。讀取操作會直接執行，任何寫入操作都會等待你的核准。',
  'Connect your Notion workspace to let Cloudflare OS search, read, and edit the pages and databases you share. Build agents that draft documents, organize notes, or manage database records.':
    '連接 Notion 工作區，讓 Cloudflare OS 搜尋、讀取及編輯你共享的頁面與資料庫。可用於建立文件起草、筆記整理或資料庫記錄管理代理程式。',
  'Connect your Slack account to give Cloudflare OS read-only access to the workspaces, channels, direct messages, and threads you can see. Build agents that summarize conversations, monitor channels, or search across your Slack history.':
    '連接 Slack 帳戶，讓 Cloudflare OS 以唯讀方式存取你可見的工作區、頻道、私訊與討論串。可用於建立對話摘要、頻道監控或 Slack 歷史搜尋代理程式。',
  'Connect your Spotify account so Cloudflare OS can search the catalog, read and edit your library and playlists, and control playback on your devices. Grant whole-account access or scope a Gadget to a single playlist.':
    '連接 Spotify 帳戶，讓 Cloudflare OS 搜尋目錄、讀取及編輯媒體庫與播放清單，並控制裝置播放。可授予整個帳戶存取權，也可將工作元件限定於單一播放清單。',
  'Connect your Supabase account so Cloudflare OS can run SQL against your project databases, explore schema, and inspect edge functions and storage for the projects you choose.':
    '連接 Supabase 帳戶，讓 Cloudflare OS 在所選專案資料庫上執行 SQL、探索結構描述，並檢查邊緣函式與儲存空間。',
  'Connect your ZoomInfo account so Cloudflare OS can resolve filter values, search companies, contacts, intent signals, scoops, and news, and enrich matched records into full detail. Search is free; enrichment consumes ZoomInfo credits. Build agents that assemble target account lists, research accounts, and prioritize outreach on buying signals.':
    '連接 ZoomInfo 帳戶，讓 Cloudflare OS 解析篩選值，搜尋公司、聯絡人、意向訊號、獨家資訊與新聞，並將相符記錄豐富為完整資料。搜尋免費，資料豐富會消耗 ZoomInfo 額度。可用於建立目標帳戶清單、帳戶研究及依購買訊號優先接觸的代理程式。',
  'The Context Library lets you and your team author collections of context documents that agents can consult to learn how to perform tasks. It is always available — no connection needed.':
    '內容資料庫可供你與團隊編寫內容文件集合，代理程式可查閱這些內容來學習如何執行工作。它始終可用，無需連接。',
  'Register recurring and one-shot workspace tasks.': '註冊重複執行或單次執行的工作區工作。',
  'Sign in with your Cloudflare account. Usage beyond the free tier can be billed to your own Cloudflare AI Gateway credits.':
    '使用 Cloudflare 帳戶登入。超出免費額度的使用量可從你自己的 Cloudflare AI Gateway 額度中結算。',
  'Confluence Site': 'Confluence 網站',
  'Search, browse, and edit any space or page on a Confluence site.':
    '搜尋、瀏覽及編輯 Confluence 網站中的任意空間或頁面。',
  'Confluence Space': 'Confluence 空間',
  'Read and edit the pages and blog posts in a single Confluence space.':
    '讀取及編輯單一 Confluence 空間中的頁面與部落格文章。',
  'Confluence Page or Blog Post': 'Confluence 頁面或部落格文章',
  'Read and edit a specific Confluence page or blog post (and its child pages).':
    '讀取及編輯指定的 Confluence 頁面或部落格文章（及其子頁面）。',
  'Email Mailbox': '電子信箱',
  'Send and receive emails.': '傳送及接收電子郵件。',
  'GitHub Repository': 'GitHub 儲存庫',
  'Read and manage issues, pull requests, reviews, and discussions in a GitHub repository.':
    '讀取及管理 GitHub 儲存庫中的議題、拉取請求、審查及討論。',
  'GitHub Issue': 'GitHub 議題',
  'Read and manage a specific GitHub issue.': '讀取及管理指定的 GitHub 議題。',
  'GitHub Pull Request': 'GitHub 拉取請求',
  'Read and manage a specific GitHub pull request and its review threads.':
    '讀取及管理指定的 GitHub 拉取請求及其審查討論串。',
  'Gmail Mailbox': 'Gmail 信箱',
  'Read emails and apply labels.': '讀取電子郵件並套用標籤。',
  'Google Doc': 'Google 文件',
  'Read and edit documents you choose.': '讀取及編輯你選擇的文件。',
  'Google Spreadsheet': 'Google 試算表',
  'Read values from a spreadsheet you choose.': '讀取你選擇的試算表中的資料。',
  'Google Calendar': 'Google 日曆',
  'Read and manage a Google Calendar.': '讀取及管理 Google 日曆。',
  'Choose a Google Cloud project, then optionally narrow access to a dataset or table.':
    '選擇 Google Cloud 專案，並可進一步將存取範圍縮小至資料集或資料表。',
  'Access to a Home Assistant instance: every area, device, entity, and dashboard.':
    '存取 Home Assistant 執行個體中的所有區域、裝置、實體及儀表板。',
  'Home Assistant Area': 'Home Assistant 區域',
  'Access to a single Home Assistant area (room): its devices and entities only.':
    '僅存取單一 Home Assistant 區域（房間）中的裝置及實體。',
  'Home Assistant Label': 'Home Assistant 標籤',
  'Access to all Home Assistant entities carrying a particular label.':
    '存取帶有指定標籤的所有 Home Assistant 實體。',
  'Home Assistant Device': 'Home Assistant 裝置',
  'Access to a single physical device and the entities it provides.':
    '存取單一實體裝置及其提供的實體。',
  'Home Assistant Entity': 'Home Assistant 實體',
  'Access to a single Home Assistant entity (light, sensor, switch, etc).':
    '存取單一 Home Assistant 實體（燈、感測器、開關等）。',
  'Linear Workspace': 'Linear 工作區',
  'Read and manage every team and issue in a Linear workspace. This is the broadest option — connect a single team or issue instead to limit what a Gadget can access.':
    '讀取及管理 Linear 工作區中的所有團隊及議題。這是範圍最廣的選項；如需限制工作元件的存取範圍，請改為連接單一團隊或議題。',
  'Linear Team': 'Linear 團隊',
  'Read and manage the issues, labels, states, and cycles of a single Linear team.':
    '讀取及管理單一 Linear 團隊的議題、標籤、狀態及週期。',
  'Linear Issue': 'Linear 議題',
  'Read and manage a single Linear issue and its comments.': '讀取及管理單一 Linear 議題及其留言。',
  'Any MCP server': '任意 MCP 伺服器',
  'An MCP endpoint you supply. Tools are discovered automatically, and writes need approval.':
    '由你提供的 MCP 端點。系統會自動探索工具，寫入操作需要核准。',
  'Notion Workspace': 'Notion 工作區',
  'Search, read, and edit any page or database shared with this connection.':
    '搜尋、讀取及編輯與此連線共享的任意頁面或資料庫。',
  'Notion Page or Database': 'Notion 頁面或資料庫',
  'Read and edit a specific Notion page or database (and its rows).':
    '讀取及編輯指定的 Notion 頁面或資料庫（及其資料列）。',
  'Slack Workspace': 'Slack 工作區',
  'Read channels, direct messages, members, and search across the whole connected workspace. The workspace is auto-detected from the connected account — no URL or ID need be supplied.':
    '讀取整個已連接工作區的頻道、私訊及成員，並可進行搜尋。系統會從已連接帳戶自動識別工作區，無需提供網址或 ID。',
  'Slack Conversation': 'Slack 對話',
  'Read a single channel, direct message, or group DM.': '讀取單一頻道、私訊或群組私訊。',
  'Slack Thread': 'Slack 討論串',
  'Read a single message thread and its replies.': '讀取單一訊息討論串及其回覆。',
  'Spotify Account': 'Spotify 帳戶',
  'Whole-account access: profile, catalog search, your library, your playlists, and playback control.':
    '存取整個帳戶：個人資料、目錄搜尋、媒體庫、播放清單及播放控制。',
  'Spotify Playlist': 'Spotify 播放清單',
  'Read and edit a single Spotify playlist.': '讀取及編輯單一 Spotify 播放清單。',
  'Supabase Project': 'Supabase 專案',
  "Query and manage a project's Postgres database, and inspect its edge functions and storage.":
    '查詢及管理專案的 Postgres 資料庫，並檢查其邊緣函式及儲存空間。',
  'Supabase Organization': 'Supabase 組織',
  'Discover and manage every project in a Supabase organization.': '探索及管理 Supabase 組織中的所有專案。',
  'ZoomInfo Account': 'ZoomInfo 帳戶',
  'Whole-account access: lookup, company/contact/intent/scoop/news search, record enrichment (consumes credits), recommendations, and account intelligence — subject to entitlements.':
    '存取整個帳戶：查詢、公司/聯絡人/意向/獨家資訊/新聞搜尋、記錄豐富（消耗額度）、推薦及帳戶情報，實際範圍依授權而定。',
}

const catalogs: Record<Exclude<UiLocale, 'en'>, MetadataCatalog> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
}

export function translateSystemMetadata(locale: UiLocale, value: string): string {
  if (locale === 'en') return value
  return catalogs[locale][value] ?? value
}
