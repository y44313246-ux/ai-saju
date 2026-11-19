/**
 * 사주 리포트 프롬프트 빌더
 * 명식 요약을 사람이 읽는 형태로 정리해 모델에 넘깁니다.
 */

const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ELEMENTS = ['목', '화', '토', '금', '수'];

export const SYSTEM_PROMPT = `당신은 20년 경력의 한국 명리 상담가입니다.
규칙:
- 전통 명리(자평명리) 용어를 쓰되, 처음 나올 때 한 줄로 풀어 설명합니다.
- 단정적 예언, 공포 조장, 의료·법률·투자 조언은 하지 않습니다.
- '당신' 대신 손님의 이름(없으면 '당신')을 사용하고, 따뜻하지만 과장 없는 문체로 씁니다.
- 각 장은 400~700자, 문단 2~3개로 구성합니다.
- 근거가 되는 명식 요소(일간, 오행, 합·충)를 문장 안에서 한 번 이상 언급합니다.
- 출력은 반드시 지정된 JSON 스키마를 따릅니다.`;

export function buildChartSummary(chart) {
  if (!chart) return '';
  const pillars = (chart.pillars || []).map((p) => {
    return `${p.label}: ${p.stemHanja}${p.branchHanja}(${p.stemKo}${p.branchKo}) 천간 ${ELEMENTS[p.stemElem]} / 지지 ${ELEMENTS[p.branchElem]} / 십성 ${p.stemGod}`;
  }).join('\n');

  const elems = (chart.elements || []).map((n, i) => `${ELEMENTS[i]} ${n}`).join(', ');

  return [
    `이름: ${chart.name || '미입력'}`,
    `성별: ${chart.gender === 'male' ? '남성' : chart.gender === 'female' ? '여성' : '미입력'}`,
    `양력 생년월일: ${chart.solar?.y}-${chart.solar?.m}-${chart.solar?.d}${chart.hour != null ? ` ${chart.hour}시` : ' (시간 모름)'}`,
    `사주팔자:\n${pillars}`,
    `일간: ${HANJA[chart.dayMaster]} ${STEMS[chart.dayMaster]} (${ELEMENTS[chart.dayMasterElem]})`,
    `오행 분포: ${elems}`
  ].join('\n');
}

export function buildUserPrompt(chart, product = 'deep') {
  const summary = buildChartSummary(chart);
  const schema = `{
  "greeting": "한 문장 인사",
  "sections": [
    {"id": "core", "title": "타고난 그릇", "body": "..."},
    {"id": "year", "title": "2026 병오년 총평", "body": "..."},
    {"id": "wealth", "title": "재물운", "body": "..."},
    {"id": "career", "title": "직업운", "body": "..."},
    {"id": "love", "title": "인연운", "body": "..."},
    {"id": "months", "title": "월별 캘린더", "body": "1월~12월을 한 줄씩"}
  ],
  "closing": "마무리 한 문단"
}`;
  const scope = product === 'year2026'
    ? '이번 요청은 2026 신년운세 단품입니다. sections 중 year, wealth, career, love 네 장만 채우고 나머지는 빈 문자열로 두세요.'
    : '심층 사주 리포트 전체 여섯 장을 작성하세요.';

  return `${summary}\n\n${scope}\n\n아래 JSON 스키마로만 답하세요:\n${schema}`;
}
