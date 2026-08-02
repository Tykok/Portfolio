import { useCallback, useEffect, useRef, useState } from 'react';

import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';
import { useLang } from 'context/LangContext';
import { useProjects } from 'context/ProjectsContext';
import { useRoute } from 'context/RouteContext';
import { companies } from 'data/companies';
import { type DeckEntry, entryId } from 'data/deck';

import { SlideRail } from './SlideRail';
import { SlideStage } from './SlideStage';

export function Projects() {
  const { t } = useLang();
  const { data: projects, loading, error } = useProjects();
  const { route, setRouteSlide } = useRoute();
  /* The id, not the index: indices shift when the projects API returns a
     different set, and a shared link has to survive that. */
  const [selectedId, setSelectedId] = useState<string | null>(route.app === 'projects' ? (route.slide ?? null) : null);

  /* Every slide we put in the address bar comes back to us as a route change.
     Remembering the last one written is what tells an echo apart from a real
     navigation — without it, an echo landing after a click reverted the click. */
  const echoRef = useRef<string | undefined>(route.slide);
  const publishSlide = useCallback(
    (slide: string | undefined) => {
      echoRef.current = slide;
      setRouteSlide(slide);
    },
    [setRouteSlide],
  );

  /* Address bar → deck: a pasted link, an edited URL, a back button. */
  useEffect(() => {
    if (route.app !== 'projects' || !route.slide) return;
    if (route.slide === echoRef.current) return;
    echoRef.current = route.slide;
    setSelectedId(route.slide);
  }, [route.app, route.slide]);

  // Companies are static module data with no API in front of them: a
  // transient projects failure must not take the company cards down with it.
  // The deck still renders — with the personal group dropped, per SlideRail's
  // empty-group rule — and the failure becomes a notice above it, not a
  // replacement for it.
  // `!loading` matters: an empty list mid-fetch is not a failed fetch, and
  // treating it as one made the deck briefly consist of companies alone.
  const projectsUnavailable = !loading && (error !== null || projects.length === 0);
  const entries: DeckEntry[] = [
    ...(projectsUnavailable ? [] : projects.map((project) => ({ kind: 'personal' as const, project }))),
    ...companies.map((company) => ({ kind: 'company' as const, company })),
  ];

  // An id from the URL that matches nothing — a renamed project, a typo — is
  // not an error page: it falls back to the first slide, and the effect below
  // rewrites the address to whatever is actually on screen.
  const found = entries.findIndex((entry) => entryId(entry) === selectedId);
  const safeIndex = found >= 0 ? found : 0;
  const shownId = entries[safeIndex] ? entryId(entries[safeIndex]) : undefined;
  const selectIndex = (i: number) => {
    if (entries[i]) setSelectedId(entryId(entries[i]));
  };

  return (
    <DeckShell
      entries={entries}
      loading={loading}
      notice={projectsUnavailable ? t('projects_error') : null}
      loadingLabel={t('projects_loading')}
      activeIndex={safeIndex}
      shownId={shownId}
      isRouted={route.app === 'projects'}
      onSelect={selectIndex}
      onShownIdChange={publishSlide}
    />
  );
}

interface DeckShellProps {
  entries: DeckEntry[];
  loading: boolean;
  notice: string | null;
  loadingLabel: string;
  activeIndex: number;
  shownId: string | undefined;
  isRouted: boolean;
  onSelect: (i: number) => void;
  onShownIdChange: (slide: string | undefined) => void;
}

/**
 * Split out so the slide-to-address effect can sit above the loading branch:
 * `shownId` only exists once the entries do, and hooks cannot hide behind an
 * early return.
 */
function DeckShell({ entries, loading, notice, loadingLabel, activeIndex, shownId, isRouted, onSelect, onShownIdChange }: DeckShellProps) {
  /* Deck → address bar. Writing `shownId` rather than the selection means a
     link to a slide that no longer exists corrects itself in the URL.
     Held back until the projects land: mid-fetch the deck is companies only,
     and correcting against that half-list overwrote the very slide the link
     had asked for. */
  useEffect(() => {
    if (loading || !isRouted || !shownId) return;
    onShownIdChange(shownId);
  }, [loading, isRouted, shownId, onShownIdChange]);

  if (loading) {
    return (
      <div className="pj-state">
        <ChickenLoader label={loadingLabel} />
      </div>
    );
  }

  return (
    // .deck-shell is a flex column so the notice takes its own height and the
    // deck takes the rest. Without it, .deck-B's height: 100% plus a non-zero
    // sibling overflows .os-winbody and pushes the deck below the fold.
    <div className="deck-shell">
      {notice && (
        <div className="pj-notice">
          <p>{notice}</p>
        </div>
      )}
      <div className="deck-B">
        <SlideRail entries={entries} activeIndex={activeIndex} onSelect={onSelect} />
        <SlideStage entries={entries} activeIndex={activeIndex} onSelect={onSelect} />
      </div>
    </div>
  );
}
