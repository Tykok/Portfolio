import type { DesktopTheme } from 'context/OSContext';

import { out } from '../lines';
import type { Line } from '../types';

export const VALID_THEMES: DesktopTheme[] = ['bliss', 'field', 'dusk', 'matrix', 'rose'];

export const LOGO: string[] = [
  '   _____ _  __  ___  ____  __ __',
  '  |_   _|  \\/  |/ _ \\/ __ \\/ _ \\',
  '    | | | |\\/| | (_) \\__ \\> <',
  '    |_| |_|  |_|\\___/____/_/_\\_\\',
];

export const NEOFETCH: Array<[string, string]> = [
  ['user', 'tykok@ticoqos'],
  ['OS', 'TicoqOS 1.0 (Luna)'],
  ['Kernel', 'Coq-6.51.77'],
  ['Uptime', '∞ coffees'],
  ['Shell', 'ticoq-sh'],
  ['Resolution', 'nostalgia × pride'],
  ['CPU', 'Backend Core i∞'],
  ['Memory', '8 projects / 1 developer'],
];

export const FORTUNES: string[] = [
  'There are only two hard problems: cache invalidation, naming things, and off-by-one errors.',
  'In prod, no one can hear you scream.',
  "The best code is the code you didn't have to write.",
  'Works on my machine ¯\\_(ツ)_/¯',
  'A well-placed Postgres index beats a thousand micro-optimizations.',
  'Always write code as if the person maintaining it is you, six months from now.',
];

export function cowsay(message: string): Line[] {
  const rule = '-'.repeat(message.length + 2);
  return out(`  ${rule}`, `< ${message} >`, `  ${rule}`, '     \\   🐓', '      \\      ^^');
}
