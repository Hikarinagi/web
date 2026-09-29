import type { BackendNovelProjectListItem } from './workbench'

type VolumeSummary = BackendNovelProjectListItem['volume']

export function volumeTitle(volume: VolumeSummary): string {
  const series = volume.series.name_cn || volume.series.name
  const label =
    volume.volume_label || (volume.volume_number != null ? `第 ${volume.volume_number} 卷` : null)
  return label ? `${series} ${label}` : volume.name_cn || volume.name || series
}

export function volumeHead(volume: VolumeSummary): { title: string; cover: string | null } {
  return { title: volumeTitle(volume), cover: volume.covers[0]?.media.src ?? null }
}
