import { useState } from 'react';

import { useLang } from 'context/LangContext';

interface Props {
  onClose: () => void;
}

const MONTH_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalPopup({ onClose }: Props) {
  const { lang, t } = useLang();
  const today = new Date();
  const [view, setView] = useState({ month: today.getMonth(), year: today.getFullYear() });

  const days = t('cal_days') as string[];
  const weekstart = t('cal_weekstart') as number;

  const prev = () =>
    setView(({ month, year }) =>
      month === 0 ? { month: 11, year: year - 1 } : { month: month - 1, year }
    );
  const next = () =>
    setView(({ month, year }) =>
      month === 11 ? { month: 0, year: year + 1 } : { month: month + 1, year }
    );

  const { month, year } = view;
  const monthNames = lang === 'fr' ? MONTH_FR : MONTH_EN;
  const totalDays = daysInMonth(year, month);
  const rawFirst = firstDayOfMonth(year, month);
  const leading = (rawFirst - weekstart + 7) % 7;

  const cells: Array<number | null> = [
    ...Array(leading).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number | null) =>
    d !== null &&
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="os-calpop tq">
      <div className="os-calpop-bar">
        <span className="nav" onClick={prev}>‹</span>
        <span>{monthNames[month]} {year}</span>
        <span className="nav" onClick={next}>›</span>
      </div>
      <div className="os-calgrid">
        <div className="os-calrow">
          {days.map((d) => (
            <div key={d} className="os-cal-dow">{d}</div>
          ))}
        </div>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <div key={row} className="os-calrow">
            {cells.slice(row * 7, row * 7 + 7).map((d, col) => (
              <div
                key={col}
                className={`os-cal-d${d === null ? ' muted' : ''}${isToday(d) ? ' today' : ''}`}
              >
                {d ?? ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="os-calfoot" onClick={onClose}>
        {today.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}
