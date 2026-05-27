import "./axs-circuit-backdrop.css";

const circuitNodes = [
  [230, 160],
  [520, 190],
  [760, 210],
  [930, 165],
  [180, 360],
  [500, 370],
  [740, 410],
  [1190, 430],
  [260, 620],
  [650, 600],
  [880, 680],
  [1160, 630],
  [350, 820],
  [760, 790],
  [1320, 810],
];

export function AXSCircuitBackdrop() {
  return (
    <div className="axs-circuit-backdrop" aria-hidden="true">
      <div className="axs-circuit-base" />
      <div className="axs-circuit-depth" />

      <svg className="axs-circuit-svg" viewBox="0 0 1600 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="axsCircuitCyanViolet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0)" />
            <stop offset="18%" stopColor="rgba(34,211,238,0.55)" />
            <stop offset="48%" stopColor="rgba(168,85,247,0.5)" />
            <stop offset="78%" stopColor="rgba(34,211,238,0.45)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0)" />
          </linearGradient>

          <filter id="axsCircuitGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.10 0 0 0 0 0.90 0 0 0 0 1.00 0 0 0 0.75 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="axsNodeGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="axs-circuit-substrate">
          <path d="M60 160 H230 V120 H360 V190 H520 V150 H760 V210 H930 V165 H1220 V230 H1510" />
          <path d="M20 360 H180 V310 H330 V370 H500 V330 H740 V410 H910 V350 H1190 V430 H1580" />
          <path d="M80 620 H260 V570 H460 V640 H650 V600 H880 V680 H1160 V630 H1540" />
          <path d="M140 820 H350 V770 H530 V840 H760 V790 H980 V870 H1320 V810 H1560" />
          <path d="M260 120 V250 H390 V410 H520 V570 H700 V730" />
          <path d="M520 150 V300 H650 V460 H820 V620 H980 V790" />
          <path d="M930 165 V300 H1080 V470 H1210 V650 H1390 V840" />
          <path d="M1220 230 V390 H1350 V560 H1500" />
        </g>

        <g className="axs-electric-rivers">
          <path d="M-120 250 C130 180 260 310 440 270 C660 220 760 390 980 330 C1190 275 1340 160 1720 250" />
          <path d="M-100 520 C180 440 330 590 560 525 C760 470 870 580 1080 520 C1290 460 1420 390 1700 460" />
          <path d="M-80 760 C190 690 320 820 560 740 C790 665 960 820 1180 745 C1380 675 1510 690 1700 620" />
        </g>

        <g className="axs-circuit-branches">
          <path d="M310 260 H380 V220 H450" />
          <path d="M410 280 V350 H520 V385" />
          <path d="M720 345 H800 V300 H910" />
          <path d="M990 335 V405 H1130" />
          <path d="M560 525 V470 H680" />
          <path d="M850 550 H930 V610 H1060" />
          <path d="M1120 510 V455 H1260" />
          <path d="M420 745 H510 V690 H650" />
          <path d="M960 770 H1080 V720 H1230" />
        </g>

        <g className="axs-circuit-nodes">
          {circuitNodes.map(([cx, cy], index) => (
            <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="3.5" />
          ))}
        </g>
      </svg>

      <div className="axs-circuit-vignette" />
    </div>
  );
}
