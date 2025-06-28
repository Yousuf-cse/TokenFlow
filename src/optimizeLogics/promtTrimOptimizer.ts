import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

const nlp = winkNLP(model);
const its = nlp.its as any;

const UNWANTED_POS = new Set([
  'INTJ', 'ADV', 'PRON', 'AUX', 'DET', 'PUNCT', 'PART', 'SCONJ', 'ADP'
]);

const FILLERS = new Set([
  'just', 'really', 'actually', 'maybe', 'perhaps', 'please',
  'somehow', 'simply', 'like', 'hey', 'what', 'can', 'could', 'okay'
]);

const SYNONYMS_MAP: Record<string, string> = {
  tell: 'explain',
  show: 'demonstrate',
  get: 'receive',
  help: 'assist',
  ask: 'inquire',
  good: 'excellent',
  bad: 'poor',
  start: 'begin',
  end: 'conclude'
};

export default function optimizePrompt(input: string): string {
  const doc = nlp.readDoc(input);
  const tokens: string[] = [];

  doc.tokens().each((token: any, i: number) => {
    const word = token.out(its.normal);
    const lemma = token.out(its.lemma);
    const pos = token.out(its.pos);
    const original = token.out();
    const isEntity = token.parentEntity() !== undefined;

    if (isEntity) {
      tokens.push(original);
      return;
    }

    if ((word === 'chatgpt' || word === 'gpt' || word === 'ai' || word === 'bot') && i <= 1) return;
    if (UNWANTED_POS.has(pos)) return;
    if (FILLERS.has(word)) return;

    const replacement = SYNONYMS_MAP[lemma] || SYNONYMS_MAP[word] || original;
    tokens.push(replacement);
  });

  return tokens
    .join(' ')
    .replace(/\s([.,!?;:])/g, '$1')
    .replace(/\bi\b/g, 'I')
    .trim();
}
