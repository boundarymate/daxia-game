// ============================================================
//  大侠模拟器 · 游戏引擎  v2.0
// ============================================================

const Engine = {

  state: null,

  // ── 初始化新游戏 ──────────────────────────────────────────
  newGame(name, gender, traits, backgrounds) {
    const base = {
      name, gender,
      age: 16,
      year: 1, month: 1,
      location: 'l_town',

      hp: 100, maxHp: 100,
      innerPower: 10,
      strength: 10,
      agility: 10,
      endurance: 10,
      perception: 10,
      charm: 10,
      speed: 10,
      swordSkill: 0,
      luck: 10,

      morality: 50,
      evil: 0,
      reputation: 0,

      gold: 50,
      energy: 100,       // 体力上限100，每月自动恢复
      maxEnergy: 100,    // 体力上限（可随endurance提升）
      renqing: 0,

      martialArts: [],   // [{id, level, exp}]  level 1-10
      weapons: [],
      equippedWeapon: null,

      followers: [],
      spouse: null,
      npcFavor: {},

      sect: null,
      sectRank: 0,
      sectContrib: 0,

      activeQuests: [],
      completedQuests: [],

      log: [],
      eventHistory: [],

      battlesWon: 0,
      battlesLost: 0,
      totalKills: 0,
    };

    traits.forEach(tid => {
      const t = DATA.TRAITS.find(x => x.id === tid);
      if (t) this._applyBonus(base, t.bonus);
    });
    backgrounds.forEach(bid => {
      const b = DATA.BACKGROUNDS.find(x => x.id === bid);
      if (b) this._applyBonus(base, b.bonus);
    });

    const minStats = { hp:50, maxHp:50, innerPower:5, strength:5, agility:5,
                       endurance:5, perception:5, charm:5, speed:5, luck:5, gold:10 };
    Object.keys(minStats).forEach(k => {
      if (base[k] < minStats[k]) base[k] = minStats[k];
    });
    base.maxHp = base.hp;
    base.maxEnergy = 100 + Math.floor(base.endurance / 5);

    DATA.NPCS.forEach(n => { base.npcFavor[n.id] = n.favor; });

    this.state = base;
    this.addLog('你踏上了江湖之路，一切从这里开始……', 'story');
    this.addLog(`初始地点：${this.getLocation().name}`, 'info');
    return base;
  },

  // ── 属性加成辅助 ─────────────────────────────────────────
  _applyBonus(state, bonus) {
    Object.keys(bonus).forEach(k => {
      if (k in state) state[k] = (state[k] || 0) + bonus[k];
    });
  },

  getLocation() {
    return DATA.LOCATIONS.find(l => l.id === this.state.location) || DATA.LOCATIONS[0];
  },

  getRealm() {
    const p = this.state.innerPower;
    let realm = DATA.REALMS[0];
    for (const r of DATA.REALMS) {
      if (p >= r.minPower) realm = r;
    }
    return realm;
  },

  getSect() {
    if (!this.state.sect) return null;
    return DATA.SECTS.find(s => s.id === this.state.sect);
  },

  getSectRankName() {
    const sect = this.getSect();
    if (!sect) return '无门无派';
    return sect.ranks[this.state.sectRank] || sect.ranks[0];
  },

  addLog(text, type = 'normal') {
    const s = this.state;
    this.state.log.unshift({ text, type, time: `第${s.year}年${s.month}月` });
    if (this.state.log.length > 200) this.state.log.pop();
  },

  // ── 时间推进（含每月结算）────────────────────────────────
  advanceTime(months) {
    const s = this.state;
    for (let i = 0; i < months; i++) {
      s.month++;
      if (s.month > 12) { s.month = 1; s.year++; s.age++; }

      // ── B: 体力每月自动恢复（基础30 + 体魄加成）
      const energyRegen = 30 + Math.floor(s.endurance / 10);
      s.energy = Math.min(s.maxEnergy, s.energy + energyRegen);

      // 气血每月自然恢复
      s.hp = Math.min(s.maxHp, s.hp + 8 + Math.floor(s.endurance / 15));

      // ── C: 每月生活开销
      this._monthlyExpense();

      // 门派月度收益
      this._sectMonthly();

      // ── F: 武功自然熟练（每月微量经验）
      this._martialMonthlyExp();
    }
  },

  // ── C: 每月生活开销 ──────────────────────────────────────
  _monthlyExpense() {
    const s = this.state;
    const loc = this.getLocation();
    // 不同地点生活费不同
    const expenseMap = {
      l_town: 5, l_xiangyang: 12, l_shaolin: 8, l_wudang: 8,
      l_huashan: 8, l_guigu: 3, l_taohua: 6, l_jianghu: 4,
      l_mongol: 0, l_dali: 10, l_tianshan: 3, l_guangming: 6,
    };
    const expense = expenseMap[s.location] || 5;
    s.gold -= expense;

    if (s.gold < 0) {
      // 穷困潦倒：体力和气血受损，声望下降
      s.gold = 0;
      const hpLoss = 5 + Math.floor(Math.random() * 8);
      const energyLoss = 10 + Math.floor(Math.random() * 10);
      s.hp = Math.max(1, s.hp - hpLoss);
      s.energy = Math.max(0, s.energy - energyLoss);
      s.reputation = Math.max(0, s.reputation - 2);
      this.addLog(`身无分文，食不果腹，气血和体力均有损耗。`, 'danger');
    }
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
    if (sect.type === 'court') {
      const salary = [0, 20, 40, 80, 150, 250, 400][this.state.sectRank] || 0;
      this.state.gold += salary;
      if (salary > 0) this.addLog(`领取朝廷俸禄 ${salary} 两银子`, 'gold');
    }
  },

  // ── F: 武功每月自然熟练 ──────────────────────────────────
  _martialMonthlyExp() {
    const s = this.state;
    s.martialArts.forEach(m => {
      if (m.level >= 10) return;
      // 每月自然积累少量经验
      m.exp = (m.exp || 0) + 1;
      this._checkMartialLevelUp(m);
    });
  },

  // ── F: 检查武功升级 ──────────────────────────────────────
  _checkMartialLevelUp(martialRecord) {
    const s = this.state;
    const ma = DATA.MARTIAL_ARTS.find(x => x.id === martialRecord.id);
    if (!ma) return false;
    // 升级所需经验：level * 10（越高越难）
    const needed = martialRecord.level * 10;
    if (martialRecord.exp >= needed && martialRecord.level < 10) {
      martialRecord.exp -= needed;
      martialRecord.level++;
      // 升级奖励：效果的10%
      const bonus = {};
      Object.entries(ma.effect).forEach(([k, v]) => {
        const gain = Math.max(1, Math.floor(v * 0.1));
        bonus[k] = gain;
      });
      this._applyBonus(s, bonus);
      const bonusStr = Object.entries(bonus).map(([k,v])=>`${this._statName(k)}+${v}`).join('，');
      this.addLog(`【${ma.name}】修炼至第${martialRecord.level}层！${bonusStr}`, 'gold');
      return true;
    }
    return false;
  },

  // ── 随机事件触发 ─────────────────────────────────────────
  _triggerRandomEvent() {
    const available = DATA.EVENTS.filter(e =>
      !this.state.eventHistory.includes(e.id) ||
      ['e_robbery','e_duel','e_orphan','e_poverty'].includes(e.id)
    );
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  },

  // ── 执行行动 ─────────────────────────────────────────────
  doAction(actionId, params = {}) {
    const s = this.state;
    const results = [];

    switch (actionId) {

      case 'rest': {
        // ── B: 休息消耗金钱，大幅恢复体力和气血
        const loc = this.getLocation();
        const restCost = { l_town:8, l_xiangyang:15, l_dali:12 }[s.location] || 8;
        if (s.gold < restCost) {
          // 没钱就露宿街头，恢复少一些
          const hpGain = Math.floor(s.maxHp * 0.15);
          const enGain = 20;
          s.hp = Math.min(s.maxHp, s.hp + hpGain);
          s.energy = Math.min(s.maxEnergy, s.energy + enGain);
          this.advanceTime(1);
          this.addLog(`身无分文，只能露宿街头，勉强恢复了气血${hpGain}点、体力${enGain}点。`, 'warn');
        } else {
          s.gold -= restCost;
          const hpGain = Math.floor(s.maxHp * 0.4);
          const enGain = 50;
          s.hp = Math.min(s.maxHp, s.hp + hpGain);
          s.energy = Math.min(s.maxEnergy, s.energy + enGain);
          this.advanceTime(1);
          this.addLog(`你在客栈休息一个月（花费${restCost}两），气血恢复${hpGain}点、体力恢复${enGain}点。`, 'normal');
        }
        results.push({ type:'rest' });
        break;
      }

      case 'train': {
        // ── B: 修炼消耗体力
        const trainCost = 25;
        if (s.energy < trainCost) {
          this.addLog(`体力不足（需要${trainCost}，当前${s.energy}），请先休息。`, 'warn');
          return { success:false, msg:`体力不足（需要${trainCost}点）` };
        }
        s.energy -= trainCost;
        const gains = this._calcTrainGain();
        Object.keys(gains).forEach(k => { s[k] = (s[k]||0) + gains[k]; });

        // ── F: 修炼时给已学武功加经验
        const expGained = this._trainMartialExp();

        this.advanceTime(1);
        const gainStr = Object.entries(gains).map(([k,v])=>`${this._statName(k)}+${v}`).join('，');
        const martialStr = expGained.length > 0 ? `，${expGained.join('、')}经验+5` : '';
        this.addLog(`你刻苦修炼一个月，${gainStr}${martialStr}。`, 'success');
        results.push({ type:'train', gains });
        break;
      }

      case 'wander': {
        const cost = params.cost || { time:1, gold:20 };
        if (s.gold < cost.gold) {
          this.addLog('盘缠不足，无法出行。', 'warn');
          return { success:false, msg:'金钱不足' };
        }
        // ── B: 游历也消耗体力
        if (s.energy < 15) {
          return { success:false, msg:'体力不足，请先休息' };
        }
        s.gold -= cost.gold;
        s.energy -= 15;
        this.advanceTime(cost.time);
        const wanderGain = this._calcWanderGain();
        Object.keys(wanderGain).forEach(k => { s[k] = (s[k]||0) + wanderGain[k]; });
        this.addLog(`你游历江湖${cost.time}个月，花费${cost.gold}两银子，见识大增。`, 'story');
        results.push({ type:'wander', gains:wanderGain });
        break;
      }

      case 'work': {
        // ── B: 打工消耗体力
        if (s.energy < 20) {
          return { success:false, msg:'体力不足，请先休息' };
        }
        const earn = 10 + Math.floor(s.charm / 5) + Math.floor(Math.random() * 10);
        s.gold += earn;
        s.energy -= 20;
        this.advanceTime(1);
        this.addLog(`你在${this.getLocation().name}做了一个月的杂活，赚得 ${earn} 两银子。`, 'gold');
        results.push({ type:'gold', val:earn });
        break;
      }

      case 'learn_martial': {
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
        return this.travel(params.locationId);
      }

      case 'talk': {
        return this.talkToNPC(params.npcId);
      }

      case 'fight': {
        return this.fight(params.npcId || params.enemyId);
      }

      case 'recruit': {
        return this.recruit(params.npcId);
      }

      case 'propose': {
        return this.propose(params.npcId);
      }

      case 'explore': {
        // ── B: 探索消耗更多体力
        if (s.energy < 35) {
          this.addLog('体力不足，无法探索。', 'warn');
          return { success:false, msg:'体力不足（需要35点）' };
        }
        s.energy -= 35;
        this.advanceTime(2);
        const roll = Math.random();
        if (roll < 0.15) {
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
          const w = this._getRandomWeapon();
          if (w) {
            s.weapons.push(w.id);
            this.addLog(`探索中发现了神兵【${w.name}】！`, 'success');
          }
        } else if (roll < 0.5) {
          const gold = 30 + Math.floor(Math.random() * 70);
          s.gold += gold;
          this.addLog(`探索中发现了一处藏宝，获得 ${gold} 两银子。`, 'gold');
        } else if (roll < 0.65) {
          const hpLoss = 10 + Math.floor(Math.random() * 20);
          s.hp = Math.max(1, s.hp - hpLoss);
          this.addLog(`探索途中遭遇危险，损失气血 ${hpLoss} 点。`, 'danger');
        } else {
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

  // ── F: 修炼时给武功加经验 ────────────────────────────────
  _trainMartialExp() {
    const s = this.state;
    const leveled = [];
    s.martialArts.forEach(m => {
      if (m.level >= 10) return;
      m.exp = (m.exp || 0) + 5;
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      if (this._checkMartialLevelUp(m) && ma) {
        leveled.push(`【${ma.name}】升至第${m.level}层`);
      }
    });
    // 返回升级了的武功名（用于日志）
    return s.martialArts.filter(m => m.level < 10).map(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      return ma ? ma.name : '';
    }).filter(Boolean).slice(0, 3);
  },

  // ── 修炼收益计算 ─────────────────────────────────────────
  _calcTrainGain() {
    const s = this.state;
    const gains = {};
    const base = 1 + Math.floor(s.perception / 20);

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

    if (this.getSect()) {
      Object.keys(gains).forEach(k => { gains[k] = Math.ceil(gains[k] * 1.3); });
    }

    return gains;
  },

  _calcWanderGain() {
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

    if (s.martialArts.find(m => m.id === martialId)) {
      return { success:false, msg:'你已经学过这门武功了' };
    }

    const req = ma.require;
    for (const [k, v] of Object.entries(req)) {
      if ((s[k] || 0) < v) {
        return { success:false, msg:`需要${this._statName(k)}达到${v}，当前为${s[k]||0}` };
      }
    }

    if (teacherId) {
      const favor = s.npcFavor[teacherId] || 0;
      if (favor < 30) {
        return { success:false, msg:'与师傅的好感度不足，需要先增进感情' };
      }
      s.npcFavor[teacherId] = Math.max(0, s.npcFavor[teacherId] - 10);
    }

    // ── B: 学武功消耗体力
    if (s.energy < 30) {
      return { success:false, msg:'体力不足，无法专心学武（需要30点）' };
    }
    s.energy -= 30;

    s.martialArts.push({ id: martialId, level: 1, exp: 0 });
    this._applyBonus(s, ma.effect);
    this.advanceTime(2);
    this.addLog(`你学会了【${ma.name}】（第1层）！${ma.desc}`, 'success');

    return { success:true, martial: ma };
  },

  // ── 加入门派 ─────────────────────────────────────────────
  joinSect(sectId) {
    const s = this.state;
    if (s.sect) return { success:false, msg:'你已经加入了门派，不能再加入其他门派' };
    const sect = DATA.SECTS.find(x => x.id === sectId);
    if (!sect) return { success:false, msg:'门派不存在' };

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

  sectContribute() {
    const s = this.state;
    const sect = this.getSect();
    if (!sect) return { success:false, msg:'你尚未加入任何门派' };

    const cost = 20;
    if (s.gold < cost) return { success:false, msg:'金钱不足' };
    if (s.energy < 20) return { success:false, msg:'体力不足' };

    s.gold -= cost;
    s.sectContrib += 30;
    s.energy -= 20;
    this.advanceTime(1);
    this.addLog(`你为${sect.name}效力一个月，贡献值+30。`, 'normal');

    return this.checkSectPromotion();
  },

  checkSectPromotion() {
    const s = this.state;
    const sect = this.getSect();
    if (!sect) return { success:false };

    const nextRank = s.sectRank + 1;
    if (nextRank >= sect.ranks.length) return { success:false, msg:'你已是门派最高职位' };

    const reqContrib = sect.rankReq[nextRank];
    if (s.sectContrib >= reqContrib && s.reputation >= reqContrib / 10) {
      s.sectRank = nextRank;
      const rankName = sect.ranks[nextRank];
      this.addLog(`恭喜！你在${sect.name}晋升为【${rankName}】！`, 'success');
      return { success:true, newRank: rankName };
    }

    return { success:false, msg:`晋升需要贡献值${reqContrib}，当前${s.sectContrib}` };
  },

  // ── 执行任务 ─────────────────────────────────────────────
  doQuest(questId) {
    const s = this.state;
    const quest = DATA.QUESTS.find(q => q.id === questId);
    if (!quest) return { success:false, msg:'任务不存在' };

    if (s.completedQuests.includes(questId)) {
      return { success:false, msg:'你已经完成过这个任务了' };
    }

    for (const [k, v] of Object.entries(quest.require)) {
      if ((s[k] || 0) < v) {
        return { success:false, msg:`需要${this._statName(k)}达到${v}` };
      }
    }

    const cost = quest.cost;
    if (cost.gold && s.gold < cost.gold) return { success:false, msg:'金钱不足' };
    if (cost.energy && s.energy < cost.energy) return { success:false, msg:`体力不足（需要${cost.energy}点）` };

    if (cost.gold) s.gold -= cost.gold;
    if (cost.energy) s.energy -= cost.energy;

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

    const reward = quest.reward;
    if (reward.gold) s.gold += reward.gold;
    if (reward.reputation) s.reputation += reward.reputation;
    if (reward.morality) s.morality = Math.min(100, s.morality + reward.morality);
    if (reward.evil) s.evil += reward.evil;
    if (reward.exp) this._gainExp(reward.exp);
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

    s.completedQuests.push(questId);
    this.advanceTime(cost.time);

    const rewardStr = [
      reward.gold ? `金钱+${reward.gold}` : '',
      reward.reputation ? `声望+${reward.reputation}` : '',
      reward.morality ? `道德+${reward.morality}` : '',
    ].filter(Boolean).join('，');

    this.addLog(`任务【${quest.name}】完成！${rewardStr}`, 'success');
    return { success:true, quest, reward };
  },

  // ── 前往某地 ─────────────────────────────────────────────
  travel(locationId) {
    const s = this.state;
    const loc = DATA.LOCATIONS.find(l => l.id === locationId);
    if (!loc) return { success:false, msg:'地点不存在' };

    const travelCost = { time:1, gold: 10 + loc.danger * 5 };
    if (s.gold < travelCost.gold) return { success:false, msg:'盘缠不足' };
    // ── B: 赶路消耗体力
    if (s.energy < 10) return { success:false, msg:'体力不足，请先休息再出发' };

    s.gold -= travelCost.gold;
    s.energy -= 10;
    s.location = locationId;
    this.advanceTime(travelCost.time);

    this.addLog(`你前往了【${loc.name}】。${loc.desc}`, 'story');

    if (loc.danger >= 3 && Math.random() < 0.3) {
      this.addLog('途中遭遇了危险！', 'danger');
      return { success:true, loc, encounter:true };
    }

    return { success:true, loc };
  },

  // ── D: 与NPC交谈（不同NPC好感提升方式不同）────────────────
  talkToNPC(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'NPC不存在' };

    // 不同NPC有不同的好感提升逻辑
    let favorGain = 3 + Math.floor(s.charm / 15);
    let talkNote = '';

    const npcBonus = DATA.NPC_FAVOR_RULES?.[npcId];
    if (npcBonus) {
      // 检查特殊条件加成
      if (npcBonus.statBonus) {
        Object.entries(npcBonus.statBonus).forEach(([stat, bonus]) => {
          if ((s[stat] || 0) >= bonus.threshold) {
            favorGain += bonus.gain;
            talkNote = bonus.note;
          }
        });
      }
    }

    // 道德对正道NPC的影响
    if (npc.align === 'good' && s.morality >= 60) {
      favorGain += 2;
    } else if (npc.align === 'good' && s.morality < 30) {
      favorGain = Math.max(0, favorGain - 3);
    }
    // 邪气对邪道NPC的影响
    if (npc.align === 'evil' && s.evil >= 20) {
      favorGain += 3;
    }

    const prevFavor = s.npcFavor[npcId] || 0;
    s.npcFavor[npcId] = Math.min(100, prevFavor + favorGain);

    const dialog = npc.dialog[Math.floor(Math.random() * npc.dialog.length)];
    this.addLog(`${npc.name}（${npc.title}）说："${dialog}"`, 'dialog');
    this.addLog(`与${npc.name}的好感度+${favorGain}${talkNote ? '（' + talkNote + '）' : ''}`, 'info');

    // ── D: 好感度阈值解锁特殊内容
    const newFavor = s.npcFavor[npcId];
    if (prevFavor < 30 && newFavor >= 30) {
      this.addLog(`与${npc.name}的好感度达到30，可以请求传授武功了！`, 'gold');
    }
    if (prevFavor < 50 && newFavor >= 50) {
      this.addLog(`与${npc.name}的好感度达到50，可以招募为手下了！`, 'gold');
    }
    if (prevFavor < 80 && newFavor >= 80 && npc.canMarry) {
      this.addLog(`与${npc.name}的好感度达到80，可以求婚了！`, 'gold');
    }

    return { success:true, npc, dialog, favorGain };
  },

  // ── E: 战斗系统（丰富结果）──────────────────────────────
  fight(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'对手不存在' };

    // ── B: 战斗消耗体力
    if (s.energy < 15) {
      return { success:false, msg:'体力不足，无法战斗（需要15点）' };
    }
    s.energy -= 15;

    const myPower = this._calcCombatPower();
    const enemyPower = npc.power;
    const ratio = myPower / (myPower + enemyPower);

    // ── E: 五种战斗结果
    const roll = Math.random();
    let outcome; // 'dominate' | 'win' | 'draw' | 'lose' | 'rout'
    if (roll < ratio * 0.3)        outcome = 'dominate'; // 大胜
    else if (roll < ratio * 0.8)   outcome = 'win';      // 胜
    else if (roll < ratio + 0.1)   outcome = 'draw';     // 平局
    else if (roll < ratio + 0.5)   outcome = 'lose';     // 败
    else                           outcome = 'rout';     // 惨败

    const baseHpLoss = Math.floor(enemyPower * 0.08);
    const hpLossMap = { dominate: baseHpLoss * 0.3, win: baseHpLoss, draw: baseHpLoss * 1.5, lose: baseHpLoss * 2.5, rout: baseHpLoss * 4 };
    const hpLoss = Math.max(1, Math.floor(hpLossMap[outcome] * (0.8 + Math.random() * 0.4)));
    s.hp = Math.max(1, s.hp - hpLoss);

    const expMap = { dominate: enemyPower * 0.8, win: enemyPower * 0.5, draw: enemyPower * 0.3, lose: enemyPower * 0.15, rout: enemyPower * 0.05 };
    const expGain = Math.floor(expMap[outcome]);
    if (expGain > 0) this._gainExp(expGain);

    // ── E: 战利品（胜利时有概率）
    let loot = null;
    if ((outcome === 'dominate' || outcome === 'win') && Math.random() < 0.3) {
      const goldLoot = 5 + Math.floor(Math.random() * enemyPower * 0.5);
      s.gold += goldLoot;
      loot = `缴获${goldLoot}两银子`;
    }

    // 声望和道德变化
    if (outcome === 'dominate' || outcome === 'win') {
      s.battlesWon++;
      const repGain = Math.floor(enemyPower / 8);
      s.reputation += repGain;
      if (npc.align === 'evil') {
        s.morality = Math.min(100, s.morality + 3);
      } else {
        s.morality = Math.max(0, s.morality - 3);
        s.evil += 3;
      }
    } else if (outcome === 'lose' || outcome === 'rout') {
      s.battlesLost++;
    }

    // ── E: 战斗叙事
    const narratives = {
      dominate: `你以压倒性的实力击败了${npc.name}，对方狼狈而逃，毫无还手之力！`,
      win:      `你与${npc.name}大战一场，最终险胜，对方心服口服。`,
      draw:     `你与${npc.name}打得难解难分，最终握手言和，互相佩服。`,
      lose:     `你与${npc.name}交手，渐落下风，勉强撑住后败退。`,
      rout:     `你被${npc.name}打得毫无还手之力，狼狈逃窜，颜面尽失！`,
    };
    const logType = ['dominate','win'].includes(outcome) ? 'success' : outcome === 'draw' ? 'normal' : 'danger';
    const lootStr = loot ? `，${loot}` : '';
    const expStr = expGain > 0 ? `，获得经验${expGain}` : '';
    this.addLog(`${narratives[outcome]}（损失气血${hpLoss}点${expStr}${lootStr}）`, logType);

    // ── E: 惨败给强敌有特殊事件（被收为弟子/被迫效力）
    let specialEvent = null;
    if (outcome === 'rout' && enemyPower > myPower * 1.5) {
      if (npc.canTeach && Math.random() < 0.4) {
        specialEvent = { type:'apprentice', npc };
        this.addLog(`${npc.name}见你虽败犹勇，有意收你为徒……`, 'gold');
      }
    }

    return { success:true, outcome, hpLoss, expGain, loot, specialEvent };
  },

  // ── 计算战斗力 ─────────────────────────────────────────────
  _calcCombatPower() {
    const s = this.state;
    let power = s.strength * 0.3 + s.innerPower * 0.4 + s.agility * 0.2 + s.swordSkill * 0.1;

    // ── F: 武功等级加成（高等级武功提供额外战斗力）
    s.martialArts.forEach(m => {
      const ma = DATA.MARTIAL_ARTS.find(x => x.id === m.id);
      if (ma) {
        const levelBonus = (m.level - 1) * ma.tier * 2;
        power += levelBonus;
      }
    });

    if (s.equippedWeapon) {
      const w = DATA.WEAPONS.find(x => x.id === s.equippedWeapon);
      if (w) power += (w.bonus.strength || 0) + (w.bonus.swordSkill || 0);
    }

    const realm = this.getRealm();
    const realmBonus = { r_mortal:1, r_xiantian:1.3, r_zongshi:1.7, r_jueding:2.2, r_legend:3 };
    power *= realmBonus[realm.id] || 1;
    return Math.floor(power);
  },

  recruit(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'NPC不存在' };
    if (!npc.canRecruit) return { success:false, msg:`${npc.name}不愿意跟随你` };

    const favor = s.npcFavor[npcId] || 0;
    if (favor < 50) return { success:false, msg:`与${npc.name}的好感度不足（需要50，当前${favor}）` };
    if (s.followers.find(f => f.npcId === npcId)) return { success:false, msg:`${npc.name}已经是你的手下了` };

    s.followers.push({ npcId, loyalty: favor });
    this.addLog(`${npc.name}决定跟随你，成为你的手下！`, 'success');
    return { success:true, npc };
  },

  propose(npcId) {
    const s = this.state;
    const npc = DATA.NPCS.find(n => n.id === npcId);
    if (!npc) return { success:false, msg:'NPC不存在' };
    if (!npc.canMarry) return { success:false, msg:`${npc.name}无法成为你的伴侣` };
    if (s.spouse) return { success:false, msg:'你已经有伴侣了' };

    const favor = s.npcFavor[npcId] || 0;
    if (favor < 80) return { success:false, msg:`与${npc.name}的好感度不足（需要80，当前${favor}）` };

    s.spouse = npcId;
    this.addLog(`${npc.name}答应了你的求婚，你们结为夫妻！`, 'success');
    return { success:true, npc };
  },

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

  resolveEventChoice(eventId, choiceIdx) {
    const s = this.state;
    const event = DATA.EVENTS.find(e => e.id === eventId);
    if (!event) return { success:false };

    const choice = event.choices[choiceIdx];
    if (!choice) return { success:false };

    if (choice.require === 'hasSect' && !s.sect) return { success:false, msg:'你尚未加入门派' };
    if (choice.require === 'evil' && s.evil < 10) return { success:false, msg:'你的邪气不足' };

    this._applyBonus(s, choice.effect);
    s.morality = Math.max(0, Math.min(100, s.morality));

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

  _gainExp(exp) {
    const s = this.state;
    const gain = Math.floor(exp / 20);
    if (gain > 0) {
      s.perception += gain;
      s.innerPower += Math.floor(gain / 2);
    }
  },

  _getRandomWeapon() {
    const s = this.state;
    const available = DATA.WEAPONS.filter(w => !s.weapons.includes(w.id) && w.tier <= 3);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  },

  _statName(key) {
    const map = {
      hp:'气血', maxHp:'最大气血', innerPower:'内力', strength:'力量',
      agility:'身法', endurance:'体魄', perception:'悟性', charm:'魅力',
      speed:'速度', swordSkill:'剑术', luck:'运气', morality:'道德',
      evil:'邪气', reputation:'声望', gold:'金钱', energy:'体力',
    };
    return map[key] || key;
  },

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

    const energyWarn = s.energy < 25 ? '⚠体力不足' : '';

    const actionDefs = {
      rest:    { name:'休息养伤',  icon:'🛌', cost:'1个月+少量银两', desc:'恢复气血和体力' },
      train:   { name:'刻苦修炼', icon:'⚔️', cost:`1个月+25体力${energyWarn}`, desc:'提升武功属性，武功积累经验' },
      wander:  { name:'游历江湖', icon:'🗺️', cost:'1个月+20两+15体力', desc:'增长见识，随机奇遇' },
      work:    { name:'打工赚钱', icon:'💰', cost:'1个月+20体力', desc:'赚取银两' },
      talk:    { name:'结交人物', icon:'💬', cost:'无', desc:'与当地人物交谈，提升好感' },
      shop:    { name:'购买装备', icon:'🛒', cost:'银两', desc:'购买武器装备' },
      quest:   { name:'接取任务', icon:'📜', cost:'不定', desc:'完成任务获得奖励' },
      fight:   { name:'切磋比武', icon:'🥊', cost:'15体力', desc:'与人切磋，积累实战经验' },
      explore: { name:'探索秘境', icon:'🔍', cost:'2个月+35体力', desc:'探索未知之地，寻找奇遇' },
    };

    (loc.actions || []).forEach(a => {
      if (actionDefs[a]) actions.push({ id:a, ...actionDefs[a] });
    });

    if (s.sect) {
      actions.push({ id:'sect_contribute', name:'为门派效力', icon:'🏯', cost:'1个月+20两+20体力', desc:'增加门派贡献值' });
    }

    return actions;
  },

  getLocalNPCs() {
    const loc = this.getLocation();
    return DATA.NPCS.filter(n => {
      return n.location === loc.name ||
        (loc.id === 'l_town' && n.location === '小镇') ||
        (loc.id === 'l_jianghu' && n.location === '江湖') ||
        (loc.id === 'l_xiangyang' && (n.location === '襄阳' || n.id === 'n_guojing' || n.id === 'n_huangrong'));
    });
  },

  getLearnableMartials() {
    const s = this.state;
    const sect = this.getSect();
    const teachable = sect ? sect.teachable : [];
    const localNPCs = this.getLocalNPCs();
    const result = [];

    teachable.forEach(mid => {
      const ma = DATA.MARTIAL_ARTS.find(m => m.id === mid);
      if (ma && !s.martialArts.find(m => m.id === mid)) {
        result.push({ ...ma, source: '门派传授', teacherId: null });
      }
    });

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

  getAvailableQuests() {
    const s = this.state;
    return DATA.QUESTS.filter(q => !s.completedQuests.includes(q.id));
  },

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
