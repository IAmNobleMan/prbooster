// 欢迎页面交互脚本
console.log('welcome.js 已加载');

// 等待DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEventListeners);
} else {
  initEventListeners();
}

function initEventListeners() {
  console.log('初始化欢迎页面按钮...');

  const goToGithubBtn = document.getElementById('goToGithub');
  const viewDocsBtn = document.getElementById('viewDocs');
  const viewGuideBtn = document.getElementById('viewGuide');
  const feedbackBtn = document.getElementById('feedback');

  console.log('按钮元素状态:', {
    goToGithub: !!goToGithubBtn,
    viewDocs: !!viewDocsBtn,
    viewGuide: !!viewGuideBtn,
    feedback: !!feedbackBtn
  });

  if (!goToGithubBtn || !viewDocsBtn || !viewGuideBtn || !feedbackBtn) {
    console.error('未找到所有按钮元素');
    return;
  }

  goToGithubBtn.addEventListener('click', function() {
    console.log('点击前往 GitHub');
    openTab('https://github.com');
  });

  viewDocsBtn.addEventListener('click', function() {
    console.log('点击查看文档');
    const url = 'https://github.com/IAmNobleMan/prbooster/blob/main/README.md';
    openTab(url);
  });

  viewGuideBtn.addEventListener('click', function() {
    console.log('点击使用指南');
    showGuide();
  });

  feedbackBtn.addEventListener('click', function() {
    console.log('点击反馈建议');
    const url = 'https://github.com/IAmNobleMan/prbooster/issues';
    openTab(url);
  });

  console.log('欢迎页面按钮初始化完成');
}

function openTab(url) {
  if (chrome && chrome.tabs) {
    chrome.tabs.create({ url: url }, function(tab) {
      console.log('已打开标签:', url);
      if (chrome.runtime.lastError) {
        console.error('chrome.tabs.create 错误:', chrome.runtime.lastError);
        window.open(url, '_blank');
      }
    });
  } else {
    console.log('使用 window.open');
    window.open(url, '_blank');
  }
}

function showGuide() {
  const modal = document.createElement('div');
  modal.className = 'guide-modal';
  modal.innerHTML = `
    <h2>🎓 快速开始</h2>
    <div class="steps">
      <p><strong>1. 访问 GitHub</strong><br>打开任意仓库的 Pull Requests 页面</p>
      <p><strong>2. 查看增强功能</strong><br>每个 PR 会显示文件数、新增行、删除行</p>
      <p><strong>3. 使用统计面板</strong><br>点击插件图标查看本周 PR 统计</p>
      <p><strong>4. 解锁高级功能</strong><br>升级到高级版，获得 AI 审查等更多功能</p>
    </div>
    <button class="close-btn">开始使用</button>
  `;

  const overlay = document.createElement('div');
  overlay.className = 'guide-overlay';

  modal.querySelector('.close-btn').addEventListener('click', function() {
    modal.remove();
    overlay.remove();
  });

  overlay.addEventListener('click', function() {
    modal.remove();
    overlay.remove();
  });

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
}
