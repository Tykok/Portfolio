import type { Line } from './types';

export const out = (...texts: string[]): Line[] => texts.map((text) => ({ type: 'output', text }));
export const dim = (...texts: string[]): Line[] => texts.map((text) => ({ type: 'dim', text }));
export const err = (text: string): Line[] => [{ type: 'error', text }];

/** One blank spacer. Dim rather than output so it never picks up a colour. */
export const blank: Line[] = [{ type: 'dim', text: '' }];

/** Two columns without a table. Long left cells push their right cell over. */
export const col = (left: string, right: string, width = 22): string => `  ${left.padEnd(width)}${right}`;

/** A group heading, padded out to a fixed rule so the sections line up. */
export const heading = (label: string): Line[] => out(`  ── ${label} ${'─'.repeat(Math.max(0, 44 - label.length))}`);

/** Bullets, indented under whatever printed them. */
export const bullets = (items: string[]): Line[] => out(...items.map((item) => `    • ${item}`));
