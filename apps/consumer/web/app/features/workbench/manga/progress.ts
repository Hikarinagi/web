import type { BackendMangaRegion } from './manga'

export function tally(regions: BackendMangaRegion[]) {
  let done = 0
  let machine = 0
  let assisted = 0
  for (const region of regions) {
    if (region.state >= 20) done += 1
    const chosen = region.translations.find(row => row.selected)
    if (chosen?.machine) machine += 1
    else if (chosen?.from_machine) assisted += 1
  }
  return { total: regions.length, done, machine, assisted }
}
