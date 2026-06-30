import { useEffect,useState } from 'react';

function formatTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function useClock(): string {
  const [clock, setClock] = useState(formatTime);

  useEffect(() => {
    const id = setInterval(() => setClock(formatTime()), 15_000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
