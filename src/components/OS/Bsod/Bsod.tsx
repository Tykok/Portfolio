import { useOS } from 'context/OSContext';

export function Bsod() {
  const { clearBsod } = useOS();

  return (
    <div className="os-bsod" onClick={clearBsod}>
      <div className="bsod-inner">
        <div className="bsod-h">A problem has been detected</div>
        <p className="bsod-stop">RECURSIVE_HIRE_LOOP_IN_BACKEND_DEVELOPER</p>
        <p>
          If this is the first time you've seen this Stop error screen,
          restart your computer. If this screen appears again, follow
          these steps:
        </p>
        <p>
          Check to make sure your budget is sufficient for hiring.<br />
          If the hiring process is complete, run the candidate evaluation<br />
          to make sure any new recruiters are properly configured.
        </p>
        <p>
          If problems continue, disable or remove any newly installed<br />
          development stacks. Disable BIOS memory options such as caching<br />
          or shadowing. If you need to use Safe Mode to remove or disable<br />
          components, restart your computer, press F8 to select Advanced<br />
          Startup Options, and then select Safe Mode.
        </p>
        <p>Technical information:</p>
        <p className="bsod-prog">
          *** STOP: 0x0000007E (0xC0000034, 0xDE4DBE3F, 0xF73AEF1C, 0xF73AEC58)
        </p>
        <p className="bsod-prog">
          *** ticoq_backend.sys - Address F73AEF1C base at F7382000, DateStamp 43446c58
        </p>
        <p style={{ marginTop: 24 }}>
          Beginning dump of physical memory...{' '}
          Physical memory dump complete.
        </p>
        <p style={{ marginTop: 22 }} className="bsod-blink">
          _
        </p>
        <p style={{ fontSize: 12, marginTop: 30, opacity: .7 }}>
          Click anywhere to restart.
        </p>
      </div>
    </div>
  );
}
