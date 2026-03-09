# 🔍 PR CodeLens - GitHub PR 智能洞察

浏览器插件，为 GitHub PR 提供智能审查与深度洞察

## 功能

### 免费版
- ✅ PR 列表增强（显示文件数、增删行数）
- ✅ 快速筛选（按作者、状态、标签）
- ✅ 基础统计（本周PR数量、合并率）

### 付费版（¥9/月）
- ⚡ AI 自动代码审查
- ⚡ 智能评论建议
- ⚡ 批量操作（批量打标签、批量评论）
- ⚡ PR 模板管理
- ⚡ 团队协作统计

## 安装

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本目录

## 开发

```bash
# 安装依赖（如果有）
npm install

# 开发模式
# 直接在 chrome://extensions/ 点击刷新
```

## 技术栈

- **前端：** Vanilla JS + CSS
- **后端：** Cloudflare Workers（待部署）
- **存储：** Chrome Storage API + Cloudflare KV
- **支付：** Stripe（待集成）

## 变现测算

假设：
- 日活 5000 人
- 付费转化率 3%
- 单价 ¥9/月

**月收入：** ¥1,350  
**年收入：** ¥16,200

## 开发计划

### Week 1：基础功能
- [x] 插件框架搭建
- [x] PR列表增强
- [ ] 基础筛选
- [ ] 统计数据展示

### Week 2：付费功能
- [ ] Stripe支付集成
- [ ] Cloudflare Worker后端
- [ ] AI代码审查
- [ ] 发布到Chrome商店

---

**让 PR 审查更高效 💰**
