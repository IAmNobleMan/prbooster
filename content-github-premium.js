// GitHub页面增强 - 付费功能

// 导入付费功能模块
import { checkSubscription, performAIReview, getTeamStats } from './premium.js';

// 在PR详情页面添加AI审查按钮
function addAIReviewButton() {
  // 检查是否在PR详情页
  if (!window.location.href.includes('/pull/')) return;

  // 查找评论输入框位置
  const commentBox = document.querySelector('.timeline-comment-form');
  if (!commentBox || commentBox.querySelector('.pr-booster-ai-btn')) return;

  const aiBtn = document.createElement('button');
  aiBtn.className = 'pr-booster-ai-btn btn btn-primary';
  aiBtn.innerHTML = '🤖 AI 智能审查';
  aiBtn.style.marginLeft = '8px';

  aiBtn.onclick = async () => {
    const sub = await checkSubscription();
    if (sub.status !== 'premium') {
      showUpgradePrompt();
      return;
    }

    aiBtn.disabled = true;
    aiBtn.innerHTML = '⏳ 分析中...';

    try {
      // 获取代码diff
      const diffContent = getDiffContent();

      // 调用AI审查
      const result = await performAIReview(window.location.href, diffContent);

      // 显示审查结果
      showAIReviewResult(result.review);
    } catch (error) {
      console.error('AI审查失败:', error);
      alert('AI审查失败: ' + error.message);
    } finally {
      aiBtn.disabled = false;
      aiBtn.innerHTML = '🤖 AI 智能审查';
    }
  };

  // 插入按钮
  const submitBtn = commentBox.querySelector('.btn-primary[type="submit"]');
  if (submitBtn) {
    submitBtn.parentNode.insertBefore(aiBtn, submitBtn.nextSibling);
  }
}

// 获取代码diff内容
function getDiffContent() {
  const diffElements = document.querySelectorAll('.diff-table');
  let diffText = '';

  diffElements.forEach(element => {
    diffText += element.textContent + '\n\n';
  });

  return diffText.substring(0, 10000); // 限制长度
}

// 显示AI审查结果
function showAIReviewResult(review) {
  const resultDiv = document.createElement('div');
  resultDiv.className = 'pr-booster-ai-review';
  resultDiv.innerHTML = `
    <h4>🤖 AI 代码审查建议</h4>
    <p>${review.replace(/\n/g, '<br>')}</p>
  `;

  // 插入到评论框上方
  const commentBox = document.querySelector('.timeline-comment-form');
  if (commentBox) {
    commentBox.parentNode.insertBefore(resultDiv, commentBox);
  }
}

// 显示升级提示
function showUpgradePrompt() {
  const promptDiv = document.createElement('div');
  promptDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 9999;
    max-width: 400px;
  `;
  promptDiv.innerHTML = `
    <h3 style="margin: 0 0 12px 0;">🔓 解锁AI智能审查</h3>
    <p style="margin: 0 0 16px 0;">AI审查是高级会员专属功能。<br>只需 ¥9/月，让代码审查更高效。</p>
    <button onclick="chrome.tabs.create({url: 'https://github.com/prbooster/upgrade'}); document.querySelector('.pr-booster-prompt').remove();" class="btn btn-primary" style="margin-right: 8px;">立即升级</button>
    <button onclick="document.querySelector('.pr-booster-prompt').remove();" class="btn">暂不</button>
  `;
  promptDiv.className = 'pr-booster-prompt';

  document.body.appendChild(promptDiv);
}

// 在仓库页面添加团队统计面板
function addTeamStatsPanel() {
  // 检查是否在仓库页面
  if (!window.location.href.includes('github.com') ||
      window.location.href.includes('/pull/')) return;

  const statsSection = {
    selector: '.discussion-sidebar-header',
    title: '团队统计',
  };

  // 创建统计面板
  const panel = document.createElement('div');
  panel.className = 'pr-booster-team-stats';
  panel.innerHTML = `
    <h4>📊 团队协作统计</h4>
    <div class="stats-loading">加载中...</div>
  `;

  // 查找合适的位置插入
  const sidebar = document.querySelector('.discussion-sidebar');
  if (sidebar) {
    sidebar.insertBefore(panel, sidebar.firstChild);

    // 异步加载数据
    loadTeamStats(panel);
  }
}

// 加载团队统计数据
async function loadTeamStats(panel) {
  try {
    const sub = await checkSubscription();
    if (sub.status !== 'premium') {
      panel.innerHTML = `
        <h4>📊 团队协作统计</h4>
        <p class="text-small text-gray-500">高级会员功能</p>
        <button onclick="chrome.tabs.create({url: 'https://github.com/prbooster/upgrade'});" class="btn btn-sm btn-link">查看详情 →</button>
      `;
      return;
    }

    const stats = await getTeamStats(window.location.href, '7d');

    panel.innerHTML = `
      <h4>📊 团队协作统计（7天）</h4>
      <div class="stat-item">总PR数: ${stats.stats.totalPRs}</div>
      <div class="stat-item">已合并: ${stats.stats.mergedPRs}</div>
      <div class="stat-item">平均合并时间: ${stats.stats.averageMergeTime}</div>
      <div class="top-contributors">
        <strong>活跃贡献者:</strong>
        ${stats.stats.topContributors.map(c => `<div>• ${c.name}: ${c.prs} PRs</div>`).join('')}
      </div>
    `;
  } catch (error) {
    console.error('加载统计失败:', error);
    panel.querySelector('.stats-loading').textContent = '加载失败';
  }
}

// 初始化
function initPremiumFeatures() {
  // 检查订阅状态
  checkSubscription().then(sub => {
    if (sub.status === 'premium') {
      // 激活高级功能
      addAIReviewButton();
      addTeamStatsPanel();
    }
  });
}

// 监听页面变化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPremiumFeatures);
} else {
  initPremiumFeatures();
}

const observer = new MutationObserver(() => {
  initPremiumFeatures();
});
observer.observe(document.body, { childList: true, subtree: true });
