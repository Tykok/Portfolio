import type { LocalizedString } from './lang';

export type AppKey = 'about' | 'projects' | 'cv' | 'contact' | 'terminal' | 'articles' | 'web';

export type IconKind = 'pc' | 'folder' | 'doc' | 'mail' | 'term' | 'news' | 'globe';

export interface AppMeta {
  key: AppKey;
  icon: IconKind;
  defaultWidth: number;
  defaultHeight: number;
  title: LocalizedString;
  short: LocalizedString;
  hidden?: boolean;
}
