import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getSchema } from '@tiptap/core'
import {
  ARTICLE_PRESET,
  COMMENT_PRESET,
  EDITOR_SCHEMA_VERSION,
  NOTIFICATION_PRESET,
  POST_PRESET,
  PRIVATE_MESSAGE_PRESET,
} from '../dist/esm/index.js'

const PRESETS = [
  ARTICLE_PRESET,
  POST_PRESET,
  COMMENT_PRESET,
  NOTIFICATION_PRESET,
  PRIVATE_MESSAGE_PRESET,
]

const WIRE_TO_SCHEMA = {
  bullet_list: 'bulletList',
  ordered_list: 'orderedList',
  list_item: 'listItem',
  code_block: 'codeBlock',
  horizontal_rule: 'horizontalRule',
  hard_break: 'hardBreak',
}

const sorted = set => [...set].sort()

const nodeAttrs = {}
const markAttrs = {}

const addAttrs = (bucket, key, keys) => {
  const acc = (bucket[key] ??= new Set())
  for (const k of keys) acc.add(k)
}

for (const preset of PRESETS) {
  const schema = getSchema(preset.extensions)
  for (const wireType of preset.allowed_node_types) {
    const node = schema.nodes[WIRE_TO_SCHEMA[wireType] ?? wireType]
    addAttrs(nodeAttrs, wireType, Object.keys(node?.spec.attrs ?? {}))
  }
  for (const markType of preset.allowed_mark_types) {
    const mark = schema.marks[markType]
    addAttrs(markAttrs, markType, Object.keys(mark?.spec.attrs ?? {}))
  }
}

const mapObject = source =>
  Object.fromEntries(
    Object.keys(source)
      .sort()
      .map(key => [key, sorted(source[key])]),
  )

const presets = Object.fromEntries(
  PRESETS.map(preset => [
    preset.key,
    {
      allowed_mark_types: sorted(preset.allowed_mark_types),
      allowed_node_types: sorted(preset.allowed_node_types),
      allowed_top_level_nodes: sorted(preset.allowed_top_level_nodes),
    },
  ]),
)

const inventory = {
  $generated: 'packages/editor-schema/scripts/generate-inventory.mjs — do not edit by hand',
  mark_attrs: mapObject(markAttrs),
  node_attrs: mapObject(nodeAttrs),
  presets,
  schema_version: EDITOR_SCHEMA_VERSION,
}

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../generated/schema-inventory.json',
)
writeFileSync(outPath, `${JSON.stringify(inventory, null, 2)}\n`)
process.stdout.write(`editor-schema inventory -> ${outPath}\n`)
