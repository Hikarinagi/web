import { tryTranslate } from '~/utils/i18n'

export const websiteLabel = (code: string) => tryTranslate(`entity.website.${code}`) ?? code
