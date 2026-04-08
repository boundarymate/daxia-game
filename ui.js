// ============================================================
//  大侠模拟器 · UI 控制器
// ============================================================

const UI = {

  selectedTraits: [],      // 已选人物特质 id 列表
  selectedBgs: {},         // 已选背景特质 { tag: id }，每类只能选一个
  selectedGender: 'male',
  currentTab: 'actions',
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

    // 确认按钮状态 + 提示文字
    const btn = document.getElementById('confirm-btn');
    const hint = document.getElementById('confirm-hint');
    if (btn) {
      const missing = ['出身', '经历', '际遇'].filter(tag => !this.selectedBgs[tag]);
      const canConfirm = pts >= 0 && missing.length === 0;
      btn.disabled = !canConfirm;

      if (hint) {
        if (pts < 0) {
          hint.textContent = `⚠ 点数超支 ${Math.abs(pts)} 点，请取消部分正面特质或选择负面特质`;
        } else if (missing.length > 0) {
          hint.textContent = `⚠ 还需选择背景特质：${missing.join('、')}`;
        } else {
          hint.textContent = '';
        }
      }
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
    // B: 体力显示带颜色警告
    const energyEl = document.getElementById('top-energy');
    const maxEn = s.maxEnergy || 100;
    energyEl.textContent = `${s.energy}/${maxEn}`;
    energyEl.style.color = s.energy < 25 ? 'var(--red-light)' : s.energy < 50 ? '#f39c12' : '';
    document.getElementById('top-time').textContent = `第${s.year}年${s.month}月 · 年龄${s.age}岁`;

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

    // 检查结局
    const ending = Engine.checkEnding();
    if (ending) this.showEnding(ending);

    // 随机事件由行动触发，不在 render 中检查
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
    // B: 体力条单独渲染，带颜色警告
    const maxEnergy = s.maxEnergy || 100;
    const energyPct = Math.min(100, (s.energy / maxEnergy) * 100);
    const energyColor = s.energy < 25 ? '#e74c3c' : s.energy < 50 ? '#f39c12' : '#2ecc71';
    const energyBar = `
      <div class="stat-row">
        <span class="stat-label">体力</span>
        <div class="stat-bar"><div class="stat-fill" style="width:${energyPct}%;background:${energyColor};transition:width .3s;"></div></div>
        <span class="stat-val" style="color:${energyColor};">${s.energy}</span>
      </div>`;
    document.getElementById('stat-bars').innerHTML = energyBar + stats.map(st => {
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
    el.innerHTML = s.martialArts.map(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      if (!ma) return '';
      const typeMap = { inner:'内功', sword:'剑法', palm:'掌法', qinggong:'轻功', hidden:'暗器', evil:'邪功' };
      // F: 显示武功等级和经验进度
      const level = m.level || 1;
      const exp = m.exp || 0;
      const needed = level * 10;
      const expPct = level >= 10 ? 100 : Math.min(100, (exp / needed) * 100);
      const levelColor = level >= 8 ? 'var(--gold-light)' : level >= 5 ? 'var(--green-light)' : 'var(--text-dim)';
      return `
        <div class="martial-item">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="martial-name">${ma.name}</div>
            <div style="font-size:10px;color:${levelColor};font-weight:700;">第${level}层${level>=10?'·满':''}</div>
          </div>
          <div class="martial-type">${typeMap[ma.type]||ma.type} · ${'★'.repeat(ma.tier)}</div>
          <div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:4px;">
            <div style="height:100%;width:${expPct}%;background:${levelColor};border-radius:2px;transition:width .3s;"></div>
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
      case 'actions': this.renderActions(); break;
      case 'map':     this.renderMap(); break;
      case 'martial': this.renderMartialLearn(); break;
      case 'quests':  this.renderQuests(); break;
      case 'npcs':    this.renderNPCs(); break;
      case 'sects':   this.renderSects(); break;
    }
  },

  renderActions() {
    const actions = Engine.getAvailableActions();
    document.getElementById('action-grid').innerHTML = actions.map(a => `
      <div class="action-btn" onclick="UI.doAction('${a.id}')">
        <div class="action-icon">${a.icon}</div>
        <div class="action-name">${a.name}</div>
        <div class="action-cost">${a.cost}</div>
        <div class="action-desc">${a.desc}</div>
      </div>
    `).join('');
  },

  renderMap() {
    const s = Engine.state;
    document.getElementById('map-grid').innerHTML = DATA.LOCATIONS.map(loc => {
      const isCurrent = loc.id === s.location;
      const dangerStr = loc.danger === 0 ? '安全' : '⚠️'.repeat(Math.min(loc.danger, 3));
      const cost = 10 + loc.danger * 5;
      return `
        <div class="map-btn ${isCurrent?'current':''}" onclick="${isCurrent?'':` UI.travel('${loc.id}')`}">
          <div class="map-btn-name">${loc.name}</div>
          <div class="map-btn-danger">${isCurrent?'📍当前位置':dangerStr+' · '+cost+'两'}</div>
        </div>`;
    }).join('');
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

  renderQuests() {
    const quests = Engine.getAvailableQuests();
    const s = Engine.state;
    document.getElementById('quest-list').innerHTML = quests.map(q => {
      const rewardStr = [
        q.reward.gold ? `银两+${q.reward.gold}` : '',
        q.reward.reputation ? `声望+${q.reward.reputation}` : '',
        q.reward.morality ? `道德+${q.reward.morality}` : '',
        q.reward.evil ? `邪气+${q.reward.evil}` : '',
      ].filter(Boolean).join('，');
      const costStr = [
        q.cost.time ? `${q.cost.time}个月` : '',
        q.cost.gold ? `${q.cost.gold}两` : '',
        q.cost.energy ? `${q.cost.energy}体力` : '',
      ].filter(Boolean).join('，');
      const reqStr = Object.entries(q.require).map(([k,v])=>`${Engine._statName(k)}≥${v}`).join('，') || '无';
      const canDo = Object.entries(q.require).every(([k,v]) => (s[k]||0) >= v);
      const diffStr = '⚔️'.repeat(q.difficulty);
      const typeColor = { normal:'var(--blue)', combat:'var(--red)', stealth:'var(--purple)', explore:'var(--green)', evil:'var(--red-light)' };
      return `
        <div class="quest-card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="quest-name">${q.name}</span>
            <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:${typeColor[q.type]||'var(--text-dim)'};">${q.type}</span>
            <span style="font-size:11px;color:var(--text-muted);">${diffStr}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-meta">
            <span class="quest-reward">奖励：${rewardStr||'无'}</span>
            <span class="quest-cost">消耗：${costStr}</span>
            <span>要求：${reqStr}</span>
          </div>
          <button class="quest-btn" ${canDo?'':' disabled style="opacity:0.4;cursor:not-allowed;"'} onclick="UI.doQuest('${q.id}')">
            ${canDo ? '接受任务' : '条件不足'}
          </button>
        </div>`;
    }).join('') || '<div style="font-size:12px;color:var(--text-muted);padding:12px;">当前无可用任务</div>';
  },

  renderNPCs() {
    const npcs = Engine.getLocalNPCs();
    const s = Engine.state;
    const alignMap = { good:'正道', evil:'邪道', neutral:'中立' };
    document.getElementById('npc-list').innerHTML = npcs.map(npc => {
      const favor = s.npcFavor[npc.id] || 0;
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
              <div style="font-size:16px;color:var(--gold-light);">${favor}</div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;">${npc.desc}</div>
          <div class="npc-favor-bar">
            <div class="npc-favor-fill" style="width:${favor}%"></div>
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
      const canJoin = !s.sect && Object.entries(sect.require).every(([k,v]) => (s[k]||0) >= v);
      return `
        <div class="sect-card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="sect-name">${sect.name}</span>
            <span style="font-size:10px;padding:1px 6px;border-radius:8px;color:${alignColor};border:1px solid ${alignColor};background:rgba(255,255,255,0.03);">${alignName}</span>
            ${isJoined ? '<span style="font-size:10px;color:var(--gold);padding:1px 6px;border:1px solid var(--gold);border-radius:8px;">已加入</span>' : ''}
          </div>
          <div class="sect-desc">${sect.desc}</div>
          <div style="font-size:10px;color:var(--text-muted);margin:4px 0;">加入条件：${reqStr}</div>
          <div style="font-size:10px;color:var(--text-muted);">职位体系：${sect.ranks.join(' → ')}</div>
          ${isJoined ? `
            <div style="margin-top:8px;display:flex;gap:8px;">
              <button class="sect-join-btn" onclick="UI.doAction('sect_contribute')">为门派效力（1月+20两）</button>
              <button class="sect-join-btn" style="border-color:var(--blue);color:var(--blue-light);" onclick="UI.doAction('sect_promote')">申请晋升</button>
            </div>` : `
            <button class="sect-join-btn" style="margin-top:8px;${!canJoin?'opacity:0.4;cursor:not-allowed;':''}" ${!canJoin?'disabled':''} onclick="UI.joinSect('${sect.id}')">
              ${s.sect ? '已加入其他门派' : (canJoin ? '申请加入' : '条件不足')}
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
      const tabs = ['actions','map','martial','quests','npcs','sects'];
      btn.classList.toggle('active', tabs[i] === tab);
    });
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    this.renderCurrentTab();
  },

  // ── 行动处理 ─────────────────────────────────────────────
  doAction(actionId, params = {}) {
    // shop 行动特殊处理
    if (actionId === 'shop') {
      this.showShopModal();
      return;
    }
    const result = Engine.doAction(actionId, params);
    if (result && !result.success && result.msg) {
      this.toast(result.msg);
    }
    this.render();
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

  doQuest(questId) {
    const result = Engine.doQuest(questId);
    if (!result.success) { this.toast(result.msg); return; }
    this.render();
    this._maybeRandomEvent();
  },

  talkToNPC(npcId) {
    const result = Engine.talkToNPC(npcId);
    if (!result.success) return;
    this.render();
    this._maybeRandomEvent();
  },

  fightNPC(npcId) {
    const result = Engine.fight(npcId);
    this.render();
    this._maybeRandomEvent();
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
    // 已废弃：不再在 render() 中触发事件，避免弹窗叠加
  },

  triggerEvent(event) {
    // 如果事件弹窗已经在显示，则排队等待
    const modal = document.getElementById('event-modal');
    if (modal && modal.style.display !== 'none') {
      this._eventQueue = this._eventQueue || [];
      this._eventQueue.push(event);
      return;
    }
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
    const result = Engine.resolveEventChoice(eventId, choiceIdx);
    if (result.success) {
      this.toast(result.choice.result.substring(0, 30) + '...');
    }
    this.render();
    // 处理排队中的事件
    if (this._eventQueue && this._eventQueue.length > 0) {
      const next = this._eventQueue.shift();
      setTimeout(() => this.showEventModal(next), 300);
    }
  },

  // ── 结局 ─────────────────────────────────────────────────
  showEnding(ending) {
    document.getElementById('ending-name').textContent = ending.name;
    document.getElementById('ending-desc').textContent = ending.desc;
    document.getElementById('ending-screen').style.display = 'flex';
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

  // ── 辅助：行动后随机触发事件（安全，不叠弹窗） ───────────────
  _maybeRandomEvent() {
    if (Math.random() < 0.3) {
      const event = Engine._triggerRandomEvent();
      if (event) {
        setTimeout(() => UI.triggerEvent(event), 400);
      }
    }
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

};

// ── 游戏主循环：每次行动后检查随机事件 ──────────────────────
// 在 doAction 之后自动检查随机事件
const _origDoAction = Engine.doAction.bind(Engine);
Engine.doAction = function(actionId, params) {
  const result = _origDoAction(actionId, params);
  // 行动后有概率触发随机事件（统一走 triggerEvent，自动排队不叠弹窗）
  if (actionId !== 'event_choice') {
    UI._maybeRandomEvent();
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
