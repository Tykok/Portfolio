import { getBadge } from 'data/techBadges';

/**
 * The stack chip row, shared by the project and the company slide.
 *
 * Only `background` is inline, because it comes from the badge data. Every
 * other property these chips need is already in os.css — `.pj-bdg` sets the
 * radius, colour, layout, font and shadow, and `.pj-chip .pj-bdg` sets the
 * size.
 */
export function StackBadges({ stack }: { stack: string[] }) {
  return (
    <div className="deck-badges">
      {stack.map((tech) => {
        const badge = getBadge(tech);
        return (
          <div key={tech} className="pj-chip">
            <span className="pj-bdg" style={{ background: badge.color }}>
              {badge.monogram}
            </span>
            {tech}
          </div>
        );
      })}
    </div>
  );
}
