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
    // 模拟AI审查响应（实际应该调用后端API）
    return {
      success: true,
      review: generateMockReview(diffContent)
    };
  } catch (error) {
    console.error('AI审查失败:', error);
    throw error;
  }
}

// 生成模拟AI审查结果
function generateMockReview(diffContent) {
  const suggestions = [
    '建议添加单元测试以验证此功能',
    '注意检查空值处理和边界条件',
    '可以考虑使用更高效的算法来优化性能',
    '代码注释可以更详细一些，方便后续维护',
    '建议将魔法数字提取为常量',
    '变量命名可以更语义化',
    '考虑使用 Promise/async 替代回调',
    '建议添加错误处理逻辑'
  ];

  const randomSuggestions = suggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 2);

  return `
**🤖 AI 代码审查建议**

${randomSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}

---
*此功能由 PR CodeLens AI 提供*
  `.trim();
}

// 批量操作PR
export async function batchAction(prUrls, action, params) {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    throw new Error('此功能需要高级会员');
  }

  try {
    // 模拟批量操作
    const results = prUrls.map(url => ({
      url,
      success: true,
      message: `${action} 成功`
    }));

    return {
      success: true,
      results,
      total: prUrls.length,
      successful: prUrls.length
    };
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
    // 模拟团队统计数据
    return {
      success: true,
      stats: {
        totalPRs: Math.floor(Math.random() * 50) + 10,
        mergedPRs: Math.floor(Math.random() * 30) + 5,
        averageMergeTime: `${Math.floor(Math.random() * 8) + 2}小时`,
        mergeRate: `${Math.floor(Math.random() * 30) + 60}%`,
        topContributors: [
          { name: 'developer1', prs: Math.floor(Math.random() * 10) + 5 },
          { name: 'developer2', prs: Math.floor(Math.random() * 8) + 3 },
          { name: 'developer3', prs: Math.floor(Math.random() * 6) + 2 }
        ]
      }
    };
  } catch (error) {
    console.error('获取统计失败:', error);
    throw error;
  }
}

// 获取PR模板
export async function getPRTemplates() {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    throw new Error('此功能需要高级会员');
  }

  return {
    success: true,
    templates: [
      {
        id: 'bugfix',
        name: 'Bug修复',
        template: `## 问题描述
描述这个bug是什么，如何复现

## 修复方案
说明如何修复了这个bug

## 测试
说明测试方法`
      },
      {
        id: 'feature',
        name: '新功能',
        template: `## 功能描述
描述这个新功能的作用

## 实现方式
说明实现方案和技术细节

## 测试说明
如何测试这个新功能`
      },
      {
        id: 'refactor',
        name: '代码重构',
        template: `## 重构目的
说明为什么需要重构

## 重构内容
列出重构的具体内容

## 影响范围
说明重构可能影响的模块`
      }
    ]
  };
}

// 保存PR模板
export async function savePRTemplate(template) {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    throw new Error('此功能需要高级会员');
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['prTemplates'], (data) => {
      const templates = data.prTemplates || [];
      templates.push(template);
      chrome.storage.local.set({ prTemplates: templates }, () => {
        resolve({ success: true, template });
      });
    });
  });
}

// 删除PR模板
export async function deletePRTemplate(templateId) {
  const sub = await checkSubscription();
  if (sub.status !== 'premium') {
    throw new Error('此功能需要高级会员');
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['prTemplates'], (data) => {
      const templates = (data.prTemplates || []).filter(t => t.id !== templateId);
      chrome.storage.local.set({ prTemplates: templates }, () => {
        resolve({ success: true });
      });
    });
  });
}
