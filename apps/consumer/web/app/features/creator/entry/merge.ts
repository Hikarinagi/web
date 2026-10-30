const MOVED: [RegExp, string][] = [
  [/_rates$/, '评分'],
  [/_favorite_items$/, '收藏'],
  [/_tags$/, '标签'],
  [/downloads|download_grants|download_tasks/, '下载资源'],
  [/_link_groups$|_source_links$/, '资源链接'],
  [/_covers$|_cover_votes$/, '封面与封面投票'],
  [/_related_works$/, '提及该条目的文章、帖子与板块'],
  [/^manga_chapters$/, '章节'],
  [/reading|read_progresses|chapter_reads/, '阅读记录'],
]

export function movedLabel(table: string): string {
  return MOVED.find(([pattern]) => pattern.test(table))?.[1] ?? '其他资料'
}
