import type { ReactElement } from 'react';

import type { IconKind } from 'types/app';

interface Props {
  kind: IconKind;
  size?: number;
}

const ICON_BODY: Record<IconKind, ReactElement> = {
  pc: (
    <g>
      <defs>
        <linearGradient id="ic-pc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfdfb" /><stop offset=".5" stopColor="#d9d6c8" /><stop offset="1" stopColor="#a7a290" />
        </linearGradient>
        <linearGradient id="ic-pc-scr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a9d2ff" /><stop offset=".45" stopColor="#3f7fe6" /><stop offset="1" stopColor="#0b337f" />
        </linearGradient>
        <linearGradient id="ic-pc-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eceadd" /><stop offset="1" stopColor="#9c9784" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="42.5" rx="12" ry="2.6" fill="#000" opacity=".12" />
      <path d="M19 33h10l1.6 6.2h-13.2z" fill="url(#ic-pc-base)" stroke="#807b6a" strokeWidth=".6" />
      <ellipse cx="24" cy="39.6" rx="8.4" ry="2.1" fill="url(#ic-pc-base)" stroke="#807b6a" strokeWidth=".6" />
      <rect x="4" y="5" width="40" height="31" rx="4.2" fill="url(#ic-pc-body)" stroke="#827d6c" strokeWidth=".8" />
      <rect x="7.6" y="8.4" width="32.8" height="22.4" rx="2.2" fill="url(#ic-pc-scr)" stroke="#06245c" strokeWidth=".8" />
      <path d="M9 9.4 L24 9.4 L13 30 L9 30 Z" fill="#fff" opacity=".22" />
      <circle cx="40.2" cy="33.3" r=".9" fill="#7fe07f" opacity=".9" />
    </g>
  ),

  folder: (
    <g>
      <defs>
        <linearGradient id="ic-fold-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd76a" /><stop offset="1" stopColor="#e9a81f" />
        </linearGradient>
        <linearGradient id="ic-fold-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe7a0" /><stop offset=".5" stopColor="#ffc94d" /><stop offset="1" stopColor="#f0a81c" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="40.5" rx="16" ry="2.4" fill="#000" opacity=".12" />
      <path d="M6 13.5c0-1.4 1-2.4 2.4-2.4h9.2l3 3.2h14c1.3 0 2.4 1 2.4 2.4v17.7H6z"
        fill="url(#ic-fold-back)" stroke="#c98e12" strokeWidth=".8" />
      <rect x="11" y="15.8" width="26" height="13" rx="1.4" fill="#fbfbf6" stroke="#d8d2bd" strokeWidth=".6" />
      <path d="M6.4 22.5h31l4.2 0c1.4 0 2.4 1.3 2.1 2.6l-2.4 9.3c-.3 1.1-1.2 1.8-2.3 1.8H4.5c-1.4 0-2.4-1.3-2.1-2.7l3.9-9.2c.3-1 .1-1.8 .1-1.8z"
        fill="url(#ic-fold-front)" stroke="#cf950f" strokeWidth=".8" />
      <path d="M7 23.4h33.6c.7 0 1.1.5 1 1.2l-.2.7H6.6z" fill="#fff" opacity=".4" />
    </g>
  ),

  doc: (
    <g>
      <defs>
        <linearGradient id="ic-doc-pg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#eef0ee" />
        </linearGradient>
        <linearGradient id="ic-doc-hdr" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5b9bee" /><stop offset="1" stopColor="#1a52d6" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="43" rx="11" ry="2.2" fill="#000" opacity=".1" />
      <path d="M10 4h19.2L38 12.6V44H10z" fill="url(#ic-doc-pg)" stroke="#b9b4a2" strokeWidth=".8" />
      <path d="M29.2 4L38 12.6h-8.8z" fill="#dcdccd" stroke="#b9b4a2" strokeWidth=".6" />
      <rect x="14" y="16" width="20" height="3.4" rx="1" fill="url(#ic-doc-hdr)" />
      <g fill="#b9b6a6">
        <rect x="14" y="23" width="20" height="1.7" rx=".8" />
        <rect x="14" y="27.4" width="20" height="1.7" rx=".8" />
        <rect x="14" y="31.8" width="20" height="1.7" rx=".8" />
        <rect x="14" y="36.2" width="13" height="1.7" rx=".8" />
      </g>
    </g>
  ),

  mail: (
    <g>
      <defs>
        <linearGradient id="ic-mail-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#cfe0fb" />
        </linearGradient>
        <linearGradient id="ic-mail-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fbcff" /><stop offset="1" stopColor="#2f6ff2" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="40.5" rx="16" ry="2.4" fill="#000" opacity=".12" />
      <rect x="4" y="10" width="40" height="28" rx="3" fill="url(#ic-mail-bg)" stroke="#5d86c9" strokeWidth=".9" />
      <path d="M4.6 35.6 L19 24 h10 L43.4 35.6 V35c0 1.4-1 2.4-2.4 2.4H7c-1.4 0-2.4-1-2.4-2.4z" fill="#e3edfd" stroke="#9bb6e4" strokeWidth=".5" />
      <path d="M5 11.4 L24 27 L43 11.4 V12.6 L24 28.4 L5 12.6 Z" fill="url(#ic-mail-flap)" />
      <path d="M5 11 L24 26.4 L43 11 H5 Z" fill="url(#ic-mail-flap)" stroke="#2155c0" strokeWidth=".6" strokeLinejoin="round" />
      <path d="M6 11.2 L24 25 L42 11.2 Z" fill="#fff" opacity=".22" />
    </g>
  ),

  term: (
    <g>
      <defs>
        <linearGradient id="ic-term-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b9bee" /><stop offset="1" stopColor="#1a52d6" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="41" rx="15" ry="2.2" fill="#000" opacity=".12" />
      <rect x="5" y="8" width="38" height="32" rx="2.6" fill="#0c0c0e" stroke="#5a5648" strokeWidth=".9" />
      <path d="M7.6 8H40.4c1.4 0 2.6 1.2 2.6 2.6V15H5v-4.4C5 9.2 6.2 8 7.6 8z" fill="url(#ic-term-bar)" />
      <g fill="#fff" opacity=".85"><circle cx="36" cy="11.5" r="1.1" /><circle cx="39.4" cy="11.5" r="1.1" /></g>
      <text x="10" y="29" fontFamily="'Lucida Console',monospace" fontSize="11" fontWeight="700" fill="#54e054">&gt;_</text>
    </g>
  ),

  media: (
    <g>
      <defs>
        <radialGradient id="ic-media-orb" cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#bfe3ff" /><stop offset=".5" stopColor="#3f8fe6" /><stop offset="1" stopColor="#11357f" />
        </radialGradient>
        <linearGradient id="ic-media-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9d3a" /><stop offset=".5" stopColor="#e8642b" /><stop offset="1" stopColor="#b83d12" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="42" rx="14" ry="2.4" fill="#000" opacity=".12" />
      <circle cx="24" cy="22" r="19" fill="url(#ic-media-ring)" />
      <circle cx="24" cy="22" r="14.5" fill="url(#ic-media-orb)" stroke="#0c2e6e" strokeWidth=".6" />
      <path d="M19.5 14.5 L33 22 L19.5 29.5 Z" fill="#fff" />
      <ellipse cx="19" cy="15.5" rx="9" ry="6" fill="#fff" opacity=".3" transform="rotate(-28 19 15.5)" />
    </g>
  ),

  globe: (
    <g>
      <defs>
        <radialGradient id="ic-globe-b" cx=".36" cy=".3" r=".8">
          <stop offset="0" stopColor="#d3edff" /><stop offset=".42" stopColor="#4fa3e8" /><stop offset=".8" stopColor="#1763b0" /><stop offset="1" stopColor="#0b3d7c" />
        </radialGradient>
        <clipPath id="ic-globe-clip"><circle cx="24" cy="23" r="17" /></clipPath>
      </defs>
      <ellipse cx="24" cy="43" rx="13" ry="2.2" fill="#000" opacity=".12" />
      <ellipse cx="24" cy="23" rx="22" ry="8" fill="none" stroke="#e8a52b" strokeWidth="1.8" opacity=".85" transform="rotate(-20 24 23)" />
      <circle cx="24" cy="23" r="17" fill="url(#ic-globe-b)" stroke="#0c3f7d" strokeWidth=".9" />
      <g clipPath="url(#ic-globe-clip)" fill="none" stroke="#eaf4ff" strokeWidth="1" opacity=".7">
        <ellipse cx="24" cy="23" rx="6" ry="17" />
        <ellipse cx="24" cy="23" rx="13" ry="17" />
        <line x1="7" y1="23" x2="41" y2="23" />
        <path d="M9 15 h30" /><path d="M9 31 h30" />
      </g>
      <path d="M14 12 a17 17 0 0 1 16 -2" fill="none" stroke="#fff" strokeWidth="2.4" opacity=".45" strokeLinecap="round" />
    </g>
  ),
};

export function AppIcon({ kind, size = 48 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`tq-svgicon ic-${kind}`}
      style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0.5px 1px 1.2px rgba(0,0,0,.34))' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {ICON_BODY[kind] ?? null}
    </svg>
  );
}
