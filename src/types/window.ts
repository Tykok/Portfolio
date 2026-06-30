import type { AppKey } from './app';

export interface WindowState {
  id: string;
  key: AppKey;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  closing: boolean;
  active: boolean;
  moX?: number;
  moY?: number;
}

export type WindowAction =
  | { type: 'OPEN'; key: AppKey; meta: { defaultWidth: number; defaultHeight: number } }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MINIMIZE'; id: string; moX?: number; moY?: number }
  | { type: 'MAXIMIZE'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'RESIZE'; id: string; w: number; h: number }
  | { type: 'START_CLOSE'; id: string };
