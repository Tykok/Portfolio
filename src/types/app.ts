import type { LocalizedString } from './lang';

export type AppKey = 'about' | 'projects' | 'cv' | 'contact' | 'terminal' | 'media' | 'web';

export type IconKind = 'pc' | 'folder' | 'doc' | 'mail' | 'term' | 'media' | 'globe';

export interface AppMeta {
  key: AppKey;
  icon: IconKind;
  defaultWidth: number;
  defaultHeight: number;
  title: LocalizedString;
  short: LocalizedString;
  hidden?: boolean;
}
