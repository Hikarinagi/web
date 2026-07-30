import type { AnnotationRecord, RecordStorageAdapter } from '@ritojs/core/annotations'
import type { ReadingPosition } from '@ritojs/core/position'
import type { ControllerOptions } from '@ritojs/kit'
import type { components } from '@hikarinagi/api-contract/v3'
import type { BackendReaderVolumeState } from '~/components/hikari-reader/types'

export type BackendReadingPosition = components['schemas']['ReadingPositionDto']

interface PositionStorageOptions {
  volumeId: number
  initialPosition?: ReadingPosition | null
}

interface AnnotationStorageOptions {
  initialAnnotations: BackendReaderVolumeState['annotations']
}

export function createPositionStorage(
  options: PositionStorageOptions,
): ControllerOptions['positionStorage'] {
  let stored: string | null = options.initialPosition
    ? JSON.stringify(options.initialPosition)
    : null

  return {
    async load() {
      return stored
    },
    async save(value: string) {
      stored = value
    },
    async clear() {
      stored = null
    },
  }
}

export function createAnnotationStorage(options: AnnotationStorageOptions): RecordStorageAdapter {
  return {
    async load() {
      return options.initialAnnotations.map(toRitoAnnotation)
    },
    async save() {
      // no-op: useReaderAnnotations owns all create/update/delete network calls
    },
  }
}

export function toRitoAnnotation(
  annotation: BackendReaderVolumeState['annotations'][number],
): AnnotationRecord {
  return {
    id: annotation.client_id,
    kind: toRitoKind(annotation.kind),
    target: annotation.target as unknown as AnnotationRecord['target'],
    color: annotation.highlight_color,
    note: annotation.note ?? undefined,
    createdAt: Date.parse(annotation.created_at),
    modifiedAt: annotation.modified_at ? Date.parse(annotation.modified_at) : undefined,
  }
}

export function toBackendKind(kind: AnnotationRecord['kind']) {
  if (kind === 'underline') return 'UNDERLINE'
  return 'HIGHLIGHT'
}

export function toBackendPosition(position: ReadingPosition): BackendReadingPosition {
  return {
    ...(position.locator
      ? {
          locator: {
            spineIdref: position.locator.spineIdref,
            manifestHref: position.locator.manifestHref,
            chapterProgress: position.locator.chapterProgress,
            ...(position.locator.sourcePoint
              ? {
                  sourcePoint: {
                    nodePath: [...position.locator.sourcePoint.nodePath],
                    textOffset: position.locator.sourcePoint.textOffset,
                  },
                }
              : {}),
          },
        }
      : {}),
    projection: {
      spreadIndex: position.projection.spreadIndex,
      pageIndex: position.projection.pageIndex,
    },
    progress: position.progress,
    timestamp: position.timestamp,
  }
}

function toRitoKind(kind: BackendReaderVolumeState['annotations'][number]['kind']) {
  if (kind === 'UNDERLINE') return 'underline'
  return 'highlight'
}
