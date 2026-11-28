export const review = {
  reason: {
    bundle: '疑似多卷合集，非单卷',
    chinese_script: '正文汉字占绝对多数且假名占比低，自动日语判定已转人工复核',
    unsettled: '未能确定这份文件所在的卷或话，请填写卷号或话号后重新提交',
    unreadable: '文件中的图片无法读取',
    unknown:
      '未能从文件看出是哪一卷、哪一话或哪篇番外，请在投稿信息里填写书上印的卷号或话号，番外填写它的名称，再重新提交',
    extra: '文件是番外，但上面没有印标题，请在投稿信息里填写这篇番外的名称，再重新提交',
    mismatch: '文件看起来是{position}，与填写的“{hint}”不一致',
    unsure: '文件看起来是{position}，但依据不足',
    no_volume: '维基里没有对应的{position}',
    several: '文件收录了{position}，一份投稿只能是一话或一整卷',
    taken: {
      volume: '这一卷已有其他投稿',
      chapter: '这一话已有其他投稿',
    },
    refused: '文件是{position}，但无法放到这个位置',
    moved: '这份文件判断为{position}，与已发布的{published}不符',
    moderation: '内容审核未通过',
    hidden: '内容已被管理员下架',
    reported: '内容因举报被下架',
  },
} as const
