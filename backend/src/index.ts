import { InterpretRequest, InterpretResponse, FollowUpInterpretRequest } from './types';
import { buildPrompt, buildFollowUpPrompt } from './prompts';
import { checkRateLimit, incrementRateLimit } from './rate-limit';

export interface Env {
  OPENAI_API_KEY: string;
  RATE_LIMIT: KVNamespace;
  APP_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-App-Key',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/rate-limit-status' && request.method === 'GET') {
      const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
      const key = `rate-limit:${clientIp}`;
      const data = await env.RATE_LIMIT.get(key, 'json') as { count: number; resetAt: number } | null;
      
      const now = Date.now();
      const limit = 30;
      
      let status: { ip: string; count: number; remaining: number; resetAt: string; isExpired: boolean };
      
      if (!data) {
        status = { ip: clientIp, count: 0, remaining: limit, resetAt: 'never', isExpired: true };
      } else if (now > data.resetAt) {
        status = { ip: clientIp, count: data.count, remaining: limit, resetAt: new Date(data.resetAt).toISOString(), isExpired: true };
      } else {
        status = { 
          ip: clientIp, 
          count: data.count, 
          remaining: Math.max(0, limit - data.count), 
          resetAt: new Date(data.resetAt).toISOString(),
          isExpired: false 
        };
      }
      
      return new Response(JSON.stringify(status), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (url.pathname === '/api/interpret' && request.method === 'POST') {
      const appKey = request.headers.get('X-App-Key');
      if (appKey !== env.APP_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitCheck = await checkRateLimit(env, clientIp);

      if (!rateLimitCheck.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded. 10 requests per day allowed.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      try {
        const body = (await request.json()) as InterpretRequest;

        if (!body.topic || !body.cards || !body.pattern || !body.locale) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        const prompt = buildPrompt(body);

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.text();
          console.error('OpenAI API error:', openaiResponse.status, errorData);
          return new Response(
            JSON.stringify({ error: 'OpenAI API error', status: openaiResponse.status, details: errorData }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        const openaiData = (await openaiResponse.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        const interpretation = openaiData.choices[0].message.content;

        await incrementRateLimit(env, clientIp);

        const response: InterpretResponse = { interpretation };
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    if (url.pathname === '/api/interpret-followup' && request.method === 'POST') {
      const appKey = request.headers.get('X-App-Key');
      if (appKey !== env.APP_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitCheck = await checkRateLimit(env, clientIp);

      if (!rateLimitCheck.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded. 10 requests per day allowed.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      try {
        const body = (await request.json()) as FollowUpInterpretRequest;

        if (!body.topic || !body.originalCards || !body.followUpCards || !body.userQuestion || !body.locale) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        const prompt = buildFollowUpPrompt(body);

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.text();
          console.error('OpenAI API error:', openaiResponse.status, errorData);
          return new Response(
            JSON.stringify({ error: 'OpenAI API error', status: openaiResponse.status, details: errorData }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        const openaiData = (await openaiResponse.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        const interpretation = openaiData.choices[0].message.content;

        await incrementRateLimit(env, clientIp);

        const response: InterpretResponse = { interpretation };
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    return new Response(JSON.stringify({ status: 'Taro AI API ready' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  },
};
