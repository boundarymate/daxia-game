// ============================================================
//  大侠模拟器 · UI 控制器
// ============================================================

const UI = {

  selectedTraits: [],      // 已选人物特质 id 列表
  selectedBgs: {},         // 已选背景特质 { tag: id }，每类只能选一个
  selectedGender: 'male',
  currentTab: 'actions',
  questSubTab: 'available',  // 'available' | 'active' | 'bounty'
  pendingEvent: null,
  traitCatFilter: '全部',  // 当前人物特质分类筛选
  bgCatFilter: '出身',     // 当前背景特质分类筛选
  INIT_POINTS: 20,         // 初始点数

  // ── 计算当前剩余点数 ──────────────────────────────────────
  calcPoints() {
    let pts = this.INIT_POINTS;
    this.selectedTraits.forEach(id => {
      const t = DATA.TRAITS.find(x => x.id === id);
      if (t) pts -= t.cost;
    });
    Object.values(this.selectedBgs).forEach(id => {
      const b = DATA.BACKGROUNDS.find(x => x.id === id);
      if (b) pts -= b.cost;
    });
    return pts;
  },

  // ── 显示创建界面 ──────────────────────────────────────────
  showCreate() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('create-screen').style.display = 'block';
    this.renderTraitCategoryTabs();
    this.renderTraitGrid();
    this.renderBgCategoryTabs();
    this.renderBgGrid();
    this.updatePointDisplay();
    this.updateAttrPreview();
  },

  setGender(g) {
    this.selectedGender = g;
    document.getElementById('btn-male').classList.toggle('active', g === 'male');
    document.getElementById('btn-female').classList.toggle('active', g === 'female');
  },

  // ── 人物特质分类标签 ──────────────────────────────────────
  renderTraitCategoryTabs() {
    const cats = ['全部', ...new Set(DATA.TRAITS.map(t => t.tag))];
    document.getElementById('trait-tabs').innerHTML = cats.map(cat => {
      const count = this.selectedTraits.filter(id => {
        const t = DATA.TRAITS.find(x => x.id === id);
        return cat === '全部' || (t && t.tag === cat);
      }).length;
      return `<button class="cat-tab ${this.traitCatFilter === cat ? 'active' : ''}" onclick="UI.setTraitCat('${cat}')">
        ${cat}<span class="cat-count">${count > 0 ? count : ''}</span>
      </button>`;
    }).join('');
  },

  setTraitCat(cat) {
    this.traitCatFilter = cat;
    this.renderTraitCategoryTabs();
    this.renderTraitGrid();
  },

  // ── 渲染人物特质卡片 ──────────────────────────────────────
  renderTraitGrid() {
    const pts = this.calcPoints();
    const filtered = DATA.TRAITS.filter(t =>
      this.traitCatFilter === '全部' || t.tag === this.traitCatFilter
    );
    document.getElementById('trait-grid').innerHTML = filtered.map(t => {
      const isPos = t.cost > 0;
      const isNeg = t.cost < 0;
      const selected = this.selectedTraits.includes(t.id);
      // 点数不足时禁用正面特质（但已选的不禁用）
      const wouldCost = t.cost - (selected ? t.cost : 0);
      const disabled = isPos && !selected && pts < t.cost;
      const costLabel = isPos ? `-${t.cost}` : `+${Math.abs(t.cost)}`;
      const costCls = isPos ? 'cost-pos' : 'cost-neg';
      const cardCls = [
        'trait-card',
        isNeg ? 'negative' : 'positive',
        selected ? 'selected' : '',
        disabled ? 'disabled' : '',
      ].filter(Boolean).join(' ');
      return `
        <div class="${cardCls}" id="tc_${t.id}" onclick="UI.toggleTrait('${t.id}')">
          <span class="trait-cost-badge ${costCls}">${costLabel}</span>
          <div class="trait-name" style="padding-right:36px;">${t.name}</div>
          <div class="trait-desc">${t.desc}</div>
          <div class="trait-bonus">${this._bonusStr(t.bonus)}</div>
        </div>`;
    }).join('');
  },

  toggleTrait(id) {
    const t = DATA.TRAITS.find(x => x.id === id);
    if (!t) return;
    const idx = this.selectedTraits.indexOf(id);
    if (idx >= 0) {
      // 取消选择
      this.selectedTraits.splice(idx, 1);
    } else {
      // 检查点数是否足够
      const pts = this.calcPoints();
      if (t.cost > 0 && pts < t.cost) {
        this.toast(`点数不足！需要 ${t.cost} 点，剩余 ${pts} 点`);
        return;
      }
      this.selectedTraits.push(id);
    }
    this.renderTraitCategoryTabs();
    this.renderTraitGrid();
    this.updatePointDisplay();
    this.updateAttrPreview();
  },

  // ── 背景特质分类标签 ──────────────────────────────────────
  renderBgCategoryTabs() {
    const cats = ['出身', '经历', '际遇'];
    document.getElementById('bg-tabs').innerHTML = cats.map(cat => {
      const selected = this.selectedBgs[cat];
      const selName = selected ? DATA.BACKGROUNDS.find(x => x.id === selected)?.name : '';
      return `<button class="cat-tab ${this.bgCatFilter === cat ? 'active' : ''}" onclick="UI.setBgCat('${cat}')">
        ${cat}${selName ? `<span class="cat-count"> · ${selName}</span>` : ''}
      </button>`;
    }).join('');
  },

  setBgCat(cat) {
    this.bgCatFilter = cat;
    this.renderBgCategoryTabs();
    this.renderBgGrid();
  },

  // ── 渲染背景特质卡片 ──────────────────────────────────────
  renderBgGrid() {
    const pts = this.calcPoints();
    const filtered = DATA.BACKGROUNDS.filter(b => b.tag === this.bgCatFilter);
    document.getElementById('bg-grid').innerHTML = filtered.map(b => {
      const isPos = b.cost > 0;
      const selected = this.selectedBgs[b.tag] === b.id;
      const disabled = isPos && !selected && pts < b.cost;
      const costLabel = isPos ? `-${b.cost}` : `+${Math.abs(b.cost)}`;
      const costCls = isPos ? 'cost-pos' : 'cost-neg';
      const cardCls = [
        'trait-card',
        b.cost < 0 ? 'negative' : 'positive',
        selected ? 'selected' : '',
        disabled ? 'disabled' : '',
      ].filter(Boolean).join(' ');
      return `
        <div class="${cardCls}" id="bc_${b.id}" onclick="UI.toggleBg('${b.id}')">
          <span class="trait-cost-badge ${costCls}">${costLabel}</span>
          <div class="trait-name" style="padding-right:36px;">${b.name}</div>
          <div class="trait-desc">${b.desc}</div>
          <div class="trait-bonus">${this._bonusStr(b.bonus)}</div>
        </div>`;
    }).join('');
  },

  toggleBg(id) {
    const b = DATA.BACKGROUNDS.find(x => x.id === id);
    if (!b) return;
    // 同类已选则取消，否则替换
    if (this.selectedBgs[b.tag] === id) {
      delete this.selectedBgs[b.tag];
    } else {
      // 检查点数（先退还旧的，再花费新的）
      const oldId = this.selectedBgs[b.tag];
      const oldCost = oldId ? (DATA.BACKGROUNDS.find(x => x.id === oldId)?.cost || 0) : 0;
      const pts = this.calcPoints() + oldCost; // 退还旧的后的点数
      if (b.cost > 0 && pts < b.cost) {
        this.toast(`点数不足！需要 ${b.cost} 点，退还旧选择后剩余 ${pts} 点`);
        return;
      }
      this.selectedBgs[b.tag] = id;
    }
    this.renderBgCategoryTabs();
    this.renderBgGrid();
    this.updatePointDisplay();
    this.updateAttrPreview();
  },

  // ── 更新分数显示 ──────────────────────────────────────────
  updatePointDisplay() {
    const pts = this.calcPoints();
    const el = document.getElementById('point-value');
    el.textContent = pts;
    el.className = 'point-value' + (pts < 0 ? ' danger' : pts === 0 ? ' zero' : '');
    // 确认按钮状态
    const btn = document.getElementById('confirm-btn');
    if (btn) {
      const bgSelected = Object.keys(this.selectedBgs).length;
      const canConfirm = pts >= 0 && bgSelected === 3;
      btn.disabled = !canConfirm;
      btn.title = !canConfirm ? (pts < 0 ? '点数超支！' : '请为出身、经历、际遇各选一个背景特质') : '';
    }
  },

  updateAttrPreview() {
    const base = {
      hp:100, innerPower:10, strength:10, agility:10,
      endurance:10, perception:10, charm:10, swordSkill:0,
      speed:10, luck:10, gold:50, morality:50
    };
    this.selectedTraits.forEach(tid => {
      const t = DATA.TRAITS.find(x => x.id === tid);
      if (t) Object.keys(t.bonus).forEach(k => { if (k in base) base[k] += t.bonus[k]; });
    });
    Object.values(this.selectedBgs).forEach(bid => {
      const b = DATA.BACKGROUNDS.find(x => x.id === bid);
      if (b) Object.keys(b.bonus).forEach(k => { if (k in base) base[k] += b.bonus[k]; });
    });

    const labels = {
      hp:'气血', innerPower:'内力', strength:'力量', agility:'身法',
      endurance:'体魄', perception:'悟性', charm:'魅力', swordSkill:'剑术',
      luck:'运气', gold:'银两', morality:'道德'
    };
    const preview = document.getElementById('attr-preview');
    preview.innerHTML = Object.entries(labels).map(([k, label]) => {
      const val = Math.max(0, base[k] || 0);
      const isLow = val < 10;
      const isHigh = val > 50;
      const color = isHigh ? 'var(--gold-light)' : isLow ? 'var(--red-light)' : 'var(--text)';
      return `
        <div style="background:var(--bg-card);border:1px solid var(--border);padding:8px 6px;border-radius:2px;text-align:center;">
          <div style="font-size:10px;color:var(--text-muted);">${label}</div>
          <div style="font-size:17px;color:${color};margin-top:2px;font-weight:700;">${val}</div>
        </div>`;
    }).join('');
  },

  confirmCreate() {
    const name = document.getElementById('char-name').value.trim() || '无名侠客';
    const pts = this.calcPoints();
    if (pts < 0) { this.toast('点数超支，请调整特质选择'); return; }
    const bgTags = Object.keys(this.selectedBgs);
    if (!bgTags.includes('出身')) { this.toast('请选择一个出身背景'); return; }
    if (!bgTags.includes('经历')) { this.toast('请选择一个经历背景'); return; }
    if (!bgTags.includes('际遇')) { this.toast('请选择一个际遇背景'); return; }

    const allSelected = [...this.selectedTraits, ...Object.values(this.selectedBgs)];
    Engine.newGame(name, this.selectedGender, this.selectedTraits, Object.values(this.selectedBgs));
    document.getElementById('create-screen').style.display = 'none';
    document.getElementById('game-screen').classList.add('active');
    this.render();
    this.toast('踏入江湖，一切从这里开始！');
  },

  // ── 主渲染 ────────────────────────────────────────────────
  render() {
    const s = Engine.state;
    if (!s) return;

    // 顶部状态栏
    document.getElementById('top-name').textContent = s.name;
    document.getElementById('top-realm').textContent = Engine.getRealm().name;
    document.getElementById('top-hp').textContent = `${s.hp}/${s.maxHp}`;
    document.getElementById('top-inner').textContent = s.innerPower;
    document.getElementById('top-rep').textContent = s.reputation;
    document.getElementById('top-gold').textContent = s.gold;
    document.getElementById('top-energy').textContent = s.energy;
    document.getElementById('top-time').textContent = `第${s.year}年${s.month}月 · 年龄${s.age}岁`;

    // 季节显示
    const seasonEl = document.getElementById('top-season');
    if (seasonEl) {
      const season = Engine.getSeason ? Engine.getSeason() : null;
      seasonEl.textContent = season ? `${season.icon}${season.name}` : '';
    }

    // 称号显示
    const titleEl = document.getElementById('top-title');
    if (titleEl) {
      if (s.activeTitle) {
        const title = DATA.TITLES.find(t => t.id === s.activeTitle);
        if (title) {
          titleEl.textContent = `「${title.name}」`;
          titleEl.style.display = 'inline';
        }
      } else {
        titleEl.style.display = 'none';
      }
    }

    // 属性条
    this.renderStatBars();

    // 道德条
    const moralPct = s.morality;
    document.getElementById('moral-cursor').style.left = moralPct + '%';
    document.getElementById('evil-val').textContent = s.evil;

    // 武功列表
    this.renderMartialList();

    // 武器列表
    this.renderWeaponList();

    // 门派信息
    this.renderSectInfo();

    // 手下列表
    this.renderFollowerList();

    // 地点信息
    this.renderLocation();

    // 当前标签页
    this.renderCurrentTab();

    // 日志
    this.renderLog();

    // 检查结局（含扩展结局）
    const ending = Engine.checkEnding ? Engine.checkEnding() : null;
    if (ending) this.showEnding(ending);
    // 扩展结局
    if (s.ending && !this._shownExtraEnding) {
      this._shownExtraEnding = s.ending.id;
      setTimeout(() => this.showExtraEnding(s.ending), 500);
    }

    // B: 武林大会行动提示
    this._tournamentActive = Engine.isTournamentActive ? Engine.isTournamentActive() : false;

    // K: 天气显示
    this._renderWeather();

    // R: 重伤状态显示
    this._renderInjuryStatus();

    // 统一弹窗队列：收集所有待弹出的弹窗，逐一排队显示
    this._queuePendingModals();
  },

  // ── 统一弹窗队列管理 ─────────────────────────────────────
  _queuePendingModals() {
    const s = Engine.state;
    if (!this._modalQueue) this._modalQueue = [];
    if (!this._modalShownKeys) this._modalShownKeys = new Set();

    // 清理已完成的弹窗 key（state 中对应字段已清空时移除）
    if (!s.pendingBreakthrough) {
      [...this._modalShownKeys].filter(k => k.startsWith('bt_')).forEach(k => this._modalShownKeys.delete(k));
    }
    if (!s.pendingRichEvent) {
      [...this._modalShownKeys].filter(k => k.startsWith('rich_')).forEach(k => this._modalShownKeys.delete(k));
    }
    if (!s.pendingEraEvent) {
      [...this._modalShownKeys].filter(k => k.startsWith('era_')).forEach(k => this._modalShownKeys.delete(k));
    }

    // 收集所有待显示的弹窗（按优先级排序）
    const candidates = [];

    // 随机事件（最高优先级）
    if (this.pendingEvent) {
      candidates.push({ key: 'event_' + (this.pendingEvent.id || 'rand'), fn: () => {
        const ev = this.pendingEvent;
        this.pendingEvent = null;
        this.showEventModal(ev);
      }});
    }

    // C: 奇遇
    const pendingHE = Engine.getPendingHiddenEvent ? Engine.getPendingHiddenEvent() : null;
    if (pendingHE) {
      candidates.push({ key: 'he_' + pendingHE.id, fn: () => this.showHiddenEventModal(pendingHE) });
    } else {
      this._modalShownKeys.delete && [...this._modalShownKeys].filter(k => k.startsWith('he_')).forEach(k => this._modalShownKeys.delete(k));
    }

    // J: 年代事件
    if (s.pendingEraEvent) {
      const era = (DATA.ERA_EVENTS || []).find(e => e.id === s.pendingEraEvent);
      if (era) candidates.push({ key: 'era_' + era.id, fn: () => this.showEraEventModal(era) });
    }

    // G: 事件链
    const activeChains = s.activeChains || {};
    const chainIds = Object.keys(activeChains);
    if (chainIds.length > 0) {
      candidates.push({ key: 'chain_' + chainIds[0], fn: () => this._checkPendingChains() });
    }

    // L: 境界突破
    if (s.pendingBreakthrough) {
      const bt = (DATA.BREAKTHROUGH_EVENTS || []).find(b => b.id === s.pendingBreakthrough);
      if (bt) candidates.push({ key: 'bt_' + bt.id, fn: () => this.showBreakthroughModal(bt) });
    }

    // S: 富事件
    if (s.pendingRichEvent) {
      candidates.push({ key: 'rich_' + s.pendingRichEvent.eventId, fn: () => this.showRichEventModal() });
    }

    // 过滤掉已经显示过的
    const newCandidates = candidates.filter(c => !this._modalShownKeys.has(c.key));
    if (newCandidates.length === 0) return;

    // 如果当前有弹窗正在显示，加入队列等待
    const hasOpenModal = document.querySelector('.modal-overlay[style*="flex"]');
    if (hasOpenModal) {
      // 把新的候选加入队列（去重）
      newCandidates.forEach(c => {
        if (!this._modalQueue.find(q => q.key === c.key)) {
          this._modalQueue.push(c);
        }
      });
      return;
    }

    // 没有弹窗，显示第一个
    const first = newCandidates[0];
    this._modalShownKeys.add(first.key);
    setTimeout(() => first.fn(), 200);
  },

  // 弹窗关闭后调用，显示队列中的下一个
  _processModalQueue() {
    if (!this._modalQueue || this._modalQueue.length === 0) return;
    const hasOpenModal = document.querySelector('.modal-overlay[style*="flex"]');
    if (hasOpenModal) return;
    const next = this._modalQueue.shift();
    if (next) {
      if (!this._modalShownKeys) this._modalShownKeys = new Set();
      this._modalShownKeys.add(next.key);
      setTimeout(() => next.fn(), 200);
    }
  },

  // ── 天气显示 ─────────────────────────────────────────────
  _renderWeather() {
    const s = Engine.state;
    let el = document.getElementById('weather-badge');
    if (!el) {
      // 在季节旁边插入天气徽章
      const seasonEl = document.getElementById('top-season');
      if (seasonEl && seasonEl.parentNode) {
        el = document.createElement('span');
        el.id = 'weather-badge';
        el.style.cssText = 'font-size:11px;color:var(--blue-light);margin-left:6px;cursor:pointer;';
        el.title = '当前天气';
        seasonEl.parentNode.insertBefore(el, seasonEl.nextSibling);
      }
    }
    if (el && Engine.getWeather) {
      const w = Engine.getWeather();
      el.textContent = `${w.icon}${w.name}`;
      el.title = w.desc;
    }
  },

  // ── 重伤状态显示 ─────────────────────────────────────────
  _renderInjuryStatus() {
    const s = Engine.state;
    let el = document.getElementById('injury-badge');
    if (!el) {
      const topBar = document.getElementById('top-hp') ? document.getElementById('top-hp').parentNode : null;
      if (topBar) {
        el = document.createElement('span');
        el.id = 'injury-badge';
        el.style.cssText = 'font-size:11px;color:var(--red-light);margin-left:8px;font-weight:bold;';
        topBar.appendChild(el);
      }
    }
    if (el) {
      if (s.isInjured) {
        el.textContent = `🩸重伤(${s.injuredMonthsLeft}月)`;
        el.style.display = 'inline';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    }
  },

  renderStatBars() {
    const s = Engine.state;
    const stats = [
      { key:'hp',         label:'气血', max:s.maxHp,  cls:'hp-fill' },
      { key:'innerPower', label:'内力', max:1000,      cls:'inner-fill' },
      { key:'strength',   label:'力量', max:200,       cls:'str-fill' },
      { key:'agility',    label:'身法', max:200,       cls:'agi-fill' },
      { key:'endurance',  label:'体魄', max:200,       cls:'end-fill' },
      { key:'perception', label:'悟性', max:200,       cls:'per-fill' },
      { key:'charm',      label:'魅力', max:200,       cls:'chm-fill' },
      { key:'swordSkill', label:'剑术', max:300,       cls:'swd-fill' },
    ];

    // 战力评级
    const power = Engine._calcCombatPower ? Engine._calcCombatPower() : 0;
    const powerGrade = power >= 300 ? { label:'绝世高手', color:'#ff6b35' } :
                       power >= 200 ? { label:'一流高手', color:'var(--gold)' } :
                       power >= 120 ? { label:'二流高手', color:'var(--gold-light)' } :
                       power >= 70  ? { label:'三流高手', color:'var(--blue-light)' } :
                       power >= 30  ? { label:'江湖新秀', color:'var(--green-light)' } :
                                      { label:'初出茅庐', color:'var(--text-muted)' };

    const powerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;margin-bottom:6px;border-bottom:1px solid var(--border);">
        <span style="font-size:10px;color:var(--text-muted);">综合战力</span>
        <div style="text-align:right;">
          <span style="font-size:14px;color:${powerGrade.color};font-weight:bold;">${power}</span>
          <span style="font-size:9px;color:${powerGrade.color};margin-left:4px;border:1px solid ${powerGrade.color};padding:0 4px;border-radius:8px;">${powerGrade.label}</span>
        </div>
      </div>`;

    document.getElementById('stat-bars').innerHTML = powerHTML + stats.map(st => {
      const val = s[st.key] || 0;
      const pct = Math.min(100, (val / st.max) * 100);
      return `
        <div class="stat-row">
          <span class="stat-label">${st.label}</span>
          <div class="stat-bar"><div class="stat-fill ${st.cls}" style="width:${pct}%"></div></div>
          <span class="stat-val">${val}</span>
        </div>`;
    }).join('');
  },

  renderMartialList() {
    const s = Engine.state;
    const el = document.getElementById('martial-list');
    if (s.martialArts.length === 0) {
      el.innerHTML = '<div style="font-size:11px;color:var(--text-muted);">尚未习得任何武功</div>';
      return;
    }
    const typeMap = { inner:'内功', sword:'剑法', palm:'掌法', qinggong:'轻功', hidden:'暗器', evil:'邪功' };
    el.innerHTML = s.martialArts.map(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      if (!ma) return '';
      const level = m.level || 1;
      const exp = m.exp || 0;
      const expNeeded = level < 10 ? (DATA.MARTIAL_LEVEL_EXP[level] || 99) : 99;
      const levelName = DATA.MARTIAL_LEVEL_NAMES ? (DATA.MARTIAL_LEVEL_NAMES[level-1] || '入门') : '入门';
      const pct = Math.min(100, Math.round(exp / expNeeded * 100));
      return `
        <div class="martial-item" style="cursor:pointer;" onclick="UI.openTrainMartialModal('${ma.id}')" title="点击专项修炼">
          <div class="martial-name">${ma.name}</div>
          <div class="martial-type">${typeMap[ma.type]||ma.type} · ${'★'.repeat(ma.tier)}</div>
          <div style="font-size:9px;color:var(--gold-dim);margin-top:2px;">「${levelName}」Lv.${level}</div>
          <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:3px;">
            <div style="height:100%;width:${pct}%;background:var(--gold);border-radius:2px;"></div>
          </div>
        </div>`;
    }).join('');
  },

  renderWeaponList() {
    const s = Engine.state;
    const el = document.getElementById('weapon-list');
    if (s.weapons.length === 0) {
      el.innerHTML = '<div style="font-size:11px;color:var(--text-muted);">尚无神兵</div>';
      return;
    }
    el.innerHTML = s.weapons.map(wid => {
      const w = DATA.WEAPONS.find(x => x.id === wid);
      if (!w) return '';
      const equipped = s.equippedWeapon === wid;
      const bonusStr = Object.entries(w.bonus).map(([k,v])=>`${Engine._statName(k)}+${v}`).join(' ');
      return `
        <div class="weapon-item ${equipped?'equipped':''}" onclick="UI.equipWeapon('${wid}')">
          <span class="weapon-tier">${'★'.repeat(w.tier)}</span>
          <span class="weapon-name">${w.name}${equipped?' ✓':''}</span>
          <span class="weapon-bonus">${bonusStr}</span>
        </div>`;
    }).join('');
  },

  equipWeapon(wid) {
    Engine.state.equippedWeapon = wid;
    const w = DATA.WEAPONS.find(x => x.id === wid);
    Engine.addLog(`装备了【${w.name}】`, 'info');
    this.render();
  },

  renderSectInfo() {
    const s = Engine.state;
    const el = document.getElementById('sect-info');
    const sect = Engine.getSect();
    if (!sect) {
      el.innerHTML = '<div style="font-size:11px;color:var(--text-muted);">无门无派</div>';
      return;
    }
    const rankName = Engine.getSectRankName();
    const nextRankReq = sect.rankReq[s.sectRank + 1] || 9999;
    const pct = Math.min(100, (s.sectContrib / nextRankReq) * 100);
    el.innerHTML = `
      <div style="font-size:13px;color:var(--gold-light);">${sect.name}</div>
      <div style="font-size:11px;color:var(--text-dim);margin:3px 0;">职位：${rankName}</div>
      <div style="font-size:10px;color:var(--text-muted);">贡献：${s.sectContrib} / ${nextRankReq}</div>
      <div class="sect-rank-track" style="margin-top:4px;">
        <div class="sect-rank-fill" style="width:${pct}%"></div>
      </div>`;
  },

  renderFollowerList() {
    const s = Engine.state;
    const el = document.getElementById('follower-list');
    let html = '';
    if (s.spouse) {
      const npc = DATA.NPCS.find(n => n.id === s.spouse);
      html += `<div class="follower-item" style="border-color:var(--red);">
        <span style="font-size:14px;">❤️</span>
        <span class="follower-name">${npc ? npc.name : '伴侣'}</span>
        <span class="follower-loyalty" style="color:var(--red-light);">伴侣</span>
      </div>`;
    }
    if (s.followers.length === 0 && !s.spouse) {
      el.innerHTML = '<div style="font-size:11px;color:var(--text-muted);">尚无手下</div>';
      return;
    }
    html += s.followers.map(f => {
      const npc = DATA.NPCS.find(n => n.id === f.npcId);
      const name = npc ? npc.name : (f.name || '手下');
      return `<div class="follower-item">
        <span style="font-size:14px;">⚔️</span>
        <span class="follower-name">${name}</span>
        <span class="follower-loyalty">忠诚${f.loyalty}</span>
      </div>`;
    }).join('');
    el.innerHTML = html;
  },

  renderLocation() {
    const loc = Engine.getLocation();
    document.getElementById('loc-name').textContent = loc.name;
    document.getElementById('loc-desc').textContent = loc.desc;

    const npcs = Engine.getLocalNPCs();
    document.getElementById('loc-npcs').innerHTML = npcs.map(n => `
      <span class="npc-chip" onclick="UI.openNPCModal('${n.id}')">${n.name}</span>
    `).join('') || '<span style="font-size:11px;color:var(--text-muted);">此地无人</span>';
  },

  renderCurrentTab() {
    switch (this.currentTab) {
      case 'actions':  this.renderActions(); break;
      case 'map':      this.renderMap(); break;
      case 'martial':  this.renderMartialLearn(); break;
      case 'quests':   this.renderQuestsTab(); break;
      case 'npcs':     this.renderNPCs(); break;
      case 'sects':    this.renderSects(); break;
      case 'rumors':    this.renderRumors(); break;
      case 'factions':  this.renderFactions(); break;
      case 'disciples': this.renderDisciples(); break;
      case 'ranking':   this.renderRanking(); break;
      case 'bag':       this.renderBag(); break;
      case 'titles':   this.renderTitles(); break;
      case 'manuals':  this.renderManuals(); break;
      case 'fusion':   this.renderFusion(); break;
      case 'era':      this.renderEra(); break;
      case 'grudge':   this.renderGrudgePanel(); break;
    }
  },

  renderActions() {
    const actions = Engine.getAvailableActions();
    const s = Engine.state;
    const season = Engine.getSeason ? Engine.getSeason() : null;
    const seasonEff = Engine.getSeasonEffects ? Engine.getSeasonEffects() : {};

    // 状态提示栏
    const tips = [];
    if (s.energy < 20) tips.push(`<span style="color:var(--red-light);">⚠️ 体力不足，无法修炼或探索</span>`);
    else if (s.energy < 40) tips.push(`<span style="color:var(--gold);">⚡ 体力偏低（${s.energy}），建议先休息</span>`);
    if (s.hp < s.maxHp * 0.3) tips.push(`<span style="color:var(--red-light);">🩸 气血危急（${s.hp}/${s.maxHp}），建议休息养伤</span>`);
    if (season && (seasonEff.trainBonus || seasonEff.innerBonus)) {
      const bonuses = [];
      if (seasonEff.trainBonus) bonuses.push(`修炼+${seasonEff.trainBonus}%`);
      if (seasonEff.innerBonus) bonuses.push(`内功+${seasonEff.innerBonus}%`);
      tips.push(`<span style="color:var(--green-light);">${season.icon} ${season.name}季加成：${bonuses.join('，')}</span>`);
    }
    if (s.studyingManual) {
      const m = (DATA.MANUALS || []).find(x => x.id === s.studyingManual.id);
      const remaining = s.studyingManual.endMonth - (s.year * 12 + s.month);
      tips.push(`<span style="color:var(--blue-light);">📖 正在研读【${m?.name || '秘籍'}】，还需${remaining}月</span>`);
    }
    // K: 天气影响提示
    if (Engine.getWeather) {
      const w = Engine.getWeather();
      const eff = w.effects || {};
      const weatherTips = [];
      if (eff.trainBonus) weatherTips.push(`修炼${eff.trainBonus > 0 ? '+' : ''}${eff.trainBonus}%`);
      if (eff.innerBonus) weatherTips.push(`内功+${eff.innerBonus}%`);
      if (eff.wanderPenalty) weatherTips.push(`游历-${eff.wanderPenalty}%`);
      if (eff.restBonus) weatherTips.push(`休息+${eff.restBonus}%`);
      if (weatherTips.length > 0) {
        tips.push(`<span style="color:var(--blue-light);">${w.icon} ${w.name}：${weatherTips.join('，')}</span>`);
      }
    }
    // R: 重伤状态提示
    if (s.isInjured) {
      tips.push(`<span style="color:var(--red-light);">🩸 重伤中（还需${s.injuredMonthsLeft}月）：${s.injuryDesc}。行动效果减半，建议休息。</span>`);
    }
    // Q2: 连击状态提示
    if (s.comboCount >= 2) {
      const comboNames = ['', '', '二连击', '三连击', '四连击', '五连击'];
      tips.push(`<span style="color:var(--gold);">🔥 ${comboNames[s.comboCount] || s.comboCount + '连击'}！行动效果+${s.comboBonus}%</span>`);
    }

    const tipsHTML = tips.length > 0 ? `
      <div style="grid-column:1/-1;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:2px;margin-bottom:4px;display:flex;flex-direction:column;gap:3px;">
        ${tips.map(t => `<div style="font-size:10px;">${t}</div>`).join('')}
      </div>` : '';

    // 计算当前休息档位
    const restTierInfo = (() => {
      if (s.sect) return { icon:'🏯', label:'门派宿舍', cost:'免费', color:'var(--green-light)', mult:1.4 };
      if (s.gold >= 10) return { icon:'🏨', label:'客栈', cost:'约10~15两', color:'var(--gold)', mult:1.0 };
      return { icon:'🌉', label:'桥洞/野外', cost:'免费', color:'var(--text-muted)', mult:0.6 };
    })();

    let html = tipsHTML + actions.map(a => {
      // 判断行动是否可用
      let disabled = false;
      let disabledReason = '';
      if (a.id === 'train' && s.energy < 20) { disabled = true; disabledReason = '体力不足'; }
      if (a.id === 'explore' && s.energy < 30) { disabled = true; disabledReason = '体力不足'; }
      if (a.id === 'work' && s.energy < 15) { disabled = true; disabledReason = '体力不足'; }
      if (a.id === 'wander' && s.gold < 20) { disabled = true; disabledReason = '银两不足'; }

      // rest 行动特殊处理：显示档位信息
      if (a.id === 'rest') {
        return `
        <div class="action-btn" onclick="UI.showRestModal()" style="position:relative;">
          <div class="action-icon">${restTierInfo.icon}</div>
          <div class="action-name">休息养伤</div>
          <div class="action-cost" style="color:${restTierInfo.color};">${restTierInfo.label} · ${restTierInfo.cost}</div>
          <div class="action-desc">气血×${(restTierInfo.mult * 30).toFixed(0)}%，体力×${(restTierInfo.mult * 40).toFixed(0)}</div>
        </div>`;
      }

      return `
      <div class="action-btn${disabled ? ' disabled' : ''}" onclick="${disabled ? '' : `UI.doAction('${a.id}')`}" style="${disabled ? 'opacity:0.45;cursor:not-allowed;' : ''}">
        <div class="action-icon">${a.icon}</div>
        <div class="action-name">${a.name}</div>
        <div class="action-cost">${disabled ? `<span style="color:var(--red-light);">${disabledReason}</span>` : a.cost}</div>
        <div class="action-desc">${a.desc}</div>
      </div>`;
    }).join('');

    // B: 武林大会行动（大会期间显示）
    if (this._tournamentActive) {
      const loc = Engine.getTournamentLocation ? Engine.getTournamentLocation() : '';
      html += `
        <div style="grid-column:1/-1;background:rgba(255,200,0,0.08);border:1px solid var(--gold);border-radius:2px;padding:10px;margin-top:4px;">
          <div style="font-size:13px;color:var(--gold);font-weight:bold;margin-bottom:8px;">🏆 武林大会正在${loc}举行！</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
            <div class="action-btn" onclick="UI.joinTournament()" style="border-color:var(--gold);">
              <div class="action-icon">⚔️</div><div class="action-name">参赛</div>
              <div class="action-cost">体力-30</div><div class="action-desc">闯关夺冠</div>
            </div>
            <div class="action-btn" onclick="UI.watchTournament()" style="border-color:var(--blue);">
              <div class="action-icon">👁️</div><div class="action-name">观战</div>
              <div class="action-cost">体力-10</div><div class="action-desc">观摩学习</div>
            </div>
            <div class="action-btn" onclick="UI.sabotageTournament()" style="border-color:var(--red);">
              <div class="action-icon">🗡️</div><div class="action-name">搅局</div>
              <div class="action-cost">体力-20</div><div class="action-desc">浑水摸鱼</div>
            </div>
          </div>
        </div>`;
    }

    document.getElementById('action-grid').innerHTML = html;
  },

  renderMartialLearn() {
    const martials = Engine.getLearnableMartials();
    const s = Engine.state;
    if (martials.length === 0) {
      document.getElementById('martial-learn-list').innerHTML =
        '<div style="font-size:12px;color:var(--text-muted);padding:12px;">当前地点无可学武功，需要拜师或加入门派</div>';
      return;
    }
    document.getElementById('martial-learn-list').innerHTML = martials.map(ma => {
      const typeMap = { inner:'内功', sword:'剑法', palm:'掌法', qinggong:'轻功', hidden:'暗器', evil:'邪功' };
      const reqStr = Object.entries(ma.require).map(([k,v])=>`${Engine._statName(k)}≥${v}`).join('，') || '无要求';
      const effectStr = Object.entries(ma.effect).map(([k,v])=>`${Engine._statName(k)}+${v}`).join('，');
      const canLearn = Object.entries(ma.require).every(([k,v]) => (s[k]||0) >= v);
      const favorOk = !ma.teacherId || (s.npcFavor[ma.teacherId] || 0) >= 30;
      const disabled = !canLearn || !favorOk;
      const disabledReason = !canLearn ? '属性不足' : (!favorOk ? '好感度不足(需30)' : '');
      return `
        <div class="martial-learn-card">
          <div class="martial-learn-info">
            <div class="martial-learn-name">${ma.name} ${'★'.repeat(ma.tier)} · ${typeMap[ma.type]||ma.type}</div>
            <div class="martial-learn-desc">${ma.desc}</div>
            <div class="martial-learn-req">要求：${reqStr}</div>
            <div style="font-size:10px;color:var(--green-light);margin-top:2px;">效果：${effectStr}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">来源：${ma.source}</div>
          </div>
          <button class="martial-learn-btn" ${disabled?'disabled':''} onclick="UI.learnMartial('${ma.id}','${ma.teacherId||''}')">
            ${disabled ? disabledReason : '学习（2月）'}
          </button>
        </div>`;
    }).join('');
  },

  // ── 任务标签页（含子标签）────────────────────────────────
  renderQuestsTab() {
    const container = document.getElementById('quest-list');
    const activeCount = Engine.getActiveQuests().length;
    const bountyCount = Engine.getActiveBounties().length;
    container.innerHTML = `
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <button class="cat-tab ${this.questSubTab==='available'?'active':''}" onclick="UI.setQuestSubTab('available')">可接任务</button>
        <button class="cat-tab ${this.questSubTab==='active'?'active':''}" onclick="UI.setQuestSubTab('active')">进行中 <span class="cat-count">${activeCount||''}</span></button>
        <button class="cat-tab ${this.questSubTab==='bounty'?'active':''}" onclick="UI.setQuestSubTab('bounty')">悬赏令 <span class="cat-count">${bountyCount||''}</span></button>
      </div>
      <div id="quest-sub-content"></div>
    `;
    this._renderQuestSubContent();
  },

  setQuestSubTab(tab) {
    this.questSubTab = tab;
    this.renderQuestsTab();
  },

  _renderQuestSubContent() {
    const el = document.getElementById('quest-sub-content');
    if (!el) return;
    if (this.questSubTab === 'available') el.innerHTML = this._buildAvailableQuestsHTML();
    else if (this.questSubTab === 'active') el.innerHTML = this._buildActiveQuestsHTML();
    else el.innerHTML = this._buildBountiesHTML();
  },

  _buildAvailableQuestsHTML() {
    const quests = Engine.getAvailableQuests();
    const s = Engine.state;
    if (quests.length === 0) return '<div style="font-size:12px;color:var(--text-muted);padding:12px;">当前无可接任务</div>';
    return quests.map(q => {
      const rewardStr = [
        q.reward.gold ? `银两+${q.reward.gold}` : '',
        q.reward.reputation ? `声望+${q.reward.reputation}` : '',
        q.reward.morality ? `道德+${q.reward.morality}` : '',
        q.reward.evil ? `邪气+${q.reward.evil}` : '',
        q.reward.item ? `物品` : '',
      ].filter(Boolean).join('，');
      const costStr = [
        q.cost.time ? `${q.cost.time}个月` : '',
        q.cost.energy ? `${q.cost.energy}体力` : '',
      ].filter(Boolean).join('，');
      const reqStr = Object.entries(q.require).map(([k,v])=>`${Engine._statName(k)}≥${v}`).join('，') || '无';
      const canDo = Object.entries(q.require).every(([k,v]) => (s[k]||0) >= v);
      const diffStr = '⚔️'.repeat(q.difficulty);
      const typeColor = { normal:'var(--blue)', combat:'var(--red)', stealth:'var(--purple)', explore:'var(--green)', evil:'var(--red-light)' };
      const chainBadge = q.chain ? '<span style="font-size:9px;padding:1px 5px;border-radius:8px;background:rgba(255,200,0,0.15);color:var(--gold);">任务链</span>' : '';
      const timeBadge = q.timeLimit ? `<span style="font-size:9px;padding:1px 5px;border-radius:8px;background:rgba(255,80,80,0.15);color:var(--red-light);">限时${q.timeLimit}月</span>` : '';
      return `
        <div class="quest-card">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;">
            <span class="quest-name">${q.name}</span>
            <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:${typeColor[q.type]||'var(--text-dim)'}">${q.type}</span>
            <span style="font-size:11px;color:var(--text-muted);">${diffStr}</span>
            ${chainBadge}${timeBadge}
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-meta">
            <span class="quest-reward">奖励：${rewardStr||'无'}</span>
            <span class="quest-cost">消耗：${costStr}</span>
            <span>要求：${reqStr}</span>
          </div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button class="quest-btn" style="flex:1;" ${canDo?'':' disabled style="opacity:0.4;cursor:not-allowed;"'} onclick="UI.acceptQuest('${q.id}')">
              ${canDo ? '接取任务' : '条件不足'}
            </button>
            <button class="quest-btn" style="flex:1;background:rgba(255,200,0,0.1);border-color:var(--gold);" ${canDo?'':' disabled style="opacity:0.4;cursor:not-allowed;"'} onclick="UI.doQuest('${q.id}')">
              ${canDo ? '立即执行' : '条件不足'}
            </button>
          </div>
        </div>`;
    }).join('');
  },

  _buildActiveQuestsHTML() {
    const quests = Engine.getActiveQuests();
    if (quests.length === 0) return '<div style="font-size:12px;color:var(--text-muted);padding:12px;">暂无进行中的任务</div>';
    return quests.map(q => {
      const remainStr = q.remaining !== null
        ? (q.remaining <= 0 ? '<span style="color:var(--red-light);">⚠️ 即将超时！</span>' : `剩余 ${q.remaining} 个月`)
        : '无时限';
      const rewardStr = [
        q.reward.gold ? `银两+${q.reward.gold}` : '',
        q.reward.reputation ? `声望+${q.reward.reputation}` : '',
      ].filter(Boolean).join('，');
      const s = Engine.state;
      const canDo = Object.entries(q.require).every(([k,v]) => (s[k]||0) >= v);
      return `
        <div class="quest-card" style="border-color:var(--gold);">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span class="quest-name">▶ ${q.name}</span>
            <span style="font-size:10px;color:var(--text-muted);margin-left:auto;">${remainStr}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-meta"><span class="quest-reward">奖励：${rewardStr||'无'}</span></div>
          <button class="quest-btn" style="margin-top:6px;width:100%;" ${canDo?'':' disabled style="opacity:0.4;"'} onclick="UI.doQuest('${q.id}')">
            执行任务
          </button>
        </div>`;
    }).join('');
  },

  _buildBountiesHTML() {
    const bounties = Engine.getActiveBounties();
    const s = Engine.state;
    if (bounties.length === 0) return '<div style="font-size:12px;color:var(--text-muted);padding:12px;">当前无悬赏令，每3个月刷新一次</div>';
    return bounties.map((b, idx) => {
      const diffStr = '⚔️'.repeat(b.difficulty);
      const canDo = Object.entries(b.require || {}).every(([k,v]) => (s[k]||0) >= v);
      const typeColor = { normal:'var(--blue)', combat:'var(--red)', stealth:'var(--purple)', explore:'var(--green)' };
      return `
        <div class="quest-card" style="border-color:var(--purple);">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span class="quest-name">📋 ${b.name}</span>
            <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:${typeColor[b.type]||'var(--text-dim)'}">${b.type}</span>
            <span style="font-size:11px;color:var(--text-muted);">${diffStr}</span>
          </div>
          <div class="quest-desc">${b.desc}</div>
          <div class="quest-meta">
            <span class="quest-reward">赏金：约${b.reward.gold}两</span>
            <span class="quest-cost">消耗：${b.cost.time||1}个月 ${b.cost.energy||0}体力</span>
          </div>
          <button class="quest-btn" style="margin-top:6px;width:100%;border-color:var(--purple);" ${canDo?'':' disabled style="opacity:0.4;"'} onclick="UI.doBounty(${idx})">
            ${canDo ? '接受悬赏' : '条件不足'}
          </button>
        </div>`;
    }).join('');
  },

  renderNPCs() {
    const npcs = Engine.getLocalNPCs();
    const s = Engine.state;
    const alignMap = { good:'正道', evil:'邪道', neutral:'中立' };
    document.getElementById('npc-list').innerHTML = npcs.map(npc => {
      const favor = s.npcFavor[npc.id] || 0;
      const displayFavor = npc.displayFavor !== undefined ? npc.displayFavor : favor;
      const avatarEmoji = npc.align === 'good' ? '🧙' : npc.align === 'evil' ? '😈' : '🧑';
      return `
        <div class="npc-card">
          <div class="npc-header">
            <div class="npc-avatar">${avatarEmoji}</div>
            <div>
              <div class="npc-name">${npc.name}</div>
              <div class="npc-title">${npc.title} · ${npc.sect}</div>
              <span class="npc-align align-${npc.align}">${alignMap[npc.align]}</span>
            </div>
            <div style="margin-left:auto;text-align:right;">
              <div style="font-size:10px;color:var(--text-muted);">好感度</div>
              <div style="font-size:16px;color:var(--gold-light);">${displayFavor}</div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;">${npc.desc}</div>
          <div class="npc-favor-bar">
            <div class="npc-favor-fill" style="width:${displayFavor}%"></div>
          </div>
          <div class="npc-actions">
            <button class="npc-action-btn" onclick="UI.talkToNPC('${npc.id}')">交谈 (+好感)</button>
            ${npc.canTeach ? `<button class="npc-action-btn" onclick="UI.openLearnFromNPC('${npc.id}')">请求传授武功</button>` : ''}
            ${npc.canRecruit ? `<button class="npc-action-btn" onclick="UI.recruitNPC('${npc.id}')">招募为手下</button>` : ''}
            ${npc.canMarry ? `<button class="npc-action-btn" style="color:var(--red-light);border-color:var(--red);" onclick="UI.proposeToNPC('${npc.id}')">求婚</button>` : ''}
            <button class="npc-action-btn" onclick="UI.fightNPC('${npc.id}')">切磋比武</button>
          </div>
        </div>`;
    }).join('') || '<div style="font-size:12px;color:var(--text-muted);padding:12px;">此地无人</div>';
  },

  renderSects() {
    const s = Engine.state;
    document.getElementById('sect-list').innerHTML = DATA.SECTS.map(sect => {
      const isJoined = s.sect === sect.id;
      const alignColor = sect.align === 'good' ? 'var(--green)' : sect.align === 'evil' ? 'var(--red)' : 'var(--blue)';
      const alignName = sect.align === 'good' ? '正道' : sect.align === 'evil' ? '邪道' : '中立';
      const reqStr = Object.entries(sect.require).map(([k,v])=>`${Engine._statName(k)}≥${v}`).join('，') || '无';
      const attrOk = Object.entries(sect.require).every(([k,v]) => (s[k]||0) >= v);
      // 地点检查
      const locOk = !sect.locationId || s.location === sect.locationId;
      const reqLoc = sect.locationId ? DATA.LOCATIONS.find(l => l.id === sect.locationId) : null;
      const locName = reqLoc ? reqLoc.name : sect.location;
      const canJoin = !s.sect && attrOk && locOk;
      // 按钮文字
      let joinBtnText = '申请加入';
      if (s.sect) joinBtnText = '已加入其他门派';
      else if (!attrOk) joinBtnText = '条件不足';
      else if (!locOk) joinBtnText = `需前往${locName}`;
      return `
        <div class="sect-card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="sect-name">${sect.name}</span>
            <span style="font-size:10px;padding:1px 6px;border-radius:8px;color:${alignColor};border:1px solid ${alignColor};background:rgba(255,255,255,0.03);">${alignName}</span>
            ${isJoined ? '<span style="font-size:10px;color:var(--gold);padding:1px 6px;border:1px solid var(--gold);border-radius:8px;">已加入</span>' : ''}
          </div>
          <div class="sect-desc">${sect.desc}</div>
          <div style="font-size:10px;color:var(--text-muted);margin:4px 0;">加入条件：${reqStr}</div>
          ${sect.locationId ? `<div style="font-size:10px;color:${locOk ? 'var(--green-light)' : 'var(--gold)'};margin-bottom:4px;">📍 需在【${locName}】拜入${locOk ? ' ✓' : '（当前不在此地）'}</div>` : ''}
          <div style="font-size:10px;color:var(--text-muted);">职位体系：${sect.ranks.join(' → ')}</div>
          ${isJoined ? `
            <div style="margin-top:8px;display:flex;gap:8px;">
              <button class="sect-join-btn" onclick="UI.doAction('sect_contribute')">为门派效力（1月+20两）</button>
              <button class="sect-join-btn" style="border-color:var(--blue);color:var(--blue-light);" onclick="UI.doAction('sect_promote')">申请晋升</button>
            </div>` : `
            <button class="sect-join-btn" style="margin-top:8px;${!canJoin?'opacity:0.4;cursor:not-allowed;':''}" ${!canJoin?'disabled':''} onclick="UI.joinSect('${sect.id}')">
              ${joinBtnText}
            </button>`}
        </div>`;
    }).join('');
  },

  renderLog() {
    const logs = Engine.state.log;
    document.getElementById('log-list').innerHTML = logs.map(l => `
      <div class="log-entry log-${l.type}">
        <div>${l.text}</div>
        <div class="log-time">${l.time}</div>
      </div>
    `).join('');
  },

  // ── 标签页切换 ────────────────────────────────────────────
  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      const tabs = ['actions','map','martial','quests','npcs','sects','rumors','factions','disciples','ranking','bag','titles','manuals','fusion','era'];
      btn.classList.toggle('active', tabs[i] === tab);
    });
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    this.renderCurrentTab();
  },

  // ── 行动处理 ─────────────────────────────────────────────
  showRestModal() {
    const s = Engine.state;
    const hasSect = !!s.sect;
    const canInn = s.gold >= 10;

    const tiers = [
      hasSect ? {
        id: 'rest_sect', icon: '🏯', label: '门派宿舍',
        desc: '在门派宿舍安心休养，恢复效果最佳。',
        cost: '免费', costColor: 'var(--green-light)',
        badge: '推荐', badgeColor: 'var(--green-light)',
      } : null,
      {
        id: 'rest_inn', icon: '🏨', label: '客栈',
        desc: '花费银两住客栈，舒适休息，恢复良好。',
        cost: '约10~15两', costColor: 'var(--gold)',
        badge: canInn ? '' : '银两不足', badgeColor: 'var(--red-light)',
        disabled: !canInn,
      },
      {
        id: 'rest_wild', icon: '🌉', label: '桥洞/野外',
        desc: '露宿野外，恢复较差，且有15%概率染病。',
        cost: '免费', costColor: 'var(--text-muted)',
        badge: '有风险', badgeColor: 'var(--red-light)',
      },
    ].filter(Boolean);

    const tiersHTML = tiers.map(t => `
      <div onclick="${t.disabled ? '' : `UI._doRestTier('${t.id}')`}"
           style="display:flex;align-items:center;gap:10px;padding:10px 12px;
                  border:1px solid var(--border);border-radius:4px;margin-bottom:8px;
                  cursor:${t.disabled ? 'not-allowed' : 'pointer'};
                  opacity:${t.disabled ? '0.45' : '1'};
                  background:rgba(255,255,255,0.02);
                  transition:background 0.15s;"
           onmouseover="${t.disabled ? '' : "this.style.background='rgba(255,255,255,0.06)'"}"
           onmouseout="this.style.background='rgba(255,255,255,0.02)'">
        <div style="font-size:22px;">${t.icon}</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:13px;">${t.label}
            ${t.badge ? `<span style="font-size:10px;color:${t.badgeColor};margin-left:6px;">[${t.badge}]</span>` : ''}
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${t.desc}</div>
        </div>
        <div style="font-size:11px;color:${t.costColor};white-space:nowrap;">${t.cost}</div>
      </div>`).join('');

    const modal = document.createElement('div');
    modal.id = 'rest-modal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;
      display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
      <div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:6px;
                  padding:20px;width:320px;max-width:90vw;">
        <div style="font-size:15px;font-weight:700;margin-bottom:14px;">🌙 选择休息方式</div>
        ${tiersHTML}
        <button onclick="document.getElementById('rest-modal').remove()"
                style="width:100%;margin-top:4px;padding:8px;background:transparent;
                       border:1px solid var(--border);border-radius:4px;
                       color:var(--text-muted);cursor:pointer;font-size:12px;">取消</button>
      </div>`;
    document.body.appendChild(modal);
  },

  _doRestTier(tierId) {
    const modal = document.getElementById('rest-modal');
    if (modal) modal.remove();
    this.doAction('rest', { tier: tierId });
  },

  doAction(actionId, params = {}) {
    // shop 行动特殊处理
    if (actionId === 'shop') {
      this.showShopModal();
      return;
    }
    const s = Engine.state;
    // 记录行动前的状态快照（用于对比变化）
    const snapBefore = {
      hp: s.hp, innerPower: s.innerPower, strength: s.strength,
      agility: s.agility, swordSkill: s.swordSkill, endurance: s.endurance,
      perception: s.perception, charm: s.charm, gold: s.gold,
      reputation: s.reputation, morality: s.morality, evil: s.evil,
      year: s.year, month: s.month,
    };

    const result = Engine.doAction(actionId, params);

    if (result && !result.success && result.msg) {
      this.toast(result.msg);
      return;
    }

    this.render();

    // 行动成功后弹出本月纪要（排除纯UI行动）
    const skipFeedback = ['shop', 'talk', 'event_choice'];
    if (!skipFeedback.includes(actionId) && result && result.success !== false) {
      setTimeout(() => this.showActionFeedback(actionId, snapBefore, result), 100);
    }
  },

  // ── 行动反馈弹窗 ─────────────────────────────────────────
  showActionFeedback(actionId, snapBefore, result) {
    const s = Engine.state;
    const actionNames = {
      rest:'休息养伤', train:'刻苦修炼', wander:'游历江湖', work:'打工赚钱',
      explore:'探索秘境', sect_contribute:'为门派效力', sect_promote:'申请晋升',
      travel:'前往新地点', fight:'切磋比武', quest:'完成任务', bounty:'悬赏任务',
      recruit:'招募手下', marry:'求婚', ranking_challenge:'挑战排行榜',
      disciple_train:'培养弟子', disciple_mission:'派遣弟子',
    };
    const actionName = actionNames[actionId] || actionId;

    // 生成叙事文本
    const narrative = Engine.generateActionNarrative(actionId, result);

    // 检查是否有顿悟
    const resultArr = result.results || [];
    const trainResult = resultArr.find(r => r.type === 'train');
    const enlightened = trainResult && trainResult.enlightened;
    const enlightenBonus = trainResult && trainResult.enlightenBonus;

    // 计算属性变化
    const statChanges = [];
    const statMap = {
      hp:'气血', innerPower:'内力', strength:'力量', agility:'身法',
      swordSkill:'剑术', endurance:'体魄', perception:'悟性',
      charm:'魅力', gold:'银两', reputation:'声望', morality:'道德', evil:'邪气',
    };
    for (const [k, label] of Object.entries(statMap)) {
      const before = snapBefore[k] || 0;
      const after = s[k] || 0;
      const diff = after - before;
      if (diff !== 0) {
        const color = diff > 0 ? 'var(--green-light)' : 'var(--red-light)';
        const sign = diff > 0 ? '+' : '';
        statChanges.push(`<span style="color:${color};">${label}${sign}${diff}</span>`);
      }
    }

    // 时间变化（至少显示1个月）
    const monthsPassed = Math.max(1, (s.year * 12 + s.month) - (snapBefore.year * 12 + snapBefore.month));

    // 本次行动产生的日志（最多5条）
    const newLogs = (result.newLogs || []).slice(-5);

    // 检查是否有待触发的随机事件（由游戏主循环设置的 pendingEvent）
    const hasPendingEvent = !!this.pendingEvent;

    // 顿悟特效 HTML
    const enlightenHTML = enlightened && enlightenBonus ? `
      <div style="background:rgba(255,220,0,0.08);border:1px solid var(--gold);border-radius:2px;padding:10px;margin-bottom:10px;text-align:center;">
        <div style="font-size:20px;margin-bottom:4px;">💡</div>
        <div style="font-size:13px;color:var(--gold);font-weight:bold;margin-bottom:4px;">修炼顿悟！</div>
        <div style="font-size:12px;color:var(--gold-light);">${enlightenBonus.label} 大幅提升 <span style="font-size:16px;">+${enlightenBonus.val}</span></div>
      </div>` : '';

    const html = `
      <div class="modal-overlay" id="action-feedback-modal" style="display:flex;">
        <div class="modal-box" style="max-width:420px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <div style="font-size:18px;">📋</div>
            <div>
              <div style="font-size:14px;color:var(--gold);">本月纪要</div>
              <div style="font-size:10px;color:var(--text-muted);">【${actionName}】· 耗时${monthsPassed}个月 · 第${s.year}年${s.month}月</div>
            </div>
          </div>

          <div style="font-size:12px;color:var(--text-dim);line-height:1.7;margin-bottom:10px;padding:8px;background:rgba(255,255,255,0.02);border-left:2px solid var(--border);border-radius:0 2px 2px 0;">
            ${narrative}
          </div>

          ${enlightenHTML}

          ${statChanges.length > 0 ? `
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:2px;padding:8px;margin-bottom:10px;">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">属性变化</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;">${statChanges.join('')}</div>
            </div>` : `
            <div style="font-size:11px;color:var(--text-muted);padding:6px 0;margin-bottom:6px;">本次行动属性无明显变化</div>`}

          ${newLogs.length > 0 ? `
            <div style="margin-bottom:10px;">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">这段时间发生了……</div>
              ${newLogs.map(l => `
                <div style="font-size:11px;color:var(--text-dim);padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);line-height:1.5;">
                  ${l.text}
                </div>`).join('')}
            </div>` : ''}

          <button onclick="UI.closeFeedbackModal()" style="
            width:100%;padding:10px;border:1px solid var(--gold);color:var(--gold-light);
            background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;margin-top:4px;">
            ${hasPendingEvent ? '继续 →（有奇遇！）' : '继续'}
          </button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  closeFeedbackModal() {
    const modal = document.getElementById('action-feedback-modal');
    if (modal) modal.remove();
    // 关闭后触发弹窗队列（统一处理所有待弹窗）
    setTimeout(() => {
      this.render();
      this._processModalQueue();
    }, 150);
  },

  showShopModal() {
    const s = Engine.state;
    const loc = Engine.getLocation();
    // 根据地点决定出售的武器
    const forSale = DATA.WEAPONS.filter(w => {
      if (s.weapons.includes(w.id)) return false;
      if (loc.id === 'l_town') return w.tier <= 2;
      if (loc.id === 'l_xiangyang') return w.tier <= 3;
      return w.tier <= 2;
    });

    const html = `
      <div class="modal-overlay" id="shop-modal" style="display:flex;">
        <div class="modal-box">
          <div class="modal-title">🛒 武器铺</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">当前银两：${s.gold} 两</div>
          ${forSale.length === 0 ? '<div style="color:var(--text-dim);">此地无武器出售</div>' :
            forSale.map(w => {
              const price = w.tier * 30;
              const bonusStr = Object.entries(w.bonus).map(([k,v])=>`${Engine._statName(k)}+${v}`).join(' ');
              const canBuy = s.gold >= price;
              return `
                <div style="background:var(--bg-card);border:1px solid var(--border);padding:10px;border-radius:2px;margin-bottom:6px;display:flex;align-items:center;gap:10px;">
                  <div style="flex:1;">
                    <div style="font-size:13px;color:var(--gold-light);">${w.name} ${'★'.repeat(w.tier)}</div>
                    <div style="font-size:11px;color:var(--text-dim);">${w.desc}</div>
                    <div style="font-size:10px;color:var(--green-light);">${bonusStr}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:13px;color:var(--gold);">${price} 两</div>
                    <button style="margin-top:4px;padding:4px 12px;border:1px solid var(--gold);color:var(--gold-light);font-size:11px;border-radius:2px;cursor:pointer;background:none;font-family:inherit;${canBuy?'':'opacity:0.4;cursor:not-allowed;'}" ${canBuy?'':'disabled'} onclick="UI.buyWeapon('${w.id}')">购买</button>
                  </div>
                </div>`;
            }).join('')
          }
          <button class="modal-close-btn" onclick="document.getElementById('shop-modal').remove()">离开</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  buyWeapon(weaponId) {
    const result = Engine.buyWeapon(weaponId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`购买了【${result.weapon.name}】！`);
    // 关闭商店
    const shopModal = document.getElementById('shop-modal');
    if (shopModal) shopModal.remove();
    this.render();
  },

  travel(locationId) {
    const result = Engine.doAction('travel', { locationId });
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    if (result.encounter) {
      this.toast('遭遇危险！');
    }
  },

  learnMartial(martialId, teacherId) {
    const result = Engine.learnMartial(martialId, teacherId || null);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`学会了【${result.martial.name}】！`);
    this.render();
  },

  joinSect(sectId) {
    const result = Engine.joinSect(sectId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`成功加入【${result.sect.name}】！`);
    this.render();
  },

  acceptQuest(questId) {
    const result = Engine.acceptQuest(questId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`接取了任务【${result.quest.name}】！`);
    this.render();
  },

  doQuest(questId) {
    const result = Engine.doQuest(questId);
    if (!result.success) { this.toast(result.msg); return; }
    if (result.chainQuest) {
      const next = DATA.QUESTS.find(q => q.id === result.chainQuest);
      if (next) setTimeout(() => this.toast(`新任务解锁：【${next.name}】`), 800);
    }
    this.render();
  },

  doBounty(idx) {
    const result = Engine.doBounty(idx);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`悬赏令完成！获得 ${result.reward.gold} 两！`);
    this.render();
  },

  talkToNPC(npcId) {
    const result = Engine.talkToNPC(npcId);
    if (!result.success) return;
    this.render();
  },

  fightNPC(npcId) {
    // 打开选招弹窗
    this.openFightMoveModal(npcId);
  },

  openFightMoveModal(npcId) {
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return;
    const moves = Engine.getAvailableMoves();
    document.getElementById('fight-move-title').textContent = `⚔️ 对决：${npc.name}`;
    document.getElementById('fight-move-desc').innerHTML =
      `<span style="color:var(--text-dim);font-size:11px;">对手：${npc.title}，战力约 ${npc.power}</span><br>
       <span style="font-size:10px;color:var(--text-muted);">选择出招方式：</span>`;
    const typeColor = { attack:'var(--red-light)', inner:'var(--blue-light)', qinggong:'var(--green-light)',
                        defend:'var(--text-dim)', evil:'var(--purple)', hidden:'var(--gold-dim)' };
    document.getElementById('fight-move-choices').innerHTML = moves.map(mv => {
      const col = typeColor[mv.type] || 'var(--text)';
      return `
        <button onclick="UI.doFightWithMove('${npcId}','${mv.id}')" style="
          padding:8px 6px;border:1px solid ${col};color:${col};background:rgba(255,255,255,0.03);
          border-radius:2px;cursor:pointer;font-family:inherit;font-size:11px;text-align:left;">
          <div style="font-weight:bold;margin-bottom:2px;">${mv.name}</div>
          <div style="font-size:9px;color:var(--text-muted);">${mv.desc}</div>
          <div style="font-size:9px;margin-top:2px;">威力×${mv.power.toFixed(1)}</div>
        </button>`;
    }).join('');
    document.getElementById('fight-move-modal').style.display = 'flex';
  },

  doFightWithMove(npcId, moveId) {
    document.getElementById('fight-move-modal').style.display = 'none';
    const npc = DATA.NPCS.find(n => n.id === npcId);
    const result = Engine.fightWithMove(npcId, moveId);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    // 弹出战斗结果弹窗
    this._showFightResultModal(npc, result);
  },

  _showFightResultModal(npc, result) {
    const s = Engine.state;
    const won = result.won;
    const counterTip = result.counterMult > 1.1 ? '<span style="color:var(--gold);">🔥 克制！威力大增！</span>' :
                       result.counterMult < 0.9 ? '<span style="color:var(--text-muted);">❄️ 被克制，威力减弱</span>' : '';

    // 生成战斗过程描述
    const fightDesc = won
      ? `你使出一招，${npc ? npc.name : '对手'}措手不及，节节败退，最终认输。`
      : `你与${npc ? npc.name : '对手'}缠斗良久，终究不敌，只得败退。`;

    const html = `
      <div class="modal-overlay" id="fight-result-modal" style="display:flex;">
        <div class="modal-box" style="max-width:380px;">
          <div style="text-align:center;margin-bottom:14px;">
            <div style="font-size:32px;margin-bottom:6px;">${won ? '🏆' : '💔'}</div>
            <div style="font-size:18px;color:${won ? 'var(--gold)' : 'var(--red-light)'};font-weight:bold;">
              ${won ? '切磋胜利！' : '切磋落败'}
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">对手：${npc ? npc.name + '（' + npc.title + '）' : '未知'}</div>
          </div>

          <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:10px;">
            <div style="font-size:11px;color:var(--text-dim);line-height:1.7;margin-bottom:6px;">${result.moveDesc}</div>
            ${counterTip ? `<div style="font-size:11px;margin-bottom:4px;">${counterTip}</div>` : ''}
            <div style="font-size:11px;color:var(--text-dim);line-height:1.7;">${fightDesc}</div>
          </div>

          <div style="display:flex;gap:12px;font-size:12px;margin-bottom:12px;">
            <div style="flex:1;text-align:center;padding:6px;background:rgba(255,80,80,0.08);border-radius:2px;">
              <div style="color:var(--text-muted);font-size:10px;">损失气血</div>
              <div style="color:var(--red-light);font-size:16px;">-${result.hpLoss}</div>
            </div>
            ${won && result.expGain ? `
            <div style="flex:1;text-align:center;padding:6px;background:rgba(100,200,100,0.08);border-radius:2px;">
              <div style="color:var(--text-muted);font-size:10px;">获得经验</div>
              <div style="color:var(--green-light);font-size:16px;">+${result.expGain}</div>
            </div>` : ''}
            <div style="flex:1;text-align:center;padding:6px;background:rgba(255,255,255,0.03);border-radius:2px;">
              <div style="color:var(--text-muted);font-size:10px;">当前气血</div>
              <div style="color:var(--gold-light);font-size:16px;">${s.hp}/${s.maxHp}</div>
            </div>
          </div>

          <button onclick="document.getElementById('fight-result-modal').remove()" style="
            width:100%;padding:10px;border:1px solid ${won ? 'var(--gold)' : 'var(--border)'};
            color:${won ? 'var(--gold-light)' : 'var(--text-muted)'};
            background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
            ${won ? '扬长而去' : '败退离开'}
          </button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  recruitNPC(npcId) {
    const result = Engine.recruit(npcId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`${result.npc.name}加入了你的队伍！`);
    this.render();
  },

  proposeToNPC(npcId) {
    const result = Engine.propose(npcId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`与${result.npc.name}喜结连理！`);
    this.render();
  },

  openNPCModal(npcId) {
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return;
    const s = Engine.state;
    const favor = s.npcFavor[npcId] || 0;
    const dialog = npc.dialog[Math.floor(Math.random() * npc.dialog.length)];

    document.getElementById('npc-modal-name').textContent = `${npc.name} · ${npc.title}`;
    document.getElementById('npc-modal-desc').innerHTML = `
      <div style="margin-bottom:8px;">${npc.desc}</div>
      <div style="font-size:12px;color:var(--gold-dim);font-style:italic;">"${dialog}"</div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">好感度：${favor}/100</div>
    `;

    const actions = [];
    actions.push({ text:'与之交谈（好感+5）', fn:`UI.talkToNPC('${npcId}');UI.closeModal('npc-modal');UI.render();` });
    if (npc.canTeach) actions.push({ text:'请求传授武功', fn:`UI.closeModal('npc-modal');UI.switchTab('martial');` });
    if (npc.canRecruit) actions.push({ text:'招募为手下', fn:`UI.recruitNPC('${npcId}');UI.closeModal('npc-modal');` });
    if (npc.canMarry) actions.push({ text:'❤️ 求婚', fn:`UI.proposeToNPC('${npcId}');UI.closeModal('npc-modal');` });
    actions.push({ text:'切磋比武', fn:`UI.fightNPC('${npcId}');UI.closeModal('npc-modal');` });

    document.getElementById('npc-modal-actions').innerHTML = actions.map(a =>
      `<button class="modal-choice-btn" onclick="${a.fn}">${a.text}</button>`
    ).join('');

    document.getElementById('npc-modal').style.display = 'flex';
  },

  openLearnFromNPC(npcId) {
    this.switchTab('martial');
  },

  closeModal(id) {
    document.getElementById(id).style.display = 'none';
  },

  // ── 随机事件 ─────────────────────────────────────────────
  checkRandomEvent() {
    if (this.pendingEvent) {
      // 如果 feedback 弹窗还在，等它关闭后再弹（closeFeedbackModal 会处理）
      if (document.getElementById('action-feedback-modal')) return;
      this.showEventModal(this.pendingEvent);
      this.pendingEvent = null;
    }
  },

  triggerEvent(event) {
    this.pendingEvent = event;
    this.showEventModal(event);
  },

  showEventModal(event) {
    document.getElementById('event-title').textContent = event.name;
    document.getElementById('event-desc').textContent = event.desc;

    const s = Engine.state;
    document.getElementById('event-choices').innerHTML = event.choices.map((c, i) => {
      // 检查前置条件
      let disabled = false;
      if (c.require === 'hasSect' && !s.sect) disabled = true;
      if (c.require === 'evil' && s.evil < 10) disabled = true;
      return `
        <button class="modal-choice-btn" ${disabled?'disabled style="opacity:0.4;"':''} onclick="UI.resolveEvent('${event.id}',${i})">
          ${c.text}
        </button>`;
    }).join('');

    document.getElementById('event-modal').style.display = 'flex';
  },

  resolveEvent(eventId, choiceIdx) {
    document.getElementById('event-modal').style.display = 'none';

    // 记录选择前的属性快照
    const s = Engine.state;
    const snapBefore = {
      hp: s.hp, innerPower: s.innerPower, strength: s.strength,
      agility: s.agility, swordSkill: s.swordSkill, endurance: s.endurance,
      perception: s.perception, charm: s.charm, gold: s.gold,
      reputation: s.reputation, morality: s.morality, evil: s.evil,
    };

    const result = Engine.resolveEventChoice(eventId, choiceIdx);
    this.render();

    if (result.success) {
      // 计算属性变化
      const statMap = {
        hp:'气血', innerPower:'内力', strength:'力量', agility:'身法',
        swordSkill:'剑术', endurance:'体魄', perception:'悟性',
        charm:'魅力', gold:'银两', reputation:'声望', morality:'道德', evil:'邪气',
      };
      const changes = [];
      for (const [k, label] of Object.entries(statMap)) {
        const diff = (s[k] || 0) - (snapBefore[k] || 0);
        if (diff !== 0) {
          const color = diff > 0 ? 'var(--green-light)' : 'var(--red-light)';
          const sign = diff > 0 ? '+' : '';
          changes.push(`<span style="color:${color};">${label}${sign}${diff}</span>`);
        }
      }

      const html = `
        <div class="modal-overlay" id="event-result-modal" style="display:flex;">
          <div class="modal-box" style="max-width:400px;">
            <div style="font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:12px;">${result.choice.result}</div>
            ${changes.length > 0 ? `
              <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:2px;padding:8px;margin-bottom:12px;">
                <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">获得效果</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;">${changes.join('')}</div>
              </div>` : ''}
            <button onclick="document.getElementById('event-result-modal').remove()" style="
              width:100%;padding:10px;border:1px solid var(--gold);color:var(--gold-light);
              background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
              知道了
            </button>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', html);
    }
  },

  // ── 结局 ─────────────────────────────────────────────────
  showEnding(ending) {
    // 改为弹窗，不锁死游戏，可继续游玩
    const existingModal = document.getElementById('ending-modal-popup');
    if (existingModal) return;

    const html = `
      <div class="modal-overlay" id="ending-modal-popup" style="display:flex;z-index:9998;">
        <div class="modal-box" style="border-color:var(--gold);max-width:460px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">🎭</div>
          <div style="font-size:11px;color:var(--gold);border:1px solid var(--gold);display:inline-block;padding:1px 10px;border-radius:8px;margin-bottom:10px;">结局解锁</div>
          <div style="font-size:20px;color:var(--gold);font-weight:bold;margin-bottom:12px;">「${ending.name}」</div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:16px;">${ending.desc}</div>
          <div style="display:flex;gap:8px;">
            <button onclick="document.getElementById('ending-modal-popup').remove()" style="
              flex:1;padding:10px;border:1px solid var(--gold);color:var(--gold-light);
              background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
              继续江湖之路
            </button>
            <button onclick="location.reload()" style="
              flex:1;padding:10px;border:1px solid var(--border);color:var(--text-muted);
              background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
              重新开始
            </button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  // ── 背包面板 ─────────────────────────────────────────────
  renderBag() {
    const s = Engine.state;
    const container = document.getElementById('bag-panel');
    if (!container) return;

    const shopItems = Engine.getShopItems();
    const inventoryItems = Object.entries(s.inventory)
      .map(([id, count]) => ({ item: DATA.ITEMS.find(i => i.id === id), count }))
      .filter(x => x.item);

    let html = `<div style="margin-bottom:12px;">`;
    html += `<div style="font-size:12px;color:var(--gold);margin-bottom:8px;">🎒 背包（${inventoryItems.length}种物品）</div>`;
    if (inventoryItems.length === 0) {
      html += '<div style="font-size:11px;color:var(--text-muted);">背包空空如也</div>';
    } else {
      html += inventoryItems.map(({ item, count }) => {
        const canUse = item.effect && Object.keys(item.effect).length > 0 && item.type !== 'material';
        return `
          <div style="display:flex;align-items:center;gap:8px;padding:6px;background:var(--bg-card);border:1px solid var(--border);border-radius:2px;margin-bottom:4px;">
            <span style="font-size:18px;">${item.icon}</span>
            <div style="flex:1;">
              <div style="font-size:12px;color:var(--gold-light);">${item.name} <span style="color:var(--text-muted);">x${count}</span></div>
              <div style="font-size:10px;color:var(--text-dim);">${item.desc}</div>
            </div>
            <div style="display:flex;gap:4px;">
              ${canUse ? `<button style="padding:3px 8px;font-size:10px;border:1px solid var(--green);color:var(--green-light);background:none;border-radius:2px;cursor:pointer;font-family:inherit;" onclick="UI.useItem('${item.id}')">使用</button>` : ''}
              <button style="padding:3px 8px;font-size:10px;border:1px solid var(--text-muted);color:var(--text-muted);background:none;border-radius:2px;cursor:pointer;font-family:inherit;" onclick="UI.sellItem('${item.id}')">出售(${item.sellPrice}两)</button>
            </div>
          </div>`;
      }).join('');
    }
    html += `</div>`;

    // 商店区域
    html += `<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">`;
    html += `<div style="font-size:12px;color:var(--gold);margin-bottom:8px;">🏪 当地商店 <span style="font-size:10px;color:var(--text-muted);">（持有：${s.gold}两）</span></div>`;
    if (shopItems.length === 0) {
      html += '<div style="font-size:11px;color:var(--text-muted);">此地无商店</div>';
    } else {
      html += shopItems.map(item => {
        const titleBonus = Engine._getTitleBonus();
        const discount = (titleBonus.itemDiscountMod || 0) / 100;
        const price = Math.floor(item.buyPrice * (1 - discount));
        const canBuy = s.gold >= price;
        const discountStr = discount > 0 ? `<span style="color:var(--green-light);font-size:9px;"> (${Math.round(discount*100)}%折扣)</span>` : '';
        return `
          <div style="display:flex;align-items:center;gap:8px;padding:6px;background:var(--bg-card);border:1px solid var(--border);border-radius:2px;margin-bottom:4px;">
            <span style="font-size:18px;">${item.icon}</span>
            <div style="flex:1;">
              <div style="font-size:12px;color:var(--gold-light);">${item.name}</div>
              <div style="font-size:10px;color:var(--text-dim);">${item.desc}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px;color:var(--gold);">${price}两${discountStr}</div>
              <button style="margin-top:2px;padding:3px 8px;font-size:10px;border:1px solid var(--gold);color:var(--gold-light);background:none;border-radius:2px;cursor:pointer;font-family:inherit;${canBuy?'':'opacity:0.4;cursor:not-allowed;'}" ${canBuy?'':'disabled'} onclick="UI.buyItem('${item.id}')">购买</button>
            </div>
          </div>`;
      }).join('');
    }
    html += `</div>`;

    container.innerHTML = html;
  },

  useItem(itemId) {
    const result = Engine.useItem(itemId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`使用了${result.item.name}！`);
    this.render();
  },

  sellItem(itemId) {
    const result = Engine.sellItem(itemId, 1);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
  },

  buyItem(itemId) {
    const result = Engine.buyItem(itemId, 1);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
  },

  // ── 称号面板 ─────────────────────────────────────────────
  renderTitles() {
    const s = Engine.state;
    const container = document.getElementById('titles-panel');
    if (!container) return;

    const myTitles = Engine.getTitles();
    const tierColor = ['', 'var(--text-dim)', 'var(--blue-light)', 'var(--gold)'];
    const tierName = ['', '普通', '稀有', '传奇'];

    let html = `<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">已获得 ${myTitles.length} 个称号</div>`;

    if (myTitles.length === 0) {
      html += '<div style="font-size:11px;color:var(--text-muted);">尚未获得任何称号，继续闯荡江湖吧！</div>';
    } else {
      html += myTitles.map(title => {
        const isActive = s.activeTitle === title.id;
        const effStr = Object.entries(title.effect)
          .filter(([k]) => !k.includes('Mod') || title.effect[k] !== 0)
          .map(([k,v]) => {
            const names = { npcFavorMod:'NPC好感', questRewardMod:'任务奖励', combatBonus:'战斗力',
                           trainingBonus:'修炼效率', itemDiscountMod:'购物折扣', stealthBonus:'潜行' };
            return `${names[k]||k}${v>0?'+':''}${v}${k.includes('Mod')||k.includes('Bonus')?'%':''}`;
          }).join('，');
        return `
          <div style="padding:8px;background:var(--bg-card);border:1px solid ${isActive?'var(--gold)':'var(--border)'};border-radius:2px;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:14px;color:${tierColor[title.tier]};font-weight:bold;">「${title.name}」</span>
              <span style="font-size:9px;padding:1px 5px;border-radius:8px;border:1px solid ${tierColor[title.tier]};color:${tierColor[title.tier]}">${tierName[title.tier]}</span>
              ${isActive ? '<span style="font-size:9px;padding:1px 5px;border-radius:8px;background:rgba(255,200,0,0.2);color:var(--gold);">当前展示</span>' : ''}
            </div>
            <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px;">${title.desc}</div>
            ${effStr ? `<div style="font-size:10px;color:var(--green-light);">效果：${effStr}</div>` : ''}
            ${!isActive ? `<button style="margin-top:6px;padding:3px 10px;font-size:10px;border:1px solid var(--gold);color:var(--gold-light);background:none;border-radius:2px;cursor:pointer;font-family:inherit;" onclick="UI.setActiveTitle('${title.id}')">设为展示称号</button>` : ''}
          </div>`;
      }).join('');
    }

    // 未获得的称号提示
    const locked = DATA.TITLES.filter(t => !s.titles.includes(t.id));
    if (locked.length > 0) {
      html += `<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px;">`;
      html += `<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">🔒 未解锁称号（${locked.length}个）</div>`;
      html += locked.map(title => {
        const condStr = Object.entries(title.condition).map(([k,v]) => {
          if (k === 'questDone') return `完成任务`;
          if (k === 'goldBelow') return `银两<${v}`;
          return `${Engine._statName(k)}≥${v}`;
        }).join('，');
        return `<div style="padding:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:2px;margin-bottom:4px;">
          <span style="font-size:12px;color:var(--text-muted);">「${title.name}」</span>
          <span style="font-size:10px;color:var(--text-dim);margin-left:8px;">条件：${condStr}</span>
        </div>`;
      }).join('');
      html += `</div>`;
    }

    container.innerHTML = html;
  },

  setActiveTitle(titleId) {
    Engine.setActiveTitle(titleId);
    this.render();
  },

  // ── 传闻面板 ─────────────────────────────────────────────
  renderRumors() {
    const container = document.getElementById('rumors-panel');
    if (!container) return;
    const rumors = Engine.getActiveRumors();
    const urgencyColor = { high:'var(--red-light)', medium:'var(--gold)', low:'var(--text-dim)' };
    const urgencyLabel = { high:'紧急', medium:'普通', low:'陈旧' };
    const typeIcon = { martial:'📜', weapon:'⚔️', items:'🎁', train:'🧘', combat_win:'🥊',
                       morality:'🌿', gold:'💰', favor:'❤️', choice:'⚖️' };

    let html = `<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">江湖传闻（${rumors.length}/3）— 每月自动更新</div>`;

    if (rumors.length === 0) {
      html += '<div style="font-size:11px;color:var(--text-muted);padding:20px 0;text-align:center;">近日江湖平静，暂无传闻……</div>';
    } else {
      html += rumors.map((r, idx) => {
        const col = urgencyColor[r.urgency] || 'var(--text-dim)';
        const icon = typeIcon[r.reward?.type] || '📋';
        const reqEntries = Object.entries(r.require || {});
        const reqStr = reqEntries.length === 0 ? '无' : reqEntries.map(([k,v]) => {
          if (k === 'inventoryItem') { const item = DATA.ITEMS.find(i=>i.id===v); return `持有${item?.name||v}`; }
          return `${Engine._statName(k)}≥${v}`;
        }).join('，');
        const costStr = `体力${r.cost?.energy||0} · 耗时${r.cost?.time||1}月`;
        const s = Engine.state;
        // 检查是否满足条件
        let canFollow = true;
        for (const [k,v] of reqEntries) {
          if (k === 'inventoryItem') { if (!(s.inventory[v]>0)) { canFollow=false; break; } }
          else if ((s[k]||0) < v) { canFollow=false; break; }
        }
        if (s.energy < (r.cost?.energy||0)) canFollow = false;

        return `
          <div style="padding:10px;background:var(--bg-card);border:1px solid ${col};border-radius:2px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:16px;">${icon}</span>
              <span style="font-size:13px;color:${col};font-weight:bold;">${r.title}</span>
              <span style="font-size:9px;padding:1px 5px;border:1px solid ${col};color:${col};border-radius:8px;">${urgencyLabel[r.urgency]||'普通'}</span>
            </div>
            <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;line-height:1.6;">${r.desc}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">前往地点：${r.loc} · 条件：${reqStr} · ${costStr}</div>
            <button onclick="UI.followRumor(${idx})" style="
              padding:5px 14px;border:1px solid ${canFollow?col:'var(--border)'};
              color:${canFollow?col:'var(--text-muted)'};
              background:none;border-radius:2px;cursor:${canFollow?'pointer':'not-allowed'};
              font-family:inherit;font-size:11px;opacity:${canFollow?1:0.5};"
              ${canFollow?'':'disabled'}>
              ${canFollow?'前往探查':'条件不足'}
            </button>
          </div>`;
      }).join('');
    }

    html += `<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px;font-size:10px;color:var(--text-muted);">已处理传闻：${Engine.state.visitedRumors.length} 条</div>`;
    container.innerHTML = html;
  },

  followRumor(idx) {
    const result = Engine.followRumor(idx);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(result.msgs.slice(0,2).join('，'));
    this.render();
  },

  // ── 势力面板 ─────────────────────────────────────────────
  renderFactions() {
    const container = document.getElementById('factions-panel');
    if (!container) return;
    const factions = Engine.getFactionAttitudes();

    let html = `<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">江湖势力关系 — 行善/作恶会影响各势力态度</div>`;

    html += factions.map(f => {
      const att = f.attitude;
      const pct = Math.round((att + 100) / 2); // -100~100 → 0~100%
      const barColor = att >= 10 ? 'var(--green-light)' : att >= -20 ? 'var(--text-dim)' : 'var(--red-light)';
      return `
        <div style="padding:10px;background:var(--bg-card);border:1px solid var(--border);border-radius:2px;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:18px;">${f.icon}</span>
            <div style="flex:1;">
              <div style="font-size:13px;color:var(--gold-light);">${f.name}</div>
              <div style="font-size:10px;color:var(--text-muted);">${f.desc}</div>
            </div>
            <span style="font-size:12px;color:${f.status.color};font-weight:bold;">${f.status.label}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;">
              <div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;transition:width 0.3s;"></div>
            </div>
            <span style="font-size:10px;color:var(--text-muted);min-width:30px;text-align:right;">${att>0?'+':''}${att}</span>
          </div>
          ${att <= f.huntThreshold ? `<div style="font-size:10px;color:var(--red-light);margin-top:4px;">⚠️ 该势力正在追杀你！每月有概率遭遇袭击。</div>` : ''}
        </div>`;
    }).join('');

    html += `
      <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">💡 影响势力关系的行为：</div>
        <div style="font-size:10px;color:var(--text-dim);line-height:1.8;">
          击杀邪派人物 → 正道好感↑ · 邪道好感↓<br>
          击杀正道人物 → 邪道好感↑ · 正道好感↓<br>
          处理传闻（救助村民）→ 朝廷好感↑<br>
          行侠仗义 → 江湖好感↑
        </div>
      </div>`;

    container.innerHTML = html;
  },

  // ── 专项修炼弹窗 ─────────────────────────────────────────
  openTrainMartialModal(martialId) {
    const details = Engine.getMartialDetails();
    const ma = details.find(m => m.id === martialId);
    if (!ma) return;
    const s = Engine.state;
    const canTrain = s.energy >= 25;
    const pct = Math.min(100, Math.round(ma.exp / ma.expNeeded * 100));
    const html = `
      <div class="modal-overlay" id="train-martial-modal" style="display:flex;">
        <div class="modal-box">
          <div class="modal-title">🧘 专项修炼</div>
          <div style="text-align:center;margin-bottom:12px;">
            <div style="font-size:18px;color:var(--gold);font-weight:bold;">${ma.name}</div>
            <div style="font-size:12px;color:var(--text-dim);margin-top:4px;">「${ma.levelName}」境 · Lv.${ma.level}/10</div>
          </div>
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:4px;">
              <span>修炼进度</span><span>${ma.exp}/${ma.expNeeded}</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;">
              <div style="height:100%;width:${pct}%;background:var(--gold);border-radius:4px;"></div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:12px;">
            专项修炼消耗 <span style="color:var(--gold);">25体力</span>，获得 <span style="color:var(--gold);">3点</span>修炼经验。<br>
            当前体力：<span style="color:${canTrain?'var(--green-light)':'var(--red-light)'}">${s.energy}</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="UI.doTrainMartial('${martialId}')" style="
              flex:1;padding:8px;border:1px solid ${canTrain?'var(--gold)':'var(--border)'};
              color:${canTrain?'var(--gold-light)':'var(--text-muted)'};
              background:none;border-radius:2px;cursor:${canTrain?'pointer':'not-allowed'};
              font-family:inherit;font-size:12px;" ${canTrain?'':'disabled'}>
              开始修炼
            </button>
            <button onclick="document.getElementById('train-martial-modal').remove()" style="
              padding:8px 16px;border:1px solid var(--border);color:var(--text-muted);
              background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
              取消
            </button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  doTrainMartial(martialId) {
    const modal = document.getElementById('train-martial-modal');
    if (modal) modal.remove();
    const result = Engine.trainMartial(martialId);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
  },

  // ── 存档/读档 ─────────────────────────────────────────────
  saveGame() {
    if (Engine.save()) this.toast('存档成功！');
    else this.toast('存档失败');
  },

  loadGame() {
    if (Engine.load()) {
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('game-screen').classList.add('active');
      this.render();
      this.toast('读取存档成功！');
    } else {
      this.toast('没有找到存档');
    }
  },

  // ── Toast 提示 ────────────────────────────────────────────
  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  },

  // ════════════════════════════════════════════════════════════
  //  B: 武林大会 UI
  // ════════════════════════════════════════════════════════════

  joinTournament() {
    const result = Engine.joinTournament();
    if (!result.success) { this.toast(result.msg); return; }
    if (result.won) {
      this.toast(`🏆 大会冠军！获得${result.gold}两、声望+${result.reputation}！`);
    } else {
      this.toast(`⚔️ 在${result.round}中落败，但有所收获。`);
    }
    this.render();
  },

  watchTournament() {
    const result = Engine.watchTournament();
    if (!result.success) { this.toast(result.msg); return; }
    this.toast('👁️ 观战有所感悟！');
    this.render();
  },

  sabotageTournament() {
    const result = Engine.sabotageTournament();
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(result.sabotageSuccess ? '🗡️ 搅局成功！' : '💥 搅局失败！');
    this.render();
  },

  // ════════════════════════════════════════════════════════════
  //  C: 奇遇系统 UI
  // ════════════════════════════════════════════════════════════

  showHiddenEventModal(he) {
    const s = Engine.state;
    const html = `
      <div class="modal-overlay" id="hidden-event-modal" style="display:flex;">
        <div class="modal-box">
          <div class="modal-title">${he.icon} ${he.name}</div>
          <div class="modal-desc" style="line-height:1.7;">${he.desc}</div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
            ${he.choices.map((c, i) => {
              const reqEntries = Object.entries(c.require || {});
              let canChoose = true;
              for (const [k, v] of reqEntries) {
                if ((s[k] || 0) < v) { canChoose = false; break; }
              }
              const reqStr = reqEntries.length > 0 ? ` (需${reqEntries.map(([k,v])=>`${Engine._statName(k)}≥${v}`).join('，')})` : '';
              return `<button onclick="UI.resolveHiddenEvent('${he.id}',${i})" style="
                padding:10px;border:1px solid ${canChoose?'var(--gold)':'var(--border)'};
                color:${canChoose?'var(--gold-light)':'var(--text-muted)'};
                background:none;border-radius:2px;cursor:${canChoose?'pointer':'not-allowed'};
                font-family:inherit;font-size:12px;text-align:left;opacity:${canChoose?1:0.5};"
                ${canChoose?'':'disabled'}>
                ${c.text}${reqStr}
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  resolveHiddenEvent(eventId, choiceIdx) {
    const modal = document.getElementById('hidden-event-modal');
    if (modal) modal.remove();
    const result = Engine.resolveHiddenEvent(eventId, choiceIdx);
    if (!result.success) { this.toast(result.msg || '无法选择'); return; }
    this.toast(result.msgs.slice(0, 2).join('，'));
    this.render();
  },

  // ════════════════════════════════════════════════════════════
  //  D: 弟子培养 UI
  // ════════════════════════════════════════════════════════════

  renderDisciples() {
    const container = document.getElementById('disciples-panel');
    if (!container) return;
    const disciples = Engine.getDisciples();
    const available = Engine.getAvailableDisciples();
    const talentMap = { sword:'剑法', inner:'内功', palm:'掌法', qinggong:'轻功', hidden:'暗器', evil:'邪功' };

    let html = `<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">门下弟子（${disciples.length}/4）</div>`;

    // 已收录弟子
    if (disciples.length > 0) {
      html += disciples.map((d, idx) => {
        const s = Engine.state;
        const currentMonth = s.year * 12 + s.month;
        const onMission = !!d.mission;
        const missionData = onMission ? DATA.DISCIPLE_MISSIONS.find(m => m.id === d.mission) : null;
        const monthsLeft = onMission ? Math.max(0, d.missionEndsAt - currentMonth) : 0;
        const expNeeded = d.level * 30;
        const pct = Math.min(100, Math.round(d.exp / expNeeded * 100));

        return `
          <div style="padding:10px;background:var(--bg-card);border:1px solid var(--border);border-radius:2px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:20px;">${d.icon}</span>
              <div style="flex:1;">
                <div style="font-size:13px;color:var(--gold-light);">${d.name} <span style="font-size:10px;color:var(--text-muted);">Lv.${d.level} · ${talentMap[d.talent]||d.talent}天赋</span></div>
                <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:4px;">
                  <div style="height:100%;width:${pct}%;background:var(--blue-light);border-radius:2px;"></div>
                </div>
                <div style="font-size:9px;color:var(--text-muted);margin-top:2px;">修炼进度 ${d.exp}/${expNeeded}</div>
              </div>
              ${onMission ? `<span style="font-size:10px;color:var(--gold);border:1px solid var(--gold);padding:1px 6px;border-radius:8px;">执行中(${monthsLeft}月)</span>` : ''}
            </div>
            ${onMission ? `<div style="font-size:10px;color:var(--text-dim);">正在执行：【${missionData?.name||'任务'}】</div>` : `
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button onclick="UI.openTeachModal(${idx})" style="padding:4px 10px;border:1px solid var(--green);color:var(--green-light);background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:10px;">传授武功</button>
                <button onclick="UI.openMissionModal(${idx})" style="padding:4px 10px;border:1px solid var(--blue);color:var(--blue-light);background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:10px;">派遣任务</button>
              </div>`}
          </div>`;
      }).join('');
    }

    // 可招募弟子
    if (available.length > 0) {
      html += `<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px;">`;
      html += `<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">可招募弟子：</div>`;
      html += available.map(tpl => {
        const reqStr = Object.entries(tpl.require || {}).map(([k,v])=>`${Engine._statName(k)}≥${v}`).join('，') || '无';
        const costStr = tpl.recruitCost.gold > 0 ? `${tpl.recruitCost.gold}两` : '免费';
        return `
          <div style="padding:8px;background:var(--bg-card);border:1px solid var(--border);border-radius:2px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">${tpl.icon}</span>
            <div style="flex:1;">
              <div style="font-size:12px;color:var(--gold-light);">${tpl.name} <span style="font-size:10px;color:var(--text-muted);">${talentMap[tpl.talent]}天赋</span></div>
              <div style="font-size:10px;color:var(--text-dim);">${tpl.desc}</div>
              <div style="font-size:9px;color:var(--text-muted);">条件：${reqStr} · 费用：${costStr}</div>
            </div>
            <button onclick="UI.recruitDisciple('${tpl.id}')" style="padding:5px 10px;border:1px solid var(--gold);color:var(--gold-light);background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:11px;">收徒</button>
          </div>`;
      }).join('');
      html += `</div>`;
    } else if (disciples.length === 0) {
      html += '<div style="font-size:11px;color:var(--text-muted);padding:20px 0;text-align:center;">尚无可招募的弟子，提升声望或道德后再来。</div>';
    }

    container.innerHTML = html;
  },

  recruitDisciple(templateId) {
    const result = Engine.recruitDisciple(templateId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`🎓 ${result.disciple.name}拜入门下！`);
    this.render();
  },

  openTeachModal(discipleIdx) {
    const s = Engine.state;
    const disciple = s.disciples[discipleIdx];
    if (!disciple) return;
    const myMartials = Engine.getMartialDetails();
    if (myMartials.length === 0) { this.toast('你尚未习得任何武功'); return; }

    const html = `
      <div class="modal-overlay" id="teach-modal" style="display:flex;">
        <div class="modal-box">
          <div class="modal-title">📖 传授武功给 ${disciple.name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">消耗20体力，弟子获得20修炼经验</div>
          <div style="display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto;">
            ${myMartials.map(ma => `
              <button onclick="UI.teachDisciple(${discipleIdx},'${ma.id}')" style="
                padding:8px;border:1px solid var(--border);color:var(--text);background:none;
                border-radius:2px;cursor:pointer;font-family:inherit;font-size:11px;text-align:left;">
                <span style="color:var(--gold-light);">${ma.name}</span>
                <span style="color:var(--text-muted);font-size:10px;margin-left:8px;">「${ma.levelName}」Lv.${ma.level}</span>
              </button>`).join('')}
          </div>
          <button onclick="document.getElementById('teach-modal').remove()" style="margin-top:10px;padding:6px 16px;border:1px solid var(--border);color:var(--text-muted);background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:11px;">取消</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  teachDisciple(discipleIdx, martialId) {
    const modal = document.getElementById('teach-modal');
    if (modal) modal.remove();
    const result = Engine.teachDisciple(discipleIdx, martialId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`📖 传授【${result.martial.name}】成功！`);
    this.render();
  },

  openMissionModal(discipleIdx) {
    const s = Engine.state;
    const disciple = s.disciples[discipleIdx];
    if (!disciple) return;

    const html = `
      <div class="modal-overlay" id="mission-modal" style="display:flex;">
        <div class="modal-box">
          <div class="modal-title">🗺️ 派遣 ${disciple.name} 执行任务</div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px;">
            ${DATA.DISCIPLE_MISSIONS.map(m => {
              const riskColor = m.risk < 0.15 ? 'var(--green-light)' : m.risk < 0.3 ? 'var(--gold)' : 'var(--red-light)';
              const rewardStr = Object.entries(m.reward).filter(([k])=>k!=='items').map(([k,v])=>`${Engine._statName(k)}+${v}`).join('，');
              return `
                <button onclick="UI.sendOnMission(${discipleIdx},'${m.id}')" style="
                  padding:8px;border:1px solid var(--border);color:var(--text);background:none;
                  border-radius:2px;cursor:pointer;font-family:inherit;font-size:11px;text-align:left;">
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:var(--gold-light);">${m.name}</span>
                    <span style="color:var(--text-muted);font-size:10px;">${m.duration}个月</span>
                  </div>
                  <div style="font-size:10px;color:var(--text-dim);margin-top:2px;">${rewardStr}</div>
                  <div style="font-size:9px;color:${riskColor};margin-top:1px;">风险：${Math.round(m.risk*100)}%</div>
                </button>`;
            }).join('')}
          </div>
          <button onclick="document.getElementById('mission-modal').remove()" style="margin-top:10px;padding:6px 16px;border:1px solid var(--border);color:var(--text-muted);background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:11px;">取消</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  sendOnMission(discipleIdx, missionId) {
    const modal = document.getElementById('mission-modal');
    if (modal) modal.remove();
    const result = Engine.sendDiscipleOnMission(discipleIdx, missionId);
    if (!result.success) { this.toast(result.msg); return; }
    this.toast(`🗺️ ${result.disciple.name}出发了！`);
    this.render();
  },

  // ════════════════════════════════════════════════════════════
  //  E: 武林排行榜 UI
  // ════════════════════════════════════════════════════════════

  renderRanking() {
    const container = document.getElementById('ranking-panel');
    if (!container) return;
    const { list, myPower, playerRank } = Engine.getRankingList();
    const alignColor = { good:'var(--green-light)', evil:'var(--red-light)', neutral:'var(--text-dim)' };

    let html = `
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">天下武林排行榜 · 你的战力：<span style="color:var(--gold);">${myPower}</span></div>
      <div style="padding:8px;background:rgba(255,200,0,0.08);border:1px solid var(--gold);border-radius:2px;margin-bottom:10px;font-size:12px;color:var(--gold);">
        你当前排名：第 ${playerRank <= list.length ? playerRank : '榜外'} 位
      </div>`;

    html += list.map(entry => {
      const col = alignColor[entry.align] || 'var(--text-dim)';
      const canChallenge = !entry.defeated && myPower > entry.power * 0.3;
      return `
        <div style="padding:8px;background:var(--bg-card);border:1px solid ${entry.defeated?'var(--green)':'var(--border)'};border-radius:2px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
          <div style="font-size:16px;color:var(--gold);font-weight:bold;min-width:24px;text-align:center;">${entry.rank}</div>
          <div style="flex:1;">
            <div style="font-size:12px;color:var(--gold-light);">${entry.name} <span style="font-size:10px;color:${col};">「${entry.title}」</span> ${entry.defeated?'<span style="font-size:9px;color:var(--green);border:1px solid var(--green);padding:0 4px;border-radius:8px;">已击败</span>':''}</div>
            <div style="font-size:10px;color:var(--text-dim);">${entry.desc}</div>
            <div style="font-size:10px;color:var(--text-muted);">战力：${entry.power}</div>
          </div>
          ${!entry.defeated && entry.npcId !== null ? `
            <button onclick="UI.challengeRanking(${entry.rank})" style="
              padding:5px 10px;border:1px solid ${canChallenge?'var(--red-light)':'var(--border)'};
              color:${canChallenge?'var(--red-light)':'var(--text-muted)'};
              background:none;border-radius:2px;cursor:${canChallenge?'pointer':'not-allowed'};
              font-family:inherit;font-size:10px;opacity:${canChallenge?1:0.5};"
              ${canChallenge?'':'disabled'}>挑战</button>` : ''}
        </div>`;
    }).join('');

    html += `<div style="margin-top:10px;font-size:10px;color:var(--text-muted);">已击败：${Engine.state.rankingDefeated.length}/${list.length} 人</div>`;
    container.innerHTML = html;
  },

  challengeRanking(rank) {
    const result = Engine.challengeRanking(rank);
    if (!result.success) { this.toast(result.msg); return; }
    if (result.won) {
      this.toast(`⚔️ 击败第${rank}名！`);
    } else {
      this.toast(`💔 挑战失败，继续努力！`);
    }
    this.render();
  },

  // ════════════════════════════════════════════════════════════
  //  A: 扩展结局 UI
  // ════════════════════════════════════════════════════════════

  showExtraEnding(ending) {
    const tierColor = { rare:'var(--blue-light)', epic:'var(--gold)', legendary:'var(--purple)' };
    const tierName = { rare:'稀有', epic:'史诗', legendary:'传奇' };
    const col = tierColor[ending.tier] || 'var(--gold)';
    const html = `
      <div class="modal-overlay" id="extra-ending-modal" style="display:flex;z-index:9999;">
        <div class="modal-box" style="border-color:${col};max-width:480px;">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:40px;margin-bottom:8px;">${ending.icon}</div>
            <div style="font-size:20px;color:${col};font-weight:bold;">「${ending.name}」</div>
            <div style="font-size:11px;color:${col};border:1px solid ${col};display:inline-block;padding:1px 8px;border-radius:8px;margin-top:4px;">${tierName[ending.tier]||''}结局</div>
          </div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:12px;">${ending.desc}</div>
          <div style="font-size:11px;color:var(--text-muted);font-style:italic;border-top:1px solid var(--border);padding-top:10px;">${ending.epilogue}</div>
          <button onclick="document.getElementById('extra-ending-modal').remove()" style="margin-top:16px;width:100%;padding:10px;border:1px solid ${col};color:${col};background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:13px;">继续江湖之路</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  // ── 辅助：bonus字符串 ─────────────────────────────────────
  _bonusStr(bonus) {
    const nameMap = {
      hp:'气血', innerPower:'内力', strength:'力量', agility:'身法',
      endurance:'体魄', perception:'悟性', charm:'魅力', swordSkill:'剑术',
      luck:'运气', gold:'银两', morality:'道德', evil:'邪气', reputation:'声望', speed:'速度'
    };
    return Object.entries(bonus)
      .filter(([,v]) => v !== 0)
      .map(([k,v]) => `${nameMap[k]||k}${v>0?'+':''}${v}`)
      .join(' ');
  },

  // ══════════════════════════════════════════════════════════
  //  F: 武学秘籍面板
  // ══════════════════════════════════════════════════════════
  renderManuals() {
    const s = Engine.state;
    const el = document.getElementById('manuals-panel');
    if (!el) return;
    const allManuals = DATA.MANUALS || [];
    const collected = s.collectedManuals || [];
    const studied = s.studiedManuals || [];
    const studying = s.studyingManual;

    let html = `<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">收集武学秘籍，研读后可领悟对应武功</div>`;

    // 正在研读
    if (studying) {
      const m = allManuals.find(x => x.id === studying.id);
      const cur = s.year * 12 + s.month;
      const remaining = studying.endMonth - cur;
      html += `
        <div style="background:rgba(255,200,0,0.08);border:1px solid var(--gold);border-radius:2px;padding:10px;margin-bottom:12px;">
          <div style="font-size:12px;color:var(--gold);margin-bottom:4px;">📖 正在研读：【${m?.name || studying.id}】</div>
          <div style="font-size:11px;color:var(--text-muted);">还需 ${remaining} 个月完成</div>
        </div>`;
    }

    // 已收集（未研读）
    if (collected.length > 0) {
      html += `<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">── 已收集（可研读）──</div>`;
      html += collected.map(id => {
        const m = allManuals.find(x => x.id === id);
        if (!m) return '';
        const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.martialId);
        const tierColor = ['','var(--text-dim)','var(--blue)','var(--gold)'][m.tier] || 'var(--text)';
        const canStudy = !studying;
        return `
          <div style="border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.02);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <span style="font-size:14px;">${m.icon}</span>
                <span style="font-size:13px;color:${tierColor};margin-left:6px;">${m.name}</span>
                <span style="font-size:10px;color:var(--text-muted);margin-left:6px;">→ ${ma?.name || '未知武功'}</span>
              </div>
              <button onclick="UI.startStudyManual('${id}')" style="
                padding:4px 10px;border:1px solid ${canStudy ? 'var(--gold)' : 'var(--border)'};
                color:${canStudy ? 'var(--gold)' : 'var(--text-muted)'};background:none;
                border-radius:2px;cursor:${canStudy ? 'pointer' : 'not-allowed'};font-size:11px;font-family:inherit;">
                研读（${m.studyTime}月）
              </button>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">${m.desc}</div>
          </div>`;
      }).join('');
    }

    // 已研读
    if (studied.length > 0) {
      html += `<div style="font-size:11px;color:var(--text-muted);margin:10px 0 6px;">── 已研读完成 ──</div>`;
      html += studied.map(id => {
        const m = allManuals.find(x => x.id === id);
        if (!m) return '';
        const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.martialId);
        return `
          <div style="border:1px solid rgba(255,255,255,0.05);border-radius:2px;padding:8px;margin-bottom:6px;opacity:0.6;">
            <span style="font-size:12px;">${m.icon}</span>
            <span style="font-size:12px;color:var(--text-muted);margin-left:6px;">${m.name}</span>
            <span style="font-size:10px;color:var(--green-light);margin-left:8px;">✓ 已领悟 ${ma?.name || ''}</span>
          </div>`;
      }).join('');
    }

    // 可发现的秘籍提示
    const undiscovered = allManuals.filter(m => !collected.includes(m.id) && !studied.includes(m.id));
    if (undiscovered.length > 0) {
      html += `
        <div style="margin-top:12px;padding:8px;border:1px dashed var(--border);border-radius:2px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">── 江湖中流传的秘籍（${undiscovered.length}本未得）──</div>
          ${undiscovered.map(m => {
            const tierColor = ['','var(--text-muted)','var(--blue)','var(--gold)'][m.tier] || 'var(--text)';
            return `<div style="font-size:11px;color:${tierColor};padding:3px 0;">${m.icon} ${m.name} <span style="color:var(--text-muted);font-size:10px;">（${m.locations.join('/')}）</span></div>`;
          }).join('')}
        </div>`;
    }

    if (collected.length === 0 && studied.length === 0) {
      html += `<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px;">尚未收集到任何秘籍。<br>探索江湖、前往特殊地点，或完成事件链可获得秘籍。</div>`;
    }

    el.innerHTML = html;
  },

  startStudyManual(manualId) {
    const result = Engine.startStudyManual(manualId);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    this.renderManuals();
  },

  // ══════════════════════════════════════════════════════════
  //  H: 地图扩展 — 在地图标签页中集成
  // ══════════════════════════════════════════════════════════
  renderMap() {
    const s = Engine.state;
    const el = document.getElementById('map-grid');
    if (!el) return;

    // 原有地点
    const locations = DATA.LOCATIONS || [];
    let html = locations.map(loc => {
      const isCurrent = s.location === loc.id;
      const dangerStr = loc.danger === 0 ? '安全' : '⚠️'.repeat(Math.min(loc.danger, 3));
      const cost = 10 + loc.danger * 5;
      return `
        <div class="map-btn ${isCurrent ? 'current' : ''}" onclick="${isCurrent ? '' : `UI.travel('${loc.id}')`}">
          <div class="map-btn-name">${loc.name}</div>
          <div class="map-btn-danger">${isCurrent ? '📍当前位置' : dangerStr + ' · ' + cost + '两'}</div>
        </div>`;
    }).join('');

    // 额外地点（H系统）
    const extraLocs = DATA.EXTRA_LOCATIONS || [];
    const unlocked = s.unlockedLocations || [];
    if (extraLocs.length > 0) {
      html += `<div style="grid-column:1/-1;font-size:11px;color:var(--text-muted);margin:10px 0 6px;border-top:1px solid var(--border);padding-top:8px;">── 特殊地点 ──</div>`;
      html += extraLocs.map(loc => {
        const isUnlocked = unlocked.includes(loc.id);
        const isCurrent = s.extraLocation === loc.id;
        const dangerColor = ['','var(--green-light)','var(--text)','var(--gold)','var(--red-light)','#ff4444'][loc.danger] || 'var(--text)';
        if (!isUnlocked) {
          return `
            <div class="map-item" style="opacity:0.4;cursor:not-allowed;" title="${loc.unlockHint}">
              <div style="font-size:18px;">🔒</div>
              <div style="font-size:12px;color:var(--text-muted);">???</div>
              <div style="font-size:10px;color:var(--text-muted);">${loc.unlockHint}</div>
            </div>`;
        }
        return `
          <div class="map-item ${isCurrent ? 'current' : ''}" onclick="${isCurrent ? `UI.showExtraLocationActions('${loc.id}')` : `UI.travelToExtra('${loc.id}')`}" style="border-color:${dangerColor};">
            <div style="font-size:18px;">${loc.icon}</div>
            <div style="font-size:12px;color:${isCurrent ? 'var(--gold)' : 'var(--text)'};">${loc.name}${isCurrent ? '（当前）' : ''}</div>
            <div style="font-size:10px;color:var(--text-muted);">${loc.desc.slice(0,20)}…</div>
            <div style="font-size:10px;color:${dangerColor};">危险度${'★'.repeat(loc.danger)}</div>
          </div>`;
      }).join('');
    }

    el.innerHTML = html;
  },

  travelToExtra(locId) {
    const result = Engine.travelToExtraLocation(locId);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    // 检查是否有待处理的事件链
    this._checkPendingChains();
  },

  showExtraLocationActions(locId) {
    const loc = DATA.EXTRA_LOCATIONS.find(l => l.id === locId);
    if (!loc) return;
    const actions = loc.specialActions || [];
    const html = `
      <div class="modal-overlay" id="extra-loc-modal" style="display:flex;">
        <div class="modal-box" style="max-width:380px;">
          <div style="font-size:16px;color:var(--gold);margin-bottom:4px;">${loc.icon} ${loc.name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">${loc.desc}</div>
          ${actions.map((a, i) => `
            <button onclick="UI.doSpecialAction('${locId}','${a.id}')" style="
              display:block;width:100%;padding:10px;margin-bottom:8px;
              border:1px solid var(--border);color:var(--text);background:none;
              border-radius:2px;cursor:pointer;font-family:inherit;text-align:left;">
              <div style="font-size:13px;">${a.name}</div>
              <div style="font-size:11px;color:var(--text-muted);">${a.desc}（${a.duration||1}个月）</div>
            </button>`).join('')}
          <button onclick="UI.closeModal('extra-loc-modal')" style="
            width:100%;padding:8px;border:1px solid var(--border);color:var(--text-muted);
            background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;margin-top:4px;">
            离开
          </button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  doSpecialAction(locId, actionId) {
    this.closeModal('extra-loc-modal');
    const snapBefore = { ...Engine.state };
    const result = Engine.doSpecialAction(locId, actionId);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    // 检查是否有待处理的事件链
    this._checkPendingChains();
  },

  // ══════════════════════════════════════════════════════════
  //  G: 事件链弹窗
  // ══════════════════════════════════════════════════════════
  _checkPendingChains() {
    const s = Engine.state;
    const activeChains = s.activeChains || {};
    for (const [chainId, chainState] of Object.entries(activeChains)) {
      const chain = DATA.EVENT_CHAINS.find(c => c.id === chainId);
      if (!chain) continue;
      const step = chain.steps.find(st => st.id === chainState.currentStep);
      if (step) {
        setTimeout(() => this.showChainModal(chain, step), 300);
        return; // 一次只显示一个
      }
    }
  },

  showChainModal(chain, step) {
    const existingModal = document.getElementById('chain-modal');
    if (existingModal) existingModal.remove();
    const html = `
      <div class="modal-overlay" id="chain-modal" style="display:flex;">
        <div class="modal-box" style="max-width:420px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">【${chain.name}】</div>
          <div style="font-size:14px;color:var(--gold);margin-bottom:10px;">${step.title}</div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.7;margin-bottom:14px;">${step.desc}</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${step.choices.map((c, i) => `
              <button onclick="UI.handleChainChoice('${chain.id}',${i})" style="
                padding:10px;border:1px solid var(--border);color:var(--text);background:none;
                border-radius:2px;cursor:pointer;font-family:inherit;text-align:left;font-size:12px;">
                ${c.text}
              </button>`).join('')}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  handleChainChoice(chainId, choiceIndex) {
    const modal = document.getElementById('chain-modal');
    if (modal) modal.remove();
    const result = Engine.handleChainChoice(chainId, choiceIndex);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    if (result.continued && result.nextStep) {
      setTimeout(() => this.showChainModal(result.chain, result.nextStep), 400);
    } else if (!result.continued && result.endMsg) {
      this.toast(result.endMsg);
    }
  },

  // ══════════════════════════════════════════════════════════
  //  I: 武功融合面板
  // ══════════════════════════════════════════════════════════
  renderFusion() {
    const s = Engine.state;
    const el = document.getElementById('fusion-panel');
    if (!el) return;
    const recipes = DATA.FUSION_RECIPES || [];
    const available = Engine.getAvailableFusions();
    const fused = s.fusedMartials || [];

    let html = `<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">将两门武功融为一体，化为更强的绝世武学</div>`;

    if (available.length > 0) {
      html += `<div style="font-size:11px;color:var(--gold);margin-bottom:8px;">── 可融合配方 ──</div>`;
      html += available.map(recipe => {
        const ma1 = DATA.MARTIAL_ARTS.find(m => m.id === recipe.source1);
        const ma2 = DATA.MARTIAL_ARTS.find(m => m.id === recipe.source2);
        const result = recipe.result;
        const reqText = Object.entries(recipe.require || {}).map(([k,v]) => {
          const names = { perception:'悟性', innerPower:'内力', swordSkill:'剑术', agility:'身法', strength:'力量', endurance:'体魄' };
          const cur = s[k] || 0;
          const ok = cur >= v;
          return `<span style="color:${ok ? 'var(--green-light)' : 'var(--red-light)'};">${names[k]||k}${v}</span>`;
        }).join(' ');
        const canFuse = Object.entries(recipe.require || {}).every(([k,v]) => (s[k]||0) >= v) &&
                        (!recipe.cost?.gold || s.gold >= recipe.cost.gold);
        return `
          <div style="border:1px solid var(--gold);border-radius:2px;padding:12px;margin-bottom:10px;background:rgba(255,200,0,0.04);">
            <div style="font-size:13px;color:var(--gold);margin-bottom:6px;">⚗️ ${recipe.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">
              【${ma1?.name}】+ 【${ma2?.name}】→ 【${result.name}】
            </div>
            <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">${result.desc}</div>
            <div style="font-size:11px;margin-bottom:8px;">需要：${reqText}${recipe.cost?.gold ? ` <span style="color:var(--gold);">银两${recipe.cost.gold}</span>` : ''}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">耗时：${recipe.studyTime||6}个月</div>
            <button onclick="UI.doFusion('${recipe.id}')" style="
              padding:8px 16px;border:1px solid ${canFuse ? 'var(--gold)' : 'var(--border)'};
              color:${canFuse ? 'var(--gold)' : 'var(--text-muted)'};background:none;
              border-radius:2px;cursor:${canFuse ? 'pointer' : 'not-allowed'};font-family:inherit;font-size:12px;">
              ${canFuse ? '开始融合' : '条件不足'}
            </button>
          </div>`;
      }).join('');
    }

    // 未解锁的配方
    const locked = recipes.filter(r => {
      if (fused.includes(r.id)) return false;
      if (available.find(a => a.id === r.id)) return false;
      return true;
    });
    if (locked.length > 0) {
      html += `<div style="font-size:11px;color:var(--text-muted);margin:10px 0 6px;">── 尚未满足条件 ──</div>`;
      html += locked.map(recipe => {
        const ma1 = DATA.MARTIAL_ARTS.find(m => m.id === recipe.source1);
        const ma2 = DATA.MARTIAL_ARTS.find(m => m.id === recipe.source2);
        const has1 = (s.martialArts || []).find(m => m.id === recipe.source1);
        const has2 = (s.martialArts || []).find(m => m.id === recipe.source2);
        return `
          <div style="border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:8px;opacity:0.5;">
            <div style="font-size:12px;color:var(--text-muted);">⚗️ ${recipe.name}</div>
            <div style="font-size:11px;color:var(--text-muted);">
              <span style="color:${has1?'var(--green-light)':'var(--red-light)'};">【${ma1?.name||recipe.source1}】</span>
              + <span style="color:${has2?'var(--green-light)':'var(--red-light)'};">【${ma2?.name||recipe.source2}】</span>
            </div>
          </div>`;
      }).join('');
    }

    // 已融合
    if (fused.length > 0) {
      html += `<div style="font-size:11px;color:var(--text-muted);margin:10px 0 6px;">── 已完成融合 ──</div>`;
      html += fused.map(id => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return '';
        return `
          <div style="border:1px solid rgba(255,255,255,0.05);border-radius:2px;padding:8px;margin-bottom:6px;opacity:0.6;">
            <span style="font-size:12px;color:var(--text-muted);">✓ ${recipe.name} → 【${recipe.result.name}】</span>
          </div>`;
      }).join('');
    }

    if (available.length === 0 && locked.length === 0 && fused.length === 0) {
      html += `<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px;">学习更多武功后，可在此融合为绝世武学。</div>`;
    }

    el.innerHTML = html;
  },

  doFusion(recipeId) {
    const result = Engine.fuseMartial(recipeId);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    this.renderFusion();
    // 显示融合成功弹窗
    const r = result.result;
    const html = `
      <div class="modal-overlay" id="fusion-success-modal" style="display:flex;">
        <div class="modal-box" style="max-width:380px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">⚗️</div>
          <div style="font-size:16px;color:var(--gold);margin-bottom:8px;">武功融合成功！</div>
          <div style="font-size:14px;color:var(--text);margin-bottom:6px;">【${r.name}】</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">${r.desc}</div>
          <button onclick="UI.closeModal('fusion-success-modal')" style="
            padding:10px 24px;border:1px solid var(--gold);color:var(--gold);
            background:none;border-radius:2px;cursor:pointer;font-family:inherit;">
            太好了！
          </button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  // ══════════════════════════════════════════════════════════
  //  J: 年代事件面板
  // ══════════════════════════════════════════════════════════
  renderEra() {
    const s = Engine.state;
    const el = document.getElementById('era-panel');
    if (!el) return;
    const eraEvents = DATA.ERA_EVENTS || [];
    const triggered = s.triggeredEraEvents || [];
    const pending = s.pendingEraEvent;

    let html = `<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">江湖大事，随时间推移而发生，影响整个武林格局</div>`;

    // 待处理的年代事件
    if (pending) {
      const era = eraEvents.find(e => e.id === pending);
      if (era) {
        html += `
          <div style="background:rgba(255,100,0,0.08);border:1px solid var(--red-light);border-radius:2px;padding:12px;margin-bottom:12px;">
            <div style="font-size:13px;color:var(--red-light);margin-bottom:6px;">⚠️ 江湖大事正在发生！</div>
            <div style="font-size:14px;color:var(--gold);margin-bottom:8px;">${era.name}</div>
            <div style="font-size:12px;color:var(--text-dim);line-height:1.7;margin-bottom:10px;">${era.detail || era.desc}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">你将如何应对？</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${era.choices.map((c, i) => {
                const condOk = !c.condition || Object.entries(c.condition).every(([k,v]) => (s[k]||0) >= v);
                return `
                  <button onclick="${condOk ? `UI.handleEraChoice('${era.id}',${i})` : ''}" style="
                    padding:10px;border:1px solid ${condOk ? 'var(--border)' : 'rgba(255,255,255,0.05)'};
                    color:${condOk ? 'var(--text)' : 'var(--text-muted)'};background:none;
                    border-radius:2px;cursor:${condOk ? 'pointer' : 'not-allowed'};
                    font-family:inherit;text-align:left;font-size:12px;
                    opacity:${condOk ? '1' : '0.4'};">
                    ${c.text}
                    ${c.condition ? `<span style="font-size:10px;color:var(--text-muted);">（需要条件）</span>` : ''}
                  </button>`;
              }).join('')}
            </div>
          </div>`;
      }
    }

    // 历史年代事件
    const pastEvents = eraEvents.filter(e => {
      const id = e.id;
      return triggered.some(t => t === id || t.startsWith(id + '_y'));
    });
    if (pastEvents.length > 0) {
      html += `<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">── 已发生的江湖大事 ──</div>`;
      html += pastEvents.map(era => {
        const typeColor = { world:'var(--text-muted)', opportunity:'var(--gold)', crisis:'var(--red-light)' }[era.type] || 'var(--text)';
        const typeIcon = { world:'🌍', opportunity:'⭐', crisis:'⚠️' }[era.type] || '📣';
        return `
          <div style="border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:8px;opacity:0.7;">
            <div style="font-size:12px;color:${typeColor};">${typeIcon} ${era.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${era.desc}</div>
          </div>`;
      }).join('');
    }

    // 未来事件预告
    const upcoming = eraEvents.filter(e => {
      if (triggered.some(t => t === e.id || t.startsWith(e.id + '_y'))) return false;
      return e.triggerYear > s.year;
    }).sort((a,b) => a.triggerYear - b.triggerYear);
    if (upcoming.length > 0) {
      html += `<div style="font-size:11px;color:var(--text-muted);margin:10px 0 6px;">── 江湖传言（未来大事）──</div>`;
      html += upcoming.slice(0,3).map(era => {
        const typeIcon = { world:'🌍', opportunity:'⭐', crisis:'⚠️' }[era.type] || '📣';
        return `
          <div style="border:1px dashed var(--border);border-radius:2px;padding:8px;margin-bottom:6px;opacity:0.5;">
            <div style="font-size:11px;color:var(--text-muted);">${typeIcon} 第${era.triggerYear}年前后：${era.name}</div>
          </div>`;
      }).join('');
    }

    if (!pending && pastEvents.length === 0) {
      html += `<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px;">江湖风平浪静，大事尚未发生……</div>`;
    }

    el.innerHTML = html;
  },

  handleEraChoice(eraId, choiceIndex) {
    const result = Engine.handleEraEventChoice(eraId, choiceIndex);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    this.renderEra();
    if (result.choice) {
      this.toast(`${result.choice.text}`, 3000);
    }
  },

  // ── 年代事件弹窗（自动弹出）──────────────────────────────
  showEraEventModal(era) {
    const s = Engine.state;
    const existingModal = document.getElementById('era-event-modal');
    if (existingModal) existingModal.remove();
    const typeIcon = { world:'🌍', opportunity:'⭐', crisis:'⚠️' }[era.type] || '📣';
    const typeColor = { world:'var(--text)', opportunity:'var(--gold)', crisis:'var(--red-light)' }[era.type] || 'var(--text)';
    const html = `
      <div class="modal-overlay" id="era-event-modal" style="display:flex;">
        <div class="modal-box" style="max-width:440px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">江湖大事 · 第${s.year}年</div>
          <div style="font-size:18px;color:${typeColor};margin-bottom:8px;">${typeIcon} ${era.name}</div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.7;margin-bottom:12px;">${era.detail || era.desc}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">你将如何应对？</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${era.choices.map((c, i) => {
              const condOk = !c.condition || Object.entries(c.condition).every(([k,v]) => (s[k]||0) >= v);
              return `
                <button onclick="${condOk ? `UI.handleEraChoiceFromModal('${era.id}',${i})` : ''}" style="
                  padding:10px;border:1px solid ${condOk ? 'var(--border)' : 'rgba(255,255,255,0.05)'};
                  color:${condOk ? 'var(--text)' : 'var(--text-muted)'};background:none;
                  border-radius:2px;cursor:${condOk ? 'pointer' : 'not-allowed'};
                  font-family:inherit;text-align:left;font-size:12px;
                  opacity:${condOk ? '1' : '0.4'};">
                  ${c.text}
                </button>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  handleEraChoiceFromModal(eraId, choiceIndex) {
    const modal = document.getElementById('era-event-modal');
    if (modal) modal.remove();
    this.handleEraChoice(eraId, choiceIndex);
  },

  // ══════════════════════════════════════════════════════════
  //  L: 境界突破弹窗
  // ══════════════════════════════════════════════════════════
  showBreakthroughModal(bt) {
    if (document.getElementById('breakthrough-modal')) return;
    const s = Engine.state;
    const failCount = s.breakthroughFailed || 0;
    const rate = Math.max(10, Math.round((bt.successRate - failCount * 0.05) * 100));
    const costStr = [];
    if (bt.cost.energy > 0) costStr.push(`体力 ${bt.cost.energy}`);
    if (bt.cost.gold > 0) costStr.push(`银两 ${bt.cost.gold}`);
    const bonusStr = Object.entries(bt.successBonus).map(([k,v]) => `${Engine._statName(k)}+${v}`).join('，');
    const penaltyStr = Object.entries(bt.failPenalty).map(([k,v]) => `${Engine._statName(k)}${v}`).join('，');

    const html = `
      <div class="modal-overlay" id="breakthrough-modal" style="display:flex;z-index:9995;">
        <div class="modal-box" style="max-width:440px;border-color:var(--gold);">
          <div style="text-align:center;margin-bottom:12px;">
            <div style="font-size:28px;margin-bottom:6px;">⚡</div>
            <div style="font-size:16px;color:var(--gold);font-weight:bold;">境界突破</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">【${bt.name}】</div>
          </div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:12px;padding:10px;background:rgba(255,255,255,0.02);border-left:2px solid var(--gold);border-radius:0 2px 2px 0;">
            ${bt.desc}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:11px;">
            <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:2px;border:1px solid var(--border);">
              <div style="color:var(--text-muted);margin-bottom:4px;">消耗</div>
              <div style="color:var(--gold-light);">${costStr.join(' / ') || '无'}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:2px;border:1px solid var(--border);">
              <div style="color:var(--text-muted);margin-bottom:4px;">成功率</div>
              <div style="color:${rate >= 60 ? 'var(--green-light)' : rate >= 40 ? 'var(--gold)' : 'var(--red-light)'};">${rate}%${failCount > 0 ? `（已失败${failCount}次）` : ''}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:2px;border:1px solid var(--border);">
              <div style="color:var(--text-muted);margin-bottom:4px;">成功奖励</div>
              <div style="color:var(--green-light);">${bonusStr}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:2px;border:1px solid var(--border);">
              <div style="color:var(--text-muted);margin-bottom:4px;">失败惩罚</div>
              <div style="color:var(--red-light);">${penaltyStr}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="UI.doBreakthrough('${bt.id}')" style="
              flex:2;padding:10px;border:1px solid var(--gold);color:var(--gold-light);
              background:rgba(255,200,0,0.05);border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
              ⚡ 尝试突破
            </button>
            <button onclick="UI.skipBreakthrough('${bt.id}')" style="
              flex:1;padding:10px;border:1px solid var(--border);color:var(--text-muted);
              background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
              暂不突破
            </button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  doBreakthrough(btId) {
    const modal = document.getElementById('breakthrough-modal');
    if (modal) modal.remove();
    const result = Engine.attemptBreakthrough(btId);
    if (!result.success) { this.toast(result.msg); return; }
    const bt = result.breakthrough;
    const isSuccess = result.result === 'success';
    const html = `
      <div class="modal-overlay" id="bt-result-modal" style="display:flex;z-index:9996;">
        <div class="modal-box" style="max-width:380px;text-align:center;border-color:${isSuccess ? 'var(--gold)' : 'var(--red-light)'};">
          <div style="font-size:36px;margin-bottom:8px;">${isSuccess ? '🌟' : '💥'}</div>
          <div style="font-size:16px;color:${isSuccess ? 'var(--gold)' : 'var(--red-light)'};font-weight:bold;margin-bottom:8px;">
            ${isSuccess ? '突破成功！' : '突破失败'}
          </div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:16px;">
            ${isSuccess ? `你成功踏入【${bt.name}】境界，武学修为大进！` : `真气逆流，突破失败，你受了内伤。`}
          </div>
          <button onclick="document.getElementById('bt-result-modal').remove();UI.render();" style="
            width:100%;padding:10px;border:1px solid var(--gold);color:var(--gold-light);
            background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
            知道了
          </button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    this.render();
  },

  skipBreakthrough(btId) {
    const modal = document.getElementById('breakthrough-modal');
    if (modal) modal.remove();
    Engine.skipBreakthrough(btId);
    this.render();
  },

  // ══════════════════════════════════════════════════════════
  //  S: 富事件（多段对话）弹窗
  // ══════════════════════════════════════════════════════════
  showRichEventModal() {
    const existing = document.getElementById('rich-event-modal');
    if (existing) existing.remove();
    const data = Engine.getRichEventStep();
    if (!data) return;
    const { event, step } = data;
    if (!step) return;

    const s = Engine.state;
    const choicesHTML = step.choices.map((c, i) => {
      // 检查前置条件
      let disabled = false;
      let disabledReason = '';
      if (c.require) {
        for (const [k, v] of Object.entries(c.require)) {
          if ((s[k] || 0) < v) {
            disabled = true;
            disabledReason = `（需要${Engine._statName(k)}≥${v}，当前${s[k]||0}）`;
            break;
          }
        }
      }
      return `
        <button class="modal-choice-btn" ${disabled ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}
          onclick="UI.handleRichEventChoice(${i})">
          ${c.text}${disabledReason ? `<span style="font-size:10px;color:var(--red-light);"> ${disabledReason}</span>` : ''}
        </button>`;
    }).join('');

    const html = `
      <div class="modal-overlay" id="rich-event-modal" style="display:flex;z-index:9994;">
        <div class="modal-box" style="max-width:460px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div style="font-size:24px;">${event.icon || '📖'}</div>
            <div>
              <div style="font-size:14px;color:var(--gold);">江湖奇遇</div>
              <div style="font-size:11px;color:var(--text-muted);">【${event.name}】</div>
            </div>
          </div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.9;margin-bottom:14px;padding:10px;background:rgba(255,255,255,0.02);border-left:2px solid var(--border);border-radius:0 2px 2px 0;white-space:pre-line;">
            ${step.desc}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${choicesHTML}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  handleRichEventChoice(choiceIdx) {
    const result = Engine.handleRichEventChoice(choiceIdx);
    if (!result.success) { this.toast(result.msg); return; }

    const modal = document.getElementById('rich-event-modal');
    if (modal) modal.remove();

    if (result.ended) {
      // 显示结果
      const eff = result.effect || {};
      const statMap = {
        hp:'气血', innerPower:'内力', strength:'力量', agility:'身法',
        swordSkill:'剑术', endurance:'体魄', perception:'悟性',
        charm:'魅力', gold:'银两', reputation:'声望', morality:'道德', evil:'邪气',
      };
      const changes = [];
      for (const [k, label] of Object.entries(statMap)) {
        if (eff[k] !== undefined && eff[k] !== 0) {
          const color = eff[k] > 0 ? 'var(--green-light)' : 'var(--red-light)';
          const sign = eff[k] > 0 ? '+' : '';
          changes.push(`<span style="color:${color};">${label}${sign}${eff[k]}</span>`);
        }
      }
      const html = `
        <div class="modal-overlay" id="rich-event-result-modal" style="display:flex;z-index:9995;">
          <div class="modal-box" style="max-width:380px;">
            <div style="font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:12px;">${result.endMsg || '奇遇结束。'}</div>
            ${changes.length > 0 ? `
              <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:2px;padding:8px;margin-bottom:12px;">
                <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">获得效果</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;">${changes.join('')}</div>
              </div>` : ''}
            <button onclick="document.getElementById('rich-event-result-modal').remove();UI.render();" style="
              width:100%;padding:10px;border:1px solid var(--gold);color:var(--gold-light);
              background:none;border-radius:2px;cursor:pointer;font-family:inherit;font-size:12px;">
              知道了
            </button>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', html);
    } else {
      // 进入下一步
      this.render();
      setTimeout(() => this.showRichEventModal(), 100);
    }
    this.render();
  },

  // ══════════════════════════════════════════════════════════
  //  P: 恩怨面板（在人物信息标签页中显示）
  // ══════════════════════════════════════════════════════════
  renderGrudgePanel() {
    const s = Engine.state;
    const container = document.getElementById('grudge-panel');
    if (!container) return;

    const intensityNames = ['', '小怨', '深仇', '不共戴天'];
    const intensityColors = ['', 'var(--text-muted)', 'var(--gold)', 'var(--red-light)'];

    const grudgesHTML = s.grudges && s.grudges.length > 0 ? s.grudges.map(g => `
      <div style="background:var(--bg-card);border:1px solid rgba(255,80,80,0.3);padding:8px;border-radius:2px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-size:12px;color:var(--red-light);">⚔️ ${g.name}</span>
            <span style="font-size:10px;color:${intensityColors[g.intensity]};margin-left:6px;border:1px solid ${intensityColors[g.intensity]};padding:0 4px;border-radius:8px;">${intensityNames[g.intensity]}</span>
          </div>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">${g.reason}</div>
      </div>`) .join('') : '<div style="font-size:11px;color:var(--text-muted);">无仇怨在身</div>';

    const debtsHTML = s.debts && s.debts.length > 0 ? s.debts.map(d => `
      <div style="background:var(--bg-card);border:1px solid rgba(80,200,80,0.3);padding:8px;border-radius:2px;margin-bottom:6px;">
        <div style="font-size:12px;color:var(--green-light);">🤝 ${d.name}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">${d.reason}</div>
      </div>`) .join('') : '<div style="font-size:11px;color:var(--text-muted);">无恩情在身</div>';

    container.innerHTML = `
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">⚔️ 仇怨（${(s.grudges||[]).length}）</div>
        ${grudgesHTML}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">🤝 恩情（${(s.debts||[]).length}）</div>
        ${debtsHTML}
      </div>`;
  },

};

// ── 游戏主循环：每次行动后检查随机事件 ──────────────────────
// 在 doAction 之后自动检查随机事件
const _origDoAction = Engine.doAction.bind(Engine);
Engine.doAction = function(actionId, params) {
  const result = _origDoAction(actionId, params);
  // 行动后有概率触发随机事件（排除事件处理本身）
  if (actionId !== 'event_choice' && Math.random() < 0.3) {
    const event = Engine._triggerRandomEvent();
    if (event) {
      setTimeout(() => UI.triggerEvent(event), 400);
    }
  }
  return result;
};

// 页面加载完成
window.addEventListener('DOMContentLoaded', () => {
  // 如果有存档，提示
  if (localStorage.getItem('daxia_save')) {
    document.querySelector('.start-btn[onclick*="loadGame"]').style.borderColor = 'var(--gold)';
  }
});
