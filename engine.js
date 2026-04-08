// ============================================================
//  大侠模拟器 · 游戏引擎
// ============================================================

const Engine = {

  // ── 游戏状态 ──────────────────────────────────────────────
  state: null,

  // ── 初始化新游戏 ──────────────────────────────────────────
  newGame(name, gender, traits, backgrounds) {
    const base = {
      // 基础信息
      name, gender,
      age: 16,
      year: 1, month: 1,   // 游戏内时间
      location: 'l_town',

      // 核心属性
      hp: 100, maxHp: 100,
      innerPower: 10,       // 内力
      strength: 10,         // 力量
      agility: 10,          // 身法/轻功
      endurance: 10,        // 体魄/耐力
      perception: 10,       // 悟性
      charm: 10,            // 魅力
      speed: 10,            // 速度
      swordSkill: 0,        // 剑术
      luck: 10,             // 运气

      // 道德与名声
      morality: 50,         // 0=极恶 100=极善
      evil: 0,              // 邪气值
      reputation: 0,        // 声望

      // 资源
      gold: 50,
      energy: 100,          // 体力（每月恢复）
      renqing: 0,           // 人情

      // 武学
      martialArts: [],      // 已学武功 [{id, level, exp}]
      weapons: [],          // 持有神兵
      equippedWeapon: null,

      // 社交
      followers: [],        // 小弟 [{npcId, loyalty}]
      spouse: null,         // 配偶 npcId
      npcFavor: {},         // {npcId: favor值}

      // 门派
      sect: null,           // 所在门派id
      sectRank: 0,          // 门派职位index
      sectContrib: 0,       // 门派贡献

      // 任务
      activeQuests: [],     // [{id, acceptedAt, deadline}]
      completedQuests: [],  // [questId]
      activeBounties: [],   // 悬赏令列表（随机生成）

      // 背包
      inventory: {},        // {itemId: count}

      // 称号
      titles: [],           // 已获得称号id列表
      activeTitle: null,    // 当前展示称号

      // Q: 江湖传闻
      activeRumors: [],     // 当前流传的传闻 [{...rumorData, expiresAt}]
      visitedRumors: [],    // 已前往处理的传闻id

      // O: 季节
      season: 'spring',     // 当前季节

      // N: 势力态度
      factionAttitude: {},  // {factionId: attitude值 -100~100}

      // M: 武功修炼经验
      martialExp: {},       // {martialId: exp值}

      // B: 武林大会
      tournamentWins: 0,        // 大会胜场数
      nextTournamentMonth: 0,   // 下次大会的月份（year*12+month）
      tournamentHistory: [],    // [{year, month, result, round}]

      // C: 奇遇系统
      locationVisits: {},       // {locationId: visitCount}
      triggeredHiddenEvents: [], // 已触发的奇遇id

      // D: 弟子培养
      disciples: [],            // [{templateId, name, level, exp, stats, mission, missionEndsAt}]

      // E: 武林排行榜
      rankingDefeated: [],      // 已击败的排行榜人物rank
      playerRank: null,         // 玩家当前排名（null=未上榜）

      // F: 武学秘籍
      collectedManuals: [],     // 已收集的秘籍id列表
      studiedManuals: [],       // 已研读完成的秘籍id列表
      studyingManual: null,     // 正在研读的秘籍 {id, startMonth, endMonth}

      // G: 事件链
      activeChains: {},         // {chainId: {currentStep, startedAt}}
      completedChains: [],      // 已完成的事件链id

      // H: 地图扩展
      unlockedLocations: [],    // 已解锁的额外地点id列表

      // I: 武功融合
      fusedMartials: [],        // 已融合的武功id列表

      // J: 年代事件
      triggeredEraEvents: [],   // 已触发的年代事件id列表
      pendingEraEvent: null,    // 待处理的年代事件

      // K: 天气系统
      currentWeather: 'sunny',  // 当前天气id
      weatherDesc: '',          // 天气描述文本

      // L: 境界突破
      triggeredBreakthroughs: [], // 已触发的突破id列表
      pendingBreakthrough: null,  // 待处理的突破事件id
      breakthroughFailed: 0,      // 本次突破失败次数（影响下次成功率）

      // P: 江湖恩怨
      grudges: [],              // [{npcId, name, reason, intensity, createdAt}] intensity: 1-3
      debts: [],                // [{npcId, name, reason, intensity, createdAt}] 恩情

      // Q2: 行动连击
      comboCount: 0,            // 当前连击数（同类行动连续次数）
      lastActionType: null,     // 上次行动类型
      comboBonus: 0,            // 当前连击加成%

      // R: 死亡与重伤
      isInjured: false,         // 是否重伤
      injuredMonthsLeft: 0,     // 重伤剩余月数
      injuryDesc: '',           // 重伤描述
      deathCount: 0,            // 死亡次数（鬼门关走过几次）
      nearDeathExp: 0,          // 鬼门关经验（影响某些属性）

      // S: 富事件（多段对话）
      pendingRichEvent: null,   // 当前进行中的富事件 {eventId, stepId}
      completedRichEvents: [],  // 已完成的富事件id列表

      // 日志
      log: [],
      eventHistory: [],

      // 统计
      battlesWon: 0,
      battlesLost: 0,
      totalKills: 0,
    };

    // 应用特质加成
    traits.forEach(tid => {
      const t = DATA.TRAITS.find(x => x.id === tid);
      if (t) this._applyBonus(base, t.bonus);
    });
    backgrounds.forEach(bid => {
      const b = DATA.BACKGROUNDS.find(x => x.id === bid);
      if (b) this._applyBonus(base, b.bonus);
    });

    // 确保属性不低于最小值
    const minStats = { hp:50, maxHp:50, innerPower:5, strength:5, agility:5,
                       endurance:5, perception:5, charm:5, speed:5, luck:5, gold:10 };
    Object.keys(minStats).forEach(k => {
      if (base[k] < minStats[k]) base[k] = minStats[k];
    });
    base.maxHp = base.hp;

    // 初始化NPC好感度
    DATA.NPCS.forEach(n => { base.npcFavor[n.id] = n.favor; });

    // 初始化势力态度
    DATA.FACTIONS.forEach(f => { base.factionAttitude[f.id] = f.initialAttitude; });

    this.state = base;
    this.addLog('你踏上了江湖之路，一切从这里开始……', 'story');
    this.addLog(`初始地点：${this.getLocation().name}`, 'info');

    // 生成初始悬赏令
    this._refreshBounties();
    // 生成初始传闻
    this._refreshRumors();
    // 设置初始季节
    this._updateSeason();
    // 设置首届武林大会时间（第2年1月）
    base.nextTournamentMonth = DATA.TOURNAMENT.firstYear * 12 + 1;
    return base;
  },

  // ── 属性加成辅助 ─────────────────────────────────────────
  _applyBonus(state, bonus) {
    Object.keys(bonus).forEach(k => {
      if (k in state) state[k] = (state[k] || 0) + bonus[k];
    });
  },

  // ── 获取当前地点 ─────────────────────────────────────────
  getLocation() {
    return DATA.LOCATIONS.find(l => l.id === this.state.location) || DATA.LOCATIONS[0];
  },

  // ── 获取境界 ─────────────────────────────────────────────
  getRealm() {
    const p = this.state.innerPower;
    const realms = DATA.REALMS;
    let realm = realms[0];
    for (const r of realms) {
      if (p >= r.minPower) realm = r;
    }
    return realm;
  },

  // ── 获取门派信息 ─────────────────────────────────────────
  getSect() {
    if (!this.state.sect) return null;
    return DATA.SECTS.find(s => s.id === this.state.sect);
  },

  getSectRankName() {
    const sect = this.getSect();
    if (!sect) return '无门无派';
    return sect.ranks[this.state.sectRank] || sect.ranks[0];
  },

  // ── 添加日志 ─────────────────────────────────────────────
  addLog(text, type = 'normal') {
    const s = this.state;
    this.state.log.unshift({
      text,
      type,
      time: `第${s.year}年${s.month}月`
    });
    if (this.state.log.length > 200) this.state.log.pop();
  },

  // ── 时间推进 ─────────────────────────────────────────────
  advanceTime(months) {
    const s = this.state;
    for (let i = 0; i < months; i++) {
      s.month++;
      if (s.month > 12) { s.month = 1; s.year++; s.age++; }

      // O: 更新季节
      this._updateSeason();
      // O: 季节影响体力恢复
      const seasonEff = this.getSeasonEffects();
      const energyRegen = 30 + (seasonEff.energyRegen || 0);
      s.energy = Math.min(100, s.energy + energyRegen);
      // 每月恢复气血
      s.hp = Math.min(s.maxHp, s.hp + 10);
      // 门派月度收益
      this._sectMonthly();
      // 随机触发事件（20%概率）
      if (Math.random() < 0.2) this._triggerRandomEvent();
      // 检查时限任务超时
      this._checkQuestDeadlines();
      // 每3个月刷新悬赏令
      if ((s.month % 3) === 1) this._refreshBounties();
      // Q: 每2个月刷新传闻，清理过期传闻
      this._tickRumors();
      // N: 检查势力追杀
      this._checkFactionHunt();
      // N: 邪气高时自动降低正道好感
      if (s.evil > 30 && s.month % 3 === 0) {
        this._applyFactionTrigger('high_evil');
      }
      // N: 声望高时提升江湖好感
      if (s.reputation > 50 && s.month % 6 === 0) {
        this._applyFactionTrigger('high_reputation');
      }
      // B: 检查武林大会
      this._checkTournamentAnnounce();
      // C: 检查奇遇触发
      this._checkHiddenEvents();
      // D: 结算弟子任务
      this._tickDiscipleMissions();
      // F: 检查秘籍研读进度
      this._checkManualStudy();
      // H: 检查地点解锁
      this.checkLocationUnlocks();
      // J: 检查年代事件（每年1月）
      if (s.month === 1) this._checkEraEvents();
      // K: 每月更新天气
      this._updateWeather();
      // L: 检查境界突破
      this._checkBreakthroughs();
      // R: 重伤倒计时
      this._tickInjury();
      // S: 随机触发富事件（10%概率，无待处理事件时）
      if (!s.pendingRichEvent && Math.random() < 0.10) this._triggerRichEvent();
    }
    // 检查称号（含新结局）
    this._checkTitles();
    this._checkExtraEndings();
  },

  // ── 门派月度收益 ─────────────────────────────────────────
  _sectMonthly() {
    const sect = this.getSect();
    if (!sect) return;
    const benefits = sect.benefits || [];
    benefits.forEach(b => {
      if (b.includes('声望+')) {
        const val = parseInt(b.match(/\d+/)?.[0] || 3);
        this.state.reputation += val;
      }
    });
    // 朝廷俸禄
    if (sect.type === 'court') {
      const salary = [0, 20, 40, 80, 150, 250, 400][this.state.sectRank] || 0;
      this.state.gold += salary;
      if (salary > 0) this.addLog(`领取朝廷俸禄 ${salary} 两银子`, 'gold');
    }
  },

  // ── 随机事件触发 ─────────────────────────────────────────
  _triggerRandomEvent() {
    const available = DATA.EVENTS.filter(e =>
      !this.state.eventHistory.includes(e.id) ||
      ['e_robbery','e_duel','e_orphan'].includes(e.id)
    );
    if (available.length === 0) return null;
    const event = available[Math.floor(Math.random() * available.length)];
    return event;
  },

  // ── 执行行动 ─────────────────────────────────────────────
  doAction(actionId, params = {}) {
    const s = this.state;
    const results = [];
    // 记录行动前的日志长度，用于收集本次行动产生的所有日志
    const logBefore = s.log ? s.log.length : 0;

    switch (actionId) {

      case 'rest': {
        // 休息：恢复体力和气血
        this._updateCombo('rest');
        const weatherRestBonus = this.getWeatherBonus('rest');
        const restMult = 1 + weatherRestBonus / 100;
        const hpGain = Math.floor(s.maxHp * 0.3 * restMult);
        s.hp = Math.min(s.maxHp, s.hp + hpGain);
        s.energy = Math.min(100, s.energy + Math.floor(40 * restMult));
        // 重伤时休息额外恢复
        if (s.isInjured) {
          s.injuredMonthsLeft = Math.max(0, s.injuredMonthsLeft - 0.5);
          this.addLog('重伤中休息，伤势恢复加快。', 'normal');
        }
        this.advanceTime(1);
        const w = this.getWeather();
        const weatherNote = weatherRestBonus !== 0 ? `（${w.icon}${w.name}：休息效果${weatherRestBonus > 0 ? '+' : ''}${weatherRestBonus}%）` : '';
        this.addLog(`你在${this.getLocation().name}休息了一个月，气血恢复了 ${hpGain} 点。${weatherNote}`, 'normal');
        results.push({ type:'hp', val:hpGain });
        break;
      }

      case 'train': {
        // 修炼：消耗体力，提升属性
        if (s.energy < 20) {
          this.addLog('体力不足，无法修炼。', 'warn');
          return { success:false, msg:'体力不足' };
        }
        if (s.isInjured) {
          this.addLog('你正在重伤中，强行修炼会加重伤势！', 'warn');
          // 重伤修炼有30%概率加重伤势
          if (Math.random() < 0.3) {
            s.injuredMonthsLeft += 1;
            this.addLog('伤势加重，多需1个月休养。', 'danger');
          }
        }
        this._updateCombo('train');
        const comboMult = this.getComboMultiplier();
        const injuryMult = this.getInjuryPenalty();
        s.energy -= 20;
        const gains = this._calcTrainGain();
        // 应用连击和重伤加成
        Object.keys(gains).forEach(k => {
          gains[k] = Math.max(1, Math.round(gains[k] * comboMult * injuryMult));
          s[k] = (s[k]||0) + gains[k];
        });
        this.advanceTime(1);
        const gainStr = Object.entries(gains).map(([k,v])=>`${this._statName(k)}+${v}`).join('，');

        // 顿悟机制：悟性越高，概率越大（最高15%）
        const enlightenChance = Math.min(0.15, 0.02 + s.perception * 0.001);
        let enlightened = false;
        let enlightenBonus = null;
        if (Math.random() < enlightenChance) {
          enlightened = true;
          // 顿悟：随机大幅提升一项核心属性
          const bonusOptions = [
            { key: 'innerPower', label: '内力', val: 10 + Math.floor(Math.random() * 15) },
            { key: 'swordSkill', label: '剑术', val: 8 + Math.floor(Math.random() * 12) },
            { key: 'strength', label: '力量', val: 6 + Math.floor(Math.random() * 10) },
            { key: 'agility', label: '身法', val: 6 + Math.floor(Math.random() * 10) },
            { key: 'perception', label: '悟性', val: 5 + Math.floor(Math.random() * 8) },
          ];
          enlightenBonus = bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
          s[enlightenBonus.key] = (s[enlightenBonus.key] || 0) + enlightenBonus.val;
          // 顿悟时给所有武功额外加经验
          s.martialArts.forEach(entry => this._addMartialExp(entry.id, 3));
          this.addLog(`💡 修炼中忽有所悟，灵台清明！${enlightenBonus.label}大幅提升+${enlightenBonus.val}！`, 'success');
        }

        this.addLog(`你刻苦修炼一个月，${gainStr}。`, 'success');
        results.push({ type:'train', gains, enlightened, enlightenBonus });
        break;
      }

      case 'wander': {
        // 游历：消耗时间和金钱，随机收获
        const cost = params.cost || { time:1, gold:20 };
        if (s.gold < cost.gold) {
          this.addLog('盘缠不足，无法出行。', 'warn');
          return { success:false, msg:'金钱不足' };
        }
        if (s.isInjured) {
          this.addLog('你正在重伤中，游历会消耗更多体力。', 'warn');
        }
        this._updateCombo('wander');
        const wanderComboMult = this.getComboMultiplier();
        const wanderInjuryMult = this.getInjuryPenalty();
        const weatherWanderBonus = this.getWeatherBonus('wander');
        s.gold -= cost.gold;
        this.advanceTime(cost.time);
        const wanderGain = this._calcWanderGain();
        // 应用连击、重伤、天气加成
        const wanderMult = wanderComboMult * wanderInjuryMult * (1 + weatherWanderBonus / 100);
        Object.keys(wanderGain).forEach(k => {
          wanderGain[k] = Math.max(0, Math.round(wanderGain[k] * wanderMult));
          s[k] = (s[k]||0) + wanderGain[k];
        });
        const ww = this.getWeather();
        const weatherWNote = weatherWanderBonus !== 0 ? `（${ww.icon}${ww.name}：游历效果${weatherWanderBonus > 0 ? '+' : ''}${weatherWanderBonus}%）` : '';
        this.addLog(`你游历江湖${cost.time}个月，花费${cost.gold}两银子，见识大增。${weatherWNote}`, 'story');
        results.push({ type:'wander', gains:wanderGain });
        break;
      }

      case 'work': {
        // 打工：获得金钱
        const earn = 10 + Math.floor(s.charm / 5) + Math.floor(Math.random() * 10);
        s.gold += earn;
        s.energy -= 15;
        this.advanceTime(1);
        this.addLog(`你在${this.getLocation().name}做了一个月的杂活，赚得 ${earn} 两银子。`, 'gold');
        results.push({ type:'gold', val:earn });
        break;
      }

      case 'learn_martial': {
        // 学习武功
        const { martialId, teacherId } = params;
        return this.learnMartial(martialId, teacherId);
      }

      case 'join_sect': {
        return this.joinSect(params.sectId);
      }

      case 'do_quest': {
        return this.doQuest(params.questId);
      }

      case 'travel': {
        // 前往某地
        return this.travel(params.locationId);
      }

      case 'talk': {
        // 与NPC交谈
        return this.talkToNPC(params.npcId);
      }

      case 'fight': {
        // 战斗
        return this.fight(params.npcId || params.enemyId);
      }

      case 'recruit': {
        return this.recruit(params.npcId);
      }

      case 'propose': {
        return this.propose(params.npcId);
      }

      case 'explore': {
        // 探索秘境
        if (s.energy < 30) {
          this.addLog('体力不足，无法探索。', 'warn');
          return { success:false, msg:'体力不足' };
        }
        s.energy -= 30;
        this.advanceTime(2);
        const roll = Math.random();
        if (roll < 0.15) {
          // 发现武功秘籍
          const unlearned = DATA.MARTIAL_ARTS.filter(m =>
            !s.martialArts.find(x => x.id === m.id) && m.tier <= 3
          );
          if (unlearned.length > 0) {
            const ma = unlearned[Math.floor(Math.random() * unlearned.length)];
            s.martialArts.push({ id: ma.id, level:1, exp:0 });
            this._applyBonus(s, ma.effect);
            this.addLog(`探索中发现了武功秘籍【${ma.name}】，你仔细研读，有所领悟！`, 'success');
          }
        } else if (roll < 0.3) {
          // 发现神兵
          const w = this._getRandomWeapon();
          if (w) {
            s.weapons.push(w.id);
            this.addLog(`探索中发现了神兵【${w.name}】！`, 'success');
          }
        } else if (roll < 0.5) {
          // 获得金钱
          const gold = 30 + Math.floor(Math.random() * 70);
          s.gold += gold;
          this.addLog(`探索中发现了一处藏宝，获得 ${gold} 两银子。`, 'gold');
        } else if (roll < 0.65) {
          // 遭遇危险
          const hpLoss = 10 + Math.floor(Math.random() * 20);
          s.hp = Math.max(1, s.hp - hpLoss);
          this.addLog(`探索途中遭遇危险，损失气血 ${hpLoss} 点。`, 'danger');
        } else {
          // 增长见识
          const gains = { perception: 3 + Math.floor(Math.random()*3), innerPower: 2 };
          this._applyBonus(s, gains);
          this.addLog('探索一番，见识大增，悟性和内力均有提升。', 'normal');
        }
        results.push({ type:'explore' });
        break;
      }

      case 'buy_weapon': {
        return this.buyWeapon(params.weaponId);
      }

      case 'event_choice': {
        return this.resolveEventChoice(params.eventId, params.choiceIdx);
      }

      case 'sect_contribute': {
        return this.sectContribute();
      }

      case 'sect_promote': {
        return this.checkSectPromotion();
      }
    }

    // 收集本次行动产生的所有新日志
    const newLogs = s.log ? s.log.slice(logBefore) : [];
    return { success:true, results, newLogs };
  },

  // ── 修炼收益计算 ─────────────────────────────────────────
  _calcTrainGain() {
    const s = this.state;
    const gains = {};
    const titleBonus = this._getTitleBonus();
    const seasonEff = this.getSeasonEffects();
    const trainMod = 1 + (titleBonus.trainingBonus || 0) / 100
                       + (seasonEff.trainBonus || 0) / 100;
    const base = Math.ceil((1 + Math.floor(s.perception / 20)) * trainMod);

    // 根据已学武功决定修炼方向
    const innerMartials = s.martialArts.filter(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      return ma && ma.type === 'inner';
    });
    const swordMartials = s.martialArts.filter(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      return ma && ma.type === 'sword';
    });

    const innerMod = 1 + (seasonEff.innerBonus || 0) / 100;
    const swordMod = 1 + (seasonEff.swordBonus || 0) / 100;

    if (innerMartials.length > 0) {
      gains.innerPower = Math.ceil((base + Math.floor(Math.random() * 3)) * innerMod);
      // M: 给内功武功增加修炼经验
      innerMartials.forEach(m => this._addMartialExp(m.id, 1));
    } else gains.innerPower = 1;

    if (swordMartials.length > 0) {
      gains.swordSkill = Math.ceil((base + Math.floor(Math.random() * 2)) * swordMod);
      swordMartials.forEach(m => this._addMartialExp(m.id, 1));
    }
    gains.endurance = 1;
    if (Math.random() < 0.3) gains.strength = 1;
    if (Math.random() < 0.3) gains.agility = 1;

    // 门派加成
    if (this.getSect()) {
      Object.keys(gains).forEach(k => { gains[k] = Math.ceil(gains[k] * 1.3); });
    }

    return gains;
  },

  // ── 游历收益计算 ─────────────────────────────────────────
  _calcWanderGain() {
    const s = this.state;
    return {
      perception: 1 + Math.floor(Math.random() * 3),
      charm: Math.floor(Math.random() * 2),
      reputation: 2 + Math.floor(Math.random() * 5),
      luck: Math.floor(Math.random() * 2),
    };
  },

  // ── 学习武功 ─────────────────────────────────────────────
  // fromManual=true 时跳过属性检查（秘籍研读已在研读阶段验证）
  learnMartial(martialId, teacherId, fromManual = false) {
    const s = this.state;
    const ma = DATA.MARTIAL_ARTS.find(m => m.id === martialId);
    if (!ma) return { success:false, msg:'武功不存在' };

    // 检查是否已学
    if (s.martialArts.find(m => m.id === martialId)) {
      return { success:false, msg:'你已经学过这门武功了' };
    }

    // 检查前置条件（从秘籍学习时跳过）
    if (!fromManual) {
      const req = ma.require;
      for (const [k, v] of Object.entries(req)) {
        if ((s[k] || 0) < v) {
          return { success:false, msg:`需要${this._statName(k)}达到${v}，当前为${s[k]||0}` };
        }
      }
    }

    // 检查师傅好感度（如果有师傅）
    if (teacherId) {
      const favor = s.npcFavor[teacherId] || 0;
      if (favor < 30) {
        return { success:false, msg:'与师傅的好感度不足，需要先增进感情' };
      }
      // 消耗人情
      s.npcFavor[teacherId] = Math.max(0, s.npcFavor[teacherId] - 10);
    }

    // 学习成功
    s.martialArts.push({ id: martialId, level: 1, exp: 0 });
    // 应用武功效果
    this._applyBonus(s, ma.effect);
    this.advanceTime(2); // 学武功需要时间
    this.addLog(`你学会了【${ma.name}】！${ma.desc}`, 'success');

    return { success:true, martial: ma };
  },

  // ── 加入门派 ─────────────────────────────────────────────
  joinSect(sectId) {
    const s = this.state;
    if (s.sect) {
      return { success:false, msg:'你已经加入了门派，不能再加入其他门派' };
    }
    const sect = DATA.SECTS.find(x => x.id === sectId);
    if (!sect) return { success:false, msg:'门派不存在' };

    // 检查加入条件
    const req = sect.require;
    for (const [k, v] of Object.entries(req)) {
      if ((s[k] || 0) < v) {
        return { success:false, msg:`加入${sect.name}需要${this._statName(k)}达到${v}` };
      }
    }

    s.sect = sectId;
    s.sectRank = 0;
    s.sectContrib = 0;
    this.addLog(`你正式加入了【${sect.name}】，成为${sect.ranks[0]}。`, 'success');
    return { success:true, sect };
  },

  // ── 门派贡献 ─────────────────────────────────────────────
  sectContribute() {
    const s = this.state;
    const sect = this.getSect();
    if (!sect) return { success:false, msg:'你尚未加入任何门派' };

    const cost = 20; // 消耗金钱
    if (s.gold < cost) return { success:false, msg:'金钱不足' };

    s.gold -= cost;
    s.sectContrib += 30;
    s.energy -= 20;
    this.advanceTime(1);
    this.addLog(`你为${sect.name}效力一个月，贡献值+30。`, 'normal');

    // 检查晋升
    return this.checkSectPromotion();
  },

  // ── 检查门派晋升 ─────────────────────────────────────────
  checkSectPromotion() {
    const s = this.state;
    const sect = this.getSect();
    if (!sect) return { success:false };

    const nextRank = s.sectRank + 1;
    if (nextRank >= sect.ranks.length) {
      return { success:false, msg:'你已是门派最高职位' };
    }

    const reqContrib = sect.rankReq[nextRank];
    if (s.sectContrib >= reqContrib && s.reputation >= reqContrib / 10) {
      s.sectRank = nextRank;
      const rankName = sect.ranks[nextRank];
      this.addLog(`恭喜！你在${sect.name}晋升为【${rankName}】！`, 'success');
      return { success:true, newRank: rankName };
    }

    return { success:false, msg:`晋升需要贡献值${reqContrib}，当前${s.sectContrib}` };
  },

  // ── 接取任务 ─────────────────────────────────────────────
  acceptQuest(questId) {
    const s = this.state;
    const quest = DATA.QUESTS.find(q => q.id === questId);
    if (!quest) return { success:false, msg:'任务不存在' };

    // 已完成且不可重复
    if (s.completedQuests.includes(questId) && !quest.repeatable) {
      return { success:false, msg:'你已经完成过这个任务了' };
    }
    // 已在进行中
    if (s.activeQuests.find(q => q.id === questId)) {
      return { success:false, msg:'你已经接取了这个任务' };
    }

    // 检查前置条件
    for (const [k, v] of Object.entries(quest.require)) {
      if ((s[k] || 0) < v) {
        return { success:false, msg:`需要${this._statName(k)}达到${v}` };
      }
    }

    // 计算截止时间
    const currentMonth = s.year * 12 + s.month;
    const deadline = quest.timeLimit ? currentMonth + quest.timeLimit : null;

    s.activeQuests.push({ id: questId, acceptedAt: currentMonth, deadline });
    const limitStr = quest.timeLimit ? `（限时${quest.timeLimit}个月）` : '';
    this.addLog(`你接取了任务【${quest.name}】${limitStr}，出发吧！`, 'info');
    return { success:true, quest };
  },

  // ── 执行任务 ─────────────────────────────────────────────
  doQuest(questId) {
    const s = this.state;
    const quest = DATA.QUESTS.find(q => q.id === questId);
    if (!quest) return { success:false, msg:'任务不存在' };

    // 如果未接取，先自动接取
    if (!s.activeQuests.find(q => q.id === questId)) {
      const acceptResult = this.acceptQuest(questId);
      if (!acceptResult.success) return acceptResult;
    }

    // 检查前置条件
    for (const [k, v] of Object.entries(quest.require)) {
      if ((s[k] || 0) < v) {
        return { success:false, msg:`需要${this._statName(k)}达到${v}` };
      }
    }

    // 消耗
    const cost = quest.cost;
    if (cost.gold && s.gold < cost.gold) return { success:false, msg:'金钱不足' };
    if (cost.energy && s.energy < cost.energy) return { success:false, msg:'体力不足' };

    if (cost.gold) s.gold -= cost.gold;
    if (cost.energy) s.energy -= cost.energy;

    // 战斗类任务有失败概率
    if (quest.type === 'combat') {
      const power = this._calcCombatPower();
      const difficulty = quest.difficulty * 20;
      if (power < difficulty && Math.random() < 0.4) {
        s.hp = Math.max(1, s.hp - 30);
        this.advanceTime(cost.time);
        this.addLog(`任务【${quest.name}】失败，你受了重伤。`, 'danger');
        return { success:false, msg:'任务失败，受伤撤退' };
      }
    }

    // 奖励
    const reward = quest.reward;
    this._applyQuestReward(reward);

    // 从进行中移除，加入已完成
    s.activeQuests = s.activeQuests.filter(q => q.id !== questId);
    if (!s.completedQuests.includes(questId)) s.completedQuests.push(questId);
    this.advanceTime(cost.time);

    const rewardStr = [
      reward.gold ? `金钱+${reward.gold}` : '',
      reward.reputation ? `声望+${reward.reputation}` : '',
      reward.morality ? `道德+${reward.morality}` : '',
      reward.item ? `获得${DATA.ITEMS.find(i=>i.id===reward.item)?.name||'物品'}` : '',
    ].filter(Boolean).join('，');

    this.addLog(`任务【${quest.name}】完成！${rewardStr}`, 'success');

    // 任务链：解锁下一个任务
    if (quest.chain) {
      const nextQuest = DATA.QUESTS.find(q => q.id === quest.chain);
      if (nextQuest) {
        this.addLog(`新任务解锁：【${nextQuest.name}】`, 'info');
      }
    }

    // 检查称号
    this._checkTitles();

    return { success:true, quest, reward, chainQuest: quest.chain || null };
  },

  // ── 执行悬赏令 ─────────────────────────────────────────────
  doBounty(bountyIdx) {
    const s = this.state;
    const bounty = s.activeBounties[bountyIdx];
    if (!bounty) return { success:false, msg:'悬赏令不存在' };

    // 检查前置条件
    for (const [k, v] of Object.entries(bounty.require || {})) {
      if ((s[k] || 0) < v) {
        return { success:false, msg:`需要${this._statName(k)}达到${v}` };
      }
    }

    const cost = bounty.cost;
    if (cost.energy && s.energy < cost.energy) return { success:false, msg:'体力不足' };
    if (cost.energy) s.energy -= cost.energy;

    // 战斗类有失败概率
    if (bounty.type === 'combat') {
      const power = this._calcCombatPower();
      const difficulty = bounty.difficulty * 20;
      if (power < difficulty && Math.random() < 0.35) {
        s.hp = Math.max(1, s.hp - 20);
        this.advanceTime(cost.time);
        this.addLog(`悬赏令【${bounty.name}】失败，你受了轻伤。`, 'danger');
        return { success:false, msg:'悬赏令失败' };
      }
    }

    // 奖励（悬赏令奖励有随机浮动）
    const reward = { ...bounty.reward };
    reward.gold = Math.floor(reward.gold * (0.8 + Math.random() * 0.4));
    this._applyQuestReward(reward);
    this.advanceTime(cost.time);

    // 移除已完成的悬赏令
    s.activeBounties.splice(bountyIdx, 1);

    this.addLog(`悬赏令【${bounty.name}】完成！获得${reward.gold}两银子，声望+${reward.reputation||0}。`, 'success');
    this._checkTitles();
    return { success:true, bounty, reward };
  },

  // ── 应用任务奖励 ─────────────────────────────────────────
  _applyQuestReward(reward) {
    const s = this.state;
    // 称号加成
    const titleBonus = this._getTitleBonus();
    const rewardMod = 1 + (titleBonus.questRewardMod || 0) / 100;

    if (reward.gold) { s.gold += Math.floor(reward.gold * rewardMod); }
    if (reward.reputation) { s.reputation += Math.floor(reward.reputation * rewardMod); }
    if (reward.morality) { s.morality = Math.min(100, s.morality + reward.morality); }
    if (reward.evil) { s.evil += reward.evil; }
    if (reward.exp) { this._gainExp(reward.exp); }
    if (reward.favor) {
      s.npcFavor[reward.favor.npc] = (s.npcFavor[reward.favor.npc] || 0) + reward.favor.val;
    }
    if (reward.randomWeapon) {
      const weapon = this._getRandomWeapon();
      if (weapon) {
        s.weapons.push(weapon.id);
        this.addLog(`你获得了神兵【${weapon.name}】！`, 'success');
      }
    }
    // 物品奖励
    if (reward.item) {
      this.addItem(reward.item, 1);
    }
  },

  // ── 检查时限任务超时 ─────────────────────────────────────
  _checkQuestDeadlines() {
    const s = this.state;
    const currentMonth = s.year * 12 + s.month;
    const expired = s.activeQuests.filter(q => q.deadline && currentMonth > q.deadline);
    expired.forEach(aq => {
      const quest = DATA.QUESTS.find(q => q.id === aq.id);
      s.activeQuests = s.activeQuests.filter(q => q.id !== aq.id);
      this.addLog(`任务【${quest?.name || aq.id}】已超时失败！`, 'danger');
    });
  },

  // ── 刷新悬赏令 ─────────────────────────────────────────────
  _refreshBounties() {
    const s = this.state;
    // 保留未完成的，补充到3条
    const maxBounties = 3;
    const locs = ['小镇', '江湖', '襄阳', '古墓'];
    const enemies = ['山贼头目', '蒙古细作', '魔教弟子', '江洋大盗', '恶霸地主'];
    const templates = DATA.BOUNTY_TEMPLATES;

    while (s.activeBounties.length < maxBounties) {
      const tpl = templates[Math.floor(Math.random() * templates.length)];
      const loc = locs[Math.floor(Math.random() * locs.length)];
      const enemy = enemies[Math.floor(Math.random() * enemies.length)];
      const goldVal = tpl.reward.gold + Math.floor(Math.random() * 30);
      const desc = tpl.descTpl
        .replace('{loc}', loc)
        .replace('{enemy}', enemy)
        .replace('{gold}', goldVal);
      s.activeBounties.push({
        name: tpl.name,
        type: tpl.type,
        difficulty: tpl.difficulty,
        desc,
        reward: { ...tpl.reward, gold: goldVal },
        cost: { ...tpl.cost },
        require: { ...tpl.require },
      });
    }
  },

  // ── 前往某地 ─────────────────────────────────────────────
  travel(locationId) {
    const s = this.state;
    const loc = DATA.LOCATIONS.find(l => l.id === locationId);
    if (!loc) return { success:false, msg:'地点不存在' };

    const travelCost = { time:1, gold: 10 + loc.danger * 5 };
    if (s.gold < travelCost.gold) return { success:false, msg:'盘缠不足' };

    s.gold -= travelCost.gold;
    s.location = locationId;
    // C: 记录地点访问次数
    this._recordLocationVisit(locationId);
    this.advanceTime(travelCost.time);

    this.addLog(`你前往了【${loc.name}】。${loc.desc}`, 'story');

    // 危险地区可能遭遇战斗
    if (loc.danger >= 3 && Math.random() < 0.3) {
      this.addLog('途中遭遇了危险！', 'danger');
      return { success:true, loc, encounter:true };
    }

    return { success:true, loc };
  },

  // ── 与NPC交谈 ─────────────────────────────────────────────
  talkToNPC(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'NPC不存在' };

    // 增加好感度
    const favorGain = 5 + Math.floor(s.charm / 10);
    s.npcFavor[npcId] = Math.min(100, (s.npcFavor[npcId] || 0) + favorGain);

    const dialog = npc.dialog[Math.floor(Math.random() * npc.dialog.length)];
    this.addLog(`${npc.name}（${npc.title}）说："${dialog}"`, 'dialog');
    this.addLog(`与${npc.name}的好感度+${favorGain}`, 'info');

    return { success:true, npc, dialog, favorGain };
  },

  // ── 战斗系统 ─────────────────────────────────────────────
  fight(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'对手不存在' };

    // 重伤时战斗力减半
    const injuryMult = this.getInjuryPenalty();
    // 连击加成
    this._updateCombo('fight');
    const comboMult = this.getComboMultiplier();

    let myPower = this._calcCombatPower() * injuryMult * comboMult;
    const enemyPower = npc.power;

    // 检查是否有仇人加成（仇人更强）
    const grudge = s.grudges.find(g => g.npcId === npcId);
    const enemyFinalPower = grudge ? enemyPower * (1 + grudge.intensity * 0.2) : enemyPower;

    const winChance = myPower / (myPower + enemyFinalPower);
    const won = Math.random() < winChance;

    const hpLoss = Math.floor(enemyFinalPower * (0.1 + Math.random() * 0.2));
    s.hp = Math.max(0, s.hp - hpLoss);

    // 检查濒死
    let nearDeath = false;
    let nearDeathResult = null;
    if (s.hp <= 0) {
      nearDeathResult = this._checkNearDeath();
      nearDeath = true;
    }

    if (won && !nearDeath) {
      s.battlesWon++;
      const expGain = Math.floor(enemyFinalPower / 2);
      this._gainExp(expGain);
      s.reputation += Math.floor(enemyFinalPower / 10);
      // 好感度变化
      if (npc.align === 'evil') {
        s.morality = Math.min(100, s.morality + 5);
        s.reputation += 10;
      } else {
        s.morality = Math.max(0, s.morality - 5);
        s.evil += 5;
      }
      // 击败仇人：化解仇怨
      if (grudge) {
        this.resolveGrudge(npcId);
        this.addLog(`你击败了仇人【${npc.name}】，一雪前耻！`, 'success');
      }
      // 击败恩人：结下新仇怨
      const debt = s.debts.find(d => d.npcId === npcId);
      if (debt) {
        this.addGrudge(npcId, npc.name, '恩将仇报，出手伤人', 2);
        s.morality = Math.max(0, s.morality - 15);
      }
      this.addLog(`你与${npc.name}大战一场，最终获胜！损失气血${hpLoss}点，获得经验${expGain}。`, 'success');
      return { success:true, won:true, hpLoss, expGain, nearDeath };
    } else if (nearDeath) {
      s.battlesLost++;
      // 败给仇人：仇怨加深
      if (grudge) {
        grudge.intensity = Math.min(3, grudge.intensity + 1);
        this.addLog(`你被仇人【${npc.name}】击败，仇怨加深！`, 'danger');
      } else {
        // 新结仇怨
        this.addGrudge(npcId, npc.name, '战败受辱', 1);
      }
      this.addLog(`你与${npc.name}交手，身受重伤，险些丧命！`, 'danger');
      return { success:true, won:false, hpLoss, nearDeath: true, nearDeathResult };
    } else {
      s.battlesLost++;
      s.hp = Math.max(1, s.hp);
      // 败给仇人：仇怨加深
      if (grudge) {
        grudge.intensity = Math.min(3, grudge.intensity + 1);
      } else {
        // 有一定概率结下仇怨
        if (Math.random() < 0.3) {
          this.addGrudge(npcId, npc.name, '战败受辱', 1);
        }
      }
      // 重伤判定：血量低于20%时触发重伤
      if (s.hp < s.maxHp * 0.2 && !s.isInjured) {
        this._applyInjury(`与${npc.name}交手受伤`, 2);
      }
      this.addLog(`你与${npc.name}交手，不敌对方，狼狈败退，损失气血${hpLoss}点。`, 'danger');
      return { success:true, won:false, hpLoss, nearDeath: false };
    }
  },

  // ── 计算战斗力 ─────────────────────────────────────────────
  _calcCombatPower() {
    const s = this.state;
    let power = s.strength * 0.3 + s.innerPower * 0.4 + s.agility * 0.2 + s.swordSkill * 0.1;
    // 武器加成
    if (s.equippedWeapon) {
      const w = DATA.WEAPONS.find(x => x.id === s.equippedWeapon);
      if (w) {
        power += (w.bonus.strength || 0) + (w.bonus.swordSkill || 0);
      }
    }
    // 境界加成
    const realm = this.getRealm();
    const realmBonus = { r_mortal:1, r_xiantian:1.3, r_zongshi:1.7, r_jueding:2.2, r_legend:3 };
    power *= realmBonus[realm.id] || 1;
    // 称号战斗加成
    const titleBonus = this._getTitleBonus();
    power += (titleBonus.combatBonus || 0);
    return Math.floor(power);
  },

  // ── 招募小弟 ─────────────────────────────────────────────
  recruit(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'NPC不存在' };
    if (!npc.canRecruit) return { success:false, msg:`${npc.name}不愿意跟随你` };

    const favor = s.npcFavor[npcId] || 0;
    if (favor < 50) {
      return { success:false, msg:`与${npc.name}的好感度不足（需要50，当前${favor}）` };
    }

    if (s.followers.find(f => f.npcId === npcId)) {
      return { success:false, msg:`${npc.name}已经是你的手下了` };
    }

    s.followers.push({ npcId, loyalty: favor });
    this.addLog(`${npc.name}决定跟随你，成为你的手下！`, 'success');
    return { success:true, npc };
  },

  // ── 求婚 ─────────────────────────────────────────────────
  propose(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'NPC不存在' };
    if (!npc.canMarry) return { success:false, msg:`${npc.name}无法成为你的伴侣` };
    if (s.spouse) return { success:false, msg:'你已经有伴侣了' };

    const favor = s.npcFavor[npcId] || 0;
    if (favor < 80) {
      return { success:false, msg:`与${npc.name}的好感度不足（需要80，当前${favor}）` };
    }

    s.spouse = npcId;
    this.addLog(`${npc.name}答应了你的求婚，你们结为夫妻！`, 'success');
    return { success:true, npc };
  },

  // ── 背包：添加物品 ─────────────────────────────────────────
  addItem(itemId, count = 1) {
    const s = this.state;
    s.inventory[itemId] = (s.inventory[itemId] || 0) + count;
    const item = DATA.ITEMS.find(i => i.id === itemId);
    if (item) this.addLog(`获得 ${item.icon}${item.name} x${count}`, 'gold');
  },

  // ── 背包：使用物品 ─────────────────────────────────────────
  useItem(itemId) {
    const s = this.state;
    const count = s.inventory[itemId] || 0;
    if (count <= 0) return { success:false, msg:'背包中没有这个物品' };

    const item = DATA.ITEMS.find(i => i.id === itemId);
    if (!item) return { success:false, msg:'物品不存在' };
    if (!item.effect || Object.keys(item.effect).length === 0) {
      return { success:false, msg:'这个物品无法直接使用' };
    }

    // 应用效果
    const eff = item.effect;
    const msgs = [];
    if (eff.energy) {
      const gain = Math.min(eff.energy, 100 - s.energy);
      s.energy = Math.min(100, s.energy + eff.energy);
      if (gain > 0) msgs.push(`体力+${gain}`);
    }
    if (eff.hp) {
      const gain = Math.min(eff.hp, s.maxHp - s.hp);
      s.hp = Math.min(s.maxHp, s.hp + eff.hp);
      if (gain > 0) msgs.push(`气血+${gain}`);
    }
    if (eff.innerPower) {
      s.innerPower += eff.innerPower;
      msgs.push(`内力+${eff.innerPower}`);
    }
    if (eff.strength && !eff.duration) {
      s.strength += eff.strength;
      msgs.push(`力量+${eff.strength}`);
    }
    if (eff.agility && !eff.duration) {
      s.agility += eff.agility;
      msgs.push(`身法+${eff.agility}`);
    }
    if (eff.curePoison) {
      msgs.push('解除毒素');
    }
    // 临时效果（duration=1月）
    if (eff.duration) {
      if (eff.strength) msgs.push(`力量临时+${eff.strength}（1月）`);
      if (eff.agility) msgs.push(`身法临时${eff.agility}（1月）`);
    }

    s.inventory[itemId]--;
    if (s.inventory[itemId] <= 0) delete s.inventory[itemId];

    this.addLog(`使用了 ${item.icon}${item.name}：${msgs.join('，')}`, 'success');
    return { success:true, item, effects: msgs };
  },

  // ── 背包：出售物品 ─────────────────────────────────────────
  sellItem(itemId, count = 1) {
    const s = this.state;
    const owned = s.inventory[itemId] || 0;
    if (owned < count) return { success:false, msg:`背包中只有${owned}个` };

    const item = DATA.ITEMS.find(i => i.id === itemId);
    if (!item) return { success:false, msg:'物品不存在' };

    const total = item.sellPrice * count;
    s.gold += total;
    s.inventory[itemId] -= count;
    if (s.inventory[itemId] <= 0) delete s.inventory[itemId];

    this.addLog(`出售 ${item.icon}${item.name} x${count}，获得${total}两银子。`, 'gold');
    return { success:true, gold: total };
  },

  // ── 商店：购买物品 ─────────────────────────────────────────
  buyItem(itemId, count = 1) {
    const s = this.state;
    const item = DATA.ITEMS.find(i => i.id === itemId);
    if (!item) return { success:false, msg:'物品不存在' };
    if (item.buyPrice <= 0) return { success:false, msg:'此物品无法购买' };

    // 称号折扣
    const titleBonus = this._getTitleBonus();
    const discount = (titleBonus.itemDiscountMod || 0) / 100;
    const price = Math.floor(item.buyPrice * (1 - discount)) * count;

    if (s.gold < price) return { success:false, msg:`金钱不足，需要${price}两` };

    s.gold -= price;
    this.addItem(itemId, count);
    this.addLog(`购买了 ${item.icon}${item.name} x${count}，花费${price}两。`, 'gold');
    return { success:true, item, price };
  },

  // ── 获取当前商店库存 ─────────────────────────────────────
  getShopItems() {
    const loc = this.getLocation();
    const shopItems = DATA.SHOPS[loc.name] || [];
    return shopItems.map(id => DATA.ITEMS.find(i => i.id === id)).filter(Boolean);
  },

  // ── 称号：检查并授予 ─────────────────────────────────────
  _checkTitles() {
    const s = this.state;
    DATA.TITLES.forEach(title => {
      if (s.titles.includes(title.id)) return;
      const cond = title.condition;
      let match = true;
      for (const [k, v] of Object.entries(cond)) {
        if (k === 'questDone') {
          if (!s.completedQuests.includes(v)) { match = false; break; }
        } else if (k === 'goldBelow') {
          if (s.gold >= v) { match = false; break; }
        } else {
          if ((s[k] || 0) < v) { match = false; break; }
        }
      }
      if (match) {
        s.titles.push(title.id);
        if (!s.activeTitle) s.activeTitle = title.id;
        const tierStr = ['', '【普通】', '【稀有】', '【传奇】'][title.tier] || '';
        this.addLog(`🏅 获得称号 ${tierStr}「${title.name}」！${title.desc}`, 'success');
      }
    });
  },

  // ── 称号：设置当前展示称号 ─────────────────────────────────
  setActiveTitle(titleId) {
    const s = this.state;
    if (!s.titles.includes(titleId)) return { success:false, msg:'尚未获得此称号' };
    s.activeTitle = titleId;
    const title = DATA.TITLES.find(t => t.id === titleId);
    this.addLog(`你将称号更换为「${title?.name}」。`, 'info');
    return { success:true };
  },

  // ── 称号：获取当前称号加成 ─────────────────────────────────
  _getTitleBonus() {
    const s = this.state;
    const bonus = { npcFavorMod:0, questRewardMod:0, combatBonus:0,
                    trainingBonus:0, itemDiscountMod:0, stealthBonus:0 };
    s.titles.forEach(tid => {
      const title = DATA.TITLES.find(t => t.id === tid);
      if (!title) return;
      const eff = title.effect;
      Object.keys(bonus).forEach(k => {
        if (eff[k]) bonus[k] += eff[k];
      });
    });
    return bonus;
  },

  // ── 获取已获得称号列表 ─────────────────────────────────────
  getTitles() {
    const s = this.state;
    return s.titles.map(tid => DATA.TITLES.find(t => t.id === tid)).filter(Boolean);
  },

  // ── 购买武器 ─────────────────────────────────────────────
  buyWeapon(weaponId) {
    const s = this.state;
    const weapon = DATA.WEAPONS.find(w => w.id === weaponId);
    if (!weapon) return { success:false, msg:'武器不存在' };

    const price = weapon.tier * 30;
    if (s.gold < price) return { success:false, msg:`金钱不足，需要${price}两` };

    s.gold -= price;
    if (!s.weapons.includes(weaponId)) s.weapons.push(weaponId);
    s.equippedWeapon = weaponId;
    this._applyBonus(s, weapon.bonus);
    this.addLog(`你购买并装备了【${weapon.name}】！`, 'success');
    return { success:true, weapon };
  },

  // ── 处理事件选择 ─────────────────────────────────────────
  resolveEventChoice(eventId, choiceIdx) {
    const s = this.state;
    const event = DATA.EVENTS.find(e => e.id === eventId);
    if (!event) return { success:false };

    const choice = event.choices[choiceIdx];
    if (!choice) return { success:false };

    // 检查前置条件
    if (choice.require === 'hasSect' && !s.sect) {
      return { success:false, msg:'你尚未加入门派' };
    }
    if (choice.require === 'evil' && s.evil < 10) {
      return { success:false, msg:'你的邪气不足' };
    }

    // 应用效果
    this._applyBonus(s, choice.effect);
    // 道德值限制
    s.morality = Math.max(0, Math.min(100, s.morality));

    // 特殊效果
    if (choice.special === 'recruit_bandit') {
      s.followers.push({ npcId:'bandit_' + Date.now(), loyalty:40, name:'改邪归正的山贼' });
    }
    if (choice.special === 'recruit_orphan') {
      s.followers.push({ npcId:'orphan_' + Date.now(), loyalty:80, name:'孤儿小弟' });
    }
    if (choice.special === 'find_weapon') {
      const w = this._getRandomWeapon();
      if (w) {
        s.weapons.push(w.id);
        this.addLog(`你在古墓中发现了神兵【${w.name}】！`, 'success');
      }
    }

    if (!s.eventHistory.includes(eventId)) s.eventHistory.push(eventId);

    this.addLog(choice.result, 'story');
    return { success:true, choice };
  },

  // ── 经验增长 ─────────────────────────────────────────────
  _gainExp(exp) {
    const s = this.state;
    // 经验转化为属性提升
    const gain = Math.floor(exp / 20);
    if (gain > 0) {
      s.perception += gain;
      s.innerPower += Math.floor(gain / 2);
    }
  },

  // ── 随机获取武器 ─────────────────────────────────────────
  _getRandomWeapon() {
    const s = this.state;
    const available = DATA.WEAPONS.filter(w => !s.weapons.includes(w.id) && w.tier <= 3);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  },

  // ── 生成行动叙事文本 ─────────────────────────────────────
  generateActionNarrative(actionId, result) {
    const s = this.state;
    const loc = this.getLocation();
    const season = this.getSeason();
    const locName = loc ? loc.name : '江湖';
    const seasonName = season ? season.name : '春';

    const narratives = {
      rest: [
        `${seasonName}日里，你在${locName}寻了一处僻静之所，闭目养神，任凭微风拂面。伤势渐渐好转，精神也恢复了几分。`,
        `你在客栈中歇息了整整一个月，每日以药草调养，以内功运气，气血渐渐充盈。`,
        `借着${seasonName}日的暖阳，你在${locName}的山间小屋中静养，听松涛阵阵，心境平和，体力大复。`,
        `你找了处清幽之地，每日打坐调息，以内力疏通经脉，伤势恢复了不少。`,
      ],
      train: [
        `${seasonName}日清晨，你在${locName}寻了处空旷之地，一遍遍演练武功，汗水湿透衣衫，却浑然不觉。`,
        `你闭关修炼，将所学武功反复钻研，每一招每一式都力求精准，内力在体内缓缓流转，愈发深厚。`,
        `月光下，你独自在${locName}练功，剑光如练，掌风呼啸，一月苦功终有所得。`,
        `你以${locName}的山石为靶，日复一日地磨砺拳脚，筋骨愈发强健，内力也更加浑厚。`,
      ],
      wander: [
        `你背负行囊，游历${locName}一带，途中结识了几位江湖人士，听闻了不少奇闻异事，见识大增。`,
        `${seasonName}风送爽，你漫步于${locName}的山水之间，偶遇高人指点，悟性有所提升。`,
        `你走遍了${locName}的大街小巷，与各色人等交谈，江湖阅历愈发丰富，声望也渐渐传开。`,
        `一路游历，你见识了江湖的险恶与美好，心境更加豁达，武学感悟也随之加深。`,
      ],
      work: [
        `你在${locName}的酒楼帮工，端茶倒水，偶尔也帮忙驱赶闹事的泼皮，赚了些辛苦钱。`,
        `你替${locName}的商队护镖，一路平安无事，赚得了一笔报酬。`,
        `你在${locName}做了些零散活计，虽然辛苦，但也积攒了些银两，够日后用度。`,
        `你在${locName}的镖局挂了个临时差事，凭着一身武艺，赚了不少银两。`,
      ],
      explore: [
        `你深入${locName}的险地探索，荆棘丛生，危机四伏，却也别有一番天地。`,
        `你循着传说中的线索，在${locName}附近的山谷中探寻，不知不觉间已过了数日。`,
        `你独自深入${locName}的秘境，遭遇了不少危险，却也有意外的收获。`,
        `带着一腔好奇，你探索了${locName}周边的未知之地，见到了常人难以见到的景象。`,
      ],
      quest: [
        `你接下了这桩差事，一路跋山涉水，历经波折，终于完成了任务，不负所托。`,
        `任务虽然艰难，但你凭借机智与武艺，一一化解了难关，顺利完成。`,
        `你全力以赴地完成了这次任务，虽然过程中遭遇了些许麻烦，但最终还是成功了。`,
      ],
      fight: [
        `两人对峙，剑拔弩张，一场切磋就此展开，招式往来间，各有所得。`,
        `你与对手过了数十招，拳脚相交，内力激荡，是一场难得的切磋。`,
      ],
      sect_contribute: [
        `你在门派中勤勉效力，协助师兄弟们处理事务，贡献了自己的一份力量。`,
        `你为门派奔走，完成了几件差事，赢得了师门的认可，贡献值有所提升。`,
      ],
    };

    const list = narratives[actionId] || [
      `你在${locName}度过了这段时光，虽无惊天动地之事，却也积累了些许经验。`,
    ];
    return list[Math.floor(Math.random() * list.length)];
  },

  // ── 属性名称映射 ─────────────────────────────────────────
  _statName(key) {
    const map = {
      hp:'气血', maxHp:'最大气血', innerPower:'内力', strength:'力量',
      agility:'身法', endurance:'体魄', perception:'悟性', charm:'魅力',
      speed:'速度', swordSkill:'剑术', luck:'运气', morality:'道德',
      evil:'邪气', reputation:'声望', gold:'金钱', energy:'体力',
    };
    return map[key] || key;
  },

  // ── 检查结局 ─────────────────────────────────────────────
  checkEnding() {
    const s = this.state;
    // 已触发过的结局不重复弹出
    if (!s.unlockedEndings) s.unlockedEndings = [];

    for (const ending of DATA.ENDINGS) {
      if (s.unlockedEndings.includes(ending.id)) continue;
      const cond = ending.condition;
      let match = true;
      for (const [k, v] of Object.entries(cond)) {
        if (k === 'sectRank') {
          if (s.sect !== v.sect || s.sectRank < v.rank) { match = false; break; }
        } else if (k === 'followers') {
          if (s.followers.length < v) { match = false; break; }
        } else if (k === 'spouse') {
          if (!s.spouse) { match = false; break; }
        } else if (k === 'age') {
          if ((s.age || 0) < v) { match = false; break; }
        } else {
          if ((s[k] || 0) < v) { match = false; break; }
        }
      }
      if (match) {
        s.unlockedEndings.push(ending.id);
        return ending;
      }
    }
    return null;
  },

  // ── 获取可用行动 ─────────────────────────────────────────
  getAvailableActions() {
    const s = this.state;
    const loc = this.getLocation();
    const actions = [];

    const actionDefs = {
      rest:     { name:'休息养伤', icon:'🛌', cost:'1个月', desc:'恢复气血和体力' },
      train:    { name:'刻苦修炼', icon:'⚔️', cost:'1个月+20体力', desc:'提升武功属性' },
      wander:   { name:'游历江湖', icon:'🗺️', cost:'1个月+20两', desc:'增长见识，随机奇遇' },
      work:     { name:'打工赚钱', icon:'💰', cost:'1个月+15体力', desc:'赚取银两' },
      talk:     { name:'结交人物', icon:'💬', cost:'无', desc:'与当地人物交谈' },
      shop:     { name:'购买装备', icon:'🛒', cost:'银两', desc:'购买武器装备' },
      quest:    { name:'接取任务', icon:'📜', cost:'不定', desc:'完成任务获得奖励' },
      fight:    { name:'切磋比武', icon:'🥊', cost:'体力', desc:'与人切磋，提升实战经验' },
      explore:  { name:'探索秘境', icon:'🔍', cost:'2个月+30体力', desc:'探索未知之地，寻找奇遇' },
    };

    (loc.actions || []).forEach(a => {
      if (actionDefs[a]) actions.push({ id:a, ...actionDefs[a] });
    });

    // 门派相关行动
    if (s.sect) {
      actions.push({ id:'sect_contribute', name:'为门派效力', icon:'🏯', cost:'1个月+20两', desc:'增加门派贡献值' });
    }

    return actions;
  },

  // ── 获取当地NPC ─────────────────────────────────────────
  getLocalNPCs() {
    const loc = this.getLocation();
    const s = this.state;
    const titleBonus = this._getTitleBonus();
    const favorMod = titleBonus.npcFavorMod || 0;
    return DATA.NPCS.filter(n => {
      // 根据地点匹配NPC
      const locName = loc.name;
      return n.location === locName ||
        (loc.id === 'l_town' && n.location === '小镇') ||
        (loc.id === 'l_jianghu' && n.location === '江湖') ||
        (loc.id === 'l_xiangyang' && (n.location === '襄阳' || n.id === 'n_guojing' || n.id === 'n_huangrong'));
    }).map(n => ({
      ...n,
      // 称号影响NPC好感显示（不修改实际值，只是展示加成）
      displayFavor: Math.min(100, (s.npcFavor[n.id] || 0) + favorMod)
    }));
  },

  // ── 获取可学武功 ─────────────────────────────────────────
  getLearnableMartials() {
    const s = this.state;
    const sect = this.getSect();
    const teachable = sect ? sect.teachable : [];
    const localNPCs = this.getLocalNPCs();

    const result = [];

    // 门派可学武功
    teachable.forEach(mid => {
      const ma = DATA.MARTIAL_ARTS.find(m => m.id === mid);
      if (ma && !s.martialArts.find(m => m.id === mid)) {
        result.push({ ...ma, source: '门派传授', teacherId: null });
      }
    });

    // NPC可教武功
    localNPCs.forEach(npc => {
      if (npc.canTeach) {
        const ma = DATA.MARTIAL_ARTS.find(m => m.id === npc.canTeach);
        if (ma && !s.martialArts.find(m => m.id === npc.canTeach)) {
          const favor = s.npcFavor[npc.id] || 0;
          result.push({ ...ma, source: `${npc.name}传授`, teacherId: npc.id, favor });
        }
      }
    });

    return result;
  },

  // ── 获取可用任务 ─────────────────────────────────────────
  getAvailableQuests() {
    const s = this.state;
    // 已完成且不可重复的排除
    // 任务链：只显示已解锁的（前置任务已完成，或是起始任务）
    const unlockedChainStarts = new Set();
    DATA.QUESTS.forEach(q => {
      if (q.chain) unlockedChainStarts.add(q.chain);
    });

    return DATA.QUESTS.filter(q => {
      if (s.completedQuests.includes(q.id) && !q.repeatable) return false;
      if (s.activeQuests.find(aq => aq.id === q.id)) return false;
      // 如果是链式任务的后续，需要前置任务已完成
      if (unlockedChainStarts.has(q.id)) {
        const prevQuest = DATA.QUESTS.find(prev => prev.chain === q.id);
        if (prevQuest && !s.completedQuests.includes(prevQuest.id)) return false;
      }
      return true;
    });
  },

  // ── 获取进行中任务 ─────────────────────────────────────────
  getActiveQuests() {
    const s = this.state;
    return s.activeQuests.map(aq => {
      const quest = DATA.QUESTS.find(q => q.id === aq.id);
      if (!quest) return null;
      const currentMonth = s.year * 12 + s.month;
      const remaining = aq.deadline ? aq.deadline - currentMonth : null;
      return { ...quest, acceptedAt: aq.acceptedAt, deadline: aq.deadline, remaining };
    }).filter(Boolean);
  },

  // ── 获取悬赏令 ─────────────────────────────────────────────
  getActiveBounties() {
    return this.state.activeBounties;
  },

  // ════════════════════════════════════════════════════════════
  //  Q: 江湖传闻系统
  // ════════════════════════════════════════════════════════════

  // 刷新/生成传闻
  _refreshRumors() {
    const s = this.state;
    const maxRumors = 3;
    if (s.activeRumors.length >= maxRumors) return;
    const currentMonth = s.year * 12 + s.month;
    const templates = DATA.RUMORS;
    const used = new Set(s.activeRumors.map(r => r.templateId));

    let attempts = 0;
    while (s.activeRumors.length < maxRumors && attempts < 20) {
      attempts++;
      const tpl = templates[Math.floor(Math.random() * templates.length)];
      if (used.has(tpl.id)) continue;
      used.add(tpl.id);

      const loc = tpl.locs[Math.floor(Math.random() * tpl.locs.length)];
      let desc = tpl.desc.replace('{loc}', loc);
      if (tpl.names) {
        const name = tpl.names[Math.floor(Math.random() * tpl.names.length)];
        desc = desc.replace('{name}', name);
      }
      if (tpl.sects) {
        const pair = tpl.sects[Math.floor(Math.random() * tpl.sects.length)];
        desc = desc.replace('{sect1}', pair[0]).replace('{sect2}', pair[1]);
      }

      s.activeRumors.push({
        templateId: tpl.id,
        type: tpl.type,
        urgency: tpl.urgency,
        title: tpl.title,
        desc,
        loc,
        reward: tpl.reward,
        require: tpl.require || {},
        cost: tpl.cost,
        expiresAt: currentMonth + 6 + Math.floor(Math.random() * 6),
      });
    }
  },

  // 每月处理传闻（清理过期、补充新传闻）
  _tickRumors() {
    const s = this.state;
    const currentMonth = s.year * 12 + s.month;
    const before = s.activeRumors.length;
    s.activeRumors = s.activeRumors.filter(r => r.expiresAt > currentMonth);
    if (s.activeRumors.length < before) {
      this.addLog('有几条江湖传闻已成旧事，新的消息又在流传……', 'info');
    }
    if (Math.random() < 0.4) this._refreshRumors();
  },

  // 前往处理传闻
  followRumor(rumorIdx) {
    const s = this.state;
    const rumor = s.activeRumors[rumorIdx];
    if (!rumor) return { success:false, msg:'传闻不存在' };

    // 检查前置条件
    for (const [k, v] of Object.entries(rumor.require)) {
      if (k === 'inventoryItem') {
        if (!(s.inventory[v] > 0)) return { success:false, msg:`需要持有${DATA.ITEMS.find(i=>i.id===v)?.name||v}` };
      } else if ((s[k] || 0) < v) {
        return { success:false, msg:`需要${this._statName(k)}达到${v}` };
      }
    }

    const cost = rumor.cost;
    if (cost.energy && s.energy < cost.energy) return { success:false, msg:'体力不足' };
    if (cost.energy) s.energy -= cost.energy;

    // 执行奖励
    const reward = rumor.reward;
    const msgs = [];
    let success = true;

    switch (reward.type) {
      case 'martial': {
        const unlearned = DATA.MARTIAL_ARTS.filter(m =>
          !s.martialArts.find(x => x.id === m.id) && m.tier <= 3
        );
        if (unlearned.length > 0) {
          const ma = unlearned[Math.floor(Math.random() * unlearned.length)];
          s.martialArts.push({ id: ma.id, level:1, exp:0 });
          this._applyBonus(s, ma.effect);
          msgs.push(`习得武功【${ma.name}】！`);
        } else {
          msgs.push('武学秘籍已被他人取走，空手而归。');
          success = false;
        }
        break;
      }
      case 'weapon': {
        const w = this._getRandomWeapon();
        if (w) { s.weapons.push(w.id); msgs.push(`获得神兵【${w.name}】！`); }
        else { msgs.push('神兵已被人捷足先登。'); success = false; }
        break;
      }
      case 'items': {
        reward.items.forEach(id => {
          this.addItem(id, 1);
          const item = DATA.ITEMS.find(i => i.id === id);
          if (item) msgs.push(`获得${item.icon}${item.name}`);
        });
        break;
      }
      case 'train': {
        this._applyBonus(s, reward.bonus);
        const bonusStr = Object.entries(reward.bonus).map(([k,v])=>`${this._statName(k)}+${v}`).join('，');
        msgs.push(`获得高人指点：${bonusStr}`);
        break;
      }
      case 'combat_win': {
        const power = this._calcCombatPower();
        if (power < 40 && Math.random() < 0.5) {
          s.hp = Math.max(1, s.hp - 30);
          msgs.push('实力不足，铩羽而归，受了重伤。');
          success = false;
        } else {
          if (reward.gold) { s.gold += reward.gold; msgs.push(`获得${reward.gold}两银子`); }
          if (reward.reputation) { s.reputation += reward.reputation; msgs.push(`声望+${reward.reputation}`); }
          if (reward.exp) this._gainExp(reward.exp);
          msgs.push('大获全胜！');
        }
        break;
      }
      case 'morality': {
        if (reward.morality) { s.morality = Math.min(100, s.morality + reward.morality); msgs.push(`道德+${reward.morality}`); }
        if (reward.reputation) { s.reputation += reward.reputation; msgs.push(`声望+${reward.reputation}`); }
        if (reward.gold) { s.gold += reward.gold; msgs.push(`获得${reward.gold}两`); }
        // 消耗草药
        if (rumor.require.inventoryItem) {
          const cnt = Math.min(s.inventory[rumor.require.inventoryItem] || 0, 3);
          s.inventory[rumor.require.inventoryItem] = Math.max(0, (s.inventory[rumor.require.inventoryItem]||0) - cnt);
          msgs.push(`消耗草药×${cnt}`);
        }
        this._applyFactionTrigger('help_village');
        break;
      }
      case 'gold': {
        const gold = reward.gold + Math.floor(Math.random() * 50);
        s.gold += gold;
        msgs.push(`获得${gold}两银子`);
        break;
      }
      case 'favor': {
        // 随机提升一个NPC好感
        const npcIds = Object.keys(s.npcFavor);
        if (npcIds.length > 0) {
          const npcId = npcIds[Math.floor(Math.random() * npcIds.length)];
          s.npcFavor[npcId] = Math.min(100, (s.npcFavor[npcId]||0) + (reward.npcBonus||20));
          const npc = DATA.NPCS.find(n => n.id === npcId);
          msgs.push(`与${npc?.name||'故人'}叙旧，好感+${reward.npcBonus||20}`);
        }
        break;
      }
      case 'choice': {
        msgs.push('你参与了门派纷争的调停，声望有所提升。');
        s.reputation += 20;
        s.morality = Math.min(100, s.morality + 5);
        break;
      }
    }

    this.advanceTime(cost.time);
    // 移除已处理的传闻
    s.activeRumors.splice(rumorIdx, 1);
    s.visitedRumors.push(rumor.templateId);

    const resultText = msgs.join('，');
    this.addLog(`【${rumor.title}】${success?'':'（失败）'} ${resultText}`, success?'success':'danger');
    this._checkTitles();
    return { success, rumor, msgs };
  },

  getActiveRumors() {
    return this.state.activeRumors;
  },

  // ════════════════════════════════════════════════════════════
  //  O: 季节系统
  // ════════════════════════════════════════════════════════════

  _updateSeason() {
    const month = this.state.month;
    let season = 'winter';
    for (const [key, data] of Object.entries(DATA.SEASONS)) {
      if (data.months.includes(month)) { season = key; break; }
    }
    const prev = this.state.season;
    this.state.season = season;
    if (prev !== season) {
      const s = DATA.SEASONS[season];
      this.addLog(`${s.icon} 时节更替，已入${s.name}季。${s.desc}`, 'story');
    }
  },

  getSeason() {
    return DATA.SEASONS[this.state.season] || DATA.SEASONS.spring;
  },

  getSeasonEffects() {
    return this.getSeason().effects || {};
  },

  // ════════════════════════════════════════════════════════════
  //  N: 江湖势力系统
  // ════════════════════════════════════════════════════════════

  // 应用势力触发器
  _applyFactionTrigger(trigger) {
    const s = this.state;
    DATA.FACTION_RULES.filter(r => r.trigger === trigger).forEach(rule => {
      const cur = s.factionAttitude[rule.faction] || 0;
      s.factionAttitude[rule.faction] = Math.max(-100, Math.min(100, cur + rule.delta));
    });
  },

  // 检查是否触发追杀
  _checkFactionHunt() {
    const s = this.state;
    DATA.FACTIONS.forEach(faction => {
      const attitude = s.factionAttitude[faction.id] || 0;
      if (attitude <= faction.huntThreshold && Math.random() < 0.15) {
        const hpLoss = 15 + Math.floor(Math.random() * 20);
        s.hp = Math.max(1, s.hp - hpLoss);
        this.addLog(`⚠️ ${faction.name}的人马追杀而来！你仓皇逃脱，损失气血${hpLoss}点。`, 'danger');
      }
    });
  },

  // 获取势力态度列表
  getFactionAttitudes() {
    const s = this.state;
    return DATA.FACTIONS.map(f => ({
      ...f,
      attitude: s.factionAttitude[f.id] || 0,
      status: this._getFactionStatus(s.factionAttitude[f.id] || 0),
    }));
  },

  _getFactionStatus(attitude) {
    if (attitude >= 70) return { label:'崇拜', color:'var(--gold)' };
    if (attitude >= 40) return { label:'友好', color:'var(--green-light)' };
    if (attitude >= 10) return { label:'中立', color:'var(--text-dim)' };
    if (attitude >= -20) return { label:'冷淡', color:'var(--text-muted)' };
    if (attitude >= -50) return { label:'敌视', color:'var(--red-light)' };
    return { label:'追杀', color:'var(--red)' };
  },

  // ════════════════════════════════════════════════════════════
  //  M: 武功升级系统
  // ════════════════════════════════════════════════════════════

  // 增加武功修炼经验，检查升级
  _addMartialExp(martialId, amount) {
    const s = this.state;
    const martialEntry = s.martialArts.find(m => m.id === martialId);
    if (!martialEntry) return;

    martialEntry.exp = (martialEntry.exp || 0) + amount;
    const currentLevel = martialEntry.level || 1;
    if (currentLevel >= 10) return;

    const expNeeded = DATA.MARTIAL_LEVEL_EXP[currentLevel]; // 升到下一级需要的累计exp
    if (martialEntry.exp >= expNeeded) {
      martialEntry.level = currentLevel + 1;
      const ma = DATA.MARTIAL_ARTS.find(m => m.id === martialId);
      const levelName = DATA.MARTIAL_LEVEL_NAMES[martialEntry.level - 1];
      this.addLog(`🌟 【${ma?.name}】修炼突破，达到「${levelName}」境！`, 'success');
      // 应用升级加成
      this._applyMartialLevelBonus(martialId, martialEntry.level);
    }
  },

  // 应用武功升级加成
  _applyMartialLevelBonus(martialId, newLevel) {
    const s = this.state;
    const ma = DATA.MARTIAL_ARTS.find(m => m.id === martialId);
    if (!ma) return;
    const bonusTable = DATA.MARTIAL_LEVEL_BONUS[ma.type] || DATA.MARTIAL_LEVEL_BONUS.inner;
    const bonus = bonusTable[newLevel] || 0;
    if (bonus <= 0) return;

    switch (ma.type) {
      case 'inner':    s.innerPower += bonus; break;
      case 'sword':    s.swordSkill += bonus; break;
      case 'palm':     s.strength += bonus; s.innerPower += Math.floor(bonus/2); break;
      case 'qinggong': s.agility += bonus; break;
      case 'hidden':   s.speed += bonus; s.perception += Math.floor(bonus/2); break;
      case 'evil':
        s.innerPower += bonus;
        s.morality = Math.max(0, s.morality - 2);
        break;
    }
  },

  // 专项修炼某门武功（消耗体力，专注提升该武功等级）
  trainMartial(martialId) {
    const s = this.state;
    const martialEntry = s.martialArts.find(m => m.id === martialId);
    if (!martialEntry) return { success:false, msg:'你尚未习得此武功' };
    if (s.energy < 25) return { success:false, msg:'体力不足（需要25）' };

    s.energy -= 25;
    // 专项修炼给3点经验
    this._addMartialExp(martialId, 3);
    this.advanceTime(1);

    const ma = DATA.MARTIAL_ARTS.find(m => m.id === martialId);
    const levelName = DATA.MARTIAL_LEVEL_NAMES[(martialEntry.level||1) - 1];
    const expNeeded = DATA.MARTIAL_LEVEL_EXP[martialEntry.level||1];
    const expLeft = expNeeded - (martialEntry.exp||0);
    this.addLog(`专项修炼【${ma?.name}】，当前「${levelName}」，距下一层还需${Math.max(0,expLeft)}次修炼。`, 'normal');
    return { success:true, martial: ma, entry: martialEntry };
  },

  // 获取武功详情（含等级信息）
  getMartialDetails() {
    const s = this.state;
    return s.martialArts.map(entry => {
      const ma = DATA.MARTIAL_ARTS.find(m => m.id === entry.id);
      if (!ma) return null;
      const level = entry.level || 1;
      const exp = entry.exp || 0;
      const expNeeded = level < 10 ? DATA.MARTIAL_LEVEL_EXP[level] : 999;
      const levelName = DATA.MARTIAL_LEVEL_NAMES[level - 1];
      return { ...ma, level, exp, expNeeded, levelName };
    }).filter(Boolean);
  },

  // ════════════════════════════════════════════════════════════
  //  P: 武功对决系统
  // ════════════════════════════════════════════════════════════

  // 获取可用招式列表
  getAvailableMoves() {
    const s = this.state;
    const moves = [...DATA.COMBAT_MOVES.default];
    s.martialArts.forEach(entry => {
      const ma = DATA.MARTIAL_ARTS.find(m => m.id === entry.id);
      if (!ma) return;
      const typeMoves = DATA.COMBAT_MOVES[ma.type] || [];
      typeMoves.forEach(mv => {
        if (!moves.find(m => m.id === mv.id)) moves.push(mv);
      });
    });
    return moves;
  },

  // 武功对决（选择招式）
  fightWithMove(npcId, moveId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'对手不存在' };

    const move = this.getAvailableMoves().find(m => m.id === moveId);
    if (!move) return { success:false, msg:'招式不存在' };

    const myBasePower = this._calcCombatPower();
    const enemyPower = npc.power;

    // 计算招式加成
    let movePowerMult = move.power;
    // 克制关系
    const enemyType = npc.martialType || 'normal';
    const counter = DATA.COMBAT_COUNTER[move.type] || {};
    const counterMult = counter[enemyType] || 1.0;
    movePowerMult *= counterMult;

    const myEffPower = myBasePower * movePowerMult;

    // 防御招式特殊处理
    let hpLoss = Math.floor(enemyPower * (0.1 + Math.random() * 0.2));
    if (move.type === 'defend') {
      hpLoss = Math.floor(hpLoss * (1 - (move.dodgeBonus || 0) - (move.defBonus || 0)));
    }

    // 特殊效果
    const specialMsgs = [];
    if (move.drain) {
      const drain = Math.floor(enemyPower * 0.1);
      s.innerPower += drain;
      specialMsgs.push(`吸取内力+${drain}`);
    }
    if (move.selfDmg) {
      const selfDmg = Math.floor(myBasePower * move.selfDmg);
      s.hp = Math.max(1, s.hp - selfDmg);
      specialMsgs.push(`自损气血${selfDmg}`);
    }
    if (move.debuff === 'poison') {
      specialMsgs.push('对手中毒，内力受损');
    }

    const winChance = myEffPower / (myEffPower + enemyPower);
    const won = Math.random() < winChance;

    s.hp = Math.max(1, s.hp - hpLoss);

    // 生成战斗描述
    const counterDesc = counterMult > 1.1 ? '（克制！）' : counterMult < 0.9 ? '（被克制）' : '';
    const moveDesc = `你使出【${move.name}】${counterDesc}，${move.desc}`;

    if (won) {
      s.battlesWon++;
      const expGain = Math.floor(enemyPower / 2);
      this._gainExp(expGain);
      s.reputation += Math.floor(enemyPower / 10);
      if (npc.align === 'evil') {
        s.morality = Math.min(100, s.morality + 5);
        s.reputation += 10;
        this._applyFactionTrigger('kill_evil_npc');
      } else {
        s.morality = Math.max(0, s.morality - 5);
        s.evil += 5;
        this._applyFactionTrigger('kill_good_npc');
      }
      // M: 战斗给武功加经验
      s.martialArts.forEach(entry => this._addMartialExp(entry.id, 1));
      const specialStr = specialMsgs.length ? `（${specialMsgs.join('，')}）` : '';
      this.addLog(`${moveDesc}。你击败了${npc.name}！损失气血${hpLoss}点${specialStr}。`, 'success');
      return { success:true, won:true, hpLoss, expGain, moveDesc, counterMult };
    } else {
      s.battlesLost++;
      s.hp = Math.max(1, s.hp - hpLoss);
      this.addLog(`${moveDesc}。你不敌${npc.name}，败退而走，损失气血${hpLoss}点。`, 'danger');
      return { success:true, won:false, hpLoss, moveDesc, counterMult };
    }
  },

  // ════════════════════════════════════════════════════════════
  //  A: 结局扩展系统
  // ════════════════════════════════════════════════════════════

  _checkExtraEndings() {
    const s = this.state;
    if (s.ending) return; // 已触发结局

    for (const ending of DATA.ENDINGS_EXTRA) {
      if (s.triggeredEnding === ending.id) continue;
      const cond = ending.condition;
      let met = true;

      for (const [k, v] of Object.entries(cond)) {
        if (k === 'questDone') {
          if (!s.completedQuests.includes(v)) { met = false; break; }
        } else if (k.startsWith('factionAttitude_')) {
          const fid = k.replace('factionAttitude_', '');
          const att = s.factionAttitude[fid] || 0;
          if (att < v) { met = false; break; }
        } else if (k === 'martialArtsCount') {
          if (s.martialArts.length < v) { met = false; break; }
        } else if (k === 'discipleCount') {
          if ((s.disciples || []).length < v) { met = false; break; }
        } else if (k === 'tournamentWins') {
          if ((s.tournamentWins || 0) < v) { met = false; break; }
        } else {
          if ((s[k] || 0) < v) { met = false; break; }
        }
      }

      if (met) {
        s.triggeredEnding = ending.id;
        s.ending = ending;
        this.addLog(`🎭 【${ending.icon}${ending.name}】结局已解锁！`, 'story');
        return;
      }
    }
  },

  getExtraEndings() {
    return DATA.ENDINGS_EXTRA;
  },

  // ════════════════════════════════════════════════════════════
  //  B: 武林大会系统
  // ════════════════════════════════════════════════════════════

  _checkTournamentAnnounce() {
    const s = this.state;
    const currentMonth = s.year * 12 + s.month;
    if (!s.nextTournamentMonth) return;

    // 提前1个月预告
    if (currentMonth === s.nextTournamentMonth - 1) {
      const loc = DATA.TOURNAMENT.locations[Math.floor(Math.random() * DATA.TOURNAMENT.locations.length)];
      s._tournamentLocation = loc;
      this.addLog(`📣 江湖消息：下月将在${loc}举办武林大会！参赛、观战或搅局，皆可前往。`, 'story');
    }
    // 大会当月
    if (currentMonth === s.nextTournamentMonth) {
      s._tournamentActive = true;
      s._tournamentLocation = s._tournamentLocation || DATA.TOURNAMENT.locations[0];
      this.addLog(`🏆 武林大会今日在${s._tournamentLocation}开幕！前往行动面板参与。`, 'story');
    }
  },

  isTournamentActive() {
    return !!this.state._tournamentActive;
  },

  getTournamentLocation() {
    return this.state._tournamentLocation || '';
  },

  // 参赛
  joinTournament() {
    const s = this.state;
    if (!s._tournamentActive) return { success: false, msg: '当前没有武林大会' };
    if (s.energy < 30) return { success: false, msg: '体力不足（需要30）' };

    s.energy -= 30;
    const power = this._calcCombatPower();
    const rounds = DATA.TOURNAMENT.rounds;
    let lastRound = null;
    let totalGold = 0, totalRep = 0, totalExp = 0;
    let won = false;

    for (const round of rounds) {
      const difficulty = round.powerReq;
      const winChance = Math.min(0.9, Math.max(0.1, (power - difficulty) / (difficulty + 50) + 0.5));
      if (Math.random() < winChance) {
        lastRound = round;
        totalGold += round.reward.gold || 0;
        totalRep += round.reward.reputation || 0;
        totalExp += round.reward.exp || 0;
        if (round.reward.title) {
          if (!s.titles.includes(round.reward.title)) s.titles.push(round.reward.title);
        }
        won = true;
      } else {
        // 败于此轮
        this.addLog(`⚔️ 武林大会：你在${round.name}中落败，但积累了宝贵经验。`, 'danger');
        this._gainExp(Math.floor(totalExp * 0.5 + 20));
        s.gold += Math.floor(totalGold * 0.5);
        s.reputation += Math.floor(totalRep * 0.5);
        s._tournamentActive = false;
        s.nextTournamentMonth += DATA.TOURNAMENT.intervalMonths;
        s.tournamentHistory.push({ year: s.year, month: s.month, result: 'lose', round: round.name });
        this.advanceTime(1);
        return { success: true, won: false, round: round.name };
      }
    }

    // 全胜！
    s.gold += totalGold;
    s.reputation += totalRep;
    this._gainExp(totalExp);
    s.tournamentWins++;
    s._tournamentActive = false;
    s.nextTournamentMonth += DATA.TOURNAMENT.intervalMonths;
    s.tournamentHistory.push({ year: s.year, month: s.month, result: 'win', round: '决赛' });
    this.addLog(`🏆 恭喜！你在武林大会上力压群雄，荣获冠军！获得${totalGold}两、声望+${totalRep}！`, 'success');
    this._applyFactionTrigger('high_reputation');
    this.advanceTime(1);
    return { success: true, won: true, gold: totalGold, reputation: totalRep };
  },

  // 观战
  watchTournament() {
    const s = this.state;
    if (!s._tournamentActive) return { success: false, msg: '当前没有武林大会' };
    if (s.energy < 10) return { success: false, msg: '体力不足（需要10）' };

    s.energy -= 10;
    const reward = DATA.TOURNAMENT.watchReward;
    s.perception += reward.perception || 0;
    this._gainExp(reward.exp || 0);
    s._tournamentActive = false;
    s.nextTournamentMonth += DATA.TOURNAMENT.intervalMonths;
    this.addLog(`👁️ 你在武林大会上观战，从高手对决中有所感悟。悟性+${reward.perception}，经验+${reward.exp}。`, 'info');
    this.advanceTime(1);
    return { success: true, ...reward };
  },

  // 搅局
  sabotageTournament() {
    const s = this.state;
    if (!s._tournamentActive) return { success: false, msg: '当前没有武林大会' };
    if (s.energy < 20) return { success: false, msg: '体力不足（需要20）' };

    s.energy -= 20;
    const reward = DATA.TOURNAMENT.sabotageReward;
    const success = Math.random() < 0.6;
    if (success) {
      s.gold += reward.gold;
      s.evil += reward.evil;
      s.reputation += reward.reputation;
      s._tournamentActive = false;
      s.nextTournamentMonth += DATA.TOURNAMENT.intervalMonths;
      this._applyFactionTrigger('kill_good_npc');
      this.addLog(`🗡️ 你趁乱搅局，浑水摸鱼，获得${reward.gold}两。但声望有所下降，邪气+${reward.evil}。`, 'danger');
    } else {
      const hpLoss = 25;
      s.hp = Math.max(1, s.hp - hpLoss);
      s.reputation -= 20;
      this.addLog(`💥 搅局失败！被众高手围攻，损失气血${hpLoss}点，声望大跌。`, 'danger');
    }
    this.advanceTime(1);
    return { success: true, sabotageSuccess: success };
  },

  // ════════════════════════════════════════════════════════════
  //  C: 奇遇系统
  // ════════════════════════════════════════════════════════════

  _checkHiddenEvents() {
    const s = this.state;
    const locId = s.location;

    DATA.HIDDEN_EVENTS.forEach(he => {
      if (s.triggeredHiddenEvents.includes(he.id)) return;
      const trig = he.trigger;
      if (trig.location && trig.location !== locId) return;

      const visits = s.locationVisits[locId] || 0;
      if (visits < (trig.minVisits || 0)) return;

      // 检查前置条件
      if (trig.require) {
        for (const [k, v] of Object.entries(trig.require)) {
          if (k.startsWith('factionAttitude_')) {
            const fid = k.replace('factionAttitude_', '');
            if ((s.factionAttitude[fid] || 0) < v) return;
          } else if ((s[k] || 0) < v) return;
        }
      }

      if (Math.random() < (trig.chance || 0.2)) {
        // 触发奇遇！存入待处理
        s._pendingHiddenEvent = he.id;
        this.addLog(`✨ 【${he.icon}${he.name}】你遭遇了一段奇遇！`, 'story');
      }
    });
  },

  getPendingHiddenEvent() {
    const s = this.state;
    if (!s._pendingHiddenEvent) return null;
    return DATA.HIDDEN_EVENTS.find(he => he.id === s._pendingHiddenEvent) || null;
  },

  resolveHiddenEvent(eventId, choiceIdx) {
    const s = this.state;
    const he = DATA.HIDDEN_EVENTS.find(e => e.id === eventId);
    if (!he) return { success: false };

    const choice = he.choices[choiceIdx];
    if (!choice) return { success: false };

    // 检查选项条件
    for (const [k, v] of Object.entries(choice.require || {})) {
      if ((s[k] || 0) < v) return { success: false, msg: `需要${this._statName(k)}达到${v}` };
    }

    const result = choice.result;
    const msgs = [result.desc];

    switch (result.type) {
      case 'martial_secret': {
        const tier = result.martialTier || 3;
        const unlearned = DATA.MARTIAL_ARTS.filter(m =>
          !s.martialArts.find(x => x.id === m.id) && m.tier <= tier
        );
        if (unlearned.length > 0) {
          const ma = unlearned[Math.floor(Math.random() * unlearned.length)];
          s.martialArts.push({ id: ma.id, level: 1, exp: 0 });
          this._applyBonus(s, ma.effect);
          msgs.push(`习得【${ma.name}】！`);
        }
        break;
      }
      case 'npc_favor': {
        if (result.npcId) {
          s.npcFavor[result.npcId] = Math.min(100, (s.npcFavor[result.npcId] || 0) + (result.bonus || 20));
        }
        break;
      }
      case 'inner_boost': {
        s.innerPower += result.amount || 30;
        msgs.push(`内力+${result.amount}`);
        break;
      }
      case 'train_bonus': {
        this._applyBonus(s, result.bonus);
        const bonusStr = Object.entries(result.bonus).map(([k, v]) => `${this._statName(k)}+${v}`).join('，');
        msgs.push(bonusStr);
        break;
      }
      case 'faction_favor': {
        const cur = s.factionAttitude[result.faction] || 0;
        s.factionAttitude[result.faction] = Math.min(100, cur + (result.delta || 10));
        break;
      }
      case 'steal_martial': {
        s.morality = Math.max(0, s.morality + (result.morality || -20));
        s.evil += result.evil || 10;
        const unlearned = DATA.MARTIAL_ARTS.filter(m => !s.martialArts.find(x => x.id === m.id));
        if (unlearned.length > 0) {
          const ma = unlearned[Math.floor(Math.random() * unlearned.length)];
          s.martialArts.push({ id: ma.id, level: 1, exp: 0 });
          msgs.push(`偷得【${ma.name}】`);
        }
        break;
      }
      case 'weapon_special': {
        if (result.weaponId && !s.weapons.includes(result.weaponId)) {
          s.weapons.push(result.weaponId);
          const w = DATA.WEAPONS.find(x => x.id === result.weaponId);
          if (w) msgs.push(`获得【${w.name}】`);
        }
        break;
      }
      case 'nothing':
      default:
        break;
    }

    s.triggeredHiddenEvents.push(eventId);
    s._pendingHiddenEvent = null;
    const text = msgs.join('，');
    this.addLog(`【${he.name}】${text}`, 'success');
    this._checkTitles();
    return { success: true, he, choice, msgs };
  },

  // 记录地点访问次数（在travel时调用）
  _recordLocationVisit(locId) {
    const s = this.state;
    s.locationVisits[locId] = (s.locationVisits[locId] || 0) + 1;
  },

  // ════════════════════════════════════════════════════════════
  //  D: 弟子培养系统
  // ════════════════════════════════════════════════════════════

  getAvailableDisciples() {
    const s = this.state;
    return DATA.DISCIPLE_TEMPLATES.filter(tpl => {
      // 未收录
      if (s.disciples.find(d => d.templateId === tpl.id)) return false;
      // 检查条件
      for (const [k, v] of Object.entries(tpl.require || {})) {
        if ((s[k] || 0) < v) return false;
      }
      return true;
    });
  },

  recruitDisciple(templateId) {
    const s = this.state;
    const tpl = DATA.DISCIPLE_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return { success: false, msg: '弟子不存在' };
    if (s.disciples.find(d => d.templateId === templateId)) return { success: false, msg: '已收录此弟子' };
    if (s.disciples.length >= 4) return { success: false, msg: '弟子已满（最多4名）' };

    // 检查条件
    for (const [k, v] of Object.entries(tpl.require || {})) {
      if ((s[k] || 0) < v) return { success: false, msg: `需要${this._statName(k)}达到${v}` };
    }
    const cost = tpl.recruitCost || {};
    if (cost.gold && s.gold < cost.gold) return { success: false, msg: `需要${cost.gold}两银子` };
    if (cost.energy && s.energy < cost.energy) return { success: false, msg: '体力不足' };

    if (cost.gold) s.gold -= cost.gold;
    if (cost.energy) s.energy -= cost.energy;

    const disciple = {
      templateId,
      name: tpl.name,
      icon: tpl.icon,
      talent: tpl.talent,
      level: 1,
      exp: 0,
      stats: { ...tpl.baseStats },
      mission: null,
      missionEndsAt: null,
    };
    s.disciples.push(disciple);
    this.addLog(`🎓 ${tpl.icon}${tpl.name}拜入门下，成为你的弟子！`, 'success');
    this.advanceTime(1);
    return { success: true, disciple: tpl };
  },

  // 传授武功给弟子
  teachDisciple(discipleIdx, martialId) {
    const s = this.state;
    const disciple = s.disciples[discipleIdx];
    if (!disciple) return { success: false, msg: '弟子不存在' };
    if (s.energy < 20) return { success: false, msg: '体力不足（需要20）' };

    const ma = DATA.MARTIAL_ARTS.find(m => m.id === martialId);
    if (!ma) return { success: false, msg: '武功不存在' };
    if (!s.martialArts.find(m => m.id === martialId)) return { success: false, msg: '你尚未习得此武功' };

    s.energy -= 20;
    disciple.exp = (disciple.exp || 0) + 20;
    // 弟子升级
    if (disciple.exp >= disciple.level * 30) {
      disciple.level++;
      // 根据天赋提升属性
      const talentBonus = { sword: { swordSkill: 8 }, inner: { innerPower: 10 }, palm: { strength: 8 },
                            qinggong: { agility: 10 }, hidden: { speed: 8 }, evil: { innerPower: 8 } };
      const bonus = talentBonus[disciple.talent] || { strength: 5 };
      Object.entries(bonus).forEach(([k, v]) => { disciple.stats[k] = (disciple.stats[k] || 0) + v; });
      this.addLog(`🌟 弟子${disciple.name}修炼有成，升至第${disciple.level}层！`, 'success');
    }
    this.addLog(`📖 你向${disciple.name}传授【${ma.name}】，弟子受益匪浅。`, 'info');
    this.advanceTime(1);
    return { success: true, disciple, martial: ma };
  },

  // 派遣弟子执行任务
  sendDiscipleOnMission(discipleIdx, missionId) {
    const s = this.state;
    const disciple = s.disciples[discipleIdx];
    if (!disciple) return { success: false, msg: '弟子不存在' };
    if (disciple.mission) return { success: false, msg: `${disciple.name}正在执行任务` };

    const mission = DATA.DISCIPLE_MISSIONS.find(m => m.id === missionId);
    if (!mission) return { success: false, msg: '任务不存在' };

    const currentMonth = s.year * 12 + s.month;
    disciple.mission = missionId;
    disciple.missionEndsAt = currentMonth + mission.duration;
    this.addLog(`🗺️ ${disciple.name}出发执行【${mission.name}】，预计${mission.duration}个月后归来。`, 'info');
    return { success: true, disciple, mission };
  },

  // 每月结算弟子任务
  _tickDiscipleMissions() {
    const s = this.state;
    const currentMonth = s.year * 12 + s.month;
    s.disciples.forEach(disciple => {
      if (!disciple.mission || !disciple.missionEndsAt) return;
      if (currentMonth < disciple.missionEndsAt) return;

      const mission = DATA.DISCIPLE_MISSIONS.find(m => m.id === disciple.mission);
      disciple.mission = null;
      disciple.missionEndsAt = null;
      if (!mission) return;

      // 判断成功/失败
      const successRate = 1 - mission.risk * (1 - disciple.level * 0.1);
      if (Math.random() < successRate) {
        const reward = mission.reward;
        if (reward.gold) s.gold += reward.gold;
        if (reward.reputation) s.reputation += reward.reputation;
        if (reward.exp) disciple.exp += reward.exp;
        if (reward.items) reward.items.forEach(id => this.addItem(id, 1));
        this.addLog(`✅ ${disciple.name}完成了【${mission.name}】，带回了丰厚收获！`, 'success');
      } else {
        const hpLoss = Math.floor(Math.random() * 20) + 10;
        this.addLog(`⚠️ ${disciple.name}执行【${mission.name}】时遭遇意外，受了些伤，空手而归。`, 'danger');
      }
    });
  },

  getDisciples() {
    return this.state.disciples || [];
  },

  // ════════════════════════════════════════════════════════════
  //  E: 武林排行榜系统
  // ════════════════════════════════════════════════════════════

  getRankingList() {
    const s = this.state;
    // 计算玩家战力，动态插入排行
    const myPower = this._calcCombatPower();
    const list = DATA.RANKING_LIST.map(r => ({
      ...r,
      defeated: s.rankingDefeated.includes(r.rank),
    }));

    // 玩家排名
    let playerRank = list.length + 1;
    for (let i = 0; i < list.length; i++) {
      if (myPower >= list[i].power) { playerRank = list[i].rank; break; }
    }
    s.playerRank = playerRank;

    return { list, myPower, playerRank };
  },

  challengeRanking(rank) {
    const s = this.state;
    const entry = DATA.RANKING_LIST.find(r => r.rank === rank);
    if (!entry) return { success: false, msg: '排行榜人物不存在' };
    if (s.rankingDefeated.includes(rank)) return { success: false, msg: '你已击败过此人' };
    if (s.energy < 40) return { success: false, msg: '体力不足（需要40）' };

    s.energy -= 40;
    const myPower = this._calcCombatPower();
    const winChance = Math.min(0.85, Math.max(0.05, myPower / (entry.power + myPower)));
    const won = Math.random() < winChance;

    const reward = DATA.RANKING_CHALLENGE_REWARD;
    if (won) {
      s.gold += reward.win.gold;
      s.reputation += reward.win.reputation;
      this._gainExp(reward.win.exp);
      s.rankingDefeated.push(rank);
      s.battlesWon++;

      // 前三名特殊奖励
      if (rank <= 3) {
        s.reputation += reward.topThreeBonus.reputation;
        if (!s.titles.includes(reward.topThreeBonus.title)) {
          s.titles.push(reward.topThreeBonus.title);
        }
        this.addLog(`🌟 你击败了排行第${rank}的${entry.name}（${entry.title}）！天下震动！`, 'success');
      } else {
        this.addLog(`⚔️ 你击败了排行第${rank}的${entry.name}！声望大涨！`, 'success');
      }
      // 更新玩家排名
      s.playerRank = rank;
      this._checkTitles();
    } else {
      s.reputation += reward.lose.reputation;
      this._gainExp(reward.lose.exp);
      const hpLoss = Math.floor(entry.power * 0.15);
      s.hp = Math.max(1, s.hp - hpLoss);
      s.battlesLost++;
      this.addLog(`💔 你挑战${entry.name}失败，损失气血${hpLoss}点，但积累了宝贵经验。`, 'danger');
    }

    this.advanceTime(1);
    return { success: true, won, entry, winChance };
  },

  // ══════════════════════════════════════════════════════════
  //  F: 武学秘籍系统
  // ══════════════════════════════════════════════════════════

  // 收集秘籍（加入背包）
  collectManual(manualId) {
    const s = this.state;
    const manual = DATA.MANUALS.find(m => m.id === manualId);
    if (!manual) return { success: false, msg: '未知秘籍' };
    if (s.collectedManuals.includes(manualId)) return { success: false, msg: `你已经拥有【${manual.name}】` };
    if (s.studiedManuals.includes(manualId)) return { success: false, msg: `你已经研读过【${manual.name}】` };
    s.collectedManuals.push(manualId);
    this.addLog(`📜 你获得了武学秘籍【${manual.name}】！`, 'success');
    return { success: true, manual };
  },

  // 开始研读秘籍
  startStudyManual(manualId) {
    const s = this.state;
    const manual = DATA.MANUALS.find(m => m.id === manualId);
    if (!manual) return { success: false, msg: '未知秘籍' };
    if (!s.collectedManuals.includes(manualId)) return { success: false, msg: '你还没有这本秘籍' };
    if (s.studiedManuals.includes(manualId)) return { success: false, msg: '你已经研读过这本秘籍了' };
    if (s.studyingManual) return { success: false, msg: `你正在研读【${DATA.MANUALS.find(m=>m.id===s.studyingManual.id)?.name}】，请先完成` };

    // 检查研读条件
    const req = manual.studyRequire || {};
    for (const [k, v] of Object.entries(req)) {
      if ((s[k] || 0) < v) {
        const statNames = { perception:'悟性', innerPower:'内力', swordSkill:'剑术', agility:'身法', strength:'力量', endurance:'体魄', morality:'道德', evil:'邪气' };
        return { success: false, msg: `研读此秘籍需要${statNames[k]||k}达到${v}（当前${s[k]||0}）` };
      }
    }

    const currentMonth = s.year * 12 + s.month;
    s.studyingManual = { id: manualId, startMonth: currentMonth, endMonth: currentMonth + manual.studyTime };
    this.addLog(`📖 你开始研读【${manual.name}】，预计需要${manual.studyTime}个月。`, 'normal');
    return { success: true };
  },

  // 检查研读进度（每月调用）
  _checkManualStudy() {
    const s = this.state;
    if (!s.studyingManual) return;
    const currentMonth = s.year * 12 + s.month;
    if (currentMonth >= s.studyingManual.endMonth) {
      const manualId = s.studyingManual.id;
      const manual = DATA.MANUALS.find(m => m.id === manualId);
      s.studyingManual = null;
      s.studiedManuals.push(manualId);
      // 移出收集列表（已研读）
      s.collectedManuals = s.collectedManuals.filter(id => id !== manualId);

      if (manual && manual.martialId) {
        // 解锁对应武功
        const result = this.learnMartial(manual.martialId, null, true);
        if (result.success) {
          this.addLog(`🌟 你研读完成【${manual.name}】，成功领悟了【${DATA.MARTIAL_ARTS.find(m=>m.id===manual.martialId)?.name}】！`, 'success');
        } else {
          this.addLog(`📜 你研读完成【${manual.name}】，武学有所精进，但尚未完全领悟。`, 'normal');
        }
      }
    }
  },

  // 探索时随机发现秘籍
  _tryFindManual(locationId) {
    const s = this.state;
    const loc = DATA.EXTRA_LOCATIONS.find(l => l.id === locationId);
    const drops = loc ? loc.manualDrops : null;
    const candidates = (DATA.MANUALS || []).filter(m => {
      if (s.collectedManuals.includes(m.id)) return false;
      if (s.studiedManuals.includes(m.id)) return false;
      if (drops) return drops.includes(m.id);
      return m.findChance > 0;
    });
    if (candidates.length === 0) return null;
    for (const manual of candidates) {
      if (Math.random() < (manual.findChance || 0.05)) {
        this.collectManual(manual.id);
        return manual;
      }
    }
    return null;
  },

  // ══════════════════════════════════════════════════════════
  //  G: 事件链系统
  // ══════════════════════════════════════════════════════════

  // 检查是否有可触发的事件链
  _checkEventChains() {
    const s = this.state;
    if (!DATA.EVENT_CHAINS) return null;
    for (const chain of DATA.EVENT_CHAINS) {
      if (s.completedChains.includes(chain.id)) continue;
      if (s.activeChains[chain.id]) continue;
      // 检查触发条件
      const trigger = chain.trigger || {};
      let canTrigger = true;
      for (const [k, v] of Object.entries(trigger)) {
        if ((s[k] || 0) < v) { canTrigger = false; break; }
      }
      // 检查地点条件
      if (chain.triggerLocation && s.location !== chain.triggerLocation) continue;
      if (!canTrigger) continue;
      // 20%概率触发
      if (Math.random() < 0.2) {
        s.activeChains[chain.id] = { currentStep: 'step1', startedAt: s.year * 12 + s.month };
        return chain;
      }
    }
    return null;
  },

  // 处理事件链选择
  handleChainChoice(chainId, choiceIndex) {
    const s = this.state;
    const chain = DATA.EVENT_CHAINS.find(c => c.id === chainId);
    if (!chain) return { success: false, msg: '未知事件链' };
    const chainState = s.activeChains[chainId];
    if (!chainState) return { success: false, msg: '该事件链未激活' };

    const step = chain.steps.find(st => st.id === chainState.currentStep);
    if (!step) return { success: false, msg: '事件步骤不存在' };
    const choice = step.choices[choiceIndex];
    if (!choice) return { success: false, msg: '无效选择' };

    // 应用效果
    const effect = choice.effect || {};
    this._applyChainEffect(effect);

    let endMsg = null;
    if (choice.nextStep) {
      chainState.currentStep = choice.nextStep;
      return { success: true, continued: true, chain, nextStep: chain.steps.find(st => st.id === choice.nextStep) };
    } else {
      // 事件链结束
      endMsg = choice.endMsg || '事件结束。';
      delete s.activeChains[chainId];
      s.completedChains.push(chainId);
      return { success: true, continued: false, endMsg, chain };
    }
  },

  // 应用事件链效果
  _applyChainEffect(effect) {
    const s = this.state;
    const statKeys = ['hp','innerPower','strength','agility','swordSkill','endurance','perception','charm','gold','reputation','morality','evil'];
    for (const k of statKeys) {
      if (effect[k] !== undefined) s[k] = Math.max(0, (s[k] || 0) + effect[k]);
    }
    if (effect.addItem) this.addItem(effect.addItem, 1);
    if (effect.addItem2) this.addItem(effect.addItem2, 1);
    if (effect.addManual) this.collectManual(effect.addManual);
    if (effect.addFollower) {
      s.followers = s.followers || [];
      s.followers.push({ npcId: 'chain_follower_' + Date.now(), loyalty: 80, name: '弟子' });
    }
  },

  // ══════════════════════════════════════════════════════════
  //  H: 地图扩展
  // ══════════════════════════════════════════════════════════

  // 检查并解锁新地点
  checkLocationUnlocks() {
    const s = this.state;
    if (!DATA.EXTRA_LOCATIONS) return [];
    const newlyUnlocked = [];
    for (const loc of DATA.EXTRA_LOCATIONS) {
      if (s.unlockedLocations.includes(loc.id)) continue;
      const cond = loc.unlockCondition || {};
      let canUnlock = true;
      for (const [k, v] of Object.entries(cond)) {
        if ((s[k] || 0) < v) { canUnlock = false; break; }
      }
      if (canUnlock) {
        s.unlockedLocations.push(loc.id);
        newlyUnlocked.push(loc);
        this.addLog(`🗺️ 新地点解锁：【${loc.name}】${loc.desc}`, 'success');
      }
    }
    return newlyUnlocked;
  },

  // 前往额外地点
  travelToExtraLocation(locId) {
    const s = this.state;
    const loc = DATA.EXTRA_LOCATIONS.find(l => l.id === locId);
    if (!loc) return { success: false, msg: '未知地点' };
    if (!s.unlockedLocations.includes(locId)) return { success: false, msg: `${loc.unlockHint || '该地点尚未解锁'}` };
    s.extraLocation = locId;
    this.advanceTime(1);
    this.addLog(`🗺️ 你前往了【${loc.name}】。`, 'normal');
    // 尝试发现秘籍
    this._tryFindManual(locId);
    // 检查事件链
    this._checkEventChains();
    return { success: true, loc };
  },

  // 在额外地点执行特殊行动
  doSpecialAction(locId, actionId) {
    const s = this.state;
    const loc = DATA.EXTRA_LOCATIONS.find(l => l.id === locId);
    if (!loc) return { success: false, msg: '未知地点' };
    const action = (loc.specialActions || []).find(a => a.id === actionId);
    if (!action) return { success: false, msg: '未知行动' };

    // 检查费用
    if (action.cost && action.cost.gold && s.gold < action.cost.gold) {
      return { success: false, msg: `需要${action.cost.gold}两银子` };
    }
    if (action.cost && action.cost.gold) s.gold -= action.cost.gold;

    // 应用效果
    const eff = action.effect || {};
    const statKeys = ['hp','innerPower','strength','agility','swordSkill','endurance','perception','charm','gold','reputation','morality','evil'];
    for (const k of statKeys) {
      if (eff[k] !== undefined) s[k] = Math.max(0, (s[k] || 0) + eff[k]);
    }

    // 风险判定
    if (action.risk && Math.random() < action.risk) {
      const dmg = Math.floor(s.maxHp * 0.15);
      s.hp = Math.max(1, s.hp - dmg);
      this.addLog(`⚠️ 行动中遭遇意外，损失气血${dmg}点。`, 'danger');
    }

    // 触发事件链
    if (action.triggerChain) {
      const chain = DATA.EVENT_CHAINS.find(c => c.id === action.triggerChain);
      if (chain && !s.completedChains.includes(action.triggerChain) && !s.activeChains[action.triggerChain]) {
        s.activeChains[action.triggerChain] = { currentStep: 'step1', startedAt: s.year * 12 + s.month };
      }
    }

    this.advanceTime(action.duration || 1);
    this.addLog(`✅ 【${action.name}】完成。`, 'normal');
    return { success: true, action };
  },

  // ══════════════════════════════════════════════════════════
  //  I: 武功融合系统
  // ══════════════════════════════════════════════════════════

  // 获取可用的融合配方
  getAvailableFusions() {
    const s = this.state;
    if (!DATA.FUSION_RECIPES) return [];
    return DATA.FUSION_RECIPES.filter(recipe => {
      if (s.fusedMartials.includes(recipe.id)) return false;
      const has1 = s.martialArts.find(m => m.id === recipe.source1);
      const has2 = s.martialArts.find(m => m.id === recipe.source2);
      return has1 && has2;
    });
  },

  // 执行武功融合
  fuseMartial(recipeId) {
    const s = this.state;
    const recipe = (DATA.FUSION_RECIPES || []).find(r => r.id === recipeId);
    if (!recipe) return { success: false, msg: '未知融合配方' };
    if (s.fusedMartials.includes(recipeId)) return { success: false, msg: '你已经完成过这个融合了' };

    // 检查是否拥有两门武功
    const has1 = s.martialArts.find(m => m.id === recipe.source1);
    const has2 = s.martialArts.find(m => m.id === recipe.source2);
    if (!has1) {
      const ma = DATA.MARTIAL_ARTS.find(m => m.id === recipe.source1);
      return { success: false, msg: `需要先掌握【${ma?.name || recipe.source1}】` };
    }
    if (!has2) {
      const ma = DATA.MARTIAL_ARTS.find(m => m.id === recipe.source2);
      return { success: false, msg: `需要先掌握【${ma?.name || recipe.source2}】` };
    }

    // 检查属性要求
    const req = recipe.require || {};
    for (const [k, v] of Object.entries(req)) {
      if ((s[k] || 0) < v) {
        const statNames = { perception:'悟性', innerPower:'内力', swordSkill:'剑术', agility:'身法', strength:'力量', endurance:'体魄' };
        return { success: false, msg: `融合需要${statNames[k]||k}达到${v}（当前${s[k]||0}）` };
      }
    }

    // 检查费用
    if (recipe.cost && recipe.cost.gold) {
      if (s.gold < recipe.cost.gold) return { success: false, msg: `融合需要${recipe.cost.gold}两银子（当前${s.gold}两）` };
      s.gold -= recipe.cost.gold;
    }

    // 执行融合：添加新武功
    const result = recipe.result;
    s.martialArts.push({ id: result.id, level: 1, exp: 0, fused: true });
    s.fusedMartials.push(recipeId);

    // 应用融合武功效果
    const eff = result.effect || {};
    const statKeys = ['hp','innerPower','strength','agility','swordSkill','endurance','perception','charm','reputation','morality'];
    for (const k of statKeys) {
      if (eff[k] !== undefined) s[k] = (s[k] || 0) + eff[k];
    }
    if (eff.hp) s.maxHp = (s.maxHp || 100) + eff.hp;

    this.advanceTime(recipe.studyTime || 6);
    this.addLog(`🌟 武功融合成功！【${DATA.MARTIAL_ARTS.find(m=>m.id===recipe.source1)?.name}】与【${DATA.MARTIAL_ARTS.find(m=>m.id===recipe.source2)?.name}】融为一体，化为【${result.name}】！`, 'success');
    this._checkTitles();
    return { success: true, recipe, result };
  },

  // ══════════════════════════════════════════════════════════
  //  J: 年代事件系统
  // ══════════════════════════════════════════════════════════

  // 检查年代事件（在 advanceTime 中调用）
  _checkEraEvents() {
    const s = this.state;
    if (!DATA.ERA_EVENTS) return null;
    for (const era of DATA.ERA_EVENTS) {
      // 检查是否已触发（不重复的）
      if (era.repeatEvery === 0 && s.triggeredEraEvents.includes(era.id)) continue;
      // 检查触发年份
      let shouldTrigger = false;
      if (era.repeatEvery > 0) {
        // 周期性事件
        const elapsed = s.year - era.triggerYear;
        if (elapsed >= 0 && elapsed % era.repeatEvery === 0 && s.month === 1) {
          const instanceId = `${era.id}_y${s.year}`;
          if (!s.triggeredEraEvents.includes(instanceId)) {
            shouldTrigger = true;
            s.triggeredEraEvents.push(instanceId);
          }
        }
      } else {
        // 一次性事件
        if (s.year === era.triggerYear && s.month === 1) {
          shouldTrigger = true;
          s.triggeredEraEvents.push(era.id);
        }
      }
      if (shouldTrigger) {
        s.pendingEraEvent = era.id;
        this.addLog(`📣 江湖大事：${era.desc}`, 'warning');
        return era;
      }
    }
    return null;
  },

  // 处理年代事件选择
  handleEraEventChoice(eraId, choiceIndex) {
    const s = this.state;
    const era = DATA.ERA_EVENTS.find(e => e.id === eraId);
    if (!era) return { success: false, msg: '未知年代事件' };
    const choice = era.choices[choiceIndex];
    if (!choice) return { success: false, msg: '无效选择' };

    // 检查条件
    if (choice.condition) {
      for (const [k, v] of Object.entries(choice.condition)) {
        if ((s[k] || 0) < v) {
          const statNames = { reputation:'声望', morality:'道德', swordSkill:'剑术', innerPower:'内力', perception:'悟性' };
          return { success: false, msg: `此选项需要${statNames[k]||k}达到${v}` };
        }
      }
    }

    // 应用效果
    const eff = choice.effect || {};
    const statKeys = ['hp','innerPower','strength','agility','swordSkill','endurance','perception','charm','gold','reputation','morality','evil'];
    for (const k of statKeys) {
      if (eff[k] !== undefined) s[k] = Math.max(0, (s[k] || 0) + eff[k]);
    }

    s.pendingEraEvent = null;
    this._checkTitles();
    this.addLog(`✅ 你做出了选择：${choice.text}`, 'normal');
    return { success: true, era, choice };
  },

  // ══════════════════════════════════════════════════════════
  //  K: 天气系统
  // ══════════════════════════════════════════════════════════
  _updateWeather() {
    const s = this.state;
    // 每月有40%概率天气变化
    if (Math.random() > 0.4 && s.currentWeather) return;
    const types = DATA.WEATHER_TYPES;
    const totalWeight = types.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * totalWeight;
    let chosen = types[0];
    for (const t of types) {
      r -= t.weight;
      if (r <= 0) { chosen = t; break; }
    }
    const changed = s.currentWeather !== chosen.id;
    s.currentWeather = chosen.id;
    s.weatherDesc = chosen.desc;
    if (changed) {
      this.addLog(`${chosen.icon} 天气变化：${chosen.name}。${chosen.desc}`, 'info');
    }
  },

  getWeather() {
    const s = this.state;
    return DATA.WEATHER_TYPES.find(w => w.id === s.currentWeather) || DATA.WEATHER_TYPES[0];
  },

  // 获取天气对某类行动的加成（返回百分比，可正可负）
  getWeatherBonus(actionType) {
    const w = this.getWeather();
    const eff = w.effects || {};
    const map = {
      train:   (eff.trainBonus || 0),
      inner:   (eff.innerBonus || 0),
      wander:  (eff.wanderBonus || 0) - (eff.wanderPenalty || 0),
      explore: (eff.exploreBonus || 0) - (eff.explorePenalty || 0),
      rest:    (eff.restBonus || 0),
      agility: (eff.agilityBonus || 0),
      stealth: (eff.stealthBonus || 0),
      energy:  -(eff.energyPenalty || 0),
    };
    return map[actionType] || 0;
  },

  // ══════════════════════════════════════════════════════════
  //  L: 境界突破系统
  // ══════════════════════════════════════════════════════════
  _checkBreakthroughs() {
    const s = this.state;
    if (s.pendingBreakthrough) return; // 已有待处理突破
    for (const bt of DATA.BREAKTHROUGH_EVENTS) {
      if (s.triggeredBreakthroughs.includes(bt.id)) continue;
      if ((s[bt.stat] || 0) >= bt.threshold) {
        s.pendingBreakthrough = bt.id;
        this.addLog(`⚡ 你感到${bt.name}的契机已到，是否尝试突破？`, 'warning');
        return;
      }
    }
  },

  // 尝试突破（玩家主动触发）
  attemptBreakthrough(btId) {
    const s = this.state;
    const bt = DATA.BREAKTHROUGH_EVENTS.find(b => b.id === btId);
    if (!bt) return { success: false, msg: '突破事件不存在' };
    if (s.triggeredBreakthroughs.includes(btId)) return { success: false, msg: '已经突破过了' };

    // 检查消耗
    if (s.energy < bt.cost.energy) return { success: false, msg: `体力不足，需要 ${bt.cost.energy} 点体力` };
    if (s.gold < bt.cost.gold) return { success: false, msg: `银两不足，需要 ${bt.cost.gold} 两` };

    s.energy -= bt.cost.energy;
    s.gold -= bt.cost.gold;

    // 失败次数降低成功率
    const failPenalty = s.breakthroughFailed * 0.05;
    const rate = Math.max(0.1, bt.successRate - failPenalty);
    const success = Math.random() < rate;

    if (success) {
      s.triggeredBreakthroughs.push(btId);
      s.pendingBreakthrough = null;
      s.breakthroughFailed = 0;
      // 应用成功奖励
      Object.entries(bt.successBonus).forEach(([k, v]) => {
        s[k] = (s[k] || 0) + v;
        if (k === 'maxHp') s.hp = Math.min(s.hp + v, s.maxHp);
      });
      if (bt.titleReward) {
        if (!s.titles.includes(bt.titleReward)) s.titles.push(bt.titleReward);
      }
      this.addLog(`🌟 突破成功！你成功踏入【${bt.name}】境界！`, 'success');
      this._checkTitles();
      return { success: true, breakthrough: bt, result: 'success' };
    } else {
      s.breakthroughFailed++;
      // 应用失败惩罚
      Object.entries(bt.failPenalty).forEach(([k, v]) => {
        s[k] = Math.max(1, (s[k] || 0) + v);
      });
      // 失败3次以上触发重伤
      if (s.breakthroughFailed >= 3) {
        this._applyInjury('突破走火入魔，经脉受损', 3);
        s.pendingBreakthrough = null;
        s.breakthroughFailed = 0;
      }
      this.addLog(`💥 突破失败！真气逆流，你受了内伤。（失败${s.breakthroughFailed}次）`, 'danger');
      return { success: true, breakthrough: bt, result: 'fail' };
    }
  },

  // 放弃突破
  skipBreakthrough(btId) {
    const s = this.state;
    s.pendingBreakthrough = null;
    this.addLog('你压制住了突破的冲动，继续积蓄力量。', 'normal');
    return { success: true };
  },

  // ══════════════════════════════════════════════════════════
  //  P: 江湖恩怨系统
  // ══════════════════════════════════════════════════════════
  addGrudge(npcId, name, reason, intensity = 1) {
    const s = this.state;
    const existing = s.grudges.find(g => g.npcId === npcId);
    if (existing) {
      existing.intensity = Math.min(3, existing.intensity + 1);
      existing.reason = reason;
    } else {
      s.grudges.push({ npcId, name, reason, intensity, createdAt: s.year * 12 + s.month });
    }
    const intensityNames = ['', '小怨', '深仇', '不共戴天'];
    this.addLog(`⚔️ 你与【${name}】结下了${intensityNames[intensity] || '仇怨'}：${reason}`, 'danger');
  },

  addDebt(npcId, name, reason, intensity = 1) {
    const s = this.state;
    const existing = s.debts.find(d => d.npcId === npcId);
    if (existing) {
      existing.intensity = Math.min(3, existing.intensity + 1);
    } else {
      s.debts.push({ npcId, name, reason, intensity, createdAt: s.year * 12 + s.month });
    }
    this.addLog(`🤝 你与【${name}】结下了恩情：${reason}`, 'success');
  },

  resolveGrudge(npcId) {
    const s = this.state;
    const idx = s.grudges.findIndex(g => g.npcId === npcId);
    if (idx === -1) return { success: false, msg: '没有与此人的仇怨' };
    const grudge = s.grudges[idx];
    s.grudges.splice(idx, 1);
    // 化解仇怨获得声望
    const repGain = grudge.intensity * 15;
    s.reputation += repGain;
    s.morality += grudge.intensity * 5;
    this.addLog(`✅ 你化解了与【${grudge.name}】的仇怨，声望+${repGain}。`, 'success');
    return { success: true, grudge };
  },

  // 仇人随机出现复仇（在 fight 中调用）
  _checkGrudgeEncounter() {
    const s = this.state;
    if (s.grudges.length === 0) return null;
    // 仇怨越深，出现概率越高
    const totalWeight = s.grudges.reduce((a, g) => a + g.intensity * 5, 0);
    if (Math.random() * 100 > totalWeight) return null;
    // 随机选一个仇人
    const grudge = s.grudges[Math.floor(Math.random() * s.grudges.length)];
    return grudge;
  },

  // ══════════════════════════════════════════════════════════
  //  Q2: 行动连击系统
  // ══════════════════════════════════════════════════════════
  _updateCombo(actionType) {
    const s = this.state;
    // 连击类型分组：同组才能连击
    const comboGroups = {
      train: 'practice', inner: 'practice',
      wander: 'explore', explore: 'explore',
      work: 'earn', trade: 'earn',
      fight: 'combat', duel: 'combat',
      rest: 'rest',
    };
    const group = comboGroups[actionType] || actionType;
    const lastGroup = comboGroups[s.lastActionType] || s.lastActionType;

    if (group === lastGroup && s.lastActionType !== null) {
      s.comboCount = Math.min(5, s.comboCount + 1);
    } else {
      s.comboCount = 1;
    }
    s.lastActionType = actionType;
    // 连击加成：每层+8%，最高+40%
    s.comboBonus = (s.comboCount - 1) * 8;

    if (s.comboCount >= 2) {
      const comboNames = ['', '', '二连击', '三连击', '四连击', '五连击'];
      this.addLog(`🔥 ${comboNames[s.comboCount] || s.comboCount + '连击'}！行动效果+${s.comboBonus}%`, 'success');
    }
    return s.comboBonus;
  },

  getComboMultiplier() {
    return 1 + (this.state.comboBonus || 0) / 100;
  },

  // ══════════════════════════════════════════════════════════
  //  R: 死亡与重伤系统
  // ══════════════════════════════════════════════════════════
  _applyInjury(desc, months = 2) {
    const s = this.state;
    s.isInjured = true;
    s.injuredMonthsLeft = Math.max(s.injuredMonthsLeft, months);
    s.injuryDesc = desc;
    this.addLog(`🩸 重伤：${desc}，需要 ${months} 个月休养。`, 'danger');
  },

  _tickInjury() {
    const s = this.state;
    if (!s.isInjured) return;
    s.injuredMonthsLeft--;
    if (s.injuredMonthsLeft <= 0) {
      s.isInjured = false;
      s.injuredMonthsLeft = 0;
      s.injuryDesc = '';
      this.addLog('🌿 你的伤势已经痊愈，可以重新出发了。', 'success');
    }
  },

  // 检查是否濒死（hp <= 0 时调用）
  _checkNearDeath() {
    const s = this.state;
    s.deathCount++;
    s.nearDeathExp++;
    // 鬼门关走过，获得一些感悟
    const bonuses = [
      { key: 'perception', val: 3 + Math.floor(Math.random() * 5) },
      { key: 'endurance', val: 2 + Math.floor(Math.random() * 3) },
    ];
    bonuses.forEach(b => { s[b.key] = (s[b.key] || 0) + b.val; });
    // 重伤3个月
    this._applyInjury('鬼门关走了一遭，元气大伤', 3);
    // 恢复到10%血量
    s.hp = Math.max(1, Math.floor(s.maxHp * 0.1));
    // 损失一些金钱（治疗费）
    const healCost = Math.min(s.gold, 30 + Math.floor(Math.random() * 50));
    s.gold -= healCost;
    this.addLog(`💀 你在鬼门关走了一遭！幸得好心人相救，花费 ${healCost} 两治疗。悟性+${bonuses[0].val}，体魄+${bonuses[1].val}。`, 'danger');
    return { nearDeath: true, bonuses, healCost };
  },

  // 重伤时行动效果减半
  getInjuryPenalty() {
    return this.state.isInjured ? 0.5 : 1.0;
  },

  // ══════════════════════════════════════════════════════════
  //  S: 富事件（多段对话）系统
  // ══════════════════════════════════════════════════════════
  _triggerRichEvent() {
    const s = this.state;
    const available = DATA.RICH_EVENTS.filter(e => {
      if (s.completedRichEvents.includes(e.id)) return false;
      if (e.trigger && e.trigger.minReputation && s.reputation < e.trigger.minReputation) return false;
      return true;
    });
    if (available.length === 0) return;
    const totalWeight = available.reduce((a, b) => a + (b.weight || 10), 0);
    let r = Math.random() * totalWeight;
    let chosen = available[0];
    for (const ev of available) {
      r -= (ev.weight || 10);
      if (r <= 0) { chosen = ev; break; }
    }
    s.pendingRichEvent = { eventId: chosen.id, stepId: 's1' };
    this.addLog(`📖 江湖奇遇：【${chosen.name}】`, 'story');
  },

  // 获取当前富事件的步骤数据
  getRichEventStep() {
    const s = this.state;
    if (!s.pendingRichEvent) return null;
    const ev = DATA.RICH_EVENTS.find(e => e.id === s.pendingRichEvent.eventId);
    if (!ev) return null;
    const step = ev.steps.find(st => st.id === s.pendingRichEvent.stepId);
    return { event: ev, step };
  },

  // 处理富事件选择
  handleRichEventChoice(choiceIdx) {
    const s = this.state;
    if (!s.pendingRichEvent) return { success: false, msg: '没有进行中的奇遇' };
    const ev = DATA.RICH_EVENTS.find(e => e.id === s.pendingRichEvent.eventId);
    if (!ev) return { success: false, msg: '奇遇数据不存在' };
    const step = ev.steps.find(st => st.id === s.pendingRichEvent.stepId);
    if (!step) return { success: false, msg: '步骤不存在' };
    const choice = step.choices[choiceIdx];
    if (!choice) return { success: false, msg: '无效选择' };

    // 检查前置条件
    if (choice.require) {
      for (const [k, v] of Object.entries(choice.require)) {
        if ((s[k] || 0) < v) {
          return { success: false, msg: `此选项需要${this._statName(k)}达到${v}，当前为${s[k]||0}` };
        }
      }
    }

    // 应用即时效果
    const eff = choice.effect || {};
    const statKeys = ['hp','innerPower','strength','agility','swordSkill','endurance',
                      'perception','charm','gold','reputation','morality','evil','luck','speed'];
    for (const k of statKeys) {
      if (eff[k] !== undefined) {
        s[k] = Math.max(0, (s[k] || 0) + eff[k]);
      }
    }
    // 给予物品
    if (choice.item) {
      s.inventory[choice.item] = (s.inventory[choice.item] || 0) + 1;
    }

    // 判断是否结束
    if (choice.next === null || choice.next === undefined) {
      // 事件结束
      s.completedRichEvents.push(ev.id);
      s.pendingRichEvent = null;
      if (choice.endMsg) this.addLog(choice.endMsg, 'story');
      this._checkTitles();
      return { success: true, ended: true, endMsg: choice.endMsg, effect: eff };
    } else {
      // 进入下一步
      s.pendingRichEvent.stepId = choice.next;
      return { success: true, ended: false, nextStepId: choice.next };
    }
  },

  // ── 保存/读取 ─────────────────────────────────────────────
  save() {
    try {
      localStorage.setItem('daxia_save', JSON.stringify(this.state));
      return true;
    } catch(e) { return false; }
  },

  load() {
    try {
      const data = localStorage.getItem('daxia_save');
      if (data) { this.state = JSON.parse(data); return true; }
    } catch(e) {}
    return false;
  },

};
