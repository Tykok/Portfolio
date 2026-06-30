interface Props {
  label: string;
  shortcut?: string;
}

export function MenuBarItem({ label, shortcut }: Props) {
  return (
    <span className="os-menu-top">
      {shortcut ? (
        <>
          <span className="mu">{label[0]}</span>
          {label.slice(1)}
        </>
      ) : (
        label
      )}
    </span>
  );
}
