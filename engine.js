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

    this.state = base;
    this.addLog('你踏上了江湖之路，一切从这里开始……', 'story');
    this.addLog(`初始地点：${this.getLocation().name}`, 'info');

    // 生成初始悬赏令
    this._refreshBounties();
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

      // 每月恢复体力
      s.energy = Math.min(100, s.energy + 30);
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
    }
    // 检查称号
    this._checkTitles();
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

    switch (actionId) {

      case 'rest': {
        // 休息：恢复体力和气血
        const hpGain = Math.floor(s.maxHp * 0.3);
        s.hp = Math.min(s.maxHp, s.hp + hpGain);
        s.energy = Math.min(100, s.energy + 40);
        this.advanceTime(1);
        this.addLog(`你在${this.getLocation().name}休息了一个月，气血恢复了 ${hpGain} 点。`, 'normal');
        results.push({ type:'hp', val:hpGain });
        break;
      }

      case 'train': {
        // 修炼：消耗体力，提升属性
        if (s.energy < 20) {
          this.addLog('体力不足，无法修炼。', 'warn');
          return { success:false, msg:'体力不足' };
        }
        s.energy -= 20;
        const gains = this._calcTrainGain();
        Object.keys(gains).forEach(k => { s[k] = (s[k]||0) + gains[k]; });
        this.advanceTime(1);
        const gainStr = Object.entries(gains).map(([k,v])=>`${this._statName(k)}+${v}`).join('，');
        this.addLog(`你刻苦修炼一个月，${gainStr}。`, 'success');
        results.push({ type:'train', gains });
        break;
      }

      case 'wander': {
        // 游历：消耗时间和金钱，随机收获
        const cost = params.cost || { time:1, gold:20 };
        if (s.gold < cost.gold) {
          this.addLog('盘缠不足，无法出行。', 'warn');
          return { success:false, msg:'金钱不足' };
        }
        s.gold -= cost.gold;
        this.advanceTime(cost.time);
        const wanderGain = this._calcWanderGain();
        Object.keys(wanderGain).forEach(k => { s[k] = (s[k]||0) + wanderGain[k]; });
        this.addLog(`你游历江湖${cost.time}个月，花费${cost.gold}两银子，见识大增。`, 'story');
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

    return { success:true, results };
  },

  // ── 修炼收益计算 ─────────────────────────────────────────
  _calcTrainGain() {
    const s = this.state;
    const gains = {};
    const titleBonus = this._getTitleBonus();
    const trainMod = 1 + (titleBonus.trainingBonus || 0) / 100;
    const base = Math.ceil((1 + Math.floor(s.perception / 20)) * trainMod);

    // 根据已学武功决定修炼方向
    const hasInner = s.martialArts.some(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      return ma && ma.type === 'inner';
    });
    const hasSword = s.martialArts.some(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      return ma && ma.type === 'sword';
    });

    if (hasInner) gains.innerPower = base + Math.floor(Math.random() * 3);
    else gains.innerPower = 1;

    if (hasSword) gains.swordSkill = base + Math.floor(Math.random() * 2);
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
  learnMartial(martialId, teacherId) {
    const s = this.state;
    const ma = DATA.MARTIAL_ARTS.find(m => m.id === martialId);
    if (!ma) return { success:false, msg:'武功不存在' };

    // 检查是否已学
    if (s.martialArts.find(m => m.id === martialId)) {
      return { success:false, msg:'你已经学过这门武功了' };
    }

    // 检查前置条件
    const req = ma.require;
    for (const [k, v] of Object.entries(req)) {
      if ((s[k] || 0) < v) {
        return { success:false, msg:`需要${this._statName(k)}达到${v}，当前为${s[k]||0}` };
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

    const myPower = this._calcCombatPower();
    const enemyPower = npc.power;

    const winChance = myPower / (myPower + enemyPower);
    const won = Math.random() < winChance;

    const hpLoss = Math.floor(enemyPower * (0.1 + Math.random() * 0.2));
    s.hp = Math.max(1, s.hp - hpLoss);

    if (won) {
      s.battlesWon++;
      const expGain = Math.floor(enemyPower / 2);
      this._gainExp(expGain);
      s.reputation += Math.floor(enemyPower / 10);
      // 好感度变化
      if (npc.align === 'evil') {
        s.morality = Math.min(100, s.morality + 5);
        s.reputation += 10;
      } else {
        s.morality = Math.max(0, s.morality - 5);
        s.evil += 5;
      }
      this.addLog(`你与${npc.name}大战一场，最终获胜！损失气血${hpLoss}点，获得经验${expGain}。`, 'success');
      return { success:true, won:true, hpLoss, expGain };
    } else {
      s.battlesLost++;
      s.hp = Math.max(1, s.hp - hpLoss);
      this.addLog(`你与${npc.name}交手，不敌对方，狼狈败退，损失气血${hpLoss}点。`, 'danger');
      return { success:true, won:false, hpLoss };
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
    for (const ending of DATA.ENDINGS) {
      const cond = ending.condition;
      let match = true;
      for (const [k, v] of Object.entries(cond)) {
        if (k === 'sectRank') {
          if (s.sect !== v.sect || s.sectRank < v.rank) { match = false; break; }
        } else if (k === 'followers') {
          if (s.followers.length < v) { match = false; break; }
        } else {
          if ((s[k] || 0) < v) { match = false; break; }
        }
      }
      if (match) return ending;
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
