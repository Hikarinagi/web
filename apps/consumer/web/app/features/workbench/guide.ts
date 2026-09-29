export interface GuideSection {
  title: string
  lines: string[]
  keys?: { combos: string[][]; text: string }[]
}

export const MAC_KEY_NOTE = '在 Mac 上，用 ⌘ 代替 Ctrl。'

const PREVIEW = '在导入预览中，你可以重命名章节、将章节合并到上一章，或从某个段落开始拆分章节。'
const INVITE = '在「更多」›「协作者」中邀请协作者并分配角色。'
const CREDITS = '在「更多」›「制作信息」中添加其他贡献者，例如图源。发布时，这些信息会写入电子书。'

export const NOVEL_GUIDE: Record<'ENTRY' | 'TRANSLATION', GuideSection[]> = {
  ENTRY: [
    {
      title: '导入正文',
      lines: [
        '项目还没有章节时，工作页面会显示导入区域。你可以导入 EPUB 或 TXT 文件、导入网站上已有的电子书，或点击「手动输入」逐章输入正文。',
        PREVIEW,
      ],
    },
    {
      title: '编辑正文',
      lines: [
        '在左侧选择章节，在右侧输入正文。停止输入后，修改会自动保存。',
        '点击「新增章节」添加章节。章节菜单可以修改、上移、下移或删除章节。',
        '如果两位成员同时修改同一章，后保存的一方需要重新载入。',
      ],
    },
    {
      title: '协作',
      lines: [
        `${INVITE}译者可以录入正文。管理还可以导入正文、编辑章节、邀请协作者并提交审核。`,
        CREDITS,
      ],
    },
    {
      title: '提交审核',
      lines: ['点击顶部的「提交审核」。审核通过后，正文会转换为电子书，添加到分卷页。'],
    },
  ],
  TRANSLATION: [
    {
      title: '导入原文',
      lines: [
        '项目还没有章节时，工作页面会显示导入区域。导入原版 EPUB 或 TXT 文件后，原文会被分成章节和段落。',
        PREVIEW,
      ],
    },
    {
      title: '翻译',
      lines: [
        '在左侧选择章节，在每个段落旁边撰写译文。停止输入后，译文会自动保存。',
        '右侧的「参考资料」面板列出术语、翻译记忆、其他成员的译文和批注。',
        '每位成员撰写自己的译文，不会覆盖他人的译文。校对可以修改译文，并选定其中一条。',
        '使用筛选可以只显示未翻译的段落、未经修改的 AI 翻译或需修改的段落。',
      ],
    },
    {
      title: '快捷键',
      lines: [MAC_KEY_NOTE],
      keys: [
        { combos: [['Ctrl', 'Enter']], text: '保存并转到下一段' },
        { combos: [['Ctrl', 'Shift', 'Enter']], text: '转到下一个未翻译的段落' },
        { combos: [['Alt', '↑']], text: '上一段' },
        { combos: [['Alt', '↓']], text: '下一段' },
        { combos: [['Esc']], text: '离开输入框' },
      ],
    },
    {
      title: '术语表与 AI 翻译',
      lines: [
        '术语表中的术语适用于该系列的每一卷。包含禁用译法的译文无法定稿。',
        '「AI 翻译」可以为全卷或本章中未翻译的段落起草译文。AI 译文在你修改之前会标记为机翻。额度用完后，可以用光点兑换。',
      ],
    },
    {
      title: '协作',
      lines: [
        `${INVITE}译者撰写译文。校对还可以校对和选定译文。管理还可以重新导入原文、邀请协作者并提交审核。`,
        CREDITS,
      ],
    },
    {
      title: '提交审核',
      lines: [
        '每个段落都有译文后，点击顶部的「提交审核」。审核通过后，译文会添加到分卷页，并根据其中未经修改的 AI 翻译所占的比例，标注为人工翻译、机翻润色或机翻。',
      ],
    },
  ],
}
