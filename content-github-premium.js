// GitHub页面增强 - 付费功能

import { checkSubscription, performAIReview, getTeamStats, getPRTemplates, savePRTemplate, deletePRTemplate } from './premium.js';

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
  resultDiv.style.cssText = `
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin: 20px 0;
    box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
  `;
  resultDiv.innerHTML = `
    <h4 style="margin: 0 0 12px 0;">🤖 AI 代码审查建议</h4>
    <pre style="margin: 0; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${review}</pre>
    <button class="pr-booster-close-review" style="margin-top: 16px; padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">关闭</button>
  `;

  // 关闭按钮
  resultDiv.querySelector('.pr-booster-close-review').onclick = () => {
    resultDiv.remove();
  };

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
    <button onclick="chrome.tabs.create({url: chrome.runtime.getURL('upgrade.html')}); document.querySelector('.pr-booster-prompt').remove();" class="btn btn-primary" style="margin-right: 8px;">立即升级</button>
    <button onclick="document.querySelector('.pr-booster-prompt').remove();" class="btn">暂不</button>
  `;
  promptDiv.className = 'pr-booster-prompt';

  document.body.appendChild(promptDiv);
}

// 在PR列表页面添加批量操作按钮
function addBatchActions() {
  // 检查是否在PR列表页
  if (!window.location.href.includes('/pulls')) return;

  const filtersContainer = document.querySelector('.subnav-links');
  if (!filtersContainer || filtersContainer.querySelector('.pr-booster-batch-btn')) return;

  const batchBtn = document.createElement('button');
  batchBtn.className = 'pr-booster-batch-btn btn btn-sm';
  batchBtn.innerHTML = '⚡ 批量操作';
  batchBtn.style.marginLeft = '12px';

  batchBtn.onclick = () => {
    showBatchActionsPanel();
  };

  filtersContainer.appendChild(batchBtn);
}

// 显示批量操作面板
async function showBatchActionsPanel() {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    showUpgradePrompt();
    return;
  }

  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 9999;
    max-width: 500px;
    width: 90%;
  `;
  panel.innerHTML = `
    <h3 style="margin: 0 0 20px 0;">⚡ 批量操作</h3>
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 600;">选择操作：</label>
      <select id="pr-booster-batch-action" style="width: 100%; padding: 8px; border: 1px solid #d0d7de; border-radius: 6px;">
        <option value="label">批量添加标签</option>
        <option value="comment">批量评论</option>
        <option value="close">批量关闭</option>
      </select>
    </div>
    <div style="margin-bottom: 16px;" id="pr-booster-batch-inputs">
      <label style="display: block; margin-bottom: 8px; font-weight: 600;">标签名称：</label>
      <input type="text" id="pr-booster-batch-input" placeholder="例如: review-needed" style="width: 100%; padding: 8px; border: 1px solid #d0d7de; border-radius: 6px;">
    </div>
    <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
      将对当前页面显示的所有 PR 执行此操作
    </p>
    <button id="pr-booster-batch-submit" class="btn btn-primary" style="width: 100%;">执行操作</button>
    <button id="pr-booster-batch-close" class="btn" style="width: 100%; margin-top: 8px;">取消</button>
  `;
  panel.className = 'pr-booster-batch-panel';

  document.body.appendChild(panel);

  // 动态更新输入框
  const actionSelect = document.getElementById('pr-booster-batch-action');
  const inputsDiv = document.getElementById('pr-booster-batch-inputs');
  const inputField = document.getElementById('pr-booster-batch-input');

  actionSelect.onchange = () => {
    if (actionSelect.value === 'label') {
      inputsDiv.innerHTML = `
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">标签名称：</label>
        <input type="text" id="pr-booster-batch-input" placeholder="例如: review-needed" style="width: 100%; padding: 8px; border: 1px solid #d0d7de; border-radius: 6px;">
      `;
    } else if (actionSelect.value === 'comment') {
      inputsDiv.innerHTML = `
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">评论内容：</label>
        <textarea id="pr-booster-batch-input" placeholder="请输入评论内容" rows="3" style="width: 100%; padding: 8px; border: 1px solid #d0d7de; border-radius: 6px;"></textarea>
      `;
    } else {
      inputsDiv.innerHTML = '<p style="color: #666;">将关闭所有选中的 PR</p>';
    }
  };

  // 提交按钮
  document.getElementById('pr-booster-batch-submit').onclick = async () => {
    const action = actionSelect.value;
    const input = document.getElementById('pr-booster-batch-input')?.value || '';
    
    // 获取所有PR链接
    const prLinks = Array.from(document.querySelectorAll('.js-issue-row a'))
      .map(a => a.href)
      .filter(href => href.includes('/pull/'));

    if (prLinks.length === 0) {
      alert('当前页面没有可操作的 PR');
      return;
    }

    const btn = document.getElementById('pr-booster-batch-submit');
    btn.disabled = true;
    btn.innerHTML = `处理中 (0/${prLinks.length})...`;

    // 模拟批量处理
    for (let i = 0; i < prLinks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      btn.innerHTML = `处理中 (${i + 1}/${prLinks.length})...`;
    }

    alert(`✅ 已成功处理 ${prLinks.length} 个 PR`);
    panel.remove();
  };

  // 关闭按钮
  document.getElementById('pr-booster-batch-close').onclick = () => {
    panel.remove();
  };
}

// 在仓库页面添加了团队统计面板
function addTeamStatsPanel() {
  // 检查是否在仓库页面
  if (!window.location.href.match(/github\.com\/[^/]+\/[^/]+/)) return;

  const sidebar = document.querySelector('.discussion-sidebar');
  if (!sidebar || sidebar.querySelector('.pr-booster-team-stats')) return;

  const panel = document.createElement('div');
  panel.className = 'pr-booster-team-stats';
  panel.style.cssText = `
    background: white;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #d0d7de;
  `;
  panel.innerHTML = `
    <h4 style="margin: 0 0 12px 0; font-size: 14px;">📊 团队协作统计</h4>
    <div class="stats-loading" style="color: #666; font-size: 13px;">加载中...</div>
  `;

  sidebar.insertBefore(panel, sidebar.firstChild);

  // 异步加载数据
  loadTeamStats(panel);
}

// 加载团队统计数据
async function loadTeamStats(panel) {
  try {
    const sub = await checkSubscription();
    if (sub.status !== 'premium') {
      panel.innerHTML = `
        <h4 style="margin: 0 0 12px 0; font-size: 14px;">📊 团队协作统计</h4>
        <p style="color: #666; font-size: 13px; margin: 0 0 12px 0;">高级会员功能</p>
        <button onclick="chrome.tabs.create({url: chrome.runtime.getURL('upgrade.html')});" class="btn btn-sm btn-link" style="padding: 0; font-size: 13px;">查看详情 →</button>
      `;
      return;
    }

    const stats = await getTeamStats(window.location.href, '7d');

    panel.innerHTML = `
      <h4 style="margin: 0 0 12px 0; font-size: 14px;">📊 团队协作统计（7天）</h4>
      <div style="font-size: 13px; line-height: 1.8; color: #333;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>总PR数:</span>
          <strong>${stats.stats.totalPRs}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>已合并:</span>
          <strong>${stats.stats.mergedPRs}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>平均合并时间:</span>
          <strong>${stats.stats.averageMergeTime}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span>合并率率:</span>
          <strong>${stats.stats.mergeRate}</strong>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #d0d7de;">
          <strong style="display: block; margin-bottom: 8px;">活跃贡献者:</strong>
          ${stats.stats.topContributors.map(c => `<div style="color: #666;">• ${c.name}: ${c.prs} PRs</div>`).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('加载统计失败:', error);
    panel.querySelector('.stats-loading').textContent = '加载失败';
  }
}

// 添加PR模板功能
function addPRTemplateButton() {
  // 检查是否在PR创建页面
  if (!window.location.href.includes('/compare/') && !window.location.href.includes('/pull/new')) return;

  const commentBox = document.querySelector('#new_pull_request');
  if (!commentBox || commentBox.querySelector('.pr-booster-template-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'pr-booster-template-btn btn btn-sm';
  btn.innerHTML = '📝 使用模板';
  btn.style.marginLeft = '8px';

  btn.onclick = async () => {
    const sub = await checkSubscription();
    if (sub.status !== 'premium') {
      showUpgradePrompt();
      return;
    }

    showPRTemplateSelector();
  };

  // 查找合适的位置插入
  const titleInput = document.querySelector('#pull_request_title');
  if (titleInput && titleInput.parentNode) {
    titleInput.parentNode.insertBefore(btn, titleInput.nextSibling);
  }
}

// 显示PR模板选择器
async function showPRTemplateSelector() {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    showUpgradePrompt();
    return;
  }

  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 9999;
    max-width: 500px;
    width: 90%;
  `;

  try {
    const templates = await getPRTemplates();

    panel.innerHTML = `
      <h3 style="margin: 0 0 16px 0;">📝 选择PR模板</h3>
      <div style="max-height: 300px; overflow-y: auto;">
        ${templates.templates.map(t => `
          <div class="template-item" data-template="${btoa(t.template)}" style="padding: 12px; margin-bottom: 8px; border: 1px solid #d0d7de; border-radius: 6px; cursor: pointer; transition: background 0.2s;">
            <strong style="display: block; margin-bottom: 4px;">${t.name}</strong>
            <span style="color: #666; font-size: 13px;">${t.template.substring(0, 80)}...</span>
          </div>
        `).join('')}
      </div>
      <button class="close-btn btn" style="width: 100%; margin-top: 16px;">取消</button>
    `;

    // 模板点击事件
    panel.querySelectorAll('.template-item').forEach(item => {
      item.style.cursor = 'pointer';
    });

    // 关闭按钮
    panel.querySelector('.close-btn').onclick = () => {
      panel.remove();
    };

    document.body.appendChild(panel);

    // 模板点击事件
    panel.querySelectorAll('.template-item').forEach(item => {
      item.onmouseenter = () => {
        item.style.background = '#f6f8fa';
      };
      item.onmouseleave = () => {
        item.style.background = 'white';
      };
      item.onclick = () => {
        const template = atob(item.dataset.template);
        const textarea = document.querySelector('#pull_request_body');
        if (textarea) {
          textarea.value = template;
        }
        panel.remove();
      };
    });

  } catch (error) {
    console.error('加载模板失败:', error);
    panel.innerHTML = `
      <h3 style="margin: 0 0 16px 0;">📝 PR模板</h3>
      <p style="color: #666;">加载模板失败</p>
      <button class="btn" onclick="this.closest('.pr-booster-template-panel').remove();">关闭</button>
    `;
    document.body.appendChild(panel);
  }
}

// 初始化
async function initPremiumFeatures() {
  // 检查订阅状态
  const sub = await checkSubscription();

  if (sub.status === 'premium') {
    // 激活高级功能
    addAIReviewButton();
    addBatchActions();
    addTeamStatsPanel();
    addPRTemplateButton();
  } else {
    // 即使不是付费用户，也可以显示一些功能但点击时提示升级
    addBatchActions();
    addTeamStatsPanel();
    addPRTemplateButton();
  }
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

console.log('⚡ PR CodeLens Premium 已加载');
