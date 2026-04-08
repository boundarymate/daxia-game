// ============================================================
//  大侠模拟器 · 核心数据库
//  时代背景：神雕侠侣年间，郭靖守襄阳
// ============================================================

const DATA = {

// ─────────────────────────────────────────────
//  人物特质
//  cost > 0 = 正面特质（花费分数）
//  cost < 0 = 负面特质（返还分数）
//  初始分数 20，最终剩余必须 >= 0
// ─────────────────────────────────────────────
TRAITS: [

  // ══ 天赋类（正面，高消耗）══
  { id:'t_genius',    name:'武学奇才',  cost:6, tag:'天赋',
    desc:'百年难遇的武学天才，修炼速度是常人三倍，悟性与内力远超同龄人',
    bonus:{ perception:20, innerPower:15, swordSkill:10 } },
  { id:'t_inner',     name:'先天真气',  cost:5, tag:'天赋',
    desc:'娘胎里便带着一股先天真气，内力根基远超常人，修炼内功事半功倍',
    bonus:{ innerPower:25, endurance:10 } },
  { id:'t_strong',    name:'天生神力',  cost:4, tag:'天赋',
    desc:'生来力大无穷，臂力惊人，习练外功招式事半功倍',
    bonus:{ strength:20, endurance:10, hp:15 } },
  { id:'t_agile',     name:'身轻如燕',  cost:4, tag:'天赋',
    desc:'骨骼轻盈，筋骨柔韧，天生适合轻功身法，一学便会',
    bonus:{ agility:20, speed:12 } },
  { id:'t_memory',    name:'过目不忘',  cost:4, tag:'天赋',
    desc:'见过的武功招式过目不忘，举一反三，学武速度极快',
    bonus:{ perception:18, luck:8 } },
  { id:'t_sword',     name:'剑道天赋',  cost:3, tag:'天赋',
    desc:'与剑有缘，初次握剑便如老友重逢，习剑法如鱼得水',
    bonus:{ swordSkill:18, agility:8 } },
  { id:'t_poison',    name:'百毒不侵',  cost:3, tag:'天赋',
    desc:'天生对毒素有极强抵抗力，中毒后恢复极快，甚至以毒养身',
    bonus:{ endurance:12, hp:20, luck:5 } },
  { id:'t_lucky',     name:'鸿运当头',  cost:3, tag:'天赋',
    desc:'天生好运，奇遇频发，总能在危难时化险为夷',
    bonus:{ luck:22 } },

  // ══ 体魄类（正面，中等消耗）══
  { id:'t_tough',     name:'铁骨铮铮',  cost:3, tag:'体魄',
    desc:'体魄强健，气血充沛，受伤后恢复极快，耐力远超常人',
    bonus:{ hp:35, endurance:15 } },
  { id:'t_fast',      name:'疾如闪电',  cost:3, tag:'体魄',
    desc:'天生反应极快，出手速度惊人，先发制人的能力极强',
    bonus:{ speed:18, agility:10 } },
  { id:'t_endure',    name:'坚韧不拔',  cost:2, tag:'体魄',
    desc:'意志如铁，修炼不辍，越挫越勇，逆境中成长更快',
    bonus:{ endurance:18, innerPower:8 } },
  { id:'t_healthy',   name:'身强体壮',  cost:2, tag:'体魄',
    desc:'从不生病，体质极佳，气血旺盛，修炼时消耗体力更少',
    bonus:{ hp:25, endurance:12 } },

  // ══ 心性类（正面，中等消耗）══
  { id:'t_kind',      name:'悲天悯人',  cost:3, tag:'心性',
    desc:'心怀苍生，侠义为先，正道中人对你天然亲近，声望提升更快',
    bonus:{ morality:20, reputation:12, charm:8 } },
  { id:'t_handsome',  name:'相貌堂堂',  cost:3, tag:'心性',
    desc:'仪表不凡，气宇轩昂，初见便令人心生好感，社交事半功倍',
    bonus:{ charm:20, reputation:8 } },
  { id:'t_calm',      name:'心如止水',  cost:2, tag:'心性',
    desc:'处变不惊，临危不乱，战斗中不受恐惧影响，内功修炼更稳',
    bonus:{ innerPower:12, perception:10, endurance:8 } },
  { id:'t_brave',     name:'胆大心细',  cost:2, tag:'心性',
    desc:'敢于冒险，又不失谨慎，探索奇遇时成功率更高',
    bonus:{ luck:12, perception:8 } },

  // ══ 负面特质（返还分数）══
  { id:'t_weak',      name:'体弱多病',  cost:-2, tag:'缺陷',
    desc:'自幼体弱，三天两头生病，气血不足，修炼时体力消耗更大',
    bonus:{ hp:-25, endurance:-12 } },
  { id:'t_dull',      name:'资质平庸',  cost:-2, tag:'缺陷',
    desc:'悟性一般，学武比常人慢一倍，但胜在踏实肯干',
    bonus:{ perception:-15, luck:-5 } },
  { id:'t_poor_start', name:'一贫如洗', cost:-2, tag:'缺陷',
    desc:'身无分文，连盘缠都凑不齐，初始银两极少',
    bonus:{ gold:-40 } },
  { id:'t_ugly',      name:'其貌不扬',  cost:-1, tag:'缺陷',
    desc:'相貌平平，甚至有些丑陋，初次见面总让人印象不佳',
    bonus:{ charm:-15, reputation:-5 } },
  { id:'t_coward',    name:'胆小如鼠',  cost:-2, tag:'缺陷',
    desc:'天生胆怯，遇到强敌容易退缩，战斗中容易失误',
    bonus:{ luck:-8, strength:-8, endurance:-5 } },
  { id:'t_arrogant',  name:'目中无人',  cost:-1, tag:'缺陷',
    desc:'自视甚高，不把他人放在眼里，难以结交朋友，好感度提升更慢',
    bonus:{ charm:-12, reputation:-8 } },
  { id:'t_wine',      name:'嗜酒如命',  cost:-2, tag:'缺陷',
    desc:'酒瘾极大，每月必须花钱买酒，但酒后武功反而大进',
    bonus:{ strength:10, innerPower:8, gold:-35 } },
  { id:'t_cruel',     name:'心狠手辣',  cost:-1, tag:'缺陷',
    desc:'行事果决，不留余地，正道人士对你天然排斥，道德值难以提升',
    bonus:{ strength:10, evil:15, morality:-15, charm:-8 } },
  { id:'t_stubborn2', name:'固执己见',  cost:-1, tag:'缺陷',
    desc:'认准的事九头牛都拉不回，拜师时师傅更难接受你，但修炼更专注',
    bonus:{ innerPower:5, perception:-8 } },
  { id:'t_sickly',    name:'先天不足',  cost:-3, tag:'缺陷',
    desc:'先天内力亏损，修炼内功比常人难上数倍，但外功反而更强',
    bonus:{ innerPower:-20, strength:12, endurance:8 } },
  { id:'t_jinx',      name:'天生霉星',  cost:-2, tag:'缺陷',
    desc:'倒霉体质，奇遇总是擦肩而过，但也因此磨砺出超强意志',
    bonus:{ luck:-18, endurance:10 } },
  { id:'t_cold',      name:'冷若冰霜',  cost:-1, tag:'缺陷',
    desc:'不苟言笑，拒人千里，令人难以亲近，但气场令敌人心生畏惧',
    bonus:{ charm:-15, strength:8, reputation:5 } },
],

// ─────────────────────────────────────────────
//  背景特质
//  同样采用分数制，细分为多个类别
//  每类最多选1个（出身/经历/际遇各选1个，共3个）
// ─────────────────────────────────────────────
BACKGROUNDS: [

  // ══ 出身类（家世背景）══
  { id:'b_noble',     name:'书香门第',  cost:3, tag:'出身',
    desc:'出身书香世家，自幼饱读诗书，见识广博，家中藏书万卷，初始金钱充裕',
    bonus:{ gold:80, perception:12, charm:8 } },
  { id:'b_military',  name:'将门虎子',  cost:3, tag:'出身',
    desc:'出身将门世家，自幼习武，家传刀法已有基础，父辈在军中颇有威望',
    bonus:{ strength:15, endurance:12, swordSkill:8, gold:40 } },
  { id:'b_merchant',  name:'富商之后',  cost:3, tag:'出身',
    desc:'家境殷实，从不为钱发愁，人脉广泛，初始银两丰厚',
    bonus:{ gold:120, charm:10, luck:8 } },
  { id:'b_official',  name:'官宦之后',  cost:2, tag:'出身',
    desc:'父辈为官，自幼见惯官场，人情世故娴熟，在朝廷中有些关系',
    bonus:{ charm:12, gold:60, reputation:12 } },
  { id:'b_jianghu',   name:'江湖遗孤',  cost:2, tag:'出身',
    desc:'父母皆为江湖人，自幼耳濡目染，对江湖规矩了如指掌，有些武学基础',
    bonus:{ swordSkill:12, reputation:15, gold:20 } },
  { id:'b_monk',      name:'寺庙出身',  cost:2, tag:'出身',
    desc:'自幼在寺庙长大，青灯古佛，内功根基扎实，心性平和',
    bonus:{ innerPower:20, morality:15, gold:-10 } },
  { id:'b_nomad',     name:'塞外牧民',  cost:1, tag:'出身',
    desc:'来自塞外草原，自幼骑马射箭，体魄强健，但对中原江湖规矩不熟',
    bonus:{ strength:18, endurance:15, agility:8, reputation:-5 } },
  { id:'b_poor',      name:'贫苦人家',  cost:-1, tag:'出身',
    desc:'自幼贫苦，食不果腹，但磨砺出坚韧意志，对钱财格外珍惜',
    bonus:{ endurance:15, strength:8, gold:-35 } },
  { id:'b_orphan',    name:'孤苦伶仃',  cost:-2, tag:'出身',
    desc:'自幼父母双亡，流浪街头，无依无靠，但也因此心志坚定，不惧艰辛',
    bonus:{ endurance:20, strength:10, gold:-45, charm:-5 } },
  { id:'b_slave',     name:'奴仆出身',  cost:-2, tag:'出身',
    desc:'曾为人奴仆，饱受欺凌，心中积怨，但也练就了察言观色的本领',
    bonus:{ perception:10, agility:10, gold:-30, morality:-10, evil:10 } },

  // ══ 经历类（成长经历）══
  { id:'e_study',     name:'苦读武典',  cost:3, tag:'经历',
    desc:'少年时遍读武学典籍，虽未实践，但理论基础扎实，学武时领悟更快',
    bonus:{ perception:15, innerPower:10, swordSkill:8 } },
  { id:'e_travel',    name:'游历四方',  cost:2, tag:'经历',
    desc:'少年时便独自游历江湖，见多识广，结交了不少朋友，声望略有基础',
    bonus:{ perception:12, charm:10, reputation:15, luck:5 } },
  { id:'e_army',      name:'从军历练',  cost:2, tag:'经历',
    desc:'曾在军中历练数年，学得一身实战本领，纪律严明，体魄强健',
    bonus:{ strength:15, endurance:12, swordSkill:10 } },
  { id:'e_doctor',    name:'学医问药',  cost:2, tag:'经历',
    desc:'曾跟随郎中学医，懂得疗伤之术，识得百草，受伤后恢复更快',
    bonus:{ hp:25, endurance:10, perception:8, gold:15 } },
  { id:'e_merchant2', name:'行商走镖',  cost:1, tag:'经历',
    desc:'曾随商队走镖，见识了江湖险恶，练就了一身防身本领，积攒了些银两',
    bonus:{ agility:10, strength:8, gold:50, luck:5 } },
  { id:'e_thief',     name:'绿林经历',  cost:1, tag:'经历',
    desc:'曾混迹绿林，身手敏捷，消息灵通，但留下了些许污点',
    bonus:{ agility:15, luck:12, evil:8, gold:30, reputation:-5 } },
  { id:'e_prison',    name:'牢狱之灾',  cost:-1, tag:'经历',
    desc:'曾身陷囹圄，在牢中苦熬数年，意志磨砺如铁，但声名有损',
    bonus:{ endurance:18, strength:10, reputation:-15, gold:-20 } },
  { id:'e_betrayed',  name:'遭人背叛',  cost:-1, tag:'经历',
    desc:'曾被至亲好友背叛，心灰意冷，从此不轻易信人，但也更加独立坚强',
    bonus:{ endurance:12, perception:8, charm:-12, morality:-8 } },
  { id:'e_disaster',  name:'家道中落',  cost:-2, tag:'经历',
    desc:'家族曾遭横祸，一夜之间从富贵跌入贫困，但也因此磨砺出不屈意志',
    bonus:{ endurance:15, strength:8, gold:-50, reputation:-10 } },

  // ══ 际遇类（特殊机缘）══
  { id:'r_secret',    name:'得遇秘籍',  cost:4, tag:'际遇',
    desc:'少年时偶然得到一本残缺武学秘籍，虽不完整，但已让你武学基础远超同龄人',
    bonus:{ innerPower:18, swordSkill:12, perception:10 } },
  { id:'r_master',    name:'高人点拨',  cost:3, tag:'际遇',
    desc:'曾被一位隐世高人偶然点拨，虽只是只言片语，却让你武学境界豁然开朗',
    bonus:{ innerPower:15, perception:15, luck:8 } },
  { id:'r_treasure',  name:'意外横财',  cost:2, tag:'际遇',
    desc:'少年时意外发现一处藏宝，虽大部分已散尽，但仍留有不少银两傍身',
    bonus:{ gold:100, luck:10 } },
  { id:'r_hero',      name:'英雄救美',  cost:2, tag:'际遇',
    desc:'曾路见不平，出手相救，此事在当地传为美谈，声望与道德均有基础',
    bonus:{ reputation:20, morality:15, charm:10 } },
  { id:'r_poison2',   name:'奇毒淬体',  cost:1, tag:'际遇',
    desc:'少年时曾中一种奇毒，虽九死一生，但毒素与体内真气融合，体质大变',
    bonus:{ endurance:20, hp:15, innerPower:10, luck:-5 } },
  { id:'r_enemy',     name:'仇家追杀',  cost:-1, tag:'际遇',
    desc:'少年时便有仇家追杀，在逃亡中练就了一身逃跑本领，但也留下了心理阴影',
    bonus:{ agility:15, speed:10, luck:-10, charm:-8 } },
  { id:'r_curse',     name:'身负诅咒',  cost:-2, tag:'际遇',
    desc:'据说你出生时有异象，被人说是不祥之人，但也因此激发了你证明自己的决心',
    bonus:{ endurance:12, innerPower:8, reputation:-15, charm:-10 } },
  { id:'r_debt',      name:'背负债务',  cost:-2, tag:'际遇',
    desc:'家中欠下巨债，债主时常上门催讨，不得不拼命赚钱还债',
    bonus:{ gold:-60, endurance:10, strength:5 } },
],

// ─────────────────────────────────────────────
//  武学体系
// ─────────────────────────────────────────────
MARTIAL_ARTS: [
  // 内功
  { id:'m_jiuyang',   name:'九阳神功',   type:'inner',   tier:5, sect:'少林',
    desc:'天下至阳至刚内功，修炼后百毒不侵，内力绵绵不绝',
    require:{ innerPower:80, perception:60 },
    effect:{ innerPower:50, endurance:30, hp:40 } },
  { id:'m_jiuyin',    name:'九阴真经',   type:'inner',   tier:5, sect:'无',
    desc:'武林至高秘典，内外兼修，威力无穷',
    require:{ innerPower:70, perception:70 },
    effect:{ innerPower:45, agility:25, swordSkill:20 } },
  { id:'m_beiming',   name:'北冥神功',   type:'inner',   tier:5, sect:'逍遥派',
    desc:'吸人内力为己用，修炼者内力深不可测',
    require:{ innerPower:60, perception:65 },
    effect:{ innerPower:60, hp:20 } },
  { id:'m_yijin',     name:'易筋经',     type:'inner',   tier:4, sect:'少林',
    desc:'少林镇寺神功，修炼后筋骨脱胎换骨',
    require:{ innerPower:50, endurance:50 },
    effect:{ innerPower:30, strength:25, endurance:20 } },
  { id:'m_zixia',     name:'紫霞神功',   type:'inner',   tier:4, sect:'华山',
    desc:'华山派内功心法，刚柔并济',
    require:{ innerPower:40, perception:40 },
    effect:{ innerPower:25, swordSkill:15, agility:10 } },
  { id:'m_chunyang',  name:'纯阳无极功', type:'inner',   tier:3, sect:'全真',
    desc:'全真教内功，修炼后内力纯正',
    require:{ innerPower:30, morality:20 },
    effect:{ innerPower:20, endurance:15 } },
  { id:'m_basic',     name:'基础吐纳功', type:'inner',   tier:1, sect:'无',
    desc:'最基础的内功心法，人人可学',
    require:{},
    effect:{ innerPower:8, endurance:5 } },

  // 剑法
  { id:'m_duli',      name:'独孤九剑',   type:'sword',   tier:5, sect:'无',
    desc:'天下第一剑法，无招胜有招，破尽天下武功',
    require:{ swordSkill:80, perception:80, agility:60 },
    effect:{ swordSkill:60, agility:20 } },
  { id:'m_taiji',     name:'太极剑法',   type:'sword',   tier:4, sect:'武当',
    desc:'以柔克刚，四两拨千斤',
    require:{ swordSkill:50, innerPower:50 },
    effect:{ swordSkill:30, agility:15, innerPower:10 } },
  { id:'m_huashan',   name:'华山剑法',   type:'sword',   tier:3, sect:'华山',
    desc:'华山派正宗剑法，刚猛凌厉',
    require:{ swordSkill:30, innerPower:25 },
    effect:{ swordSkill:20, strength:8 } },
  { id:'m_wudang',    name:'武当长剑',   type:'sword',   tier:3, sect:'武当',
    desc:'武当派剑法，正大光明',
    require:{ swordSkill:25, morality:15 },
    effect:{ swordSkill:18, innerPower:8 } },
  { id:'m_basic_sword', name:'基础剑术', type:'sword',   tier:1, sect:'无',
    desc:'最基础的剑术，初学者必修',
    require:{},
    effect:{ swordSkill:8 } },

  // 掌法/拳法
  { id:'m_jianglong', name:'降龙十八掌', type:'palm',    tier:5, sect:'丐帮',
    desc:'丐帮镇帮绝学，刚猛无匹，天下第一掌法',
    require:{ strength:70, innerPower:60, endurance:50 },
    effect:{ strength:40, innerPower:20, hp:20 } },
  { id:'m_shaolin',   name:'少林拳法',   type:'palm',    tier:3, sect:'少林',
    desc:'少林七十二绝技之基础，刚猛有力',
    require:{ strength:30, endurance:30 },
    effect:{ strength:20, endurance:15 } },
  { id:'m_tianshan',  name:'天山折梅手', type:'palm',    tier:4, sect:'逍遥派',
    desc:'逍遥派绝学，以柔克刚，变化无穷',
    require:{ agility:50, perception:50 },
    effect:{ agility:25, strength:15, innerPower:10 } },

  // 轻功
  { id:'m_lingbo',    name:'凌波微步',   type:'qinggong', tier:5, sect:'逍遥派',
    desc:'天下第一轻功，步法变化如鬼魅',
    require:{ agility:70, innerPower:60, perception:60 },
    effect:{ agility:50, speed:30 } },
  { id:'m_tianzhan',  name:'梯云纵',     type:'qinggong', tier:4, sect:'武当',
    desc:'武当轻功，纵跃如飞',
    require:{ agility:40, innerPower:35 },
    effect:{ agility:25, speed:15 } },
  { id:'m_caoyuan',   name:'草上飞',     type:'qinggong', tier:2, sect:'无',
    desc:'江湖常见轻功，轻盈灵活',
    require:{ agility:20 },
    effect:{ agility:12, speed:8 } },

  // 暗器
  { id:'m_anqi',      name:'弹指神通',   type:'hidden',  tier:4, sect:'桃花岛',
    desc:'黄药师绝学，以内力弹出暗器，威力惊人',
    require:{ innerPower:50, agility:40, perception:50 },
    effect:{ agility:20, innerPower:10 } },
  { id:'m_feihua',    name:'飞花摘叶',   type:'hidden',  tier:3, sect:'无',
    desc:'以花叶为暗器，随手拈来皆是武器',
    require:{ innerPower:40, agility:35 },
    effect:{ agility:15, innerPower:8 } },

  // 邪功
  { id:'m_xingxiu',   name:'星宿神功',   type:'evil',    tier:4, sect:'星宿派',
    desc:'星宿老怪所创，阴毒无比，配合毒药威力大增',
    require:{ evil:30, innerPower:40 },
    effect:{ innerPower:25, evil:15, charm:-10 } },
  { id:'m_sunflower', name:'葵花宝典',   type:'evil',    tier:5, sect:'无',
    desc:'武功奇书，修炼者需自宫，威力无与伦比',
    require:{ innerPower:80, evil:20 },
    effect:{ innerPower:60, agility:30, swordSkill:30, charm:-20 } },
  { id:'m_huagong',   name:'化功大法',   type:'evil',    tier:4, sect:'明教',
    desc:'明教秘传，可化解他人内力',
    require:{ innerPower:50, evil:15 },
    effect:{ innerPower:35, endurance:15 } },
],

// ─────────────────────────────────────────────
//  神兵利器
// ─────────────────────────────────────────────
WEAPONS: [
  { id:'w_yitian',    name:'倚天剑',     tier:5, type:'sword',
    desc:'削铁如泥，天下至利之剑，内藏九阴真经',
    bonus:{ swordSkill:30, strength:15 }, location:'unknown' },
  { id:'w_tulong',    name:'屠龙刀',     tier:5, type:'blade',
    desc:'号令天下，莫敢不从，内藏武穆遗书',
    bonus:{ strength:30, reputation:20 }, location:'unknown' },
  { id:'w_xuantiexue', name:'玄铁重剑',  tier:4, type:'sword',
    desc:'重剑无锋，大巧不工，以力破巧',
    bonus:{ strength:25, swordSkill:15 }, location:'古墓' },
  { id:'w_bihaochao', name:'碧海潮生曲', tier:4, type:'flute',
    desc:'桃花岛传世之宝，以音律伤人',
    bonus:{ innerPower:20, charm:15 }, location:'桃花岛' },
  { id:'w_ruyi',      name:'如意金箍棒', tier:3, type:'staff',
    desc:'传说中的神器，重逾千斤',
    bonus:{ strength:20, endurance:10 }, location:'少林' },
  { id:'w_zhanlu',    name:'湛卢剑',     tier:3, type:'sword',
    desc:'仁者之剑，剑气凛然',
    bonus:{ swordSkill:20, morality:10 }, location:'武当' },
  { id:'w_puhong',    name:'朴刀',       tier:1, type:'blade',
    desc:'普通朴刀，江湖常见兵器',
    bonus:{ strength:5 }, location:'铁匠铺' },
  { id:'w_common_sword', name:'普通长剑', tier:1, type:'sword',
    desc:'普通长剑，初学者常用',
    bonus:{ swordSkill:5 }, location:'铁匠铺' },
],

// ─────────────────────────────────────────────
//  NPC 人物（金庸宇宙）
// ─────────────────────────────────────────────
NPCS: [
  // 神雕侠侣人物
  { id:'n_guojing',   name:'郭靖',    title:'郭大侠',   sect:'丐帮',  align:'good',
    desc:'侠之大者，为国为民，镇守襄阳',
    location:'襄阳', power:95, favor:0,
    canTeach:'m_jianglong', canRecruit:false,
    dialog:['为国为民，侠之大者。','你可愿为守护襄阳出一份力？','习武之人，当以天下苍生为念。'] },
  { id:'n_huangrong',  name:'黄蓉',   title:'黄帮主',   sect:'丐帮',  align:'good',
    desc:'聪慧机敏，丐帮帮主，郭靖之妻',
    location:'襄阳', power:85, favor:0,
    canTeach:'m_anqi', canRecruit:false,
    dialog:['你这人倒有几分意思。','丐帮的事，我自有主张。','桃花岛的武功，可不是随便传人的。'] },
  { id:'n_yangguo',   name:'杨过',    title:'神雕大侠', sect:'无',    align:'neutral',
    desc:'情深义重，武功盖世，独臂神雕侠',
    location:'古墓', power:98, favor:0,
    canTeach:'m_xuantiexue', canRecruit:false,
    dialog:['我行我素，不受任何约束。','小龙女是我此生唯一。','玄铁重剑，重剑无锋，大巧不工。'] },
  { id:'n_xiaolongnv', name:'小龙女', title:'姑姑',     sect:'古墓派', align:'neutral',
    desc:'冰清玉洁，古墓派传人，杨过之妻',
    location:'古墓', power:90, favor:0,
    canTeach:null, canRecruit:false,
    dialog:['过儿，你来了。','古墓之中，清净无为。','世间纷扰，不如归去。'] },
  { id:'n_jinlun',    name:'金轮法王', title:'法王',    sect:'蒙古',  align:'evil',
    desc:'蒙古国师，武功深不可测，野心勃勃',
    location:'蒙古大营', power:92, favor:0,
    canTeach:'m_yijin', canRecruit:true,
    dialog:['蒙古铁骑，天下无敌。','识时务者为俊杰，何不归顺大汗？','你的武功，倒有几分意思。'] },
  { id:'n_liuyingzhou', name:'李莫愁', title:'赤练仙子', sect:'古墓派', align:'evil',
    desc:'心狠手辣，赤练神掌，情伤之后性情大变',
    location:'江湖', power:75, favor:0,
    canTeach:null, canRecruit:true,
    dialog:['问世间情为何物，直教生死相许。','你若惹了我，休想活命。','哼，男人没一个好东西。'] },
  { id:'n_yinggu',    name:'瑛姑',    title:'瑛姑',     sect:'无',    align:'neutral',
    desc:'一灯大师旧情人，精通奇门数术',
    location:'黑沼', power:60, favor:0,
    canTeach:null, canRecruit:false,
    dialog:['我这一生，皆是错误。','数术之道，可知天命。','你来此地，所为何事？'] },

  // 天龙八部人物（年迈版）
  { id:'n_xuzhu',     name:'虚竹',    title:'虚竹大师', sect:'少林/逍遥派', align:'good',
    desc:'逍遥派掌门，少林弟子出身，武功深不可测',
    location:'少林', power:96, favor:0,
    canTeach:'m_beiming', canRecruit:false,
    dialog:['阿弥陀佛，施主有礼了。','逍遥派的武功，非有缘人不可传。','老衲在少林修行多年，尘缘已了。'] },
  { id:'n_duan',      name:'段誉',    title:'段皇爷',   sect:'大理',  align:'good',
    desc:'大理皇帝，六脉神剑与凌波微步传人',
    location:'大理', power:88, favor:0,
    canTeach:'m_lingbo', canRecruit:false,
    dialog:['大理段氏，以仁义治国。','六脉神剑，非段氏子弟不可传。','施主若有难，段某愿效犬马之劳。'] },
  { id:'n_tianshan',  name:'天山童姥', title:'童姥',    sect:'逍遥派', align:'evil',
    desc:'逍遥派长老，修炼不老童功，性情乖戾',
    location:'天山', power:94, favor:0,
    canTeach:'m_tianshan', canRecruit:false,
    dialog:['老身的武功，岂是你能学的？','天山之上，唯我独尊。','你若能让老身满意，或许可以传你一招半式。'] },

  // 江湖散人
  { id:'n_laotou',    name:'老叫花',  title:'老叫花',   sect:'丐帮',  align:'good',
    desc:'丐帮老乞丐，看似落魄，实则深藏不露',
    location:'小镇', power:40, favor:0,
    canTeach:'m_basic', canRecruit:false,
    dialog:['小娃娃，给老头儿几文钱吧。','哈哈，老头儿我也曾是江湖中人。','你有慧根，老头儿教你几招。'] },
  { id:'n_blacksmith', name:'铁匠王',  title:'王铁匠',  sect:'无',    align:'neutral',
    desc:'小镇铁匠，打造兵器一流',
    location:'小镇', power:10, favor:0,
    canTeach:null, canRecruit:false,
    dialog:['要打什么兵器，尽管说。','好铁出好刀，价钱不便宜。','这把剑，是我的得意之作。'] },
  { id:'n_innkeeper',  name:'掌柜老陈', title:'陈掌柜', sect:'无',    align:'neutral',
    desc:'小镇客栈掌柜，消息灵通',
    location:'小镇', power:5, favor:0,
    canTeach:null, canRecruit:false,
    dialog:['客官，打尖还是住店？','江湖上的事，老夫知道不少。','最近江湖上不太平啊。'] },
  { id:'n_beauty',    name:'林若雪',  title:'林姑娘',   sect:'无',    align:'good',
    desc:'小镇大夫之女，温柔善良，略懂医术',
    location:'小镇', power:8, favor:0,
    canTeach:null, canRecruit:true, canMarry:true,
    dialog:['公子有礼了。','父亲说，行医救人是最大的善事。','江湖险恶，公子多加小心。'] },
  { id:'n_merchant',  name:'赵员外',  title:'赵员外',   sect:'无',    align:'neutral',
    desc:'小镇富商，财大气粗，有些任务需要他',
    location:'小镇', power:15, favor:0,
    canTeach:null, canRecruit:false,
    dialog:['有钱能使鬼推磨。','这笔买卖，对你我都有好处。','你若帮我办成此事，重金酬谢。'] },
  { id:'n_wanderer',  name:'流浪剑客', title:'剑客',    sect:'无',    align:'neutral',
    desc:'行走江湖的剑客，武功不俗，可以切磋',
    location:'江湖', power:35, favor:0,
    canTeach:'m_basic_sword', canRecruit:true,
    dialog:['江湖路远，以剑为伴。','你若想学剑，先过我这一关。','切磋切磋，不打不相识。'] },
  { id:'n_monk',      name:'慧明和尚', title:'慧明',    sect:'少林',  align:'good',
    desc:'少林寺游方僧人，武功扎实',
    location:'江湖', power:45, favor:0,
    canTeach:'m_shaolin', canRecruit:false,
    dialog:['阿弥陀佛，施主有礼。','少林武功，以戒律为先。','施主若有向佛之心，可来少林一叙。'] },
  { id:'n_evil_man',  name:'黑风双煞', title:'双煞',    sect:'魔教',  align:'evil',
    desc:'魔教杀手，心狠手辣，专门劫道',
    location:'江湖', power:50, favor:0,
    canTeach:null, canRecruit:true,
    dialog:['把钱留下，留你全尸。','魔教行事，不留活口。','你若投靠魔教，荣华富贵少不了你的。'] },
],

// ─────────────────────────────────────────────
//  门派 / 帮派 / 朝廷
// ─────────────────────────────────────────────
SECTS: [
  {
    id:'s_shaolin',   name:'少林寺',   align:'good',   type:'sect',
    desc:'武林泰山北斗，天下武功出少林',
    location:'嵩山', require:{ morality:20, reputation:30 },
    ranks:['俗家弟子','记名弟子','入室弟子','执事僧','长老','方丈'],
    rankReq:[0,200,500,1000,2000,5000],
    teachable:['m_yijin','m_shaolin','m_basic'],
    benefits:['声望+5/月','可学少林武功','少林庇护'],
  },
  {
    id:'s_wudang',    name:'武当派',   align:'good',   type:'sect',
    desc:'武当七侠，正道领袖',
    location:'武当山', require:{ morality:15, reputation:20 },
    ranks:['外门弟子','内门弟子','亲传弟子','执事','长老','掌门'],
    rankReq:[0,150,400,800,1800,4000],
    teachable:['m_chunyang','m_wudang','m_tianzhan'],
    benefits:['声望+4/月','可学武当武功'],
  },
  {
    id:'s_huashan',   name:'华山派',   align:'good',   type:'sect',
    desc:'华山论剑发源地，剑气书香两派',
    location:'华山', require:{ swordSkill:20, reputation:15 },
    ranks:['外门弟子','内门弟子','亲传弟子','执事','长老','掌门'],
    rankReq:[0,100,300,700,1500,3500],
    teachable:['m_zixia','m_huashan'],
    benefits:['声望+3/月','可学华山武功'],
  },
  {
    id:'s_gaibang',   name:'丐帮',     align:'good',   type:'gang',
    desc:'天下第一大帮，消息最为灵通',
    location:'各地', require:{ reputation:25 },
    ranks:['新入帮','一袋弟子','三袋弟子','五袋弟子','七袋弟子','九袋长老','副帮主','帮主'],
    rankReq:[0,50,150,350,700,1500,3000,6000],
    teachable:['m_jianglong'],
    benefits:['消息+','声望+3/月','可学降龙十八掌'],
  },
  {
    id:'s_mingjiao',  name:'明教',     align:'evil',   type:'gang',
    desc:'魔教之首，行事神秘，追求力量',
    location:'光明顶', require:{ evil:20 },
    ranks:['普通教众','锐金旗','洪水旗','烈火旗','厚土旗','巨木旗','五行旗使','护教法王','左右使者','教主'],
    rankReq:[0,80,200,450,900,1800,3500,6000,10000,20000],
    teachable:['m_huagong','m_basic'],
    benefits:['武功资源+','邪道加成'],
  },
  {
    id:'s_xingxiu',   name:'星宿派',   align:'evil',   type:'sect',
    desc:'星宿老怪丁春秋所创，阴毒无比',
    location:'星宿海', require:{ evil:30 },
    ranks:['星宿弟子','星宿使者','星宿长老','星宿大长老','教主'],
    rankReq:[0,100,300,800,2000],
    teachable:['m_xingxiu'],
    benefits:['邪道加成','毒术+'],
  },
  {
    id:'s_court',     name:'朝廷司武监', align:'neutral', type:'court',
    desc:'朝廷武官机构，以秩序为先',
    location:'临安', require:{ reputation:40, morality:10 },
    ranks:['武监学员','武监校尉','武监百户','武监千户','武监指挥','武监都督','司武监正使'],
    rankReq:[0,200,500,1000,2000,4000,8000],
    teachable:[],
    benefits:['俸禄+','官方庇护','朝廷资源'],
  },
],

// ─────────────────────────────────────────────
//  地点
// ─────────────────────────────────────────────
LOCATIONS: [
  { id:'l_town',      name:'清风镇',   type:'town',    danger:0,
    desc:'一个宁静的小镇，是许多江湖人的起点',
    actions:['rest','work','train','talk','shop','quest'] },
  { id:'l_xiangyang', name:'襄阳城',   type:'city',    danger:2,
    desc:'郭靖镇守的英雄之城，战火纷飞',
    actions:['quest','fight','train','talk','shop','join_gaibang','join_court'] },
  { id:'l_shaolin',   name:'少林寺',   type:'sect',    danger:1,
    desc:'武林圣地，天下武功出少林',
    actions:['train','talk','join_shaolin','quest'] },
  { id:'l_wudang',    name:'武当山',   type:'sect',    danger:1,
    desc:'武当七侠，正道领袖',
    actions:['train','talk','join_wudang','quest'] },
  { id:'l_huashan',   name:'华山',     type:'sect',    danger:2,
    desc:'华山论剑之地，剑气纵横',
    actions:['train','talk','join_huashan','quest','explore'] },
  { id:'l_guigu',     name:'古墓',     type:'secret',  danger:3,
    desc:'古墓派所在，机关重重',
    actions:['explore','fight','talk'] },
  { id:'l_taohua',    name:'桃花岛',   type:'island',  danger:2,
    desc:'黄药师的桃花岛，机关阵法无数',
    actions:['explore','talk','quest'] },
  { id:'l_jianghu',   name:'江湖',     type:'wild',    danger:3,
    desc:'广阔江湖，奇遇与危险并存',
    actions:['explore','fight','quest','wander'] },
  { id:'l_mongol',    name:'蒙古大营', type:'enemy',   danger:5,
    desc:'蒙古军营，危机四伏',
    actions:['fight','spy','quest'] },
  { id:'l_dali',      name:'大理',     type:'city',    danger:1,
    desc:'大理国，段氏皇族所在',
    actions:['talk','quest','train','shop'] },
  { id:'l_tianshan',  name:'天山',     type:'wild',    danger:4,
    desc:'天山童姥所在，险峻无比',
    actions:['explore','fight','talk'] },
  { id:'l_guangming', name:'光明顶',   type:'sect',    danger:4,
    desc:'明教总坛，邪道圣地',
    actions:['train','talk','join_mingjiao','quest','fight'] },
],

// ─────────────────────────────────────────────
//  任务库
//  chain: 完成后解锁的下一个任务id
//  timeLimit: 时限（月），超时自动失败
//  repeatable: 可重复接取
// ─────────────────────────────────────────────
QUESTS: [
  // ══ 普通任务 ══
  { id:'q_escort',    name:'护送商队',  type:'normal',  difficulty:1,
    desc:'护送赵员外的商队安全抵达下一个城镇，路上可能遭遇山贼。',
    reward:{ gold:30, reputation:10, exp:20 },
    cost:{ time:1, energy:20 }, require:{},
    chain:'q_escort2' },

  { id:'q_escort2',   name:'护送要员',  type:'normal',  difficulty:2,
    desc:'赵员外感激你上次的帮助，这次委托你护送一位重要客商进京，报酬丰厚。',
    reward:{ gold:80, reputation:25, exp:40, favor:{ npc:'n_merchant', val:20 } },
    cost:{ time:2, energy:25 }, require:{ reputation:10 },
    chain:'q_escort3' },

  { id:'q_escort3',   name:'押送军饷',  type:'combat',  difficulty:3,
    desc:'朝廷委托押送一批军饷前往襄阳，沿途有蒙古细作觊觎，务必安全送达。',
    reward:{ gold:150, reputation:50, morality:10, exp:80 },
    cost:{ time:3, energy:40 }, require:{ reputation:30, strength:25 } },

  { id:'q_medicine',  name:'采集草药',  type:'normal',  difficulty:1,
    desc:'林大夫需要一些珍贵草药，请你去山中采集。',
    reward:{ gold:20, reputation:5, favor:{ npc:'n_beauty', val:15 }, exp:15, item:'i_herb' },
    cost:{ time:1, energy:15 }, require:{},
    chain:'q_medicine2' },

  { id:'q_medicine2', name:'寻找百年人参', type:'explore', difficulty:2,
    desc:'林姑娘说有位重病老人急需百年人参，深山中或许能找到，但山中危险重重。',
    reward:{ gold:40, reputation:15, favor:{ npc:'n_beauty', val:30 }, exp:30, item:'i_ginseng' },
    cost:{ time:2, energy:30 }, require:{},
    chain:'q_medicine3' },

  { id:'q_medicine3', name:'救治郭大侠',  type:'normal',  difficulty:2,
    desc:'郭大侠在守城中受了内伤，林姑娘请你协助寻找解药材料，此乃大义之举。',
    reward:{ gold:0, reputation:60, morality:20, favor:{ npc:'n_guojing', val:40 }, exp:60 },
    cost:{ time:2, energy:20 }, require:{} },

  { id:'q_bandit',    name:'剿灭山贼',  type:'combat',  difficulty:2,
    desc:'附近山上有一伙山贼，官府悬赏剿灭，活捉首领赏银加倍。',
    reward:{ gold:50, reputation:20, exp:40 },
    cost:{ time:2, energy:30 }, require:{ strength:20 },
    chain:'q_bandit2' },

  { id:'q_bandit2',   name:'山贼头目',  type:'combat',  difficulty:3,
    desc:'上次剿匪后，山贼头目亲自出马，纠集更多人马，扬言要报仇，必须将其彻底击溃。',
    reward:{ gold:100, reputation:40, exp:70 },
    cost:{ time:2, energy:40 }, require:{ strength:30 } },

  { id:'q_letter',    name:'传递书信',  type:'normal',  difficulty:1,
    desc:'帮郭大侠传递一封重要书信到武当山，务必亲手交给张真人。',
    reward:{ gold:10, reputation:15, favor:{ npc:'n_guojing', val:20 }, exp:10 },
    cost:{ time:3, energy:20 }, require:{},
    chain:'q_letter2' },

  { id:'q_letter2',   name:'秘密情报',  type:'stealth', difficulty:3,
    desc:'郭大侠有一份关于蒙古军部署的秘密情报，需要秘密送往临安朝廷，不能被蒙古细作发现。',
    reward:{ gold:60, reputation:40, morality:15, exp:60 },
    cost:{ time:4, energy:35 }, require:{ agility:25, perception:20 } },

  { id:'q_spy',       name:'刺探军情',  type:'stealth', difficulty:3,
    desc:'潜入蒙古大营，刺探军事部署，带回情报可获重赏。',
    reward:{ gold:80, reputation:30, exp:60 },
    cost:{ time:2, energy:40 }, require:{ agility:30 } },

  { id:'q_rescue',    name:'营救人质',  type:'combat',  difficulty:3,
    desc:'魔教绑架了无辜百姓，前去营救，时间紧迫！',
    reward:{ gold:60, reputation:40, morality:10, exp:50 },
    cost:{ time:2, energy:35 }, require:{ strength:30, swordSkill:20 },
    timeLimit: 6 },

  { id:'q_treasure',  name:'寻找宝藏',  type:'explore', difficulty:4,
    desc:'传说古墓中藏有前人留下的武学秘籍，但机关重重，需要极高的身法和悟性。',
    reward:{ gold:100, exp:80, randomWeapon:true },
    cost:{ time:3, energy:50 }, require:{ agility:40, perception:30 } },

  { id:'q_defend',    name:'协助守城',  type:'combat',  difficulty:4,
    desc:'蒙古大军来袭，协助郭大侠守卫襄阳，此乃侠义之举！',
    reward:{ gold:0, reputation:60, morality:20, exp:100 },
    cost:{ time:5, energy:60 }, require:{ strength:40, innerPower:30 },
    repeatable: true },

  { id:'q_assassin',  name:'暗杀任务',  type:'evil',    difficulty:3,
    desc:'魔教委托你暗杀一名官员，事成之后重金酬谢。',
    reward:{ gold:150, evil:20, exp:50 },
    cost:{ time:1, energy:30 }, require:{ evil:10 } },

  // ══ 时限任务（紧急）══
  { id:'q_urgent_herb', name:'【紧急】寻药救人', type:'normal', difficulty:2,
    desc:'【限时6个月】城中爆发瘟疫，急需大量草药，每耽误一天都有人命危在旦夕！',
    reward:{ gold:120, reputation:50, morality:25, exp:60 },
    cost:{ time:2, energy:30 }, require:{},
    timeLimit: 6 },

  { id:'q_urgent_defend', name:'【紧急】边境告急', type:'combat', difficulty:4,
    desc:'【限时4个月】蒙古军突袭边境小城，守军告急，需要立刻驰援！',
    reward:{ gold:0, reputation:80, morality:30, exp:120 },
    cost:{ time:3, energy:50 }, require:{ strength:35, innerPower:25 },
    timeLimit: 4 },
],

// ─────────────────────────────────────────────
//  I: 悬赏令模板（随机生成）
// ─────────────────────────────────────────────
BOUNTY_TEMPLATES: [
  { id:'bt_bandit',   name:'剿匪悬赏',   type:'combat',  difficulty:2,
    descTpl:'官府悬赏：击败盘踞{loc}的{enemy}，赏银{gold}两。',
    reward:{ gold:40, reputation:15 }, cost:{ time:1, energy:25 },
    require:{ strength:15 } },
  { id:'bt_escort',   name:'护镖悬赏',   type:'normal',  difficulty:1,
    descTpl:'镖局急招：护送货物从{loc}出发，安全送达赏银{gold}两。',
    reward:{ gold:25, reputation:8 }, cost:{ time:1, energy:15 },
    require:{} },
  { id:'bt_hunt',     name:'猎杀恶人',   type:'combat',  difficulty:3,
    descTpl:'江湖通缉：{enemy}作恶多端，击败者赏银{gold}两，声望大增。',
    reward:{ gold:80, reputation:30, morality:10 }, cost:{ time:2, energy:35 },
    require:{ strength:25 } },
  { id:'bt_explore',  name:'探路悬赏',   type:'explore', difficulty:2,
    descTpl:'商队急需：探明{loc}附近的安全路线，报酬{gold}两。',
    reward:{ gold:35, reputation:10 }, cost:{ time:2, energy:30 },
    require:{ agility:20 } },
],

// ─────────────────────────────────────────────
//  随机事件库
// ─────────────────────────────────────────────
EVENTS: [
  {
    id:'e_old_man',   name:'路遇高人',
    desc:'你在路上遇到一位白发老人，他似乎在等你。',
    choices:[
      { text:'上前行礼，恭敬问候',
        result:'老人微微一笑，传授你一套基础内功心法。',
        effect:{ innerPower:10, morality:5 } },
      { text:'视而不见，继续赶路',
        result:'你擦肩而过，错失良机。',
        effect:{} },
      { text:'试探老人武功深浅',
        result:'老人轻描淡写地化解你的试探，哈哈一笑而去。',
        effect:{ perception:5 } },
    ]
  },
  {
    id:'e_robbery',   name:'路遇劫匪',
    desc:'三名蒙面劫匪拦住去路，要你留下买路钱。',
    choices:[
      { text:'拔剑迎战',
        result:'你与劫匪大战一场，将其击退，缴获一些财物。',
        effect:{ gold:30, reputation:10, hp:-15, exp:20 } },
      { text:'乖乖交钱',
        result:'你忍气吞声，交出了一些银两。',
        effect:{ gold:-20, reputation:-5 } },
      { text:'假装服软，伺机逃跑',
        result:'你趁其不备，施展轻功逃脱。',
        effect:{ agility:5, exp:10 } },
      { text:'晓之以理，劝其从良',
        result:'劫匪中有人被你说动，放你离去，甚至有人愿意跟随你。',
        effect:{ morality:10, reputation:5, charm:5 },
        special:'recruit_bandit' },
    ]
  },
  {
    id:'e_secret_book', name:'发现秘籍',
    desc:'你在一处废弃的山洞中发现了一本残破的武功秘籍。',
    choices:[
      { text:'仔细研读，尝试修炼',
        result:'你花费数日研读，领悟了其中部分精髓。',
        effect:{ innerPower:15, perception:10, exp:30 } },
      { text:'带回去请高人指点',
        result:'你将秘籍带给了一位前辈，他为你详细讲解，收获颇丰。',
        effect:{ innerPower:10, perception:15, exp:25, reputation:5 } },
      { text:'据为己有，秘不示人',
        result:'你将秘籍藏好，日后慢慢研究。',
        effect:{ innerPower:8, evil:5 } },
      { text:'上交给门派',
        result:'门派对你大加赞赏，声望大增。',
        effect:{ reputation:20, morality:10 },
        require:'hasSect' },
    ]
  },
  {
    id:'e_beauty',    name:'邂逅佳人',
    desc:'你在客栈中遇到一位气质不凡的女子，她似乎遇到了麻烦。',
    choices:[
      { text:'挺身而出，仗义相助',
        result:'你帮助了她，她对你心生好感，留下了联系方式。',
        effect:{ morality:10, charm:8, reputation:10 },
        special:'meet_npc_beauty' },
      { text:'袖手旁观',
        result:'你冷眼旁观，女子用自己的方式解决了麻烦，对你投来鄙视的目光。',
        effect:{ reputation:-5 } },
      { text:'趁火打劫，要求报酬',
        result:'你帮助了她，但要求了报酬，她勉强答应，心中不满。',
        effect:{ gold:20, evil:5, charm:-5 } },
    ]
  },
  {
    id:'e_duel',      name:'江湖挑战',
    desc:'一名自称"快剑李三"的剑客拦住你，要与你比武。',
    choices:[
      { text:'接受挑战，正面迎战',
        result:'你与李三大战三十回合，胜负各半，互相佩服。',
        effect:{ swordSkill:8, reputation:10, exp:25, hp:-10 } },
      { text:'婉言谢绝，以礼相待',
        result:'李三见你谦逊有礼，反而对你刮目相看。',
        effect:{ morality:5, charm:5 } },
      { text:'出其不意，先发制人',
        result:'你突然出手，打了李三一个措手不及，但此举有失侠义。',
        effect:{ strength:5, evil:8, reputation:-5, exp:15 } },
    ]
  },
  {
    id:'e_orphan',    name:'孤儿求助',
    desc:'路边有一个衣衫褴褛的孤儿，向你乞讨食物。',
    choices:[
      { text:'慷慨解囊，给予帮助',
        result:'孤儿感激涕零，你心中也感到温暖。',
        effect:{ gold:-10, morality:15, reputation:8 } },
      { text:'给一点点，打发了事',
        result:'你给了一点零钱，孤儿道谢离去。',
        effect:{ gold:-3, morality:3 } },
      { text:'视而不见',
        result:'你冷漠地走过，孤儿的眼神让你心中不安。',
        effect:{ morality:-5 } },
      { text:'收留孤儿，带在身边',
        result:'你决定收留这个孤儿，他日后或许能成为你的得力助手。',
        effect:{ gold:-5, morality:20, reputation:10 },
        special:'recruit_orphan' },
    ]
  },
  {
    id:'e_poison',    name:'中毒危机',
    desc:'你不慎中了毒，毒性正在蔓延，需要立刻处理。',
    choices:[
      { text:'强行运功逼毒',
        result:'你强行运功，将毒素逼出大半，但内力大损。',
        effect:{ hp:-20, innerPower:-15 } },
      { text:'寻找解药',
        result:'你找到了一位郎中，花费银两解了毒。',
        effect:{ gold:-30, hp:-5 } },
      { text:'以毒攻毒，服下另一种毒药',
        result:'险中求胜，毒素相互抵消，你安然无恙，还意外提升了抗毒能力。',
        effect:{ endurance:15, luck:5, hp:-5 } },
    ]
  },
  {
    id:'e_spy',       name:'发现奸细',
    desc:'你无意中发现一名蒙古奸细正在刺探情报。',
    choices:[
      { text:'立刻擒拿，扭送官府',
        result:'你将奸细擒获，官府重重嘉奖。',
        effect:{ gold:40, reputation:20, morality:10 } },
      { text:'暗中跟踪，摸清底细',
        result:'你跟踪奸细，发现了一个蒙古情报网络，获得重要情报。',
        effect:{ perception:10, reputation:15, exp:20 } },
      { text:'假装不知，放其离去',
        result:'你选择明哲保身，奸细顺利离去。',
        effect:{ morality:-10 } },
      { text:'与奸细接触，为己所用',
        result:'你与奸细达成协议，获得了一些秘密情报，但此举有损名节。',
        effect:{ gold:60, evil:15, reputation:-10 },
        require:'evil' },
    ]
  },
  {
    id:'e_tournament', name:'武林大会',
    desc:'江湖上举办了一场武林大会，高手云集，你是否参加？',
    choices:[
      { text:'参加比武，一展身手',
        result:'你在比武中表现出色，名声大噪。',
        effect:{ reputation:30, exp:40, hp:-20 } },
      { text:'以观众身份旁观学习',
        result:'你在旁观中领悟了不少武学精髓。',
        effect:{ perception:15, exp:20 } },
      { text:'趁乱结交各路英雄',
        result:'你广结善缘，认识了不少江湖朋友。',
        effect:{ charm:10, reputation:15 } },
    ]
  },
  {
    id:'e_ancient_tomb', name:'古墓奇遇',
    desc:'你在山中迷路，误入一处古墓，墓中机关重重，却也藏有宝物。',
    choices:[
      { text:'小心探索，寻找出路',
        result:'你触发了一处机关，但也发现了一本武功秘籍。',
        effect:{ innerPower:20, hp:-10, exp:30 } },
      { text:'原路返回，不贪宝物',
        result:'你安全退出，虽无所获，但保住了性命。',
        effect:{ morality:5 } },
      { text:'大胆深入，寻找传说中的宝藏',
        result:'你深入古墓，历经险阻，终于找到了一件神兵利器！',
        effect:{ hp:-30, exp:50 },
        special:'find_weapon' },
    ]
  },
  {
    id:'e_master',    name:'高人指点',
    desc:'一位白眉老者观察你练功许久，开口道："你的武功路子不对，可愿听老夫指点？"',
    choices:[
      { text:'虚心请教，洗耳恭听',
        result:'老者为你纠正了武功中的错误，你的修炼速度大增。',
        effect:{ innerPower:15, perception:10, exp:25 } },
      { text:'婉言谢绝，自有主张',
        result:'老者摇头叹气，飘然而去。',
        effect:{} },
      { text:'请老者收你为徒',
        result:'老者沉吟片刻，说："你有此心，老夫便考考你。"',
        effect:{ perception:5 },
        special:'try_apprentice' },
    ]
  },
],

// ─────────────────────────────────────────────
//  境界系统
// ─────────────────────────────────────────────
REALMS: [
  { id:'r_mortal',    name:'后天境',   minPower:0,    desc:'普通人，尚未入门' },
  { id:'r_xiantian',  name:'先天境',   minPower:100,  desc:'内力已入先天，武功初成' },
  { id:'r_zongshi',   name:'宗师境',   minPower:250,  desc:'武功已臻宗师，江湖一流高手' },
  { id:'r_jueding',   name:'绝顶境',   minPower:500,  desc:'武功绝顶，天下罕有敌手' },
  { id:'r_legend',    name:'传说境',   minPower:800,  desc:'武林传说，名垂千古' },
],

// ─────────────────────────────────────────────
//  K: 物品/药材库
//  type: herb=草药, pill=丹药, food=食物, material=材料, weapon=武器
//  effect: 使用时的效果
//  buyPrice: 商店购买价，0=不可购买
//  sellPrice: 出售价格
// ─────────────────────────────────────────────
ITEMS: [
  // ── 草药 ──
  { id:'i_herb',      name:'普通草药',  type:'herb',
    desc:'山中常见草药，可恢复少量体力，也是许多丹药的基础材料。',
    effect:{ energy:15 }, buyPrice:5, sellPrice:2,
    icon:'🌿' },
  { id:'i_ginseng',   name:'百年人参',  type:'herb',
    desc:'深山中生长百年的人参，药力极为强劲，可大幅恢复体力和内力。',
    effect:{ energy:40, innerPower:5 }, buyPrice:80, sellPrice:40,
    icon:'🌱' },
  { id:'i_lingzhi',   name:'千年灵芝',  type:'herb',
    desc:'传说中的仙草，极为罕见，服用后内力大增，甚至可以突破瓶颈。',
    effect:{ energy:30, innerPower:15, hp:20 }, buyPrice:200, sellPrice:100,
    icon:'🍄' },
  { id:'i_xuelian',   name:'雪莲花',    type:'herb',
    desc:'生长于雪山之巅的奇花，清热解毒，可解大多数毒素。',
    effect:{ energy:20, curePoison:true }, buyPrice:60, sellPrice:30,
    icon:'🌸' },
  { id:'i_wudu',      name:'五毒草',    type:'herb',
    desc:'含有剧毒的草药，可用于炼制毒药，也可少量入药治疗顽疾。',
    effect:{ energy:5 }, buyPrice:15, sellPrice:8,
    icon:'🌾' },

  // ── 丹药 ──
  { id:'i_huisheng',  name:'回生丹',    type:'pill',
    desc:'名医所制，服用后可迅速恢复大量体力，战斗中的救命良药。',
    effect:{ energy:60, hp:30 }, buyPrice:120, sellPrice:60,
    icon:'💊' },
  { id:'i_peiyuan',   name:'培元丹',    type:'pill',
    desc:'专门培补元气的丹药，长期服用可增强内力根基。',
    effect:{ energy:30, innerPower:10 }, buyPrice:80, sellPrice:40,
    icon:'🔴' },
  { id:'i_jiedu',     name:'解毒丹',    type:'pill',
    desc:'可解百毒的神丹，江湖行走必备之物。',
    effect:{ curePoison:true, energy:10 }, buyPrice:50, sellPrice:25,
    icon:'🟢' },
  { id:'i_dali',      name:'大力丸',    type:'pill',
    desc:'服用后短时间内力量大增，但过后会有虚弱感。',
    effect:{ strength:15, energy:-10, duration:1 }, buyPrice:40, sellPrice:20,
    icon:'🟡' },
  { id:'i_jiuhua',    name:'九花玉露丸', type:'pill',
    desc:'极品丹药，传说是全真教秘方所制，服用后内力修为大进。',
    effect:{ energy:50, innerPower:20, hp:20 }, buyPrice:300, sellPrice:150,
    icon:'⚪' },

  // ── 食物 ──
  { id:'i_food',      name:'干粮',      type:'food',
    desc:'普通干粮，可以充饥恢复少量体力。',
    effect:{ energy:10 }, buyPrice:2, sellPrice:1,
    icon:'🍞' },
  { id:'i_wine',      name:'好酒',      type:'food',
    desc:'一壶好酒，喝下去心情大好，但可能影响身法。',
    effect:{ energy:15, agility:-5, duration:1 }, buyPrice:10, sellPrice:5,
    icon:'🍶' },
  { id:'i_meat',      name:'烤全羊',    type:'food',
    desc:'大块吃肉，大碗喝酒，江湖豪迈！恢复体力效果极佳。',
    effect:{ energy:25, strength:5, duration:1 }, buyPrice:20, sellPrice:10,
    icon:'🍖' },

  // ── 材料 ──
  { id:'i_ironore',   name:'精铁矿石',  type:'material',
    desc:'打造兵器的上等材料，铁匠铺收购价格不错。',
    effect:{}, buyPrice:0, sellPrice:15,
    icon:'⚙️' },
  { id:'i_jade',      name:'碧玉',      type:'material',
    desc:'上等碧玉，可用于制作护身符，也可出售给珠宝商。',
    effect:{}, buyPrice:0, sellPrice:50,
    icon:'💎' },
],

// ─────────────────────────────────────────────
//  K: 商店库存（不同地点有不同商品）
// ─────────────────────────────────────────────
SHOPS: {
  '小镇': ['i_herb', 'i_food', 'i_wine', 'i_jiedu'],
  '江湖': ['i_herb', 'i_food', 'i_huisheng', 'i_jiedu', 'i_dali'],
  '襄阳': ['i_herb', 'i_ginseng', 'i_huisheng', 'i_peiyuan', 'i_jiedu', 'i_food', 'i_meat', 'i_wine'],
  '古墓': [],
  '蒙古大营': [],
},

// ─────────────────────────────────────────────
//  L: 称号系统
//  condition: 触发条件（满足任意一项即可获得）
//  effect: 称号带来的被动效果（影响NPC好感和事件概率）
//  tier: 1=普通, 2=稀有, 3=传奇
// ─────────────────────────────────────────────
TITLES: [
  // ── 声望类 ──
  { id:'tl_wanderer',   name:'江湖游侠',  tier:1,
    desc:'初入江湖，小有名气的游侠。',
    condition:{ reputation:20 },
    effect:{ npcFavorMod:5, questRewardMod:0 } },
  { id:'tl_hero',       name:'一方豪杰',  tier:1,
    desc:'在一方地界颇有名望，百姓口耳相传。',
    condition:{ reputation:60 },
    effect:{ npcFavorMod:10, questRewardMod:5 } },
  { id:'tl_famous',     name:'名震江湖',  tier:2,
    desc:'名声响彻江湖，无论走到哪里都有人认识你。',
    condition:{ reputation:120 },
    effect:{ npcFavorMod:20, questRewardMod:10, eventMod:{ positive:10 } } },
  { id:'tl_legend',     name:'武林传奇',  tier:3,
    desc:'你的名字已成为传奇，江湖中无人不知无人不晓。',
    condition:{ reputation:250 },
    effect:{ npcFavorMod:35, questRewardMod:20, eventMod:{ positive:20 } } },

  // ── 武功类 ──
  { id:'tl_swordsman',  name:'剑客',      tier:1,
    desc:'以剑闻名，剑法颇有造诣。',
    condition:{ swordSkill:40 },
    effect:{ combatBonus:5 } },
  { id:'tl_swordmaster',name:'剑道高手',  tier:2,
    desc:'剑法已臻化境，出剑如行云流水。',
    condition:{ swordSkill:100 },
    effect:{ combatBonus:15, npcFavorMod:10 } },
  { id:'tl_innermaster',name:'内功宗师',  tier:2,
    desc:'内力深厚，已达宗师境界，修炼速度远超常人。',
    condition:{ innerPower:150 },
    effect:{ trainingBonus:20, combatBonus:10 } },

  // ── 道德类 ──
  { id:'tl_righteous',  name:'正道侠士',  tier:1,
    desc:'行事光明磊落，是正道中人的楷模。',
    condition:{ morality:40 },
    effect:{ npcFavorMod:15, eventMod:{ positive:5 } } },
  { id:'tl_greatxia',   name:'侠之大者',  tier:3,
    desc:'为国为民，侠之大者。郭大侠亲口称赞的称号。',
    condition:{ morality:80, reputation:150 },
    effect:{ npcFavorMod:40, questRewardMod:15, eventMod:{ positive:25 } } },
  { id:'tl_evil',       name:'魔头',      tier:1,
    desc:'作恶多端，江湖中人人喊打。',
    condition:{ evil:40 },
    effect:{ npcFavorMod:-20, eventMod:{ negative:10 } } },
  { id:'tl_demon',      name:'一代魔头',  tier:2,
    desc:'恶名昭著，令人闻风丧胆，正道中人见之必诛。',
    condition:{ evil:80 },
    effect:{ npcFavorMod:-35, combatBonus:10, eventMod:{ negative:20 } } },

  // ── 任务类 ──
  { id:'tl_guardian',   name:'守城英雄',  tier:2,
    desc:'参与守卫襄阳，被百姓称为守城英雄。',
    condition:{ questDone:'q_defend' },
    effect:{ npcFavorMod:20, morality:5 } },
  { id:'tl_doctor',     name:'悬壶济世',  tier:1,
    desc:'多次帮助医治病患，被称为悬壶济世的大夫。',
    condition:{ questDone:'q_medicine3' },
    effect:{ npcFavorMod:15, itemDiscountMod:10 } },
  { id:'tl_spy',        name:'影子刺客',  tier:2,
    desc:'多次完成潜入任务，行踪飘忽如影随形。',
    condition:{ questDone:'q_spy' },
    effect:{ combatBonus:8, stealthBonus:20 } },

  // ── 财富类 ──
  { id:'tl_rich',       name:'富甲一方',  tier:1,
    desc:'家财万贯，在江湖中颇有财力。',
    condition:{ gold:500 },
    effect:{ itemDiscountMod:5, npcFavorMod:5 } },
  { id:'tl_pauper',     name:'穷困潦倒',  tier:1,
    desc:'身无分文，连饭都吃不起，江湖路难行。',
    condition:{ goldBelow:10 },
    effect:{ npcFavorMod:-5, questRewardMod:-5 } },
],

// ─────────────────────────────────────────────
//  结局
// ─────────────────────────────────────────────
ENDINGS: [
  { id:'end_hero',    name:'侠之大者',
    condition:{ morality:80, reputation:200, innerPower:300 },
    desc:'你以侠义之心行走江湖，最终成为一代大侠，名垂青史，与郭靖并称"双侠"。' },
  { id:'end_demon',   name:'魔教教主',
    condition:{ evil:80, innerPower:300, sectRank:{ sect:'s_mingjiao', rank:9 } },
    desc:'你走上邪道，凭借强横武力成为魔教教主，令江湖闻风丧胆。' },
  { id:'end_hermit',  name:'隐世高人',
    condition:{ innerPower:500, reputation:150, morality:70, age:45 },
    desc:'你看破红尘，隐居山林，成为传说中的世外高人，偶尔出山指点后辈。' },
  { id:'end_general', name:'护国将军',
    condition:{ reputation:150, strength:200, sectRank:{ sect:'s_court', rank:5 } },
    desc:'你投身朝廷，凭借赫赫战功成为护国将军，为守卫家园立下汗马功劳。' },
  { id:'end_sword',   name:'剑道宗师',
    condition:{ swordSkill:300, innerPower:200, reputation:150 },
    desc:'你一生痴迷剑道，终于悟出剑道至理，成为天下第一剑客，独孤求败。' },
  { id:'end_love',    name:'归隐田园',
    condition:{ charm:120, morality:60, spouse:true },
    desc:'你找到了心爱之人，携手归隐田园，过上了平静幸福的生活。' },
],

// ─────────────────────────────────────────────
//  Q: 江湖传闻模板
//  type: rumor=普通传闻, treasure=宝物出世, crisis=危机, person=人物出没
//  reward: 前往后可能获得的奖励
//  require: 前往的属性要求
// ─────────────────────────────────────────────
RUMORS: [
  // ── 宝物出世 ──
  { id:'r_secret_manual', type:'treasure', urgency:2,
    title:'武学秘籍现世',
    desc:'江湖传言，{loc}附近的山洞中发现了一本前朝武学秘籍，已有数名高手前往争夺。',
    locs:['终南山','古墓','华山','峨眉山'],
    reward:{ type:'martial', desc:'习得一门随机武功' },
    require:{ agility:15 },
    cost:{ time:2, energy:25 } },

  { id:'r_divine_weapon', type:'treasure', urgency:2,
    title:'神兵重现江湖',
    desc:'据说{loc}的铁匠铺收到了一批上古精铁，正在打造绝世神兵，先到先得。',
    locs:['襄阳','小镇','江湖'],
    reward:{ type:'weapon', desc:'获得一件稀有神兵' },
    require:{},
    cost:{ time:1, energy:15 } },

  { id:'r_herb_valley', type:'treasure', urgency:1,
    title:'百草谷现世',
    desc:'有人在{loc}深处发现了一处百草谷，其中灵药遍地，但据说有猛兽守护。',
    locs:['终南山','峨眉山','古墓'],
    reward:{ type:'items', items:['i_ginseng','i_lingzhi'], desc:'采集珍贵草药' },
    require:{ agility:20 },
    cost:{ time:2, energy:30 } },

  // ── 人物出没 ──
  { id:'r_master_appears', type:'person', urgency:2,
    title:'高人现身',
    desc:'江湖传言，一位隐世高人近日现身{loc}，据说愿意指点有缘之人，机不可失。',
    locs:['终南山','华山','武当山','峨眉山'],
    reward:{ type:'train', bonus:{ innerPower:15, perception:10 }, desc:'获得高人指点，大幅提升内力和悟性' },
    require:{ innerPower:20 },
    cost:{ time:2, energy:20 } },

  { id:'r_evil_master', type:'person', urgency:3,
    title:'魔头出没',
    desc:'消息传来，一名凶残魔头在{loc}一带作恶，已有数名侠士前去讨伐，无一生还。',
    locs:['江湖','蒙古大营','古墓'],
    reward:{ type:'combat_win', gold:200, reputation:50, desc:'击败魔头，获得重赏' },
    require:{ strength:40, innerPower:50 },
    cost:{ time:2, energy:40 } },

  { id:'r_wandering_doctor', type:'person', urgency:1,
    title:'神医游历',
    desc:'神医{name}近日游历至{loc}附近，据说其医术通神，可治百病，还会传授医术。',
    names:['华佗再世','妙手回春','悬壶老人'],
    locs:['小镇','襄阳','江湖'],
    reward:{ type:'items', items:['i_huisheng','i_jiuhua'], desc:'获得珍贵丹药' },
    require:{},
    cost:{ time:1, energy:10 } },

  // ── 危机事件 ──
  { id:'r_village_crisis', type:'crisis', urgency:3,
    title:'村庄告急',
    desc:'急报！{loc}附近一处村庄遭山贼洗劫，村民四散奔逃，急需侠士出手相救！',
    locs:['小镇','江湖','襄阳'],
    reward:{ type:'morality', morality:20, reputation:30, gold:50, desc:'救助村民，获得声望与道德' },
    require:{},
    cost:{ time:1, energy:20 } },

  { id:'r_plague', type:'crisis', urgency:3,
    title:'瘟疫肆虐',
    desc:'{loc}一带爆发瘟疫，百姓苦不堪言，急需大量草药救治，有药材者可前往援助。',
    locs:['小镇','襄阳','江湖'],
    reward:{ type:'morality', morality:30, reputation:40, desc:'捐献草药，救助百姓' },
    require:{ inventoryItem:'i_herb' },
    cost:{ time:1, energy:15 } },

  { id:'r_sect_war', type:'crisis', urgency:3,
    title:'门派纷争',
    desc:'江湖传言，{sect1}与{sect2}之间的积怨已久，近日在{loc}爆发冲突，双方死伤惨重。',
    sects:[['全真教','古墓派'],['丐帮','魔教'],['武当派','明教']],
    locs:['江湖','终南山','华山'],
    reward:{ type:'choice', desc:'可选择调停或助战' },
    require:{},
    cost:{ time:2, energy:25 } },

  // ── 普通传闻 ──
  { id:'r_tournament', type:'rumor', urgency:2,
    title:'武林大会',
    desc:'消息传来，{loc}将举办一场武林大会，各路英雄豪杰云集，切磋武艺，一较高下。',
    locs:['襄阳','江湖','华山'],
    reward:{ type:'combat_win', reputation:40, exp:60, desc:'参加武林大会，扬名立万' },
    require:{ innerPower:30 },
    cost:{ time:2, energy:30 } },

  { id:'r_treasure_map', type:'rumor', urgency:1,
    title:'藏宝图现世',
    desc:'据说有人在{loc}的古玩铺发现了一张藏宝图，图上标注的宝藏据说价值连城。',
    locs:['小镇','襄阳','江湖'],
    reward:{ type:'gold', gold:150, desc:'寻得宝藏，获得大量银两' },
    require:{ perception:20 },
    cost:{ time:2, energy:20 } },

  { id:'r_old_friend', type:'rumor', urgency:1,
    title:'故人来访',
    desc:'有人捎来消息，你的一位旧识近日出现在{loc}，似乎有要事相告。',
    locs:['小镇','襄阳','江湖'],
    reward:{ type:'favor', npcBonus:20, desc:'与故人叙旧，增进感情' },
    require:{},
    cost:{ time:1, energy:10 } },
],

// ─────────────────────────────────────────────
//  O: 季节数据
// ─────────────────────────────────────────────
SEASONS: {
  spring: { name:'春', months:[3,4,5], icon:'🌸',
    desc:'春暖花开，万物复苏，正是修炼的好时节。',
    effects:{ energyRegen:+10, trainBonus:+15, herbBonus:+20, eventMod:'positive' } },
  summer: { name:'夏', months:[6,7,8], icon:'☀️',
    desc:'烈日炎炎，暑气逼人，体力消耗加大，但内功修炼事半功倍。',
    effects:{ energyRegen:-5, innerBonus:+20, trainBonus:+5, eventMod:'neutral' } },
  autumn: { name:'秋', months:[9,10,11], icon:'🍂',
    desc:'金风送爽，秋高气爽，剑法修炼最为适宜，江湖事端也多发于此时。',
    effects:{ energyRegen:+5, swordBonus:+20, combatBonus:+10, eventMod:'neutral' } },
  winter: { name:'冬', months:[12,1,2], icon:'❄️',
    desc:'天寒地冻，江湖萧索，体力恢复减慢，但寒冬苦练可磨砺意志。',
    effects:{ energyRegen:-15, trainBonus:+25, travelCostMod:+10, eventMod:'negative' } },
},

// ─────────────────────────────────────────────
//  N: 江湖势力（门派仇恨/好感系统）
//  factions: 各势力的初始态度
// ─────────────────────────────────────────────
FACTIONS: [
  { id:'f_zhengdao',  name:'正道联盟',  icon:'⚔️',
    desc:'全真教、丐帮、武当等正道门派组成的联盟，以除暴安良为己任。',
    sects:['s_quanzhen','s_gaibang','s_wudang'],
    initialAttitude: 50,
    // 触发追杀的仇恨阈值
    huntThreshold: -40 },
  { id:'f_mingjiao',  name:'明教',      icon:'🔥',
    desc:'行事神秘的明教，亦正亦邪，与正道时有摩擦。',
    sects:['s_mingjiao'],
    initialAttitude: 20,
    huntThreshold: -30 },
  { id:'f_mongol',    name:'蒙古势力',  icon:'🏹',
    desc:'虎视眈眈的蒙古大军，是中原武林共同的敌人。',
    sects:[],
    initialAttitude: -20,
    huntThreshold: -50 },
  { id:'f_jianghu',   name:'江湖散人',  icon:'🗡️',
    desc:'无门无派的江湖人士，态度随你的声望和行为而变化。',
    sects:[],
    initialAttitude: 30,
    huntThreshold: -60 },
],

// 势力态度变化规则
FACTION_RULES: [
  // 行为 → 对哪个势力的影响
  { trigger:'kill_good_npc',  faction:'f_zhengdao', delta:-20, desc:'击杀正道中人' },
  { trigger:'kill_evil_npc',  faction:'f_zhengdao', delta:+15, desc:'击杀邪道中人' },
  { trigger:'kill_evil_npc',  faction:'f_mingjiao', delta:+5,  desc:'击杀邪道中人' },
  { trigger:'help_village',   faction:'f_zhengdao', delta:+10, desc:'救助百姓' },
  { trigger:'help_village',   faction:'f_jianghu',  delta:+8,  desc:'救助百姓' },
  { trigger:'join_mingjiao',  faction:'f_zhengdao', delta:-15, desc:'加入明教' },
  { trigger:'join_mingjiao',  faction:'f_mingjiao', delta:+20, desc:'加入明教' },
  { trigger:'defend_xiangyang',faction:'f_zhengdao',delta:+25, desc:'守卫襄阳' },
  { trigger:'defend_xiangyang',faction:'f_mongol',  delta:-30, desc:'守卫襄阳' },
  { trigger:'high_evil',      faction:'f_zhengdao', delta:-10, desc:'邪气过高' },
  { trigger:'high_evil',      faction:'f_jianghu',  delta:-5,  desc:'邪气过高' },
  { trigger:'high_reputation',faction:'f_jianghu',  delta:+5,  desc:'声望提升' },
],

// ─────────────────────────────────────────────
//  M: 武功升级数据
//  每门武功可升至10层，每层提供额外加成
// ─────────────────────────────────────────────
MARTIAL_LEVEL_NAMES: ['入门','小成','初窥门径','渐入佳境','融会贯通',
                       '炉火纯青','登峰造极','出神入化','臻于化境','无上境界'],

// 升级所需修炼次数（累计）
MARTIAL_LEVEL_EXP: [0, 10, 25, 45, 70, 100, 140, 190, 250, 320],

// 每层额外加成（叠加在基础效果上）
MARTIAL_LEVEL_BONUS: {
  // 内功类：每层内力+3，5层后额外+5
  inner:  [0,3,3,3,3,8,3,3,3,3,10],
  // 剑法类：每层剑术+3，5层后额外+5
  sword:  [0,3,3,3,3,8,3,3,3,3,10],
  // 掌法类：每层力量+2，内力+1
  palm:   [0,2,2,2,2,5,2,2,2,2,8],
  // 轻功类：每层身法+3
  qinggong:[0,3,3,3,3,6,3,3,3,3,8],
  // 暗器类：每层速度+2，悟性+1
  hidden: [0,2,2,2,2,4,2,2,2,2,6],
  // 邪功类：每层内力+4，但道德-2
  evil:   [0,4,4,4,4,10,4,4,4,4,15],
},

// ─────────────────────────────────────────────
//  P: 武功对决招式库
//  每门武功有独特招式，战斗时可选择
// ─────────────────────────────────────────────
COMBAT_MOVES: {
  // 通用招式（无武功时可用）
  default: [
    { id:'m_punch',   name:'铁拳',    power:1.0, desc:'一记有力的拳头', type:'normal' },
    { id:'m_kick',    name:'扫腿',    power:0.9, desc:'横扫千军的腿法', type:'normal' },
    { id:'m_dodge',   name:'闪避',    power:0.3, desc:'灵活躲避对方攻击，减少受伤', type:'defend', dodgeBonus:0.4 },
  ],
  // 内功招式
  inner: [
    { id:'m_qi_blast',  name:'气劲外放', power:1.5, desc:'将内力凝聚于掌心，轰然爆发', type:'inner' },
    { id:'m_iron_shirt',name:'金钟罩',   power:0.5, desc:'以内力护体，大幅减少受伤', type:'defend', defBonus:0.5 },
  ],
  // 剑法招式
  sword: [
    { id:'m_sword_fast', name:'剑走偏锋', power:1.3, desc:'出剑如电，令对手防不胜防', type:'sword', speedBonus:0.2 },
    { id:'m_sword_heavy',name:'重剑无锋', power:1.8, desc:'以力破巧，一剑重如泰山', type:'sword', powerBonus:0.3 },
    { id:'m_sword_flow', name:'行云流水', power:1.2, desc:'剑法如流水，绵绵不绝', type:'sword', comboBonus:true },
  ],
  // 掌法招式
  palm: [
    { id:'m_palm_wave',  name:'降龙十八掌', power:2.0, desc:'天下第一掌法，威力无穷', type:'palm' },
    { id:'m_palm_push',  name:'推山掌',     power:1.4, desc:'以掌力推开对手', type:'palm' },
  ],
  // 轻功招式
  qinggong: [
    { id:'m_swift',      name:'凌波微步', power:0.8, desc:'身法飘逸，难以捉摸，大幅提升闪避', type:'qinggong', dodgeBonus:0.6 },
    { id:'m_aerial',     name:'凌空一击', power:1.6, desc:'借助轻功从高处俯冲攻击', type:'qinggong' },
  ],
  // 暗器招式
  hidden: [
    { id:'m_dart',       name:'飞镖连珠', power:1.2, desc:'连发数枚飞镖，令对手难以招架', type:'hidden' },
    { id:'m_poison_dart',name:'毒镖',     power:1.0, desc:'涂有毒药的飞镖，中者内力大损', type:'hidden', debuff:'poison' },
  ],
  // 邪功招式
  evil: [
    { id:'m_absorb',     name:'吸星大法', power:1.5, desc:'吸取对手内力为己用', type:'evil', drain:true },
    { id:'m_dark_palm',  name:'七伤拳',   power:2.2, desc:'威力极大但伤己七分', type:'evil', selfDmg:0.3 },
  ],
},

// 招式克制关系（attacker type → defender type → 倍率）
COMBAT_COUNTER: {
  inner:    { normal:1.3, sword:1.1, palm:0.9 },
  sword:    { qinggong:1.4, normal:1.2, inner:0.9 },
  palm:     { inner:1.2, normal:1.3, evil:0.8 },
  qinggong: { hidden:1.3, palm:1.1, sword:0.9 },
  hidden:   { inner:1.2, qinggong:0.8, normal:1.3 },
  evil:     { inner:1.4, palm:1.3, sword:0.8 },
  normal:   {},
  defend:   {},
},

// ═══════════════════════════════════════════════════════════
//  A: 结局扩展数据
// ═══════════════════════════════════════════════════════════
ENDINGS_EXTRA: [
  {
    id: 'ending_xiangyang',
    name: '守卫襄阳',
    tier: 'epic',
    icon: '🏯',
    desc: '你率领中原武林，在襄阳城下与蒙古大军血战三日三夜。城墙之上，你的身影如同一座不倒的丰碑。此战之后，你的名字传遍天下，成为中原武林永远铭记的英雄。',
    condition: { reputation: 200, factionAttitude_f_zhengdao: 60, factionAttitude_f_mongol: -60, questDone: 'q_defend_xiangyang' },
    epilogue: '数十年后，说书人仍在讲述那场守城之战，而你的名字，已成为侠义精神的象征。',
  },
  {
    id: 'ending_evil_lord',
    name: '魔道宗主',
    tier: 'epic',
    icon: '👹',
    desc: '你踏遍江湖，以无上邪功震慑四方。正道武林谈你色变，邪道中人俯首称臣。你建立了一个以恐惧为基石的黑暗王国，成为这个时代最令人畏惧的存在。',
    condition: { evil: 80, innerPower: 300, battlesWon: 30, factionAttitude_f_zhengdao: -70 },
    epilogue: '你的统治带来了一段黑暗岁月，但也有人说，正是你的存在，让正道武林重新团结起来……',
  },
  {
    id: 'ending_hermit',
    name: '归隐山林',
    tier: 'legendary',
    icon: '🌿',
    desc: '看透了江湖的恩怨情仇，你选择在一处世外桃源隐居。青山绿水，晨钟暮鼓，你将毕生所学著成一部武学秘典，留待有缘人。这或许才是真正的逍遥。',
    condition: { age: 50, morality: 80, martialArtsCount: 5 },
    epilogue: '多年后，有人在深山中发现了一部残缺的武学秘典，据说是一位无名高人所著，其中武学之深，令天下高手叹为观止。',
  },
  {
    id: 'ending_wulin_leader',
    name: '武林盟主',
    tier: 'legendary',
    icon: '👑',
    desc: '你在武林大会上力压群雄，被推举为新一任武林盟主。从此号令天下，莫敢不从。你以仁义治理武林，开创了一段太平盛世。',
    condition: { reputation: 300, morality: 70, tournamentWins: 3 },
    epilogue: '你的盟主任期内，江湖纷争大为减少，百姓安居乐业。史书上留下了你的名字——一代仁侠。',
  },
  {
    id: 'ending_disciple_legacy',
    name: '薪火相传',
    tier: 'rare',
    icon: '🕯️',
    desc: '你收下了数名弟子，将毕生武学倾囊相授。当你年迈之时，弟子们已各自成名，将你的武学与精神传遍天下。',
    condition: { discipleCount: 3, age: 55 },
    epilogue: '你的弟子中，有人成了一代宗师，有人守护了一方百姓，有人写下了武学典籍。你的传承，比你的武功更加长久。',
  },
],

// ═══════════════════════════════════════════════════════════
//  B: 武林大会数据
// ═══════════════════════════════════════════════════════════
TOURNAMENT: {
  // 大会每3年举办一次（36个月）
  intervalMonths: 36,
  // 首届在第2年举办
  firstYear: 2,
  name: '武林大会',
  locations: ['嵩山', '华山', '泰山', '少林寺'],
  rounds: [
    { name: '初赛', powerReq: 0,   reward: { gold: 50,  reputation: 20, exp: 30 } },
    { name: '半决赛', powerReq: 60, reward: { gold: 150, reputation: 60, exp: 80 } },
    { name: '决赛',  powerReq: 100, reward: { gold: 300, reputation: 150, exp: 200, title: 'title_wulin_hero' } },
  ],
  // 搅局奖励（偷袭/破坏）
  sabotageReward: { gold: 80, evil: 10, reputation: -20 },
  // 观战奖励（学习对手招式）
  watchReward: { perception: 5, exp: 20 },
},

// ═══════════════════════════════════════════════════════════
//  C: 奇遇系统数据
// ═══════════════════════════════════════════════════════════
HIDDEN_EVENTS: [
  {
    id: 'he_ancient_tomb',
    name: '古墓奇遇',
    icon: '🏚️',
    trigger: { location: 'l_zhongnan', minVisits: 3, chance: 0.3 },
    desc: '终南山深处，你发现了一处隐秘的古墓入口。墓中阴气森森，却隐约有武学气息……',
    choices: [
      {
        text: '深入探索',
        require: {},
        result: { type: 'martial_secret', martialTier: 4, desc: '你在古墓中发现了一部绝世武学秘籍！' },
      },
      {
        text: '谨慎离开',
        require: {},
        result: { type: 'nothing', desc: '你感到一阵不安，转身离去。' },
      },
    ],
  },
  {
    id: 'he_jiuhua_valley',
    name: '绝情谷底',
    icon: '🌸',
    trigger: { location: 'l_xiangyang', minVisits: 2, chance: 0.25, require: { charm: 60 } },
    desc: '谷底深处，百花盛开，一名白衣女子正在练剑。她见到你，眼中闪过一丝异色……',
    choices: [
      {
        text: '上前搭话',
        require: { charm: 60 },
        result: { type: 'npc_favor', npcId: 'npc_xiaolongnv', bonus: 30, desc: '她对你颇有好感，传授了你一套剑法。' },
      },
      {
        text: '默默离开',
        require: {},
        result: { type: 'nothing', desc: '你悄然离去，不打扰她的清修。' },
      },
    ],
  },
  {
    id: 'he_guangming_peak',
    name: '光明顶密道',
    icon: '🔥',
    trigger: { location: 'l_wudang', minVisits: 2, chance: 0.2, require: { factionAttitude_f_mingjiao: 30 } },
    desc: '明教中人悄悄告诉你，光明顶下有一条密道，藏有明教历代教主的武学心得……',
    choices: [
      {
        text: '进入密道',
        require: { factionAttitude_f_mingjiao: 30 },
        result: { type: 'inner_boost', amount: 50, desc: '你在密道中修炼三日，内力大进！' },
      },
      {
        text: '婉言谢绝',
        require: {},
        result: { type: 'faction_favor', faction: 'f_mingjiao', delta: 10, desc: '你的谨慎让明教中人更加信任你。' },
      },
    ],
  },
  {
    id: 'he_peach_blossom',
    name: '桃花岛秘境',
    icon: '🌺',
    trigger: { location: 'l_jiaxing', minVisits: 3, chance: 0.2 },
    desc: '嘉兴湖畔，一叶小舟飘来，船上老者须发皆白，正在弹琴。他见到你，微微一笑……',
    choices: [
      {
        text: '以武会友',
        require: { swordSkill: 80 },
        result: { type: 'train_bonus', bonus: { swordSkill: 30, perception: 15 }, desc: '老者传授了你桃花岛的剑法精髓！' },
      },
      {
        text: '聆听琴音',
        require: {},
        result: { type: 'train_bonus', bonus: { perception: 20, charm: 10 }, desc: '琴声中蕴含武学至理，你若有所悟。' },
      },
    ],
  },
  {
    id: 'he_shaolin_scripture',
    name: '少林藏经阁',
    icon: '📿',
    trigger: { location: 'l_luoyang', minVisits: 2, chance: 0.15, require: { morality: 70 } },
    desc: '少林寺方丈见你心性纯良，邀你入藏经阁观摩一日……',
    choices: [
      {
        text: '潜心研读',
        require: { morality: 70 },
        result: { type: 'train_bonus', bonus: { innerPower: 40, endurance: 20 }, desc: '你从佛经中悟出了内功心法的精髓！' },
      },
      {
        text: '顺手牵羊',
        require: {},
        result: { type: 'steal_martial', morality: -30, evil: 20, desc: '你偷走了一部秘籍，但内心深感不安。' },
      },
    ],
  },
  {
    id: 'he_dugu_sword',
    name: '独孤剑冢',
    icon: '⚔️',
    trigger: { location: 'l_zhongnan', minVisits: 5, chance: 0.1, require: { swordSkill: 120 } },
    desc: '终南山绝顶，你发现了三座剑冢。冢前石碑上刻着：剑魔独孤求败。一股无形剑意扑面而来……',
    choices: [
      {
        text: '感悟剑意（需剑术120）',
        require: { swordSkill: 120 },
        result: { type: 'train_bonus', bonus: { swordSkill: 60, innerPower: 30 }, desc: '你在剑冢前枯坐三日，剑法突破至化境！' },
      },
      {
        text: '取走利剑',
        require: {},
        result: { type: 'weapon_special', weaponId: 'w_dugu_sword', desc: '你取走了剑冢中的一把玄铁重剑。' },
      },
    ],
  },
],

// ═══════════════════════════════════════════════════════════
//  D: 弟子培养数据
// ═══════════════════════════════════════════════════════════
DISCIPLE_TEMPLATES: [
  {
    id: 'disc_young_hero',
    name: '少年英雄',
    icon: '🧒',
    desc: '一名天资聪颖的少年，眼中充满对武学的渴望。',
    talent: 'sword',
    baseStats: { strength: 20, agility: 25, perception: 30 },
    growthRate: 1.2,
    require: { reputation: 50 },
    recruitCost: { gold: 0, energy: 20 },
  },
  {
    id: 'disc_village_girl',
    name: '村姑奇才',
    icon: '👧',
    desc: '看似普通的村姑，却有着惊人的武学天赋，尤其擅长轻功。',
    talent: 'qinggong',
    baseStats: { agility: 35, charm: 25, perception: 25 },
    growthRate: 1.3,
    require: { morality: 60 },
    recruitCost: { gold: 0, energy: 15 },
  },
  {
    id: 'disc_fallen_noble',
    name: '落魄贵公子',
    icon: '🧑',
    desc: '家道中落的贵族子弟，自幼习武，基础扎实，缺乏实战经验。',
    talent: 'inner',
    baseStats: { innerPower: 30, endurance: 25, charm: 30 },
    growthRate: 1.1,
    require: { gold: 100 },
    recruitCost: { gold: 100, energy: 10 },
  },
  {
    id: 'disc_orphan',
    name: '孤儿侠客',
    icon: '👦',
    desc: '父母双亡的孤儿，心中充满仇恨与渴望，潜力无限。',
    talent: 'palm',
    baseStats: { strength: 30, endurance: 30, perception: 20 },
    growthRate: 1.4,
    require: { morality: 40 },
    recruitCost: { gold: 0, energy: 25 },
  },
],

// 弟子可执行的任务
DISCIPLE_MISSIONS: [
  { id: 'dm_patrol',    name: '巡逻护院',  duration: 1, reward: { gold: 30, exp: 10 },  risk: 0.1 },
  { id: 'dm_collect',  name: '采集草药',  duration: 2, reward: { items: ['i_herb'], exp: 15 }, risk: 0.05 },
  { id: 'dm_bounty',   name: '完成悬赏',  duration: 3, reward: { gold: 80, exp: 30, reputation: 10 }, risk: 0.25 },
  { id: 'dm_spy',      name: '刺探情报',  duration: 2, reward: { gold: 50, exp: 20 }, risk: 0.3 },
  { id: 'dm_challenge',name: '挑战高手',  duration: 1, reward: { exp: 50 }, risk: 0.4 },
],

// ═══════════════════════════════════════════════════════════
//  E: 武林排行榜数据
// ═══════════════════════════════════════════════════════════
RANKING_LIST: [
  { rank: 1,  name: '独孤求败', title: '剑魔',     power: 500, martialType: 'sword',    align: 'neutral', desc: '以剑法独步天下，求一败而不得，已归隐多年。', npcId: null },
  { rank: 2,  name: '王重阳',   title: '中神通',   power: 450, martialType: 'inner',    align: 'good',    desc: '全真教创始人，天下第一高手，已仙逝。', npcId: null },
  { rank: 3,  name: '东邪黄药师',title: '东邪',    power: 400, martialType: 'hidden',   align: 'neutral', desc: '桃花岛主，武学奇才，行事怪僻。', npcId: 'npc_huangyaoshi' },
  { rank: 4,  name: '西毒欧阳锋',title: '西毒',    power: 390, martialType: 'evil',     align: 'evil',    desc: '白驼山主，蛤蟆功天下无双。', npcId: null },
  { rank: 5,  name: '南帝段智兴',title: '南帝',    power: 380, martialType: 'inner',    align: 'good',    desc: '大理皇帝，一阳指举世无双。', npcId: null },
  { rank: 6,  name: '北丐洪七公',title: '北丐',    power: 370, martialType: 'palm',     align: 'good',    desc: '丐帮帮主，降龙十八掌传人。', npcId: 'npc_hongqigong' },
  { rank: 7,  name: '金轮法王',  title: '国师',    power: 320, martialType: 'inner',    align: 'evil',    desc: '蒙古国师，金轮功法威力无穷。', npcId: null },
  { rank: 8,  name: '杨过',      title: '神雕大侠', power: 300, martialType: 'sword',   align: 'good',    desc: '独臂大侠，黯然销魂掌创始人。', npcId: 'npc_yangguo' },
  { rank: 9,  name: '小龙女',    title: '古墓仙子', power: 280, martialType: 'qinggong', align: 'neutral', desc: '古墓派传人，玉女心经无双。', npcId: 'npc_xiaolongnv' },
  { rank: 10, name: '郭靖',      title: '大侠',    power: 260, martialType: 'palm',     align: 'good',    desc: '降龙十八掌与九阴真经双修，守卫襄阳的英雄。', npcId: 'npc_guojing' },
],

// 挑战排行榜的奖励
RANKING_CHALLENGE_REWARD: {
  win:  { reputation: 50, exp: 100, gold: 200 },
  lose: { reputation: -10, exp: 30 },
  // 击败前三名的特殊奖励
  topThreeBonus: { reputation: 200, title: 'title_wulin_first' },
},

// ═══════════════════════════════════════════════════════════
//  F: 武学秘籍系统
//  秘籍是可收集的物品，收集后需要"研读"才能解锁对应武功
//  tier: 1=残卷(普通), 2=完整秘籍, 3=绝世秘典
//  martialId: 对应 MARTIAL_ARTS 中的武功 id
//  findChance: 在各地点探索时的发现概率(0-1)
//  locations: 可能出现的地点
// ═══════════════════════════════════════════════════════════
MANUALS: [
  // ── 内功秘籍 ──
  { id:'mn_jiuyang',   name:'九阳神功残卷',  tier:3, martialId:'m_jiuyang',
    desc:'少林镇寺之宝，记载九阳神功心法，字字珠玑，需有极高悟性方能参透。',
    icon:'📜', studyTime:6, studyRequire:{ perception:50, innerPower:60 },
    locations:['少林寺'], findChance:0.05 },
  { id:'mn_jiuyin',    name:'九阴真经（上册）', tier:3, martialId:'m_jiuyin',
    desc:'武林至高秘典上册，内功心法精妙绝伦，得此一册已是莫大机缘。',
    icon:'📜', studyTime:8, studyRequire:{ perception:60, innerPower:50 },
    locations:['古墓', '桃花岛'], findChance:0.04 },
  { id:'mn_beiming',   name:'北冥神功心法',  tier:3, martialId:'m_beiming',
    desc:'逍遥派不传之秘，以北冥为名，吸纳天地精华，内力深不可测。',
    icon:'📜', studyTime:6, studyRequire:{ perception:55, innerPower:50 },
    locations:['逍遥岛'], findChance:0.06 },
  { id:'mn_yijin',     name:'易筋经',        tier:2, martialId:'m_yijin',
    desc:'少林七十二绝技之首，修炼后筋骨脱胎换骨，内力大增。',
    icon:'📖', studyTime:4, studyRequire:{ endurance:40, innerPower:40 },
    locations:['少林寺'], findChance:0.08 },
  { id:'mn_zixia',     name:'紫霞秘笈',      tier:2, martialId:'m_zixia',
    desc:'华山派内功心法，刚柔并济，修炼者内力纯正，剑法亦随之精进。',
    icon:'📖', studyTime:3, studyRequire:{ innerPower:30, perception:30 },
    locations:['华山'], findChance:0.10 },
  { id:'mn_chunyang',  name:'纯阳功法',      tier:1, martialId:'m_chunyang',
    desc:'全真教基础内功，修炼者内力纯正，是入门的好选择。',
    icon:'📄', studyTime:2, studyRequire:{ morality:10 },
    locations:['小镇', '江湖'], findChance:0.15 },

  // ── 剑法秘籍 ──
  { id:'mn_duli',      name:'独孤九剑剑谱',  tier:3, martialId:'m_duli',
    desc:'风清扬所传，天下第一剑法，无招胜有招，破尽天下武功，得此剑谱者天下无敌。',
    icon:'📜', studyTime:10, studyRequire:{ swordSkill:70, perception:70, agility:50 },
    locations:['华山'], findChance:0.03 },
  { id:'mn_taiji',     name:'太极剑法图解',  tier:2, martialId:'m_taiji',
    desc:'武当派镇派之宝，以柔克刚，四两拨千斤，图文并茂，易于参悟。',
    icon:'📖', studyTime:4, studyRequire:{ swordSkill:40, innerPower:40 },
    locations:['武当山'], findChance:0.08 },
  { id:'mn_huashan',   name:'华山剑法手册',  tier:1, martialId:'m_huashan',
    desc:'华山派正宗剑法，刚猛凌厉，是华山弟子必修功课。',
    icon:'📄', studyTime:2, studyRequire:{ swordSkill:20 },
    locations:['华山', '江湖'], findChance:0.15 },

  // ── 掌法秘籍 ──
  { id:'mn_jianglong', name:'降龙十八掌掌谱', tier:3, martialId:'m_jianglong',
    desc:'丐帮镇帮绝学，刚猛无匹，天下第一掌法，每一掌皆有排山倒海之势。',
    icon:'📜', studyTime:7, studyRequire:{ strength:60, innerPower:50, endurance:40 },
    locations:['丐帮总舵'], findChance:0.05 },
  { id:'mn_tianshan',  name:'天山折梅手诀',  tier:2, martialId:'m_tianshan',
    desc:'逍遥派绝学，以柔克刚，变化无穷，需有极高悟性方能领悟其中奥妙。',
    icon:'📖', studyTime:5, studyRequire:{ agility:40, perception:40 },
    locations:['逍遥岛'], findChance:0.07 },

  // ── 轻功秘籍 ──
  { id:'mn_lingbo',    name:'凌波微步图谱',  tier:3, martialId:'m_lingbo',
    desc:'天下第一轻功，步法变化如鬼魅，以《易经》六十四卦为基础，变化无穷。',
    icon:'📜', studyTime:8, studyRequire:{ agility:60, innerPower:50, perception:50 },
    locations:['逍遥岛'], findChance:0.04 },
  { id:'mn_tianzhan',  name:'梯云纵口诀',    tier:2, martialId:'m_tianzhan',
    desc:'武当轻功，纵跃如飞，是武当弟子必修的基础轻功。',
    icon:'📖', studyTime:3, studyRequire:{ agility:30, innerPower:25 },
    locations:['武当山'], findChance:0.10 },

  // ── 邪功秘籍 ──
  { id:'mn_sunflower', name:'葵花宝典残页',  tier:3, martialId:'m_sunflower',
    desc:'武功奇书，修炼者需自宫，威力无与伦比。残页上的内容已足以让人武功大进，但代价极大。',
    icon:'📜', studyTime:12, studyRequire:{ innerPower:70, evil:15 },
    locations:['古墓', '江湖'], findChance:0.02 },
],

// ═══════════════════════════════════════════════════════════
//  G: 事件链系统
//  多步骤连锁事件，每个 chain 由若干 steps 组成
//  trigger: 触发条件（首次触发）
//  steps: 事件步骤数组，每步有 id/desc/choices
//  choices: 选项，每个选项有 text/effect/nextStep（null=结束）
// ═══════════════════════════════════════════════════════════
EVENT_CHAINS: [
  {
    id: 'chain_sword_destiny',
    name: '剑缘',
    desc: '一段与神剑相关的奇缘',
    trigger: { swordSkill: 40, reputation: 30 },
    triggerLocation: null, // null=任意地点
    steps: [
      {
        id: 'step1',
        title: '神秘老者',
        desc: '你在路边遇到一位白发苍苍的老者，他打量你片刻，缓缓开口："年轻人，你与剑有缘，老夫有一事相托……"',
        choices: [
          { text: '恭敬聆听', effect: { morality: 2 }, nextStep: 'step2_listen' },
          { text: '婉言谢绝', effect: {}, nextStep: null, endMsg: '你婉言谢绝，老者叹了口气，转身离去。' },
        ]
      },
      {
        id: 'step2_listen',
        title: '托付重任',
        desc: '老者从怀中取出一块玉佩："此乃我毕生心血所铸，内藏一门剑法口诀。你若能找到华山之巅的剑冢，将此玉佩放入，便可得到完整剑谱。"',
        choices: [
          { text: '接受玉佩，前往华山', effect: { addItem: 'i_jade_sword', morality: 5 }, nextStep: 'step3_huashan' },
          { text: '询问老者身份', effect: {}, nextStep: 'step2b_ask' },
        ]
      },
      {
        id: 'step2b_ask',
        title: '老者的秘密',
        desc: '老者微微一笑："老夫不过是一个爱剑之人，姓名已不重要。"他将玉佩塞入你手中，转身消失在茫茫人海。',
        choices: [
          { text: '前往华山', effect: { addItem: 'i_jade_sword' }, nextStep: 'step3_huashan' },
        ]
      },
      {
        id: 'step3_huashan',
        title: '华山剑冢',
        desc: '你历经艰辛来到华山之巅，找到了传说中的剑冢。将玉佩放入后，石壁上缓缓浮现出剑法图谱，你屏息凝神，将其一一记下。',
        choices: [
          { text: '潜心参悟（需要7天）', effect: { swordSkill: 25, perception: 10, addManual: 'mn_duli' }, nextStep: null, endMsg: '你在剑冢旁苦修七日，终于将剑法融会贯通，武功大进！' },
          { text: '拓印带走', effect: { addManual: 'mn_duli' }, nextStep: null, endMsg: '你将剑谱拓印带走，日后慢慢研读。' },
        ]
      },
    ]
  },
  {
    id: 'chain_poison_master',
    name: '毒手药王',
    desc: '与一位神秘毒医的相遇',
    trigger: { endurance: 30 },
    triggerLocation: null,
    steps: [
      {
        id: 'step1',
        title: '中毒',
        desc: '你在山中行走时，不慎触碰了一株奇异的植物，顿时感到全身麻痹，毒素迅速蔓延……',
        choices: [
          { text: '强行运功逼毒', effect: { hp: -20, innerPower: -10 }, nextStep: 'step2_fight' },
          { text: '就地休息等待', effect: { hp: -10 }, nextStep: 'step2_wait' },
        ]
      },
      {
        id: 'step2_fight',
        title: '毒素蔓延',
        desc: '你强行运功，毒素反而扩散更快，就在你快要支撑不住时，一个身影出现在你面前……',
        choices: [
          { text: '请求帮助', effect: { morality: 3 }, nextStep: 'step3_healer' },
        ]
      },
      {
        id: 'step2_wait',
        title: '神秘救援',
        desc: '你静静等待，毒素慢慢侵蚀你的身体。就在意识模糊之际，一个老人出现了，他从药箱中取出一粒丹药……',
        choices: [
          { text: '服下丹药', effect: { hp: 30 }, nextStep: 'step3_healer' },
        ]
      },
      {
        id: 'step3_healer',
        title: '毒手药王',
        desc: '救你的是一位须发皆白的老医者，自称"毒手药王"。他为你解毒后说："你体质不错，若有兴趣，可随我学习医毒之道。"',
        choices: [
          { text: '拜师学艺', effect: { perception: 15, endurance: 10, addItem: 'i_jiedu', addItem2: 'i_wudu' }, nextStep: null, endMsg: '你跟随毒手药王学习了一段时间，对医毒之道有了深刻认识，体质大为增强。' },
          { text: '道谢离去', effect: { morality: 5, addItem: 'i_jiedu' }, nextStep: null, endMsg: '你向老医者道谢，他赠你一粒解毒丹，你们就此别过。' },
        ]
      },
    ]
  },
  {
    id: 'chain_lost_disciple',
    name: '迷途弟子',
    desc: '一个走火入魔的年轻人',
    trigger: { morality: 20, reputation: 40 },
    triggerLocation: null,
    steps: [
      {
        id: 'step1',
        title: '走火入魔',
        desc: '你在路上遇到一个年轻人，他双目赤红，内力失控，正在伤害路人。旁边的人都吓得四散奔逃。',
        choices: [
          { text: '出手制止', effect: { hp: -15, morality: 10 }, nextStep: 'step2_stop' },
          { text: '绕道而行', effect: { morality: -5 }, nextStep: null, endMsg: '你选择绕道而行，事后听说那个年轻人伤了几个路人，你心中有些愧疚。' },
        ]
      },
      {
        id: 'step2_stop',
        title: '点穴制敌',
        desc: '你出手点住了年轻人的穴道，他慢慢恢复了神智，泪流满面："多谢大侠救我，我修炼时走火入魔，差点铸成大错……"',
        choices: [
          { text: '传授调息之法', effect: { reputation: 15, morality: 10, perception: 5 }, nextStep: 'step3_teach' },
          { text: '带他去找名医', effect: { gold: -30, morality: 15 }, nextStep: 'step3_doctor' },
        ]
      },
      {
        id: 'step3_teach',
        title: '传道授业',
        desc: '你将自己所知的调息之法传授给他，他感激涕零，拜你为师。数月后，他武功大进，成为你的得力弟子。',
        choices: [
          { text: '收他为徒', effect: { reputation: 20, addFollower: true }, nextStep: null, endMsg: '你收下了这个弟子，他日后成为你的左膀右臂，江湖上也多了一段佳话。' },
        ]
      },
      {
        id: 'step3_doctor',
        title: '名医诊治',
        desc: '你带他找到了一位名医，花费了不少银两，但年轻人的走火入魔之症得到了根治。他感激地说："大侠大恩大德，没齿难忘！"',
        choices: [
          { text: '挥手道别', effect: { reputation: 25, morality: 20 }, nextStep: null, endMsg: '你挥手道别，年轻人含泪而去。此事在江湖上传为美谈，你的声望大增。' },
        ]
      },
    ]
  },
  {
    id: 'chain_ancient_tomb',
    name: '古墓奇遇',
    desc: '深入古墓探寻秘密',
    trigger: { agility: 40, perception: 35 },
    triggerLocation: '古墓',
    steps: [
      {
        id: 'step1',
        title: '密室发现',
        desc: '你在古墓深处发现了一扇隐藏的石门，门上刻着奇异的符文，散发着淡淡的寒气。',
        choices: [
          { text: '强行推开', effect: { hp: -10, strength: 5 }, nextStep: 'step2_force' },
          { text: '研究符文', effect: { perception: 8 }, nextStep: 'step2_study' },
        ]
      },
      {
        id: 'step2_force',
        title: '机关触发',
        desc: '石门轰然打开，但同时触发了机关，暗箭四射！你受了些伤，但也进入了密室。',
        choices: [
          { text: '搜寻密室', effect: { addManual: 'mn_jiuyin' }, nextStep: null, endMsg: '密室中藏有九阴真经上册！你如获至宝，小心收好。' },
        ]
      },
      {
        id: 'step2_study',
        title: '破解符文',
        desc: '你仔细研究符文，发现这是一套机关密码。按照规律推演，你轻松打开了石门，进入密室。',
        choices: [
          { text: '搜寻密室', effect: { perception: 5, addManual: 'mn_jiuyin' }, nextStep: null, endMsg: '密室中藏有九阴真经上册，以及一些前人留下的武学心得！你大喜过望。' },
        ]
      },
    ]
  },
],

// ═══════════════════════════════════════════════════════════
//  H: 地图扩展 — 新地点定义
//  unlockCondition: 解锁条件（满足后可前往）
//  danger: 危险等级 1-5
//  specialActions: 该地点特有的行动
// ═══════════════════════════════════════════════════════════
EXTRA_LOCATIONS: [
  {
    id: 'loc_shaolin',
    name: '少林寺',
    desc: '天下武学发源地，少林七十二绝技举世无双，寺中高僧如云。',
    icon: '🏯',
    danger: 1,
    unlockCondition: { reputation: 50, morality: 20 },
    unlockHint: '声望足够且品行端正，方可拜访少林圣地',
    npcs: ['npc_shaolin_abbot'],
    specialActions: [
      { id: 'shaolin_study', name: '研习佛法', desc: '在少林寺研习佛法武学', cost: { gold: 0 }, effect: { innerPower: 8, morality: 5, endurance: 5 }, duration: 1 },
      { id: 'shaolin_spar', name: '切磋武艺', desc: '与少林武僧切磋', cost: { gold: 0 }, effect: { swordSkill: 5, strength: 5, hp: -10 }, duration: 1 },
    ],
    manualDrops: ['mn_yijin', 'mn_jiuyang'],
  },
  {
    id: 'loc_wudang',
    name: '武当山',
    desc: '道家圣地，武当派以内功见长，太极剑法天下闻名。',
    icon: '⛰️',
    danger: 1,
    unlockCondition: { reputation: 40, morality: 15 },
    unlockHint: '需要一定声望和品行方可上山',
    npcs: [],
    specialActions: [
      { id: 'wudang_taichi', name: '修炼太极', desc: '修炼武当太极功法', cost: { gold: 0 }, effect: { innerPower: 6, agility: 6, swordSkill: 4 }, duration: 1 },
      { id: 'wudang_meditate', name: '打坐悟道', desc: '在武当山打坐悟道', cost: { gold: 0 }, effect: { perception: 8, innerPower: 5, morality: 3 }, duration: 1 },
    ],
    manualDrops: ['mn_tianzhan', 'mn_taiji'],
  },
  {
    id: 'loc_peachblossom',
    name: '桃花岛',
    desc: '东邪黄药师的居所，岛上奇花异草，机关重重，武学奇书众多。',
    icon: '🌸',
    danger: 3,
    unlockCondition: { agility: 50, perception: 40 },
    unlockHint: '需要极高的身法和悟性才能找到并登上桃花岛',
    npcs: ['npc_huangyaoshi'],
    specialActions: [
      { id: 'peach_explore', name: '探索机关', desc: '探索岛上的奇门机关', cost: { gold: 0 }, effect: { perception: 10, agility: 8 }, duration: 1, risk: 0.3 },
      { id: 'peach_study', name: '研读典籍', desc: '研读岛上收藏的武学典籍', cost: { gold: 0 }, effect: { perception: 12, innerPower: 6 }, duration: 2 },
    ],
    manualDrops: ['mn_jiuyin', 'mn_lingbo'],
  },
  {
    id: 'loc_guangming',
    name: '光明顶',
    desc: '明教圣地，教众众多，武学独特，与正道势力长期对立。',
    icon: '🔥',
    danger: 3,
    unlockCondition: { evil: 20, reputation: 60 },
    unlockHint: '需要一定的邪气或在江湖上有足够名望，方能找到光明顶',
    npcs: [],
    specialActions: [
      { id: 'guangming_train', name: '修炼圣火功', desc: '修炼明教圣火功法', cost: { gold: 0 }, effect: { innerPower: 10, evil: 5, strength: 8 }, duration: 1 },
      { id: 'guangming_mission', name: '执行教务', desc: '为明教执行任务', cost: { gold: 0 }, effect: { gold: 50, reputation: 10, evil: 3 }, duration: 1 },
    ],
    manualDrops: ['mn_huagong'],
  },
  {
    id: 'loc_xiaoyao',
    name: '逍遥岛',
    desc: '逍遥派隐秘之地，北冥神功、凌波微步等绝世武学皆出于此。',
    icon: '🏝️',
    danger: 4,
    unlockCondition: { innerPower: 100, perception: 80 },
    unlockHint: '需要极深的内力和悟性，方能感应到逍遥岛的所在',
    npcs: [],
    specialActions: [
      { id: 'xiaoyao_absorb', name: '修炼北冥', desc: '修炼北冥神功，吸纳天地精华', cost: { gold: 0 }, effect: { innerPower: 20, hp: 10 }, duration: 2 },
      { id: 'xiaoyao_step', name: '练习凌波', desc: '练习凌波微步步法', cost: { gold: 0 }, effect: { agility: 15, perception: 8 }, duration: 1 },
    ],
    manualDrops: ['mn_beiming', 'mn_lingbo', 'mn_tianshan'],
  },
  {
    id: 'loc_huashan',
    name: '华山',
    desc: '华山派所在，剑法天下闻名，山顶剑冢藏有绝世剑谱。',
    icon: '🗻',
    danger: 2,
    unlockCondition: { swordSkill: 30, reputation: 30 },
    unlockHint: '剑法有所成就且有一定名望，方可登上华山',
    npcs: [],
    specialActions: [
      { id: 'huashan_sword', name: '练剑', desc: '在华山练习剑法', cost: { gold: 0 }, effect: { swordSkill: 10, agility: 5 }, duration: 1 },
      { id: 'huashan_tomb', name: '探寻剑冢', desc: '寻找传说中的剑冢', cost: { gold: 0 }, effect: { perception: 5 }, duration: 1, triggerChain: 'chain_sword_destiny' },
    ],
    manualDrops: ['mn_duli', 'mn_zixia', 'mn_huashan'],
  },
],

// ═══════════════════════════════════════════════════════════
//  I: 武功融合配方
//  需要同时掌握 source1 和 source2 两门武功，
//  消耗一定资源后，融合为 result 武功（新的更强武功）
//  result 武功直接加入 MARTIAL_ARTS 效果，不需要单独定义
// ═══════════════════════════════════════════════════════════
FUSION_RECIPES: [
  {
    id: 'fusion_yin_yang',
    name: '阴阳合一',
    source1: 'm_jiuyang',   // 九阳神功
    source2: 'm_jiuyin',    // 九阴真经
    result: {
      id: 'm_yinyang',
      name: '阴阳神功',
      type: 'inner',
      tier: 6,
      desc: '融合九阳九阴之精华，刚柔并济，阴阳调和，天下无双。修炼者内力深不可测，百毒不侵，且兼具攻守。',
      effect: { innerPower: 120, endurance: 50, hp: 60, agility: 30, swordSkill: 30 },
    },
    require: { innerPower: 150, perception: 100 },
    cost: { gold: 500 },
    studyTime: 12,
    desc: '将九阳神功与九阴真经融为一体，需要极高的内力和悟性，以及大量时间潜心参悟。',
  },
  {
    id: 'fusion_sword_palm',
    name: '剑掌合一',
    source1: 'm_duli',      // 独孤九剑
    source2: 'm_jianglong', // 降龙十八掌
    result: {
      id: 'm_jianlongzhang',
      name: '降龙剑掌',
      type: 'sword',
      tier: 6,
      desc: '融合独孤九剑的无招胜有招与降龙十八掌的刚猛无匹，出剑如掌，出掌如剑，攻无不克。',
      effect: { swordSkill: 80, strength: 50, innerPower: 40, agility: 20 },
    },
    require: { swordSkill: 120, strength: 80, perception: 80 },
    cost: { gold: 300 },
    studyTime: 10,
    desc: '将剑法与掌法融为一体，需要极高的剑术和力量，以及深厚的悟性。',
  },
  {
    id: 'fusion_light_inner',
    name: '御风而行',
    source1: 'm_lingbo',    // 凌波微步
    source2: 'm_beiming',   // 北冥神功
    result: {
      id: 'm_yufeng',
      name: '御风神功',
      type: 'qinggong',
      tier: 6,
      desc: '以北冥神功为根基，以凌波微步为形，内外合一，如御风而行，飘忽不定，天下无人能追。',
      effect: { agility: 80, innerPower: 60, speed: 50, perception: 20 },
    },
    require: { agility: 100, innerPower: 120, perception: 90 },
    cost: { gold: 400 },
    studyTime: 10,
    desc: '将轻功与内功融为一体，需要极高的身法和内力，以及深厚的悟性。',
  },
  {
    id: 'fusion_taiji_jiuyin',
    name: '太极阴阳',
    source1: 'm_taiji',     // 太极剑法
    source2: 'm_jiuyin',    // 九阴真经
    result: {
      id: 'm_taijiyinyang',
      name: '太极阴阳剑',
      type: 'sword',
      tier: 5,
      desc: '以九阴真经为内力根基，以太极剑法为外在形式，阴阳流转，变化无穷，以柔克刚达到极致。',
      effect: { swordSkill: 50, innerPower: 40, agility: 30, endurance: 20 },
    },
    require: { swordSkill: 80, innerPower: 80, perception: 70 },
    cost: { gold: 200 },
    studyTime: 8,
    desc: '将太极剑法与九阴真经融合，需要较高的剑术和内力。',
  },
],

// ═══════════════════════════════════════════════════════════
//  J: 年代事件系统
//  每隔固定年数触发的江湖大事，影响整个游戏世界
//  triggerYear: 触发年份（游戏内年份）
//  type: 'world'=世界事件, 'opportunity'=机遇, 'crisis'=危机
//  effect: 对玩家的影响（可选）
//  worldEffect: 对世界状态的影响
// ═══════════════════════════════════════════════════════════
ERA_EVENTS: [
  {
    id: 'era_wulin_assembly',
    name: '武林大会',
    triggerYear: 3,
    repeatEvery: 5, // 每5年重复一次
    type: 'opportunity',
    desc: '五年一度的武林大会在中原召开，天下英雄齐聚一堂，切磋武艺，论道江湖。',
    detail: '武林大会是江湖中最盛大的聚会，各大门派掌门亲临，武林排行榜将在此更新。参与者可以结交豪杰，切磋武艺，甚至有机会获得秘籍传授。',
    choices: [
      { text: '参加武林大会', effect: { reputation: 30, swordSkill: 10, perception: 5 }, condition: { reputation: 30 } },
      { text: '旁观学习', effect: { perception: 15, swordSkill: 5 } },
      { text: '不予理会', effect: {} },
    ],
    worldEffect: { rankingUpdate: true },
  },
  {
    id: 'era_mongol_invasion',
    name: '蒙古南侵',
    triggerYear: 5,
    repeatEvery: 0, // 不重复
    type: 'crisis',
    desc: '蒙古大军南下，铁蹄踏遍中原，无数百姓流离失所，江湖中人纷纷起义抗敌。',
    detail: '蒙古大军势如破竹，各大城市相继告急。郭靖大侠在襄阳城头振臂高呼，号召天下英雄共抗外敌。这是一个考验每个江湖人良知的时刻。',
    choices: [
      { text: '投身抗蒙大业', effect: { reputation: 50, morality: 20, hp: -30 }, condition: { morality: 10 } },
      { text: '保护百姓撤离', effect: { reputation: 25, morality: 15, gold: -50 } },
      { text: '趁乱发财', effect: { gold: 100, morality: -30, evil: 20 } },
      { text: '置身事外', effect: { morality: -10 } },
    ],
    worldEffect: { locationDanger: { '襄阳': 3 } },
  },
  {
    id: 'era_jianghu_plague',
    name: '江湖瘟疫',
    triggerYear: 7,
    repeatEvery: 0,
    type: 'crisis',
    desc: '一场神秘瘟疫席卷江湖，许多武林人士相继病倒，据说与某种奇毒有关。',
    detail: '瘟疫来势汹汹，各大门派损失惨重。有人说这是某个邪派的阴谋，也有人说是上天的惩罚。医者仁心，此时正是展现侠义的时候。',
    choices: [
      { text: '寻找解药（需要草药知识）', effect: { reputation: 40, morality: 25, perception: 10 }, condition: { perception: 40 } },
      { text: '救治病患', effect: { reputation: 20, morality: 20, hp: -20, gold: -80 } },
      { text: '隔离自保', effect: { hp: 10 } },
    ],
    worldEffect: { npcAvailability: 0.7 },
  },
  {
    id: 'era_secret_revealed',
    name: '武林秘典现世',
    triggerYear: 10,
    repeatEvery: 0,
    type: 'opportunity',
    desc: '传说中的《武林秘典》在江湖中现世，记载了上古武学的精髓，各大势力争相夺取。',
    detail: '《武林秘典》是传说中的武学总纲，据说得此秘典者可在短时间内武功大进。然而争夺秘典的过程中，江湖腥风血雨，不知多少人为此丧命。',
    choices: [
      { text: '参与争夺', effect: { innerPower: 30, swordSkill: 20, hp: -40, reputation: 20 }, condition: { reputation: 60 } },
      { text: '暗中观察', effect: { perception: 20, reputation: 10 } },
      { text: '将秘典销毁以平息纷争', effect: { morality: 30, reputation: 40 }, condition: { morality: 40 } },
    ],
    worldEffect: {},
  },
  {
    id: 'era_wulin_tournament',
    name: '天下第一武道会',
    triggerYear: 8,
    repeatEvery: 10,
    type: 'opportunity',
    desc: '十年一度的天下第一武道会开幕，胜者将被封为"天下第一"，名扬四海。',
    detail: '武道会汇聚了天下最顶尖的武者，每一场比试都是武学的盛宴。胜者不仅名扬天下，还将获得丰厚的奖励和各大门派的尊重。',
    choices: [
      { text: '参加武道会', effect: { reputation: 60, swordSkill: 15, innerPower: 10 }, condition: { reputation: 80, swordSkill: 60 } },
      { text: '观摩学习', effect: { perception: 20, swordSkill: 8 } },
      { text: '不感兴趣', effect: {} },
    ],
    worldEffect: { rankingUpdate: true },
  },
  {
    id: 'era_peace_treaty',
    name: '江湖休战',
    triggerYear: 12,
    repeatEvery: 0,
    type: 'world',
    desc: '经过多年的纷争，各大门派终于坐下来谈判，签订了《江湖休战协议》，武林迎来难得的和平时期。',
    detail: '和平时期，各大门派开放交流，武学传播更加自由，江湖中的仇恨也逐渐消散。这是修炼和结交朋友的好时机。',
    choices: [
      { text: '积极参与和平建设', effect: { reputation: 20, morality: 15, gold: 30 } },
      { text: '趁机广交朋友', effect: { charm: 15, reputation: 15 } },
      { text: '利用和平期潜心修炼', effect: { innerPower: 20, swordSkill: 15, perception: 10 } },
    ],
    worldEffect: { factionRelations: 'improved' },
  },
],

// ═══════════════════════════════════════════════════════════
//  K: 天气系统
//  每月随机天气，影响行动效果
// ═══════════════════════════════════════════════════════════
WEATHER_TYPES: [
  { id:'sunny',  name:'晴空万里', icon:'☀️', weight:30,
    effects:{ trainBonus:10, exploreBonus:15, wanderBonus:5 },
    desc:'阳光明媚，正是修炼的好时机。' },
  { id:'cloudy', name:'阴云密布', icon:'☁️', weight:20,
    effects:{},
    desc:'天色阴沉，江湖中人各自忙碌。' },
  { id:'rain',   name:'细雨绵绵', icon:'🌧️', weight:20,
    effects:{ innerBonus:20, trainBonus:5, wanderPenalty:10 },
    desc:'雨声淅沥，最宜修炼内功，游历却不便。' },
  { id:'storm',  name:'狂风暴雨', icon:'⛈️', weight:8,
    effects:{ wanderPenalty:30, explorePenalty:20, restBonus:15 },
    desc:'风雨大作，出行艰难，不如在屋内休养。' },
  { id:'snow',   name:'大雪纷飞', icon:'❄️', weight:10,
    effects:{ innerBonus:15, wanderPenalty:20, restBonus:10 },
    desc:'白雪皑皑，内功修炼别有一番意境。' },
  { id:'fog',    name:'大雾弥漫', icon:'🌫️', weight:8,
    effects:{ stealthBonus:30, exploreBonus:10, wanderPenalty:5 },
    desc:'浓雾遮天，行踪难觅，探索奇遇更多。' },
  { id:'wind',   name:'劲风呼啸', icon:'💨', weight:12,
    effects:{ agilityBonus:15, trainBonus:5 },
    desc:'劲风中练功，身法更加灵动。' },
  { id:'hot',    name:'烈日炎炎', icon:'🌞', weight:10,
    effects:{ energyPenalty:10, trainBonus:-5, restBonus:5 },
    desc:'酷暑难耐，体力消耗更快，不宜剧烈修炼。' },
],

// ═══════════════════════════════════════════════════════════
//  L: 修炼境界突破
//  内力/剑术等达到阈值时触发突破事件
// ═══════════════════════════════════════════════════════════
BREAKTHROUGH_EVENTS: [
  { id:'bt_inner_1', stat:'innerPower', threshold:50,  name:'后天圆满',
    desc:'你感到体内真气涌动，似乎即将突破后天境界的桎梏，踏入先天之门。',
    cost:{ energy:50, gold:0 },
    successBonus:{ innerPower:30, maxHp:20, endurance:10 },
    failPenalty:{ innerPower:-10, hp:-20 },
    successRate:0.7, titleReward:'t_xiantian' },
  { id:'bt_inner_2', stat:'innerPower', threshold:120, name:'先天大成',
    desc:'先天真气已臻大成，你感到一道无形的壁垒横亘在前，突破后将踏入化劲境界。',
    cost:{ energy:70, gold:100 },
    successBonus:{ innerPower:50, maxHp:30, endurance:20, perception:15 },
    failPenalty:{ innerPower:-20, hp:-30 },
    successRate:0.55 },
  { id:'bt_inner_3', stat:'innerPower', threshold:250, name:'化劲入虚',
    desc:'化劲之境已至顶峰，虚空之境就在眼前，此乃武学至高境界，万中无一能达到。',
    cost:{ energy:100, gold:300 },
    successBonus:{ innerPower:100, maxHp:50, endurance:30, perception:30, swordSkill:30 },
    failPenalty:{ innerPower:-30, hp:-50 },
    successRate:0.35 },
  { id:'bt_sword_1', stat:'swordSkill', threshold:60,  name:'剑意初成',
    desc:'你的剑法已有了自己的意境，剑意初成，再进一步便可达到人剑合一之境。',
    cost:{ energy:40, gold:0 },
    successBonus:{ swordSkill:25, agility:10, perception:8 },
    failPenalty:{ swordSkill:-8, hp:-15 },
    successRate:0.65 },
  { id:'bt_sword_2', stat:'swordSkill', threshold:150, name:'人剑合一',
    desc:'剑意已深入骨髓，人剑合一之境触手可及，突破后剑法将达到出神入化的境界。',
    cost:{ energy:80, gold:200 },
    successBonus:{ swordSkill:60, agility:20, perception:20, innerPower:20 },
    failPenalty:{ swordSkill:-20, hp:-30 },
    successRate:0.45 },
],

// ═══════════════════════════════════════════════════════════
//  M2: 升级版随机事件（多段对话，选择影响后续）
// ═══════════════════════════════════════════════════════════
RICH_EVENTS: [
  {
    id:'re_mysterious_elder',
    name:'神秘老人',
    icon:'🧙',
    weight:15,
    trigger:{ minReputation:0 },
    steps:[
      { id:'s1', desc:'你在山间小道上遇到一位白发苍苍的老人，他正坐在路边休息，见你走来，眼中闪过一丝异光。\n\n"年轻人，你走的这条路，是去哪里的？"',
        choices:[
          { text:'"我在游历江湖，随遇而安。"', next:'s2a', effect:{} },
          { text:'"老人家，你是何人？"', next:'s2b', effect:{} },
          { text:'"不劳老人家费心。"（无礼离开）', next:null, effect:{ morality:-5 }, endMsg:'老人摇摇头，叹了口气，你错过了一段奇缘。' },
        ]
      },
      { id:'s2a', desc:'老人点点头，眼中露出赞许之色："游历江湖，好！年轻人就该多走走看看。老夫年轻时也是如此。"\n\n他从怀中取出一个小瓷瓶："这是老夫自制的培元丹，送给你，愿你江湖路上平安。"',
        choices:[
          { text:'恭敬接受，道谢离去', next:null, effect:{ innerPower:15, perception:8 }, endMsg:'老人微笑着目送你离去，你感到内力有所增长。', item:'i_peiyuan' },
          { text:'"老人家，可否指点晚辈一二？"', next:'s3', effect:{} },
        ]
      },
      { id:'s2b', desc:'老人哈哈一笑："老夫不过是一个游方道人，无名无姓。倒是你，身上有一股不凡的气息。"\n\n他打量着你，若有所思："你可曾遇到过什么奇遇？"',
        choices:[
          { text:'如实相告', next:'s3', effect:{ charm:5 } },
          { text:'"没什么特别的。"', next:null, effect:{}, endMsg:'老人点点头，起身离去，留下一句"缘分未到"。' },
        ]
      },
      { id:'s3', desc:'老人沉吟片刻，说道："你的根骨不错，只是修炼方向有些偏差。"\n\n他伸出手指，在你眉心轻轻一点，你顿时感到一股暖流涌遍全身，脑中武学感悟如潮水般涌来。\n\n"记住，武学之道，在于心，不在于力。"',
        choices:[
          { text:'用心感悟（悟性≥20）', next:null, require:{ perception:20 }, effect:{ innerPower:30, perception:20, swordSkill:15 }, endMsg:'你用心感悟老人的指点，武学境界大进！' },
          { text:'强行吸收', next:null, effect:{ innerPower:20, hp:-15 }, endMsg:'你强行吸收这股力量，有所收获，但也受了些内伤。' },
        ]
      },
    ]
  },
  {
    id:'re_bandit_camp',
    name:'山贼营地',
    icon:'⚔️',
    weight:20,
    trigger:{ minReputation:0 },
    steps:[
      { id:'s1', desc:'你发现了一处山贼营地，约有十余名山贼，他们正在欺压几名被俘的商人。\n\n山贼头目见你靠近，大喝一声："哪里来的小子，找死吗？"',
        choices:[
          { text:'拔剑迎战，救出商人', next:'s2a', effect:{ hp:-10 } },
          { text:'"我是来入伙的。"（诈降）', next:'s2b', effect:{} },
          { text:'悄悄绕道离开', next:null, effect:{}, endMsg:'你悄悄离开，商人的哭声渐渐远去，你心中有些不安。' },
        ]
      },
      { id:'s2a', desc:'你与山贼大战一场，凭借武艺将其击退，山贼头目见势不妙，仓皇逃窜。\n\n被救的商人感激涕零，其中一人说："恩人大义，我等无以为报，这些银两请收下。"',
        choices:[
          { text:'收下银两', next:null, effect:{ gold:80, reputation:20, morality:10 }, endMsg:'商人千恩万谢，你收下了报酬，声望大增。' },
          { text:'分文不取，仗义相助', next:null, effect:{ reputation:35, morality:25 }, endMsg:'你婉拒了报酬，商人们对你敬佩不已，你的侠名传遍附近。' },
        ]
      },
      { id:'s2b', desc:'山贼头目打量你一番，哈哈大笑："好，有胆色！先把你的银两交出来，算是投名状！"\n\n你心中盘算着如何脱身……',
        choices:[
          { text:'趁其不备，突然出手（需身法≥20）', next:null, require:{ agility:20 }, effect:{ gold:50, reputation:15, agility:5 }, endMsg:'你出其不意，将山贼头目制服，救出商人，还缴获了一些财物。' },
          { text:'乖乖交出银两，伺机逃跑', next:null, effect:{ gold:-30, agility:3 }, endMsg:'你交出银两，趁乱逃脱，损失了一些钱财。' },
        ]
      },
    ]
  },
  {
    id:'re_ancient_tomb',
    name:'古墓奇遇',
    icon:'🏛️',
    weight:10,
    trigger:{ minReputation:10 },
    steps:[
      { id:'s1', desc:'你在山中迷路，无意间发现了一处隐秘的古墓入口，石门上刻着"入者自负"四个大字。\n\n墓中隐约传来一股奇异的气息，似乎有什么东西在召唤你。',
        choices:[
          { text:'推门而入，探索古墓', next:'s2', effect:{} },
          { text:'谨慎观察后再进入', next:'s2', effect:{ perception:3 } },
          { text:'不入虎穴，转身离去', next:null, effect:{}, endMsg:'你转身离去，但心中始终对那古墓念念不忘。' },
        ]
      },
      { id:'s2', desc:'古墓内机关重重，你小心翼翼地前行，终于来到一处宽阔的石室。\n\n石室中央有一具石棺，棺盖上放着一本泛黄的古籍，旁边还有一柄生锈的长剑。',
        choices:[
          { text:'取走古籍研读', next:'s3a', effect:{} },
          { text:'取走长剑', next:'s3b', effect:{} },
          { text:'两样都要', next:'s3c', effect:{ morality:-5 } },
        ]
      },
      { id:'s3a', desc:'你翻开古籍，发现这是一本残缺的内功心法，虽然残缺，但其中蕴含的武学道理极为深奥。\n\n你花了数日时间研读，有所领悟。',
        choices:[
          { text:'深入钻研（需悟性≥25）', next:null, require:{ perception:25 }, effect:{ innerPower:40, perception:15 }, endMsg:'你深入钻研，领悟了古籍中的精髓，内力大进！' },
          { text:'浅尝辄止', next:null, effect:{ innerPower:20, perception:8 }, endMsg:'你有所领悟，内力有所提升。' },
        ]
      },
      { id:'s3b', desc:'你拿起长剑，虽然生锈，但剑身沉重，隐隐有一股凛冽的剑气。\n\n你试着挥舞几下，感觉这把剑与你颇为投缘。',
        choices:[
          { text:'带走此剑，日后修复', next:null, effect:{ swordSkill:20, strength:8 }, endMsg:'你带走了古剑，剑法有所精进。' },
        ]
      },
      { id:'s3c', desc:'你将古籍和长剑都收入囊中，正要离去，却触动了机关，石室开始震动！\n\n你必须立刻逃出去！',
        choices:[
          { text:'施展轻功，全力逃跑（需身法≥15）', next:null, require:{ agility:15 }, effect:{ innerPower:25, swordSkill:15, agility:5 }, endMsg:'你施展轻功，惊险逃出，带走了两样宝贝！' },
          { text:'丢下一样，轻装逃跑', next:null, effect:{ innerPower:20, hp:-20 }, endMsg:'你丢下长剑，带着古籍逃出，受了些伤。' },
        ]
      },
    ]
  },
  {
    id:'re_jianghu_conflict',
    name:'门派纷争',
    icon:'⚖️',
    weight:18,
    trigger:{ minReputation:15 },
    steps:[
      { id:'s1', desc:'你目睹了一场门派冲突：一名少林弟子与一名丐帮弟子正在激烈争吵，双方剑拔弩张，眼看就要动手。\n\n周围已经聚集了不少看热闹的人。',
        choices:[
          { text:'上前调停', next:'s2a', effect:{} },
          { text:'站在少林一边', next:'s2b', effect:{ morality:3 } },
          { text:'"打起来！打起来！"（看热闹）', next:'s2c', effect:{ morality:-5 } },
        ]
      },
      { id:'s2a', desc:'你上前调停，双方见你气度不凡，暂时停手。\n\n少林弟子说："此人偷了我少林的东西！"\n丐帮弟子反驳："胡说！这是我丐帮祖传之物！"\n\n你仔细观察，发现真相似乎并不简单……',
        choices:[
          { text:'支持少林（需道德≥40）', next:null, require:{ morality:40 }, effect:{ reputation:20, morality:10 }, endMsg:'你凭借智慧化解了纷争，两派都对你心存感激，声望大增。' },
          { text:'支持丐帮', next:null, effect:{ reputation:15, charm:8 }, endMsg:'你的调停让丐帮弟子感激，声望有所提升。' },
          { text:'"此事另有隐情，需从长计议"', next:null, effect:{ reputation:25, perception:10 }, endMsg:'你的公正态度赢得了双方的尊重，声望大增，悟性也有所提升。' },
        ]
      },
      { id:'s2b', desc:'你站在少林一边，丐帮弟子见寡不敌众，愤愤离去，临走时撂下一句："此事没完！"\n\n少林弟子向你道谢。',
        choices:[
          { text:'接受少林的谢礼', next:null, effect:{ gold:30, reputation:10 }, endMsg:'少林弟子赠你银两，但丐帮对你的印象变差了。' },
        ]
      },
      { id:'s2c', desc:'两人打了起来，场面混乱，你趁乱……',
        choices:[
          { text:'趁乱摸走一些财物', next:null, effect:{ gold:25, evil:15, morality:-15 }, endMsg:'你趁乱得了些好处，但心中有些不安。' },
          { text:'良心发现，上前制止', next:null, effect:{ morality:5, reputation:5 }, endMsg:'你及时制止了打斗，挽回了一些颜面。' },
        ]
      },
    ]
  },
],

};
