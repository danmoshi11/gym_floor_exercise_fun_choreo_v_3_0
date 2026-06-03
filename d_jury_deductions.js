// ==========================================
// D裁判员降组与无效判定库 (D-Jury Downgrades)
// 包含精准的 target_ids 映射及操作动作布尔值
// ==========================================

const d_jury_deductions = [
  // ----------------------------------------
  // 1. 全局与通用动作无效判定 (Global/General)
  // ----------------------------------------
  { 
    "element_category": "通用规则 (General)", 
    "fault_condition": "教练员在运动员完成动作时提供帮助", 
    "d_jury_actions": {
      "no_dv": true,               // 无难度价值
      "no_cv": true,               // 无连接价值
      "no_cr": true,               // 无编排要求
      "no_dismount_bonus": true,   // 无下法加分
      "downgrade_to_other": false  // 不涉及降组，直接无效
    },
    "description": "严重犯规，动作完全不予承认",
    "target_tags": ["all"] 
  },
  { 
    "element_category": "通用规则 (General)", 
    "fault_condition": "动作脚未先落地或未按规定的姿势落地 (如未站立着陆/摔倒未先触脚)", 
    "d_jury_actions": {
      "no_dv": true,
      "no_cv": true,
      "no_cr": true,
      "no_dismount_bonus": true,
      "downgrade_to_other": false
    },
    "description": "未成功完成动作",
    "target_tags": ["all"] 
  },

  // ----------------------------------------
  // 2. 空翻姿态降组判定 (Acro Saltos Downgrades)
  // ----------------------------------------
  { 
    "element_category": "直体空翻 (Stretched Saltos)", 
    "fault_condition": "未能维持直体姿势（髋角屈>10°，未能保持绝大部分旋转在直体姿势）", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true // 认作对应的屈体空翻
    },
    "description": "直体空翻降级为屈体空翻 (Stretched becomes Pike)",
    "target_ids": [
      "4.202", "4.302-360", "4.302-540", "4.402", "4.502", "4.602", // 前直系列
      "4.805", // 阿直两周
      "5.101-layout", "5.201-360layout", "5.201-180", "5.301-540", "5.301-720", "5.401", "5.501", "5.601", // 后直单周系列
      "5.603", "5.703", "5.803", "5.903" // 后直两周系列
    ],
    "_targets_annotation": {
      "4.202": "前直", "4.302-360": "前直360", "4.805": "阿直两周",
      "5.101-layout": "后直", "5.803": "直体旋/后直360旋", "5.903": "后直720旋"
      // 省略部分中文释义，囊括了所有 data.js 中的直体空翻
    }
  },
  { 
    "element_category": "屈体空翻 (Piked Saltos)", 
    "fault_condition": "膝角 < 135° (严重屈膝)", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true // 认作对应的团身空翻
    },
    "description": "屈体空翻降级为团身空翻 (Pike becomes Tuck)",
    "target_ids": [
      "4.101-pike", "4.201-180pike", "4.601-pike", // 前屈系列
      "4.205-pike", "4.605", // 阿屈系列
      "5.101-pike", "5.402-pike", "5.502-pike360" // 后屈系列
    ],
    "_targets_annotation": {
      "4.101-pike": "前屈", "4.601-pike": "前屈两周", "4.605": "阿屈两周",
      "5.101-pike": "后屈", "5.402-pike": "后屈两周", "5.502-pike360": "屈体旋"
    }
  },
  { 
    "element_category": "直体两周空翻 (Double Salto Stretched)", 
    "fault_condition": "抓大腿以协助完成第二周空翻", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true // 直接降为团身两周
    },
    "description": "借力犯规，直体两周直接降级为团身两周",
    "target_ids": [
      "5.603", "5.703", "5.803", "5.903"
    ],
    "_targets_annotation": {
      "5.603": "后直两周", "5.703": "后直两周180", "5.803": "直体旋", "5.903": "后直720旋"
    }
  },

  // ----------------------------------------
  // 3. 跳步 180度劈叉要求降组判定 (Leaps & Jumps Split Downgrades)
  // ----------------------------------------
  { 
    "element_category": "要求180°劈叉的跳步与立转", 
    "fault_condition": "劈叉不足 > 45°", 
    "d_jury_actions": {
      "no_dv": true,              // 可能无难度
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true  // 或认作《标准》中的其他动作
    },
    "description": "劈叉严重不足超过45度，认作无难度价值或较低等级动作",
    "target_ids": [
      "1.101", "1.201", "1.301",  // 跨跳系列
      "1.202", "1.302", "1.402",  // 剪交/交换腿系列
      "1.204", "1.304", "1.404",  // 强森/交换腿带转体系列
      "1.205",                    // 交换腿跳 (普通)
      "1.107", "1.207", "1.307", "1.407", // 劈叉跳系列
      "1.108", "1.208",           // 分腿屈体/横劈叉成俯撑
      "1.109",                    // 西松跳(要求倾斜劈叉180)
      "1.209", "1.309", "1.409", "1.305", "1.405", // 所有结环跳系列
      "2.203", "2.403", "2.503",  // 高举腿立转 (带纵劈叉)
      "2.206"                     // 依柳辛
    ],
    "_targets_annotation": {
      "1.101": "跨跳", "1.301": "跨跳360", "1.202": "剪交跳/交换腿跳", "1.402": "剪交360/交换腿360",
      "1.204": "交换腿90(强森)", "1.304": "交换腿180", "1.404": "交换腿360",
      "1.107": "劈叉跳", "1.407": "劈叉540", "1.209": "西松结环/劈叉结环", "1.409": "剪交结环180",
      "1.305": "交换腿结环", "2.403": "高举腿720"
    }
  },

  // ----------------------------------------
  // 4. 结环跳专属特征降组 (Ring Leaps Specific Downgrades)
  // ----------------------------------------
  { 
    "element_category": "所有结环跳 (All Ring Leaps/Jumps)", 
    "fault_condition": "无背弓且头未后仰 / 后脚低于头顶高", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true // 认作普通的跨跳/交换腿跳/劈叉跳
    },
    "description": "结环特征不足，降组为不带结环的基础跳步",
    "target_ids": [
      "1.209", // 西松结环, 鹿结环, 劈叉结环, 劈叉结环180
      "1.309", // 跨结环, 劈叉结环360
      "1.409", // 剪交结环180, 跨结环180
      "1.305", // 交换腿结环
      "1.405"  // 交换腿结环180
    ],
    "_targets_annotation": {
      "1.209": "包含:西松结环/鹿结环/劈叉结环/劈叉结环180",
      "1.309": "包含:跨结环/劈叉结环360",
      "1.409": "包含:剪交结环180/跨结环180",
      "1.305": "交换腿结环",
      "1.405": "交换腿结环180"
    }
  },

  // ----------------------------------------
  // 5. 交换腿与特定跳步专项降组
  // ----------------------------------------
  { 
    "element_category": "带转体的交换腿跳/强森跳 (Switch Leap/Johnson with turn)", 
    "fault_condition": "转体度数不足 (如缺角超30°)", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true 
    },
    "description": "转体不足时，认作较低度数的转体动作",
    "target_ids": [
      "1.302", "1.402", // 交换腿180, 交换腿360
      "1.204", "1.304", "1.404" // 交换腿90, 交换腿180, 交换腿360 (强森系列)
    ],
    "_targets_annotation": {
      "1.302": "交换腿180/剪交180", "1.404": "交换腿360(Bulimar)"
    }
  },
  { 
    "element_category": "猫跳 (Cat Leap)", 
    "fault_condition": "缺乏依次交换腿", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true // 认作团身双脚跳
    },
    "description": "无依次交换腿，失去猫跳特征",
    "target_ids": ["1.111", "1.211", "1.311"],
    "_targets_annotation": { "1.111": "猫跳", "1.311": "猫跳720" }
  },
  { 
    "element_category": "团身跳/分腿屈体跳/狼跳 (Tuck/Pike/Wolf Jumps)", 
    "fault_condition": "髋角或膝角 > 135°", 
    "d_jury_actions": {
      "no_dv": true,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true
    },
    "description": "姿态严重形变，无难度或认作其他低价值动作",
    "target_ids": [
      "1.213", "1.313", // 团跳系列
      "1.107", "1.307", "1.407", "1.108", "1.208", // 劈叉/屈体跳系列
      "1.105", "1.114", "1.214", "1.514" // 狼跳系列
    ],
    "_targets_annotation": {
      "1.313": "团跳720", "1.107": "劈叉跳", "1.514": "狼跳720"
    }
  },

  // ----------------------------------------
  // 6. 立转专项降组 (Turns on 1 leg)
  // ----------------------------------------
  { 
    "element_category": "所有单腿立转 (Turns on 1 leg)", 
    "fault_condition": "转体度数不足 / 支撑腿过早掉下 (Under turning > 30°)", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true
    },
    "description": "肩和髋的位置决定完成度，未完成足额度数降级为较低度数的转体。",
    "target_tags": ["turns"] 
  },
  { 
    "element_category": "特定腿位立转 (Turns with specific leg positions)", 
    "fault_condition": "自由腿未保持在规定位置 (如掉落低于水平)", 
    "d_jury_actions": {
      "no_dv": false,
      "no_cv": false,
      "no_cr": false,
      "no_dismount_bonus": false,
      "downgrade_to_other": true
    },
    "description": "要求自由腿前举、侧举或后举的转体，若整个转体过程中掉下，则降级为基本立转",
    "target_ids": [
      "2.202", "2.402", "2.502", // 水平腿
      "2.203", "2.403", "2.503", // 高举腿/劈叉
      "2.204", "2.404"           // 阿提丢/后扳腿
    ],
    "_targets_annotation": {
      "2.402": "水平720", "2.403": "高举腿720", "2.404": "阿提丢720/后扳腿720"
    }
  }
];

window.d_jury_deductions = d_jury_deductions;