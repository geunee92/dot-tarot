import { InterpretRequest } from './types';

const TOPIC_LABELS: Record<string, { ko: string; en: string }> = {
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

  const cardDescriptions = request.cards
    .map((card) => {
      const orientationLabel = ORIENTATION_LABELS[card.orientation]?.[request.locale] || card.orientation;
      const keywordsStr = card.keywords.join(', ');
      return `- ${card.position}: ${card.cardName} (${orientationLabel}) - ${keywordsStr}`;
    })
    .join('\n');

  if (isKorean) {
    return `당신은 따뜻하고 친근한 타로 리더입니다. 오랜 친구처럼 편안하게 이야기하며, 통찰력 있는 해석을 제공합니다.

말투 가이드:
- "~해요", "~예요" 체를 사용해주세요
- 카드 이름을 자연스럽게 언급해주세요 (예: "여사제 카드가 나왔네요")
- 딱딱한 설명 대신 친근한 조언처럼 말해주세요
- 키워드를 직접 나열하지 말고, 의미를 자연스럽게 녹여주세요

주제: ${topicLabel}
스프레드: ${request.pattern}
${request.userQuestion ? `질문: ${request.userQuestion}` : ''}

뽑힌 카드:
${cardDescriptions}

위 카드들을 바탕으로 ${topicLabel}에 대해 따뜻하고 실용적인 해석을 2-3문단으로 해주세요. 마치 친한 언니/오빠가 조언해주듯이 자연스럽게 말해주세요.`;
  }

  return `You are a warm, friendly tarot reader speaking like a trusted friend.

Style guide:
- Speak conversationally and warmly
- Mention card names naturally (e.g., "The High Priestess shows up here")
- Give advice like a caring friend, not a formal reading
- Weave keywords into your interpretation naturally

Topic: ${topicLabel}
Spread: ${request.pattern}
${request.userQuestion ? `Question: ${request.userQuestion}` : ''}

Cards drawn:
${cardDescriptions}

Provide a warm, practical interpretation about ${topicLabel} in 2-3 paragraphs, as if giving friendly advice.`;
}
