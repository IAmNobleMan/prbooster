// Cloudflare Worker - 后端API
// 部署到 Cloudflare Workers

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 激活高级功能
    if (path === '/activate' && request.method === 'POST') {
      return handleActivation(request, env, corsHeaders);
    }

    // AI代码审查
    if (path === '/ai-review' && request.method === 'POST') {
      return handleAIReview(request, env, corsHeaders);
    }

    // 批量操作
    if (path === '/batch-action' && request.method === 'POST') {
      return handleBatchAction(request, env, corsHeaders);
    }

    // 团队统计
    if (path === '/team-stats' && request.method === 'POST') {
      return handleTeamStats(request, env, corsHeaders);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

// 处理激活请求
async function handleActivation(request, env, corsHeaders) {
  try {
    const { code, userId } = await request.json();

    // 验证激活码（这里简化处理，实际应该从数据库或KV查询）
    if (!code || code.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: '无效的激活码' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 生成订阅信息
    const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1年
    const token = generateToken(userId, expiresAt);

    // 保存到 KV（可选）
    if (env.SUBSCRIPTIONS) {
      await env.SUBSCRIPTIONS.put(userId, JSON.stringify({
        status: 'premium',
        expiresAt,
        token
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiresAt,
        token,
        plan: 'annual'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// 处理AI代码审查
async function handleAIReview(request, env, corsHeaders) {
  try {
    // 验证token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '未授权' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { prUrl, diffContent } = await request.json();

    // 调用AI API（这里以OpenAI为例）
    const ifiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的代码审查助手。请分析以下PR的代码变更，提供具体的改进建议，包括潜在bug、性能优化、代码风格等。请用简洁明了的语言回复，用bullet points列出要点。'
          },
          {
            role: 'user',
            content: `PR链接: ${prUrl}\n\n代码变更:\n${diffContent}`
          }
        ],
        max_tokens: 1000
      })
    });

    const aiResult = await ifiResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        review: aiResult.choices[0].message.content
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// 处理批量操作
async function handleBatchAction(request, env, corsHeaders) {
  // 实现批量操作逻辑
  return new Response(
    JSON.stringify({ success: true, message: '批量操作已提交' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// 处理团队统计
async function handleTeamStats(request, env, corsHeaders) {
  // 实现团队统计逻辑
  return new Response(
    JSON.stringify({
      success: true,
      stats: {
        totalPRs: 42,
        mergedPRs: 38,
        averageMergeTime: '2.5h',
        topContributors: [
          { name: 'User1', prs: 15 },
          { name: 'User2', prs: 12 },
          { name: 'User3', prs: 10 }
        ]
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// 生成简单的token
function generateToken(userId, expiresAt) {
  const payload = { userId, expiresAt };
  return btoa(JSON.stringify(payload));
}
