export const notification = {
  interaction: {
    mention: { title: '提到了你' },
    follow: { title: '关注了你' },
    reply: { title: '回复了你的评论' },
    comment: {
      galgame: '评论了你的游戏',
      light_novel: '评论了你的轻小说',
      light_novel_volume: '评论了你的分卷',
      person: '评论了你的人物',
      character: '评论了你的角色',
      producer: '评论了你的厂商',
      post: '评论了你的图文',
      article: '评论了你的文章',
      galgame_rate: '评论了你的评分',
      light_novel_rate: '评论了你的评分',
      light_novel_volume_rate: '评论了你的评分',
      manga_rate: '评论了你的评分',
    },
    like: {
      one: {
        comment: '赞了你的评论',
        post: '赞了你的图文',
        article: '赞了你的文章',
        galgame_rate: '赞了你的评分',
        light_novel_rate: '赞了你的评分',
        light_novel_volume_rate: '赞了你的评分',
        manga_rate: '赞了你的评分',
      },
      many: {
        comment: '等 {count} 人赞了你的评论',
        post: '等 {count} 人赞了你的图文',
        article: '等 {count} 人赞了你的文章',
        galgame_rate: '等 {count} 人赞了你的评分',
        light_novel_rate: '等 {count} 人赞了你的评分',
        light_novel_volume_rate: '等 {count} 人赞了你的评分',
        manga_rate: '等 {count} 人赞了你的评分',
      },
    },
    dm: {
      one: '给你发了私信',
      many: '给你发了 {count} 条私信',
    },
  },
  contribution: {
    closed: {
      title: '你的变更请求「{summary}」已关闭',
      untitled: '你的变更请求已关闭',
      body: '维基改为直接编辑，附上来源的修改会立即生效。这条请求没有合并，已经关闭；你提交的内容附在下面，可以在条目编辑页重新填写。',
      body_empty:
        '维基改为直接编辑，附上来源的修改会立即生效。这条请求没有合并，已经关闭；你可以在条目编辑页重新填写。',
    },
  },
  application: {
    approved: { title: '通过了你的创作组申请' },
    rejected: { title: '驳回了你的创作组申请' },
  },
  group: {
    added: { title: '把你加入了「{group_name}」' },
    removed: { title: '把你移出了「{group_name}」' },
  },
  wiki: {
    task_stopped: {
      title: '维基任务「{task}」已自动停止',
      body: '其最近 {window} 次编辑中有 {reverted} 次被撤销，因此该任务已停止。请查明原因，然后在后台的任务列表中重新开启。',
    },
    unnamed: '未命名',
    time: '时间：{at, date, date_time}',
    entry_changed: {
      one: '修改了你关注的条目「{entry}」',
      many: '修改了你关注的条目「{entry}」，共有 {count} 次新修改',
      summary: '修改内容：{summary}',
      latest: '最近一次修改：{summary}',
      editor: '修改人：{editor}',
      earlier: '此前另有 {earlier} 次修改，可在「我关注的」修改列表中查看。',
    },
    edit_reverted: {
      one: '撤销了你对条目「{entry}」的修改',
      many: '撤销了你对「{entry}」等 {count} 个条目的修改',
      entries:
        '条目：{count, plural, =1 {{first}} =2 {{first}、{second}} =3 {{first}、{second}、{third}} other {{first}、{second}、{third}等 {count} 个条目}}',
      summary: '被撤销的修改：{summary}',
      editor: '撤销人：{editor}',
      note: '撤销说明：{note}',
      action: '如认为原修改无误，可在条目编辑页附上来源后重新填写。',
    },
    value_deprecated: {
      one: '作废了你在条目「{entry}」添加的{count, plural, =1 {值} other { {count} 个值}}',
      many: '作废了你在「{entry}」等 {entries} 个条目中添加的{count, plural, =1 {值} other { {count} 个值}}',
      entry: '条目：{entry}',
      merged: '条目：{entry}（已并入「{merged_into}」）',
      value: '{property}「{value}」',
      property: '{property}',
      reason:
        '理由：{reason, select, CONTRADICTED {内容有误} WRONG_ENTRY {不属于此条目} DUPLICATE {与另一个值重复} RESCHEDULED {发售日已改期} BAD_SOURCE {无从查证} other {已撤销}}',
      value_note: '说明：{note}',
      source: '与之矛盾的来源：{url}',
      excerpt: '摘录：「{excerpt}」',
      unlisted: '另有 {rest} 个值未列出，可在该次修改中查看。',
      editor: '作废人：{editor}',
      note: '修改说明：{note}',
      action: '如认为上述值无误，可在条目编辑页将其恢复，并附上来源。',
    },
  },
  epub: {
    result: {
      PASSED: '你提交的 epub 校对已通过',
      REJECTED: '你提交的 epub 校对被驳回',
      NEEDS_HUMAN: '你提交的 epub 校对转人工复核',
      FAILED: '你提交的 epub 校对处理失败',
    },
    withheld: '账号注册未满 {days} 天，本次未获得光点。',
  },
  moderation: {
    result: {
      comment: '你的评论未通过审核',
      rate: '你的短评未通过审核',
      post: '你的图文未通过审核',
      article: '你的文章未通过审核',
      account: '你的账号未通过审核',
      emoji: '你的表情未通过审核',
      favorite_collection: '你的收藏夹未通过审核',
      profile: '你的资料未通过审核',
      avatar: '你的头像未通过审核',
      banner: '你的头图未通过审核',
      avatar_banner: '你的头像和头图未通过审核',
      topic: '你的话题未通过审核',
    },
  },
  appeal: {
    upheld: { title: '你的申诉已通过', body: '内容已恢复。' },
    denied: { title: '你的申诉未通过' },
  },
  achievement: {
    unlock: { title: '解锁新装扮「{decoration_name}」' },
  },
  telegram: {
    code: {
      title: 'Telegram 绑定验证码',
      code: '验证码：{code}，{ttl_minutes} 分钟内有效。',
      hint: '回到 Telegram 把它发给机器人即可完成绑定。如果这不是你的操作，忽略这条消息即可。',
    },
  },
  manga: {
    position:
      '{position, select, volume {第 {number} 卷} volume_edition {第 {number} 卷（{edition}）} single {单行本} single_edition {单行本（{edition}）} chapter {第 {number} 话} chapters {第 {number} 至 {last} 话} extra {番外「{title}」} named {{title}} other {番外}}',
    work: '{series} {position}',
    update: {
      title: '你追的漫画《{work_title}》更新啦',
      latest: '最新已更新到{latest}',
      progress: '你看到{progress}，还有 {unread_chapters} 话没看',
      unread: '还有 {unread_chapters} 话没看',
    },
  },
  novel: {
    update: {
      title: '你追的轻小说《{work_title}》更新啦',
      titled: '新发布了 {volume}',
      numbered: '新发布了第 {number} 卷',
      untitled: '新发布了新的一卷',
    },
  },
  workbench: {
    project: {
      novel: '小说项目：《{work}》',
      manga: '漫画项目：《{work}》',
    },
    note: '说明：{note}。',
    note_punctuated: '说明：{note}',
    volume_changed: '项目现改为第 {number} 卷',
    submitted: {
      one: '提交了项目《{work}》，等待审核',
      many: '有 {count} 次项目提交等待审核',
    },
    approved: {
      actor: '通过了你的项目《{work}》并已发布',
      system: '你的项目《{work}》已通过并发布',
    },
    rejected: {
      actor: '退回了你的项目《{work}》',
      system: '你的项目《{work}》已退回',
    },
    stale: {
      title: '你的项目《{work}》已被释放',
      body: '项目长期没有进展，已释放认领。恢复项目后可以继续。',
    },
    held: {
      one: '项目《{work}》转为待处理',
      many: '有 {count} 个项目转为待处理',
      body: '项目所在的卷已在维基中并入另一卷，而那一卷已有内容或其他投稿。项目已暂停发布，页面保留，重新指定所在的卷后恢复。',
    },
    resumed: {
      actor: '恢复了你的项目《{work}》',
      system: '你的项目《{work}》已恢复',
      body: '项目所在的卷已重新指定，项目已恢复。',
    },
    remounted: {
      title: '你的项目《{work}》所在的卷已改正',
      body: '项目所在的卷已改正，已发布的内容照常可读。',
    },
  },
  ai: {
    route: {
      suspended: '{channel} 上的 {model} 已暂停',
      resumed: '{channel} 上的 {model} 已恢复',
      kind: {
        AUTH: '认证失败',
        QUOTA: '余额或额度用完',
        NOT_FOUND: '未找到模型',
      },
    },
  },
  apm: {
    alert: {
      fault_rate: {
        title: '故障率突增：{service}（{environment}）',
        body: '最近 5 分钟 {total} 次请求里 {faults} 次是服务端故障，失败率 {rate, number, ::percent .0}，此前一小时为 {baseline_rate, number, ::percent .0}。',
      },
      new_fault: {
        title: '新出现的故障：{count} 个',
        fault: '{service}（{environment}）{name}，{occurrences} 次',
        fault_message: '{service}（{environment}）{name}：{message}，{occurrences} 次',
        unlisted: '另有 {unlisted} 个未列出',
      },
      link: '查看：{url}',
    },
    issue_assigned: {
      title: '在 APM 指派了一个错误给你',
      error: '错误：{error_name}',
      link: '处理地址：{url}',
    },
  },
  lottery: {
    won: {
      title: '你在「{lottery_title}」中获得了{tier}',
      prize: '奖品：{prize_name}。',
      claim: '请在 {claim_by, date, month_day_time} 前到「我的奖品」领取，逾期视为放弃。',
      granted: '奖品已发放到你的账户，无需领取。',
    },
    standby: {
      title: '你递补获得了「{lottery_title}」的{tier}',
    },
    remind: {
      title: '「{lottery_title}」的奖品即将过期',
      body: '你获得的{prize_name}尚未领取，请在 {claim_by, date, month_day_time} 前到「我的奖品」领取，逾期视为放弃。',
    },
    delivered: {
      title: '「{lottery_title}」的奖品已发放',
      body: '{prize_name}已发放到你填写的账号 {account}，请查收。',
    },
  },
} as const
