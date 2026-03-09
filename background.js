// 背景服务脚本

// 监听安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('⚡ PR Booster 已安装');

    // 打开欢迎页面
    chrome.tabs.create({
      url: 'https://github.com/prbooster/welcome'
    });
  }
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkSubscription') {
    // 检查订阅状态（这里简化处理）
    chrome.storage.local.get(['subscription'], (data) => {
      sendResponse({
        status: data.subscription?.status || 'free',
        premium: data.subscription?.status === 'premium'
      });
    });
    return true; // 保持消息通道开启
  }

  if (request.action === 'activatePremium') {
    // 激活高级功能（需要后端验证）
    activatePremium(request.code, sendResponse);
    return true;
  }
});

// 激活高级功能
async function activatePremium(code, callback) {
  try {
    // 这里应该调用后端 API 验证激活码
    // 暂时模拟成功
    const subscription = {
      status: 'premium',
      activatedAt: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1年
    };

    await chrome.storage.local.set({ subscription });
    callback({ success: true });
  } catch (error) {
    callback({ success: false, error: error.message });
  }
}

// 定期同步统计数据（每小时一次）
setInterval(() => {
  chrome.storage.local.get(['stats'], (data) => {
    if (data.stats) {
      // 可以在这里同步到后端
      console.log('同步统计数据:', data.stats);
    }
  });
}, 60 * 60 * 1000);
