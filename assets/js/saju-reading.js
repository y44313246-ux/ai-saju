/* =========================================================================
 * 사주결 · 해석 엔진 (saju-reading.js)
 * 계산된 명식을 사람의 말로 옮깁니다. 모든 문장은 규칙 기반으로 생성됩니다.
 * ========================================================================= */
(function (global) {
  'use strict';

  var C = global.SajuCore;

  /* ------------------------------------------------------------ 천간 성향 */
  var STEM_PROFILE = [
    { // 0 갑
      image: '하늘로 곧게 뻗는 큰 나무',
      title: '곧은 기둥',
      keywords: ['시작', '소신', '성장'],
      essence: '한 번 방향을 정하면 뿌리부터 끝까지 곧게 자라는 사람입니다. 판을 여는 자리, 처음 시작하는 일에서 힘이 나고, 원칙과 명분을 중요하게 여깁니다. 누군가에게 기대기보다 스스로 서려는 마음이 커서 겉은 담담해도 속은 단단합니다.',
      strength: '추진력과 소신이 분명해, 남들이 망설이는 자리에서 먼저 문을 엽니다.',
      caution: '곧게만 가려다 꺾이기 쉽습니다. 때로는 한 발 물러나 흐름에 몸을 맡기는 지혜가 필요합니다.',
      fit: '기획·창업, 교육, 사람을 세우는 일'
    },
    { // 1 을
      image: '담장을 타고 오르는 덩굴',
      title: '휘어지는 지혜',
      keywords: ['적응', '감각', '끈기'],
      essence: '어디에 놓여도 환경에 맞춰 길을 찾아내는 사람입니다. 부드러워 보이지만 포기하지 않는 끈질김이 있고, 사람 사이의 미묘한 감정을 잘 읽습니다. 정면으로 밀기보다 돌아가는 길에서 더 강해집니다.',
      strength: '분위기를 읽는 감각이 좋아, 어려운 자리에서도 관계를 살려 냅니다.',
      caution: '눈치를 보다 속마음을 삼킬 때가 있습니다. 원하는 것을 조금 더 분명히 말해도 괜찮습니다.',
      fit: '디자인, 영업, 사람과 사람을 잇는 일'
    },
    { // 2 병
      image: '한낮에 높이 뜬 해',
      title: '환한 기세',
      keywords: ['열정', '표현', '리더십'],
      essence: '숨기는 것 없이 환하게 드러내는 사람입니다. 감정도 의욕도 크게 표현하고, 그 자리에 있는 것만으로 분위기를 밝힙니다. 앞장서서 사람을 모으고 판을 키우는 재주가 있습니다.',
      strength: '표현이 시원시원해 사람들이 내 편이 되기 쉽습니다.',
      caution: '기세가 오르면 한 번에 다 써버리기 쉽고, 말이 앞서 상처를 줄 수 있습니다. 속도를 조절하면 오래 갑니다.',
      fit: '방송·콘텐츠, 마케팅, 무대 위의 일'
    },
    { // 3 정
      image: '어둠을 밝히는 촛불',
      title: '조용한 열',
      keywords: ['집중', '섬세', '통찰'],
      essence: '조용하지만 마음속에 식지 않는 열이 있는 사람입니다. 겉으로 크게 드러내지 않으면서도 한곳에 깊이 집중하고, 사람과 사람 사이의 온도를 섬세하게 살핍니다. 작은 것에서 의미를 찾는 눈이 있습니다.',
      strength: '한 가지를 파고드는 집중력이 남다르고, 사람의 마음을 정확히 짚어냅니다.',
      caution: '혼자 삭히는 일이 많습니다. 온도가 떨어지기 전에 밖으로 꺼내 놓는 연습이 필요합니다.',
      fit: '연구·분석, 상담, 손끝의 기술'
    },
    { // 4 무
      image: '흔들리지 않는 산',
      title: '묵직한 중심',
      keywords: ['안정', '신뢰', '포용'],
      essence: '쉽게 동요하지 않고 사람을 품는 사람입니다. 말보다 행동으로 신뢰를 쌓고, 맡은 자리를 지키는 책임감이 큽니다. 급하게 몰아붙이기보다 흐름을 기다릴 줄 아는 여유가 있습니다.',
      strength: '어려운 때일수록 중심을 잡아 주어, 사람들이 자연스럽게 기대게 됩니다.',
      caution: '무게를 지키다 변화의 때를 놓칠 수 있습니다. 지금 옮겨야 할 짐과 내려놓을 짐을 구분해 보세요.',
      fit: '관리·운영, 부동산, 조직을 지키는 일'
    },
    { // 5 기
      image: '곡식을 기르는 밭',
      title: '살리는 손길',
      keywords: ['실무', '배려', '조율'],
      essence: '사람을 살리는 재주가 있는 현실가입니다. 겉은 조용해도 속으로 필요한 것을 정확히 계산하고, 상대가 무엇을 원하는지 빨리 알아챕니다. 돌보고 챙기는 손길이 자연스러워 주변에 사람이 끊이지 않습니다.',
      strength: '실제로 굴러가게 만드는 힘이 있습니다. 계획을 현실로 옮기는 데 강합니다.',
      caution: '남의 몫까지 떠안고 혼자 지치기 쉽습니다. 도움을 청하는 것도 능력입니다.',
      fit: '경영지원, 기획·조정, 돌봄과 교육'
    },
    { // 6 경
      image: '불로 다듬지 않은 원석',
      title: '단호한 칼날',
      keywords: ['결단', '추진', '의리'],
      essence: '결단이 빠르고 앞뒤가 분명한 사람입니다. 옳고 그름을 가리는 감각이 날카롭고, 한번 마음먹으면 밀고 나가는 힘이 있습니다. 사람을 가리지 않고 솔직하게 말해, 싫어도 믿을 수 있는 사람이 됩니다.',
      strength: '복잡한 상황을 한 번에 정리하는 결단력이 있습니다.',
      caution: '칼날이 앞서면 관계에 흠이 남습니다. 같은 말도 각을 세우지 않고 건네는 연습이 약이 됩니다.',
      fit: '영업·협상, 개발, 판을 정리하는 일'
    },
    { // 7 신
      image: '정교하게 세공된 보석',
      title: '높은 기준',
      keywords: ['완성도', '안목', '집요함'],
      essence: '기준이 높고 손끝이 정교한 사람입니다. 겉으로는 담담해 보여도 자기 일에 대한 자부심이 강하고, 어설픈 것을 견디지 못합니다. 감각이 좋아 무엇이 좋은 것인지 빠르게 알아봅니다.',
      strength: '디테일에서 차이를 만듭니다. 마무리가 깔끔해 결과물이 오래 남습니다.',
      caution: '스스로에게도 남에게도 엄격해 마음이 상하기 쉽습니다. 90%도 충분히 훌륭하다는 것을 기억하세요.',
      fit: '디자인, 브랜딩, 정밀한 전문직'
    },
    { // 8 임
      image: '큰 바다로 흐르는 강',
      title: '큰 그릇',
      keywords: ['지혜', '포용', '확장'],
      essence: '그릇이 크고 흐름을 읽는 사람입니다. 작은 일에 매이기보다 큰 그림을 그리고, 여러 사람의 이야기를 담아낼 수 있습니다. 움직임이 자연스러워 어디에 놓여도 길을 찾습니다.',
      strength: '사람과 정보를 모아 크게 굴리는 힘이 있습니다.',
      caution: '흐름을 따르다 방향을 잃을 수 있습니다. 지금 내가 어디로 가는지 한 번씩 확인해 보세요.',
      fit: '사업·전략, 무역·유통, 사람을 잇는 일'
    },
    { // 9 계
      image: '조용히 스며드는 이슬비',
      title: '섬세한 촉',
      keywords: ['직관', '감수성', '스며듦'],
      essence: '섬세하고 직관이 밝은 사람입니다. 말하지 않아도 분위기로 많은 것을 읽고, 작은 변화를 먼저 알아챕니다. 겉은 부드러워도 속은 생각이 많고 깊어, 조용히 오래 곁을 지키는 사람입니다.',
      strength: '상대의 감정을 미리 알아채는 촉이 있어, 위로가 필요한 자리에 정확히 나타납니다.',
      caution: '생각이 많아 스스로를 소모하기 쉽습니다. 느낌을 짧게라도 기록해 두면 마음이 가벼워집니다.',
      fit: '글쓰기, 상담·심리, 감각을 다루는 일'
    }
  ];

  /* ------------------------------------------------------------ 오행 해석 */
  var ELEMENT_META = [
    { ko: '목', hanja: '木', color: '#3E7C59', key: '성장과 시작',
      excess: '새로 시작하려는 마음이 앞서 계획이 여러 갈래로 벌어지기 쉽습니다. 하나를 끝까지 붙드는 힘이 관건입니다.',
      lack: '새로운 일을 여는 힘이 약해질 수 있습니다. 아침에 몸을 깨우는 산책이나 초록을 곁에 두는 습관이 보충이 됩니다.' },
    { ko: '화', hanja: '火', color: '#B4453A', key: '열정과 표현',
      excess: '감정의 온도가 높아지고 말과 행동이 빨라집니다. 열이 오를수록 한 박자 쉬어 가는 것이 오래 갑니다.',
      lack: '속에 있는 것을 밖으로 꺼내는 일이 버거울 수 있습니다. 좋아하는 것을 소리 내어 말하는 연습이 약이 됩니다.' },
    { ko: '토', hanja: '土', color: '#A98045', key: '중심과 신뢰',
      excess: '책임을 지려는 마음이 커져 짐이 무거워집니다. 모든 것을 다 떠안지 않아도 괜찮습니다.',
      lack: '중심이 흔들려 결정을 미루기 쉽습니다. 생활의 리듬을 일정하게 만드는 것만으로도 크게 달라집니다.' },
    { ko: '금', hanja: '金', color: '#8A8A8A', key: '결단과 완성',
      excess: '기준이 날카로워지고 잘라내는 힘이 강해집니다. 정리와 결단에는 좋지만, 사람에게는 조금 부드러워도 됩니다.',
      lack: '마무리와 결단이 늦어질 수 있습니다. 작은 일부터 "정하면 지킨다"를 반복해 보세요.' },
    { ko: '수', hanja: '水', color: '#2F5D7C', key: '지혜와 흐름',
      excess: '생각이 많아지고 감정이 깊어집니다. 머릿속을 종이에 옮겨 두면 훨씬 가벼워집니다.',
      lack: '쉬어 가는 힘이 부족해 소모가 쌓입니다. 물을 자주 마시고, 혼자 조용한 시간을 짧게라도 확보하세요.' }
  ];

  /* ------------------------------------------------------------ 유틸 */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }
  function pick(arr, seed) { return arr[seed % arr.length]; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function stemProfile(stem) { return STEM_PROFILE[stem]; }

  function elementBalance(counts) {
    var total = counts.reduce(function (a, b) { return a + b; }, 0) || 1;
    var rows = counts.map(function (n, i) {
      var pct = Math.round((n / total) * 100);
      var state;
      if (n === 0) state = '없음';
      else if (n >= 3) state = '과다';
      else if (n === 2) state = '적정';
      else state = '부족';
      return { elem: i, ko: ELEMENT_META[i].ko, hanja: ELEMENT_META[i].hanja,
        color: ELEMENT_META[i].color, count: n, pct: pct, state: state };
    });
    var missing = rows.filter(function (r) { return r.count === 0; });
    var strongest = rows.slice().sort(function (a, b) { return b.count - a.count; })[0];
    var summary;
    if (!missing.length) {
      summary = '다섯 기운이 모두 있습니다. 어느 하나에 치우치지 않아 상황에 따라 유연하게 힘을 쓸 수 있는 명식입니다.';
    } else if (missing.length === 1) {
      summary = missing[0].ko + '의 기운이 비어 있습니다. ' + ELEMENT_META[missing[0].elem].lack;
    } else {
      summary = missing.map(function (r) { return r.ko; }).join('·') + '의 기운이 비어 있습니다. 비어 있는 자리는 약점이라기보다, 의식해서 채워 갈 때 인생이 넓어지는 지점입니다.';
    }
    return { rows: rows, missing: missing, strongest: strongest, summary: summary };
  }

  /* ------------------------------------------------------------ 오늘의 운세 */
  var YUKHAP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  var SAMHAP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
  var HYEONG = [[2, 5, 8], [1, 10, 7], [0, 3]];
  var HAE = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
  var WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];

  function hasPair(list, a, b) {
    return list.some(function (g) {
      return g.indexOf(a) !== -1 && g.indexOf(b) !== -1 && a !== b;
    });
  }

  function branchRelation(a, b) {
    if (a === b) return { type: 'self', label: '같은 기운' };
    if (hasPair(YUKHAP, a, b)) return { type: 'yukhap', label: '육합' };
    if (hasPair(SAMHAP, a, b)) return { type: 'samhap', label: '삼합' };
    if (Math.abs(a - b) === 6) return { type: 'chung', label: '충' };
    if (hasPair(HYEONG, a, b)) return { type: 'hyeong', label: '형' };
    if (hasPair(WONJIN, a, b)) return { type: 'wonjin', label: '원진' };
    if (hasPair(HAE, a, b)) return { type: 'hae', label: '해' };
    return { type: 'none', label: '무관' };
  }

  function stemRelation(me, tg) {
    if (me === tg) return '비화';
    if ((me + 1) % 5 === tg) return '아생';
    if ((tg + 1) % 5 === me) return '생아';
    if ((me + 2) % 5 === tg) return '아극';
    return '극아';
  }

  var STEM_REL_TEXT = {
    비화: '나와 같은 기운이 하루를 덮습니다. 내 색이 진해지는 만큼 고집도 세지기 쉬우니, 양보할 곳을 미리 정해 두면 편안합니다.',
    아생: '내 기운이 밖으로 흘러나가는 날입니다. 표현하고 베풀수록 인연이 남지만, 다 쏟고 나면 저녁이 비어 버리니 힘을 아껴 쓰세요.',
    생아: '나를 채워 주는 기운이 들어옵니다. 도움을 청하기 좋은 날이고, 미뤄 둔 부탁이 있다면 오늘이 적기입니다.',
    아극: '내가 다루고 거두는 기운이 들어옵니다. 성과를 챙기고 정리하기에 좋지만, 사람까지 재단하는 눈이 되지 않도록 하세요.',
    극아: '나를 눌러 다스리는 기운이 작동합니다. 압박이 느껴져도 규칙을 지키면 오히려 인정받는 하루가 됩니다.'
  };

  var BRANCH_REL_TEXT = {
    self: '일지가 같은 기운을 만나 익숙한 리듬이 이어집니다. 편하지만 고집이 세지기 쉬운 날입니다.',
    yukhap: '일지가 합을 이루어 사람과 일이 부드럽게 붙습니다. 미뤄 둔 연락을 꺼내기 좋습니다.',
    samhap: '세 기운이 모이는 삼합 — 여럿이 힘을 합치는 일에 운이 실립니다.',
    chung: '일지가 충을 이뤄 흔들림이 있습니다. 큰 결정은 하루쯤 미루는 편이 낫습니다.',
    hyeong: '형(刑)의 기운이 있어 말과 서류를 한 번 더 확인하게 됩니다. 서두르면 틈이 생깁니다.',
    wonjin: '원진의 기운 — 괜히 서운한 마음이 올라올 수 있습니다. 감정은 하루 뒤에 꺼내 보세요.',
    hae: '해(害)의 기운이 있어 도우려던 일이 오히려 짐이 될 수 있습니다. 선을 지키는 것이 배려입니다.',
    none: '특별한 마찰 없이 평소 리듬대로 흘러가는 날입니다.'
  };

  var MONEY_TEXT = {
    high: ['재물의 문이 열려 있는 날입니다. 들어오는 돈을 확인하고, 미뤄 둔 수금이나 정산을 오늘 처리해 보세요.',
      '돈이 도는 결이 좋습니다. 다만 벌기만 하고 새는 곳을 모르면 남지 않으니, 나가는 돈도 함께 살펴보세요.'],
    mid: ['큰 변화보다 지키는 쪽이 유리합니다. 지출은 한 번 더 따져 보고, 작은 이득은 그냥 흘려보내지 마세요.',
      '무난한 하루입니다. 새로 벌이기보다 이미 가진 것을 정리하면 숫자가 조금 더 좋아집니다.'],
    low: ['지갑이 열리기 쉬운 날입니다. 충동구매와 즉석 제안은 하루만 미뤄 두세요.',
      '재물의 결이 고르지 않습니다. 누구를 위해 쓰는 돈인지 한 번 물어보고 결정하면 후회가 적습니다.']
  };

  var LOVE_TEXT = {
    high: ['말이 잘 통하는 날입니다. 전하고 싶었던 마음이 있다면 오늘 꺼내 보세요.',
      '사람의 온도가 올라갑니다. 함께하는 자리에서 예상보다 좋은 인연을 만날 수 있습니다.'],
    mid: ['평소처럼 곁을 지키는 것이 가장 좋습니다. 상대의 말을 끝까지 듣는 것만으로 관계가 깊어집니다.',
      '오해가 생겨도 바로 풀 수 있는 날입니다. 다만 짧은 메시지보다는 목소리가 낫습니다.'],
    low: ['감정이 앞서기 쉬운 날입니다. 하고 싶은 말이 있으면 하루 묵혔다가 꺼내 보세요.',
      '상대의 사정을 헤아릴 여유가 필요한 하루입니다. 지금은 조용히 곁에 있는 것이 답입니다.']
  };

  var HEALTH_TEXT = {
    high: ['기운이 도는 하루입니다. 미뤄 둔 운동을 시작하기 좋고, 몸을 쓰면 오히려 머리가 맑아집니다.',
      '몸의 리듬이 좋습니다. 조금 무리해도 회복이 빠른 날이니 그 기운을 하나 남겨 두세요.'],
    mid: ['무난하지만 자세와 수면이 관건입니다. 늦은 시간의 야식과 화면은 줄이는 것이 좋습니다.',
      '컨디션은 평소와 비슷합니다. 물을 조금 더 마시고, 오래 앉아 있었다면 일어나 걸어 보세요.'],
    low: ['몸이 보내는 작은 신호를 놓치지 마세요. 무리한 일정보다 일찍 쉬는 쪽이 이득입니다.',
      '기운이 얕은 하루입니다. 커피로 버티기보다 짧은 낮잠이나 산책으로 채우는 편이 낫습니다.']
  };

  function band(score) { return score >= 74 ? 'high' : score >= 56 ? 'mid' : 'low'; }

  function todayFortune(chart, tp) {
    var meElem = chart.dayMasterElem;
    var tgElem = C.STEM_ELEM[tp.day.stem];
    var rel = stemRelation(meElem, tgElem);
    var brel = branchRelation(chart.dayPillar.branch, tp.day.branch);
    var seed = hash('' + chart.dayMaster + tp.day.stem + tp.day.branch + (chart.dayPillar.branch));

    var base = { '비화': 68, '아생': 71, '생아': 80, '아극': 77, '극아': 60 }[rel];
    var branchAdj = { self: 0, yukhap: 10, samhap: 8, chung: -15, hyeong: -8, wonjin: -4, hae: -6, none: 2 }[brel.type];
    var score = clamp(base + branchAdj + (seed % 7) - 3, 38, 96);

    var god = C.tenGodName(chart.dayMaster, tp.day.stem);
    var moneyMod = 0, loveMod = 0, healthMod = 0;
    if (god === '편재' || god === '정재') { moneyMod = 12; loveMod = -2; }
    if (god === '식신' || god === '상관') { moneyMod = 4; loveMod = 6; healthMod = 2; }
    if (god === '편관' || god === '정관') { loveMod = -4; healthMod = -6; moneyMod = 6; }
    if (god === '편인' || god === '정인') { healthMod = 8; loveMod = 4; moneyMod = -6; }
    if (god === '비견' || god === '겁재') { moneyMod = -8; loveMod = 2; }

    var money = clamp(score + moneyMod + (seed % 5) - 2, 30, 97);
    var love = clamp(score + loveMod + ((seed >> 3) % 5) - 2, 30, 97);
    var health = clamp(score + healthMod + ((seed >> 6) % 5) - 2, 30, 97);

    var headline;
    if (score >= 86) headline = '기운이 크게 실리는 하루';
    else if (score >= 74) headline = '부드럽게 풀리는 하루';
    else if (score >= 62) headline = '평소의 리듬이면 충분한 하루';
    else if (score >= 50) headline = '한 걸음 천천히 가는 하루';
    else headline = '잠시 쉬어가도 좋은 하루';

    var summary = STEM_REL_TEXT[rel] + ' ' + BRANCH_REL_TEXT[brel.type];

    return {
      date: tp.solar,
      ganji: tp.ganjiText,
      dayStem: tp.day,
      stemRelation: rel,
      branchRelation: brel,
      tenGod: god,
      score: score,
      headline: headline,
      summary: summary,
      domains: {
        money: { score: money, text: pick(MONEY_TEXT[band(money)], seed) },
        love: { score: love, text: pick(LOVE_TEXT[band(love)], seed >> 2) },
        health: { score: health, text: pick(HEALTH_TEXT[band(health)], seed >> 4) }
      }
    };
  }

  /* ------------------------------------------------------------ 신년운세 맛보기 */
  var YEAR_INFO = {
    2026: { stem: 2, branch: 6, name: '병오(丙午)' },
    2027: { stem: 3, branch: 7, name: '정미(丁未)' }
  };

  function yearlyLine(chart, year) {
    var info = YEAR_INFO[year];
    if (!info) return '';
    var rel = stemRelation(chart.dayMasterElem, C.STEM_ELEM[info.stem]);
    var brel = branchRelation(chart.dayPillar.branch, info.branch);
    var t = {
      비화: '나와 같은 기운이 크게 들어오는 해입니다. 내 뜻대로 밀어붙이기 좋지만, 사람과의 속도 차이를 살펴야 합니다.',
      아생: '내가 밖으로 베푸는 해입니다. 만들고 표현하는 일이 성과로 이어지지만, 체력의 총량을 계산해 두어야 합니다.',
      생아: '나를 도와주는 기운이 들어오는 해입니다. 귀인과 후원을 만나기 좋고, 배움에 투자하면 오래 남습니다.',
      아극: '내가 거두는 해입니다. 성과와 재물을 챙기기 좋지만, 관계를 숫자로 재지 않도록 주의하세요.',
      극아: '나를 다스리는 기운이 강한 해입니다. 압박이 크지만 그만큼 단단해집니다. 규칙과 절차가 방패가 됩니다.'
    }[rel];
    var b = {
      self: '일지가 같은 기운을 만나 익숙한 흐름이 이어집니다.',
      yukhap: '일지가 합을 이루니 인연과 협력의 문이 열립니다.',
      samhap: '삼합이 성립해 여럿이 함께하는 일에 힘이 실립니다.',
      chung: '일지가 충을 맞아 이동과 변화가 많은 해입니다. 큰 결정은 서두르지 마세요.',
      hyeong: '형의 기운이 있어 말과 계약에서 세심함이 필요합니다.',
      wonjin: '원진의 기운 — 가까운 사이에서 서운함이 쌓이지 않도록 마음을 자주 꺼내세요.',
      hae: '해의 기운이 있어 도움과 방해가 교차합니다. 선을 분명히 하는 것이 좋습니다.',
      none: '지지의 마찰은 크지 않아 흐름을 타기 좋습니다.'
    }[brel.type];
    return t + ' ' + b;
  }

  /* ------------------------------------------------------------ 리포트 샘플 */
  function reportSample(chart) {
    var p = STEM_PROFILE[chart.dayMaster];
    var yearLine = yearlyLine(chart, 2026);
    var name = chart.input.name ? chart.input.name + ' 님' : '당신';
    return [
      name + '의 일간은 ' + C.STEMS_HANJA[chart.dayMaster] + ' ' + C.STEMS[chart.dayMaster] + ', ' + p.image + '입니다. ' + p.essence,
      '2026년 병오년은 ' + yearLine + ' 상반기에는 ' + (chart.elements[2] >= 2 ? '쌓아 둔 것을 세상에 꺼내 놓는 일' : '기반을 다지는 일') + '에 힘을 쓰고, 하반기에는 ' + (chart.elements[3] >= 2 ? '정리와 결단' : '사람을 통해 넓히는 일') + '에서 결실을 보게 됩니다.'
    ];
  }

  global.SajuReading = {
    STEM_PROFILE: STEM_PROFILE,
    ELEMENT_META: ELEMENT_META,
    stemProfile: stemProfile,
    elementBalance: elementBalance,
    todayFortune: todayFortune,
    yearlyLine: yearlyLine,
    reportSample: reportSample,
    branchRelation: branchRelation
  };
})(window);
