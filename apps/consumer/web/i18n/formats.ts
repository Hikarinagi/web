export const DATETIME_FORMATS = {
  'zh-CN': {
    numeric: { year: 'numeric', month: 'numeric', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: false },
  },
} satisfies Record<string, Record<string, Intl.DateTimeFormatOptions>>
