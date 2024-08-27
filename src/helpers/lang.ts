import en from 'src/langs/en.json'
import fr from 'src/langs/fr.json'

const getForKey = (lang: string, key: string): string => {
  return Object.entries(lang === 'fr' ? fr : en).find(([k]) => k === key)?.[1] || ''
}

export const Lang = {
  getForKey
}
