import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const EDITOR_RESOURCE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Galgame', value: 'galgame' },
  { label: '轻小说', value: 'light-novel' },
  { label: '轻小说卷', value: 'light-novel-volume' },
  { label: '漫画', value: 'manga' },
  { label: '漫画单行本', value: 'manga-volume' },
  { label: '人物', value: 'person' },
  { label: '厂商', value: 'producer' },
  { label: '角色', value: 'character' },
  { label: '标签', value: 'tag' },
]

export const editorLaunchSchema = v.object({
  resource_type: v.picklist(
    EDITOR_RESOURCE_OPTIONS.map(option => option.value),
    '请选择资源类型',
  ),
  resource_id: v.pipe(
    v.number('请输入资源 ID'),
    v.integer('资源 ID 必须是整数'),
    v.minValue(1, '资源 ID 必须大于 0'),
  ),
})

export type EditorLaunchValues = v.InferOutput<typeof editorLaunchSchema>

export const editorNewSchema = v.object({
  resource_type: v.picklist(
    EDITOR_RESOURCE_OPTIONS.map(option => option.value),
    '请选择资源类型',
  ),
})

export type EditorNewValues = v.InferOutput<typeof editorNewSchema>

export const editorNewResolver = valibotResolver(editorNewSchema)

export const editorLaunchInitialValues: { resource_type: string; resource_id: number | null } = {
  resource_type: 'galgame',
  resource_id: null,
}

export const editorLaunchResolver = valibotResolver(editorLaunchSchema)
