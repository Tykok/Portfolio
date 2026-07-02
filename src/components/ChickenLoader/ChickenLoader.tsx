import './ChickenLoader.scss';

interface Props {
  label?: string;
}

export function ChickenLoader({ label = 'Loading' }: Props) {
  return (
    <div className="chicken-loader" role="img" aria-label={label}>
      <svg className="cl-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        {/* Legs (drawn first so the body overlaps the hips) */}
        <g className="cl-leg cl-leg--back" stroke="#ff9f1c" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M52 78 L48 102" />
          <path d="M41 106 L48 102 L55 106" />
        </g>
        <g className="cl-leg cl-leg--front" stroke="#ff9f1c" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M68 78 L72 102" />
          <path d="M65 106 L72 102 L79 106" />
        </g>

        {/* Body + head bob together */}
        <g className="cl-body">
          {/* comb */}
          <path d="M80 26 q4 -8 8 0 q4 -8 8 0 q4 -6 6 2 l-22 4 z" fill="#e23b3b" />
          {/* body */}
          <ellipse cx="56" cy="60" rx="34" ry="26" fill="#f6d365" />
          {/* wing */}
          <path d="M44 56 q16 -8 30 2 q-14 10 -30 -2 z" fill="#f0b429" />
          {/* head */}
          <circle cx="86" cy="40" r="16" fill="#f6d365" />
          {/* beak */}
          <polygon points="100,38 116,43 100,49" fill="#ff9f1c" />
          {/* wattle */}
          <path d="M99 49 q5 6 0 11 q-5 -4 0 -11 z" fill="#e23b3b" />
          {/* eye */}
          <circle cx="90" cy="37" r="2.6" fill="#232323" />
        </g>
      </svg>
    </div>
  );
}

export default ChickenLoader;
