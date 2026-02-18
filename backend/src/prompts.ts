import { InterpretRequest, FollowUpInterpretRequest } from './types';

const TOPIC_LABELS: Record<string, { ko: string; en: string }> = {
  GENERAL: { ko: '일반', en: 'general' },
  LOVE: { ko: '연애', en: 'love' },
  MONEY: { ko: '재정', en: 'finances' },
  WORK: { ko: '커리어', en: 'career' },
};

const ORIENTATION_LABELS: Record<string, { ko: string; en: string }> = {
  upright: { ko: '정위치', en: 'upright' },
  reversed: { ko: '역위치', en: 'reversed' },
};

export function buildPrompt(request: InterpretRequest): string {
  const isKorean = request.locale === 'ko';
  const topicLabel = TOPIC_LABELS[request.topic]?.[request.locale] || request.topic;
  const isGeneral = request.topic === 'GENERAL';

  const cardDescriptions = request.cards
    .map((card) => {
      const orientationLabel = ORIENTATION_LABELS[card.orientation]?.[request.locale] || card.orientation;
      const keywordsStr = card.keywords.join(', ');
      return `- ${card.position}: ${card.cardName} (${orientationLabel}) - ${keywordsStr}`;
    })
    .join('\n');

  if (isKorean) {
    if (isGeneral) {
      return `당신은 픽셀 세계의 신비로운 점술사입니다. 막연한 고민을 안고 찾아온 의뢰인에게 철학적이고 성찰적인 해석을 제공합니다.

말투 가이드:
- "~해요", "~예요" 체를 사용해주세요
- 신비롭고 은유적인 표현을 사용해주세요
- 구체적 행동 지침보다 내면의 성찰을 유도하세요
- 카드의 상징적 의미를 깊이 있게 탐구해주세요

의뢰 유형: 떠돌이 의뢰 (막연한 고민)
스프레드: ${request.pattern}

뽑힌 카드:
${cardDescriptions}

의뢰인은 특별한 질문 없이 찾아왔어요. 카드가 보여주는 전체적인 흐름과 메시지를 2-3문단으로 해석해주세요. 추상적이지만 의미 있는 통찰을 전해주세요.`;
    }

    return `당신은 픽셀 세계의 전문 점술사입니다. ${topicLabel} 전문 의뢰를 받았습니다. 의뢰인의 구체적 질문에 맞춰 실용적이고 행동 지향적인 해석을 제공합니다.

말투 가이드:
- "~해요", "~예요" 체를 사용해주세요
- 카드 이름을 자연스럽게 언급해주세요
- 의뢰인의 질문에 초점을 맞춰 구체적으로 조언해주세요
- 키워드를 직접 나열하지 말고, 의미를 자연스럽게 녹여주세요

의뢰 유형: ${topicLabel} 전문 의뢰
스프레드: ${request.pattern}
${request.userQuestion ? `의뢰인의 질문: ${request.userQuestion}` : ''}

뽑힌 카드:
${cardDescriptions}

위 카드들을 바탕으로 ${topicLabel}에 대해 따뜻하고 실용적인 해석을 2-3문단으로 해주세요. 마치 친한 언니/오빠가 조언해주듯이 자연스럽게 말해주세요.`;
  }

  if (isGeneral) {
    return `You are a mysterious oracle in a pixel world. A wandering client has come to you with vague concerns, seeking philosophical insight.

Style guide:
- Speak mysteriously and poetically
- Use metaphorical, reflective language
- Focus on inner reflection rather than specific action items
- Explore the symbolic depth of each card

Consultation type: Wandering Client (vague concerns)
Spread: ${request.pattern}

Cards drawn:
${cardDescriptions}

The client has come without a specific question. Interpret the overall flow and message shown by the cards in 2-3 paragraphs. Provide abstract but meaningful insights.`;
  }

  return `You are a specialist oracle in a pixel world, handling ${topicLabel} consultations. Provide practical, actionable interpretations tailored to the client's specific question.

Style guide:
- Speak conversationally and warmly
- Mention card names naturally
- Focus on the client's question with specific, actionable advice
- Weave keywords into your interpretation naturally

Consultation type: ${topicLabel} Specialist Consultation
Spread: ${request.pattern}
${request.userQuestion ? `Client's question: ${request.userQuestion}` : ''}

Cards drawn:
${cardDescriptions}

Provide a warm, practical interpretation about ${topicLabel} in 2-3 paragraphs, as if giving friendly advice.`;
}

export function buildFollowUpPrompt(request: FollowUpInterpretRequest): string {
  const isKorean = request.locale === 'ko';
  const topicLabel = TOPIC_LABELS[request.topic]?.[request.locale] || request.topic;

  const originalCardDescriptions = request.originalCards
    .map((card) => {
      const orientationLabel = ORIENTATION_LABELS[card.orientation]?.[request.locale] || card.orientation;
      const keywordsStr = card.keywords.join(', ');
      return `- ${card.position}: ${card.cardName} (${orientationLabel}) - ${keywordsStr}`;
    })
    .join('\n');

  const followUpCardDescriptions = request.followUpCards
    .map((card) => {
      const orientationLabel = ORIENTATION_LABELS[card.orientation]?.[request.locale] || card.orientation;
      const keywordsStr = card.keywords.join(', ');
      return `- ${card.position}: ${card.cardName} (${orientationLabel}) - ${keywordsStr}`;
    })
    .join('\n');

  if (isKorean) {
    return `당신은 따뜻하고 친근한 점술사입니다. 오랜 친구처럼 편안하게 이야기하며, 통찰력 있는 해석을 제공합니다.

사용자가 기존 의뢰에 대해 추가 질문을 했어요. 원래 의뢰의 맥락을 이해한 뒤, 새로 뽑은 3장의 카드로 더 깊은 해석을 2-3문단으로 해주세요.

주제: ${topicLabel}

[원래 의뢰]
스프레드: ${request.originalPattern}
${request.originalInterpretation ? `해석: ${request.originalInterpretation}` : ''}

원래 카드:
${originalCardDescriptions}

[추가 질문]
${request.userQuestion}

[새로 뽑은 카드]
${followUpCardDescriptions}

위 맥락을 바탕으로 따뜻하고 실용적인 추가 해석을 2-3문단으로 해주세요.`;
  }

  return `You are a warm, friendly oracle speaking like a trusted friend.

The user has a follow-up question about their consultation. Understand the original consultation context, then interpret the 3 new cards (Depth, Hidden, Outcome) in 2-3 paragraphs.

Topic: ${topicLabel}

[Original Consultation]
Spread: ${request.originalPattern}
${request.originalInterpretation ? `Interpretation: ${request.originalInterpretation}` : ''}

Original cards:
${originalCardDescriptions}

[Follow-up Question]
${request.userQuestion}

[New Cards]
${followUpCardDescriptions}

Based on the above context, provide a warm, practical follow-up interpretation in 2-3 paragraphs.`;
}
