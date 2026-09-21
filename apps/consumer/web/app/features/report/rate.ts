import type { ReportBody } from './report'

export type RateReportKind =
  'galgame_rate' | 'light_novel_rate' | 'light_novel_volume_rate' | 'manga_rate'

export async function reportRate(
  kind: RateReportKind,
  workId: number,
  rateId: number,
  body: ReportBody,
): Promise<void> {
  switch (kind) {
    case 'galgame_rate':
      await hikariRequest<'/api/v3/galgames/{id}/rates/{rateId}/report', 'post'>(
        '/api/v3/galgames/{id}/rates/{rateId}/report',
        { method: 'post', path: { id: workId, rateId }, body },
      )
      return
    case 'light_novel_rate':
      await hikariRequest<'/api/v3/light-novels/{id}/rates/{rateId}/report', 'post'>(
        '/api/v3/light-novels/{id}/rates/{rateId}/report',
        { method: 'post', path: { id: workId, rateId }, body },
      )
      return
    case 'light_novel_volume_rate':
      await hikariRequest<'/api/v3/light-novel-volumes/{id}/rates/{rateId}/report', 'post'>(
        '/api/v3/light-novel-volumes/{id}/rates/{rateId}/report',
        { method: 'post', path: { id: workId, rateId }, body },
      )
      return
    case 'manga_rate':
      await hikariRequest<'/api/v3/mangas/{id}/rates/{rateId}/report', 'post'>(
        '/api/v3/mangas/{id}/rates/{rateId}/report',
        { method: 'post', path: { id: workId, rateId }, body },
      )
  }
}
