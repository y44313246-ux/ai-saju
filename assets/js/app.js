/* =========================================================================
 * 사주결 · app.js — 화면 조립과 상호작용
 * ========================================================================= */
(function () {
  'use strict';

  var C = window.SajuCore;
  var R = window.SajuReading;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var state = { calendar: 'solar', gender: 'female', chart: null };

  /* ------------------------------------------------------------ 폼 구성 */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function fillSelect(sel, items, placeholder) {
    var html = '';
    if (placeholder) html += '<option value="">' + placeholder + '</option>';
    items.forEach(function (it) {
      html += '<option value="' + it.value + '"' + (it.selected ? ' selected' : '') + '>' + it.label + '</option>';
    });
    sel.innerHTML = html;
  }

  function initForm() {
    var years = [];
    for (var y = 2025; y >= 1920; y--) years.push({ value: y, label: y + '년' });
    fillSelect($('#f-year'), years, '연도');

    var months = [];
    for (var m = 1; m <= 12; m++) months.push({ value: m, label: m + '월' });
    fillSelect($('#f-month'), months, '월');

    fillDays();

    var hours = [{ value: '', label: '시간 모름' }];
    for (var h = 0; h < 24; h++) {
      var branch = C.BRANCHES[Math.floor(((h + 1) % 24) / 2)];
      hours.push({ value: h, label: pad2(h) + '시 (' + branch + '시)' });
    }
    fillSelect($('#f-hour'), hours);

    $('#f-month').addEventListener('change', fillDays);
    $('#f-year').addEventListener('change', fillDays);

    // 양력 / 음력
    $('#seg-calendar').addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setSeg('#seg-calendar', btn);
      state.calendar = btn.dataset.value;
      $('#leap-wrap').hidden = state.calendar !== 'lunar';
      fillDays();
    });

    // 성별
    $('#seg-gender').addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setSeg('#seg-gender', btn);
      state.gender = btn.dataset.value;
    });

    $('#saju-form').addEventListener('submit', onSubmit);
  }

  function setSeg(sel, btn) {
    $$(sel + ' .seg-btn').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function fillDays() {
    var isLunar = state.calendar === 'lunar';
    var max = isLunar ? 30 : 31;
    var cur = $('#f-day').value;
    var days = [];
    for (var d = 1; d <= max; d++) days.push({ value: d, label: d + '일' });
    fillSelect($('#f-day'), days, '일');
    if (cur && +cur <= max) $('#f-day').value = cur;
  }

  /* ------------------------------------------------------------ 제출 */
  function showError(msg) {
    var el = $('#form-error');
    el.textContent = msg;
    el.hidden = false;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function onSubmit(e) {
    e.preventDefault();
    var err = $('#form-error');
    err.hidden = true;

    var year = +$('#f-year').value;
    var month = +$('#f-month').value;
    var day = +$('#f-day').value;
    if (!year || !month || !day) return showError('생년월일을 모두 선택해 주세요.');

    var hourVal = $('#f-hour').value;
    var input = {
      name: $('#f-name').value,
      gender: state.gender,
      calendar: state.calendar,
      leap: $('#f-leap').checked,
      year: year, month: month, day: day,
      hour: hourVal === '' ? null : +hourVal,
      minute: 0
    };

    var chart;
    try {
      chart = C.compute(input);
    } catch (ex) {
      return showError(ex.message || '생년월일을 확인해 주세요.');
    }

    state.chart = chart;
    render(chart);

    var result = $('#result');
    result.hidden = false;
    result.classList.remove('is-in');
    void result.offsetWidth;
    result.classList.add('is-in');
    setTimeout(function () {
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  /* ------------------------------------------------------------ 렌더 */
  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];

  function fmtDate(y, m, d) {
    var dt = new Date(y, m - 1, d);
    return y + '년 ' + m + '월 ' + d + '일 (' + WEEK[dt.getDay()] + ')';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(chart) {
    var name = chart.input.name;
    var today = C.today();
    var tp = C.pillarOfDate(today.y, today.m, today.d);
    var fortune = R.todayFortune(chart, tp);
    var profile = R.stemProfile(chart.dayMaster);
    var balance = R.elementBalance(chart.elements);

    $('#result-date').textContent = today.y + '.' + pad2(today.m) + '.' + pad2(today.d) + ' 오늘의 명식';
    $('#result-title').textContent = name ? name + '님의 사주' : '사주명식';

    var sub = [];
    sub.push('<strong>' + fmtDate(chart.solar.y, chart.solar.m, chart.solar.d) + '</strong>');
    sub.push(chart.hourKnown ? pad2(chart.input.hour) + '시' : '시간 모름');
    sub.push(chart.input.gender === 'male' ? '남성' : chart.input.gender === 'female' ? '여성' : '');
    sub.push(chart.input.calendar === 'lunar' ? '음력 ' + (chart.input.leap ? '윤' : '') + chart.input.month + '월 ' + chart.input.day + '일' : '양력');
    $('#result-sub').innerHTML = sub.filter(Boolean).join(' · ');

    /* 요약 */
    $('#master-hanja').textContent = C.STEMS_HANJA[chart.dayMaster];
    $('#master-name').textContent = C.STEMS[chart.dayMaster] + C.ELEMENTS[chart.dayMasterElem] +
      ' · ' + profile.title;
    $('#master-img').textContent = profile.image;
    $('#summary-headline').textContent = fortune.headline;
    $('#summary-text').textContent = fortune.summary;

    $('#gauge-num').textContent = fortune.score;
    var circle = $('#gauge-fg');
    circle.style.strokeDashoffset = 326.7;
    setTimeout(function () {
      circle.style.strokeDashoffset = (326.7 * (1 - fortune.score / 100)).toFixed(1);
    }, 240);

    var meta = [];
    meta.push(chart.zodiac + '띠');
    if (chart.lunar) meta.push('음력 ' + chart.lunar.m + '월 ' + chart.lunar.d + '일' + (chart.lunar.leap ? ' (윤달)' : ''));
    meta.push('일주 ' + chart.dayPillar.stemKo + chart.dayPillar.branchKo);
    meta.push('오행 ' + balance.strongest.ko + ' ' + balance.strongest.count + '개');
    if (balance.missing.length) meta.push(balance.missing.map(function (m) { return m.ko; }).join('·') + ' 없음');
    $('#summary-meta').innerHTML = meta.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');

    renderPillars(chart);
    renderElements(balance);
    renderNature(profile, chart);
    renderFortune(fortune, tp);
    updatePremium(chart);
  }

  function renderPillars(chart) {
    var html = chart.pillars.map(function (p) {
      return '' +
        '<div class="pillar' + (p.isMe ? ' is-me' : '') + '">' +
          (p.isMe ? '<span class="me-badge">나</span>' : '') +
          '<span class="p-label">' + p.label + '</span>' +
          '<span class="p-god">' + p.stemGod + '</span>' +
          '<div class="p-glyph"><b class="e' + p.stemElem + '">' + p.stemKo + '</b><i>' + p.stemHanja + '</i></div>' +
          '<div class="p-glyph"><b class="e' + p.branchElem + '">' + p.branchKo + '</b><i>' + p.branchHanja + '</i></div>' +
          '<span class="p-elem">' + C.ELEMENTS[p.stemElem] + ' · ' + C.ELEMENTS[p.branchElem] + (p.branchGod ? ' · ' + p.branchGod : '') + '</span>' +
        '</div>';
    });
    if (!chart.hourKnown) {
      html.push('<div class="pillar is-empty"><span class="p-label">시주</span><span class="p-god">—</span>' +
        '<div class="p-glyph"><b style="color:#B4AA9A">?</b><i>모름</i></div>' +
        '<div class="p-glyph"><b style="color:#B4AA9A">·</b><i>·</i></div>' +
        '<span class="p-elem">시간 미입력</span></div>');
    }
    $('#pillars').innerHTML = html.join('');
    $('#pillar-note').textContent = '자시(23시) 기준 · 절입 시각 반영';
    $('#pillar-caption').textContent = '일주 ' + chart.dayPillar.stemKo + chart.dayPillar.branchKo + '의 ' +
      C.STEMS[chart.dayMaster] + '이 나의 중심(일간)입니다. 같은 글자라도 계절과 짝에 따라 다르게 쓰입니다.';
  }

  function renderElements(balance) {
    var html = balance.rows.map(function (r) {
      var label = { '과다': '강함', '적정': '고름', '부족': '약함', '없음': '없음' }[r.state];
      return '' +
        '<div class="el-row">' +
          '<span class="el-name e' + r.elem + '">' + r.hanja + '<small>' + r.ko + '</small></span>' +
          '<span class="el-track"><span class="el-fill" data-w="' + (r.count === 0 ? 0 : Math.max(8, r.pct)) + '" style="background:linear-gradient(90deg,' + r.color + 'aa,' + r.color + ')"></span></span>' +
          '<span class="el-count"><b>' + r.count + '</b> · ' + label + '</span>' +
        '</div>';
    });
    $('#elements').innerHTML = html.join('');
    $('#element-note').textContent = '여덟 글자 기준';
    $('#element-summary').textContent = balance.summary;
    setTimeout(function () {
      $$('.el-fill').forEach(function (el) { el.style.width = el.dataset.w + '%'; });
    }, 120);
  }

  function renderNature(profile, chart) {
    $('#nature-keyword').textContent = profile.keywords.join(' · ');
    $('#nature-lead').innerHTML = C.STEMS_HANJA[chart.dayMaster] + ' ' + C.STEMS[chart.dayMaster] +
      ' — <em>' + esc(profile.image) + '</em>';
    $('#nature-body').textContent = profile.essence;
    $('#nature-strength').textContent = profile.strength;
    $('#nature-caution').textContent = profile.caution;
    $('#nature-fit').innerHTML = '<b>어울리는 자리</b> · ' + esc(profile.fit);
  }

  function renderFortune(fortune, tp) {
    var rows = [
      { key: 'money', name: '재물운', hanja: '財' },
      { key: 'love', name: '인연운', hanja: '緣' },
      { key: 'health', name: '건강운', hanja: '身' }
    ];
    $('#today-ganji').textContent = tp.ganjiText.replace('일 (', ' (');
    $('#fortune-list').innerHTML = rows.map(function (row) {
      var d = fortune.domains[row.key];
      return '' +
        '<div class="fortune-item">' +
          '<div class="f-head">' +
            '<span class="f-name">' + row.name + '<span>' + row.hanja + '</span></span>' +
            '<span class="f-score">' + d.score + '점</span>' +
          '</div>' +
          '<p class="f-text">' + esc(d.text) + '</p>' +
        '</div>';
    }).join('');
  }

  function updatePremium(chart) {
    var open = $('#preview-open');
    var title = $('#preview-title');
    var line = R.yearlyLine(chart, 2026);
    title.textContent = '2026 병오년 신년운세 · ' + (chart.input.name ? chart.input.name + '님' : '내 사주');
    open.textContent = line.split('. ')[0] + '.';
  }

  /* ------------------------------------------------------------ 결제 · 모달 */
  var PRODUCTS = {
    year2026: { name: '2026 신년운세', price: 19000 },
    deep: { name: '심층 사주 리포트', price: 39000 },
    bundle: { name: '신년 + 심층 패키지', price: 49000 }
  };

  $$('[data-product]').forEach(function (btn) {
    btn.addEventListener('click', function () { purchase(btn.dataset.product); });
  });

  function purchase(key) {
    var product = PRODUCTS[key];
    if (!state.chart) {
      toast('먼저 생년월일시를 입력해 사주를 열어 주세요.');
      document.getElementById('saju-form-section').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // 실제 연동 지점: /api/checkout → 토스페이먼츠·포트원 결제창 URL을 돌려받습니다.
    fetch('api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: key, chart: { dayMaster: state.chart.dayMaster, elements: state.chart.elements } })
    }).then(function (res) {
      if (!res.ok) throw new Error('checkout-unavailable');
      return res.json();
    }).then(function (data) {
      if (data && data.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
      openDemoModal(product);
    }).catch(function () { openDemoModal(product); });
  }

  function openDemoModal(product) {
    var body = '';
    body += '<p><strong>' + product.name + '</strong> · ' + product.price.toLocaleString('ko-KR') + '원</p>';
    if (state.chart) {
      var sample = R.reportSample(state.chart);
      body += '<div class="modal-sample">' + sample.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') + '</div>';
    }
    body += '<p class="modal-note">지금은 시안 단계라 결제창이 아직 연결되어 있지 않습니다. 실제 오픈 시 이 버튼에서 토스페이먼츠·포트원 결제창이 열리고, 결제가 끝나면 웹 열람 링크와 PDF가 발급됩니다. <br>연동 지점: <code>POST /api/checkout</code> → <code>POST /api/reading</code></p>';
    body += '<button class="btn-primary" type="button" data-close>확인</button>';
    showModal('심층 리포트 · 미리보기', body);
  }

  function showModal(title, html) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = html;
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    $$('#modal [data-close]').forEach(function (el) {
      el.addEventListener('click', closeModal, { once: true });
    });
  }

  function closeModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  });

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  $$('[data-todo]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      toast('시안 단계에서는 준비 중인 페이지입니다.');
    });
  });

  initForm();
})();
