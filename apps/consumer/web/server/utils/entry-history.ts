import type { ApiData } from '@hikarinagi/api-contract/v3'

type Revisions = ApiData<'/api/v3/wiki/entries/{id}/revisions', 'get'>

export function historyRowsOf(entry: { id: number; label: string }, revisions: Revisions) {
  return {
    ...revisions,
    items: revisions.items.map(item => ({
      id: item.number,
      revision: item.number,
      created_at: item.created_at,
      editor: item.edit.editor,
      summary: item.edit.summary,
      note: item.edit.note,
      reverted: item.edit.reverted_at !== null,
      imported: item.edit.batch.imported,
      batch_id: item.edit.batch.id,
      edits: [
        {
          id: item.edit.id,
          created_at: item.created_at,
          summary: item.edit.summary,
          entries: [{ id: entry.id, title: entry.label }],
        },
      ],
    })),
  }
}
