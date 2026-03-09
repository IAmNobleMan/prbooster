// 升级页面交互脚本
console.log('upgrade.js 已加载');

// 等待DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEventListeners);
} else {
  initEventListeners();
}

function initEventListeners() {
  console.log('初始化升级页面按钮...');

  const subscribeBtn = document.getElementById('subscribeBtn');
  const backBtn = document.getElementById('backBtn');
  const qrClose = document.getElementById('qrClose');

  console.log('按钮元素状态:', {
    subscribe: !!subscribeBtn,
    back: !!backBtn,
    qrClose: !!qrClose
  });

  if (!subscribeBtn || !backBtn || !qrClose) {
    console.error('未找到所有按钮元素');
    return;
  }

  subscribeBtn.addEventListener('click', function() {
    console.log('点击立即升级');
    showPaymentModal();
  });

  backBtn.addEventListener('click', function() {
    console.log('点击返回免费版');
    closeCurrentTab();
  });

  qrClose.addEventListener('click', function() {
    console.log('点击取消支付');
    document.getElementById('qrModal').classList.remove('active');
  });

  console.log('升级页面按钮初始化完成');
}

function generateQRCode() {
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect fill="#000" x="0" y="0" width="200" height="200"/>
      <rect fill="#fff" x="10" y="10" width="30" height="30"/>
      <rect fill="#fff" x="50" y="10" width="30" height="30"/>
      <rect fill="#fff" x="90" y="10" width="30" height="30"/>
      <rect fill="#fff" x="130" y="10" width="30" height="30"/>
      <rect fill="#fff" x="170" y="10" width="30" height="30"/>

      <rect fill="#fff" x="10" y="50" width="30" height="30"/>
      <rect fill="#fff" x="50" y="50" width="30" height="30"/>
      <rect fill="#fff" x="90" y="50" width="30" height="30"/>
      <rect fill="#fff" x="130" y="50" width="30" height="30"/>
      <rect fill="#fff" x="170" y="50" width="30" height="30"/>

      <rect fill="#fff" x="10" y="90" width="30" height="30"/>
      <rect fill="#fff" x="50" y="90" width="30" height="30"/>
      <rect fill="#fff" x="90" y="90" width="30" height="30"/>
      <rect fill="#fff" x="130" y="90" width="30" height="30"/>
      <rect fill="#fff" x="170" y="90" width="30" height="30"/>

      <text x="100" y="140" text-anchor="middle" fill="#fff" font-size="20">支付宝支付</text>
      <text x="100" y="170" text-anchor="middle" fill="#fff" font-size="14">¥9.00</text>
    </svg>
  `)}`;
}

function showPaymentModal() {
  const qrImage = document.getElementById('qrImage');
  const modal = document.getElementById('qrModal');

  modal.classList.add('active');
  qrImage.innerHTML = `<img src="${generateQRCode()}" alt="支付宝支付二维码">`;

  // 模拟支付成功
  setTimeout(function() {
    activatePremium();
  }, 3000);
}

function closeCurrentTab() {
  if (chrome && chrome.tabs) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.remove(tabs[0].id);
      }
    });
  } else {
    window.close();
  }
}

function activatePremium() {
  const subscription = {
    status: 'premium',
    activatedAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    plan: 'monthly'
  };

  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ subscription }, function() {
      document.getElementById('qrModal').classList.remove('active');
      alert('✅ 升级成功！感谢您的支持');

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.url?.startsWith('https://github.com')) {
          chrome.tabs.reload(tabs[0].id);
        } else {
          chrome.tabs.create({ url: 'https://github.com' });
        }
      });

      setTimeout(function() {
        closeCurrentTab();
      }, 1000);
    });
  } else {
    alert('✅ 升级成功！（演示模式）');
    window.close();
  }
}
