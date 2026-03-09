// 付费功能模块

const API_ENDPOINT = 'https://api.prbooster.com'; // 待部署的后端API

// 检查订阅状态
export async function checkSubscription() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['subscription'], (data) => {
      const sub = data.subscription || { status: 'free' };

      // 检查是否过期
      if (sub.status === 'premium' && sub.expiresAt < Date.now()) {
        // 过期了，降级为免费版
        chrome.storage.local.set({
          subscription: { status: 'free' }
        });
        resolve({ status: 'free', expired: true });
      } else {
        resolve(sub);
      }
    });
  });
}

// 激活高级功能
export async function activatePremium(activationCode) {
  try {
    // 调用后端API验证激活码
    const response = await fetch(`${API_ENDPOINT}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: activationCode,
        userId: await getUserId()
      })
    });

    const result = await response.json();

    if (result.success) {
      // 保存订阅信息
      await chrome.storage.local.set({
        subscription: {
          status: 'premium',
          activatedAt: Date.now(),
          expiresAt: result.expiresAt,
          plan: result.plan
        }
      });

      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('激活失败:', error);
    return { success: false, error: error.message };
  }
}

// 获取用户ID
export async function getUserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userId'], (data) => {
      if (data.userId) {
        resolve(data.userId);
      } else {
        // 生成新用户ID
        const userId = 'user_' + Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({ userId }, () => {
          resolve(userId);
        });
      }
    });
  });
}

// AI 代码审查
export async function performAIReview(prUrl, diffContent) {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    throw new Error('此功能需要高级会员');
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/ai-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sub.token}`
      },
      body: JSON.stringify({
        prUrl,
        diffContent
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('AI审查失败:', error);
    throw error;
  }
}

// 批量操作PR
export async function batchAction(prUrls, action, params) {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    throw new Error('此功能需要高级会员');
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/batch-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sub.token}`
      },
      body: JSON.stringify({
        prUrls,
        action,
        params
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('批量操作失败:', error);
    throw error;
  }
}

// 获取团队统计
export async function getTeamStats(repoUrl, timeRange = '7d') {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    throw new Error('此功能需要高级会员');
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/team-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sub.token}`
      },
      body: JSON.stringify({
        repoUrl,
        timeRange
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('获取统计失败:', error);
    throw error;
  }
}
