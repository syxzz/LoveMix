/**
 * 剧本数据
 * 包含示例剧本和角色信息
 */

import { Script } from '../types';

export const SAMPLE_SCRIPTS: Script[] = [
  {
    id: 'mansion_murder',
    title: '庄园谋杀案',
    description: '一个风雨交加的夜晚，豪华庄园内发生了一起离奇的谋杀案...',
    difficulty: 'medium',
    duration: '60-90分钟',
    characterCount: 6,
    storyBackground: `
在一个风雨交加的夜晚，富豪威廉·布莱克在自己的庄园举办了一场私人晚宴。
参加晚宴的有他的家人、朋友和商业伙伴。然而，就在晚宴进行到一半时，
威廉突然倒地身亡。经检查，他是被毒死的。

现场被封锁，所有人都成为了嫌疑人。作为在场的一员，你需要通过搜集线索、
与其他人对话，找出真正的凶手。
    `,
    characters: [
      {
        id: 'char_1',
        name: '艾米丽·布莱克',
        age: 28,
        gender: '女',
        occupation: '艺术家',
        personality: '敏感、细腻、有艺术气质',
        background: '威廉的女儿，从小在庄园长大。与父亲关系复杂，因为父亲反对她的艺术事业。',
        secret: '你最近因为艺术事业失败欠下了巨额债务，曾向父亲求助但被拒绝。',
        goal: '证明自己的清白，同时隐藏自己的财务困境。',
      },
      {
        id: 'char_2',
        name: '詹姆斯·格林',
        age: 45,
        gender: '男',
        occupation: '商业伙伴',
        personality: '精明、冷静、善于算计',
        background: '威廉的商业伙伴，两人共同经营一家投资公司。',
        secret: '你发现威廉最近在暗中调查公司账目，可能发现了你挪用公款的事实。',
        goal: '转移注意力，避免公司账目被深入调查。',
      },
      {
        id: 'char_3',
        name: '玛格丽特·布莱克',
        age: 50,
        gender: '女',
        occupation: '家庭主妇',
        personality: '优雅、传统、有些神经质',
        background: '威廉的妻子，结婚25年。表面上是完美的夫妻，但实际上感情早已破裂。',
        secret: '你知道威廉有外遇，并且他最近修改了遗嘱，打算离婚后把大部分财产留给情人。',
        goal: '保护自己的财产权益，找出威廉的情人。',
      },
      {
        id: 'char_4',
        name: '托马斯·怀特',
        age: 35,
        gender: '男',
        occupation: '私人医生',
        personality: '专业、谨慎、有同情心',
        background: '威廉的私人医生，负责他的健康管理。',
        secret: '你在威廉的要求下，给他开了一些不该开的药物，这可能导致医疗事故。',
        goal: '避免自己的医疗失误被发现，保护职业声誉。',
      },
      {
        id: 'char_5',
        name: '莉莉安·罗斯',
        age: 26,
        gender: '女',
        occupation: '秘书',
        personality: '聪明、野心勃勃、神秘',
        background: '威廉的私人秘书，工作能力出色，深得威廉信任。',
        secret: '你是威廉的情人，他承诺会离婚娶你，并把大部分财产留给你。',
        goal: '隐藏与威廉的关系，同时确保能继承遗产。',
      },
      {
        id: 'char_6',
        name: '亨利·布朗',
        age: 60,
        gender: '男',
        occupation: '管家',
        personality: '忠诚、细心、守旧',
        background: '在布莱克家工作了30年的老管家，对家族非常忠诚。',
        secret: '你知道所有人的秘密，包括威廉的外遇和公司的财务问题。',
        goal: '保护布莱克家族的名誉，找出真凶。',
      },
    ],
    clues: [
      {
        id: 'clue_1',
        name: '毒药瓶',
        type: 'key',
        location: '书房',
        description: '在书房的抽屉里发现了一个空的毒药瓶，上面有指纹。',
        discovered: false,
      },
      {
        id: 'clue_2',
        name: '遗嘱草稿',
        type: 'important',
        location: '卧室',
        description: '威廉最近修改的遗嘱草稿，显示他打算把大部分财产留给"L.R."。',
        discovered: false,
      },
      {
        id: 'clue_3',
        name: '财务报表',
        type: 'important',
        location: '书房',
        description: '公司的财务报表，显示有大笔资金去向不明。',
        discovered: false,
      },
      {
        id: 'clue_4',
        name: '情书',
        type: 'normal',
        location: '书房',
        description: '一封写给"我的挚爱"的情书，署名是W.B.。',
        discovered: false,
      },
      {
        id: 'clue_5',
        name: '药物记录',
        type: 'normal',
        location: '医药箱',
        description: '威廉的用药记录，显示他最近服用了一些不寻常的药物组合。',
        discovered: false,
      },
      {
        id: 'clue_6',
        name: '监控录像',
        type: 'key',
        location: '监控室',
        description: '晚宴当晚的监控录像，显示有人在威廉的酒杯里放了什么东西。',
        discovered: false,
      },
      {
        id: 'clue_7',
        name: '银行对账单',
        type: 'important',
        location: '书房',
        description: '艾米丽的银行对账单，显示她欠下了50万美元的债务。',
        discovered: false,
      },
      {
        id: 'clue_8',
        name: '离婚协议',
        type: 'normal',
        location: '保险箱',
        description: '一份未签署的离婚协议书，条款对玛格丽特非常不利。',
        discovered: false,
      },
    ],
    murderer: 'char_5',
    motive: '莉莉安发现威廉并不打算真的离婚娶她，而是准备解雇她并给她一笔封口费。愤怒之下，她决定毒死威廉，这样就能继承遗嘱中留给她的财产。',
    truth: `
真相揭晓：

凶手是莉莉安·罗斯（秘书）。

案件经过：
莉莉安与威廉有不正当关系，威廉承诺会离婚娶她，并修改遗嘱把大部分财产留给她。
然而，就在晚宴前一天，莉莉安偷听到威廉与律师的电话，得知威廉并不打算真的离婚，
而是准备解雇她并给她一笔封口费打发她离开。

愤怒和绝望之下，莉莉安决定毒死威廉。她利用自己秘书的身份，轻易地接触到了
威廉的私人物品。她从医生托马斯那里偷了毒药（托马斯因为给威廉开了不该开的药，
所以不敢声张），并在晚宴上趁机将毒药放入威廉的酒杯中。

监控录像显示，在晚宴进行时，莉莉安曾短暂地靠近威廉的座位，并在他的酒杯旁停留。
毒药瓶上的指纹经过鉴定，正是莉莉安的。

其他嫌疑人虽然都有动机，但都有不在场证明或者缺乏关键证据。
    `,
  },
];

// 根据ID获取剧本
export const getScriptById = (id: string): Script | undefined => {
  return SAMPLE_SCRIPTS.find(script => script.id === id);
};

// 获取所有剧本
export const getAllScripts = (): Script[] => {
  return SAMPLE_SCRIPTS;
};

// 获取剧本（包含动态生成的封面）
export const getScriptByIdWithCover = async (id: string): Promise<Script | undefined> => {
  const script = getScriptById(id);
  if (!script) return undefined;

  // 如果没有预设封面，尝试从缓存或生成
  if (!script.coverImage) {
    const { getCachedCover } = await import('../services/scriptInit');
    const cachedCover = await getCachedCover(script.id);
    if (cachedCover) {
      return { ...script, coverImage: cachedCover };
    }
  }

  return script;
};
