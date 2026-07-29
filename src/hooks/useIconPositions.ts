import { useEffect, useState } from 'react';

import { appsMeta } from 'data/apps';

const STORAGE_KEY = 'tq-icon-pos';
const ICON_COL_X = 14;
const ICON_ROW_H = 90;
const ICON_START_Y = 14;

type Positions = Record<string, { x: number; y: number }>;

function buildDefaults(): Positions {
  const out: Positions = {};
  appsMeta
    .filter((a) => !a.hidden)
    .forEach((app, idx) => {
      out[app.key] = { x: ICON_COL_X, y: ICON_START_Y + idx * ICON_ROW_H };
    });
  return out;
}

export function useIconPositions() {
  const [positions, setPositions] = useState<Positions>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...buildDefaults(), ...JSON.parse(raw) };
    } catch {
      /* Unreadable or malformed storage — fall through to the defaults. */
    }
    return buildDefaults();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
      /* Private mode or quota exceeded — icon layout just won't persist. */
    }
  }, [positions]);

  const moveIcon = (key: string, x: number, y: number) => setPositions((prev) => ({ ...prev, [key]: { x, y } }));

  const resetPositions = () => {
    const d = buildDefaults();
    setPositions(d);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    } catch {
      /* Same as above: persistence is best-effort, the reset still applies. */
    }
  };

  return { positions, moveIcon, resetPositions };
}
