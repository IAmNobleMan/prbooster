// 绑定升级按钮事件
document.getElementById('upgradeBtn').addEventListener('click', () => {
  chrome.tabs.create({
    url: 'https://github.com/prbooster/upgrade'
  });
});

// 加载统计数据
chrome.storage.local.get(['stats', 'subscription'], (data) => {
  const stats = data.stats || { weeklyPRs: 0, mergedPRs: 0 };
  const subscription = data.subscription || { status: 'free' };

  // 更新统计
  document.getElementById('prCount').textContent = stats.weeklyPRs;
  const rate = stats.weeklyPRs > 0 
    ? Math.round((stats.mergedPRs / stats.weeklyPRs) * 100) 
    : 0;
  document.getElementById('mergeRate').textContent = rate + '%';

  // 更新订阅状态
  const statusBadge = document.getElementById('statusBadge');
  const upgradeBtn = document.getElementById('upgradeBtn');

  if (subscription.status === 'premium') {
    statusBadge.textContent = '✨ 高级会员';
    statusBadge.classList.add('premium');
    upgradeBtn.textContent = '✅ 已激活高级功能';
    upgradeBtn.disabled = true;
  }
});

// 初始化时从当前页面获取数据
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url?.includes('github.com')) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getPRStats' }, (response) => {
      if (response?.stats) {
        chrome.storage.local.set({ stats: response.stats });
        document.getElementById('prCount').textContent = response.stats.weeklyPRs;
        const rate = response.stats.weeklyPRs > 0 
          ? Math.round((response.stats.mergedPRs / response.stats.weeklyPRs) * 100) 
          : 0;
        document.getElementById('mergeRate').textContent = rate + '%';
      }
    });
  }
});
