// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPRStats') {
    const stats = getPRStats();
    sendResponse({ stats });
  }
});

// 获取 PR 统计数据
function getPRStats() {
  const prItems = document.querySelectorAll('.js-issue-row');
  let weeklyPRs = 0;
  let mergedPRs = 0;

  prItems.forEach(item => {
    weeklyPRs++;
    const icon = item.querySelector('.octicon-check');
    if (icon) mergedPRs++;
  });

  return {
    weeklyPRs,
    mergedPRs,
    timestamp: Date.now()
  };
}

// 增强 PR 列表显示
function enhancePRList() {
  const prItems = document.querySelectorAll('.js-issue-row');

  prItems.forEach(item => {
    // 如果已经增强过，跳过
    if (item.dataset.prBoosterEnhanced) return;
    item.dataset.prBoosterEnhanced = 'true';

    // 获取 PR 链接
    const link = item.querySelector('a');
    if (!link) return;

    // 添加显示文件数和行数
    const statsElement = item.querySelector('.opened-by');
    if (statsElement && !statsElement.querySelector('.pr-booster-stats')) {
      // 这里可以添加更多统计信息
      const diffInfo = document.createElement('span');
      diffInfo.className = 'pr-booster-stats';
      diffInfo.style.marginLeft = '8px';
      diffInfo.style.fontSize = '12px';
      diffInfo.style.color = '#58a6ff';
      diffInfo.innerHTML = '<span class="octicon octicon-diff"></span> 待分析';

      statsElement.appendChild(diffInfo);

      // 异步获取 PR 详情
      const prUrl = link.href + '/files';
      fetchPRDetails(prUrl, diffElement => {
        diffInfo.innerHTML = diffElement;
      });
    }
  });
}

// 获取 PR 详情（文件数和行数）
async function fetchPRDetails(url, callback) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // 解析统计信息
    const fileCount = doc.querySelectorAll('.file').length;
    const additions = doc.querySelectorAll('.blob-code-addition').length;
    const deletions = doc.querySelectorAll('.blob-code-deletion').length;

    callback(`
      <span title="${fileCount} 文件">📁 ${fileCount}</span>
      <span style="margin-left: 4px; color: #2ea043;" title="新增 ${additions} 行">+${additions}</span>
      <span style="margin-left: 4px; color: #f85149;" title="删除 ${deletions} 行">-${deletions}</span>
    `);
  } catch (error) {
    console.error('PR Booster: 获取详情失败', error);
  }
}

// 页面加载后增强显示
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhancePRList);
} else {
  enhancePRList();
}

// 监听页面动态变化（GitHub 是单页应用）
const observer = new MutationObserver(() => {
  enhancePRList();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('⚡ PR Booster 已激活');
