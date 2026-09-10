
import { useTheme } from '../contexts/ThemeContext';

/* ============================================================
   UNDERWATER FISH SPRITE
============================================================ */
function FishSprite({
  top,
  left,
  scale,
  duration,
  delay,
  direction = 1,
  isLight = false,
}: {
  top: string;
  left: string;
  scale: number;
  duration: number;
  delay: number;
  direction?: number;
  isLight?: boolean;
}) {
  const bodyColor = isLight ? 'rgba(8,145,178,0.38)' : 'rgba(121,210,225,0.22)';
  const tailColor = isLight ? 'rgba(14,116,144,0.32)' : 'rgba(89,190,211,0.20)';
  const finColor = isLight ? 'rgba(3,105,161,0.40)' : 'rgba(180,235,240,0.22)';
  const eyeColor = isLight ? 'rgba(2,132,199,0.75)' : 'rgba(220,250,255,0.55)';
  const line1Color = isLight ? 'rgba(8,145,178,0.30)' : 'rgba(210,245,250,0.16)';
  const line2Color = isLight ? 'rgba(8,145,178,0.22)' : 'rgba(210,245,250,0.12)';

  return (
    <div
      className="absolute pointer-events-none fish-swim"
      style={{
        top,
        left,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        transform: `scale(${scale * direction}, ${scale})`,
      }}
    >
      <svg width="90" height="42" viewBox="0 0 90 42" fill="none">
        <path
          d="M14 21C25 8 43 5 58 12C65 15 70 19 75 21C70 23 65 27 58 30C43 37 25 34 14 21Z"
          fill={bodyColor}
        />
        <path
          d="M14 21L2 10L6 21L2 32L14 21Z"
          fill={tailColor}
        />
        <path
          d="M38 11C40 4 47 3 51 11"
          stroke={finColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="61" cy="18" r="2" fill={eyeColor} />
        <path
          d="M27 17C36 20 44 21 54 20"
          stroke={line1Color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M27 26C37 23 45 22 54 22"
          stroke={line2Color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ============================================================
   SMALL FISH SCHOOL
============================================================ */
function FishSchool({ isLight }: { isLight: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <FishSprite top="25%" left="-12%" scale={0.75} duration={25} delay={0} isLight={isLight} />
      <FishSprite top="33%" left="-18%" scale={0.45} duration={32} delay={-8} isLight={isLight} />
      <FishSprite top="43%" left="-10%" scale={0.6}  duration={29} delay={-14} isLight={isLight} />
      <FishSprite top="58%" left="-15%" scale={0.38} duration={36} delay={-4} isLight={isLight} />
      <FishSprite top="67%" left="-20%" scale={0.52} duration={31} delay={-18} isLight={isLight} />
      <FishSprite top="76%" left="-13%" scale={0.34} duration={38} delay={-22} isLight={isLight} />
    </div>
  );
}

/* ============================================================
   BUBBLES
============================================================ */
function Bubbles({ isLight }: { isLight: boolean }) {
  const bubbles = [
    { left: '8%',  size: 4, duration: 12, delay: 0 },
    { left: '17%', size: 7, duration: 16, delay: -6 },
    { left: '29%', size: 3, duration: 11, delay: -2 },
    { left: '42%', size: 5, duration: 14, delay: -9 },
    { left: '55%', size: 3, duration: 10, delay: -4 },
    { left: '64%', size: 8, duration: 18, delay: -12 },
    { left: '73%', size: 4, duration: 13, delay: -7 },
    { left: '84%', size: 6, duration: 17, delay: -14 },
    { left: '93%', size: 3, duration: 11, delay: -3 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className={`water-bubble ${isLight ? 'water-bubble-light' : ''}`}
          style={{
            left: bubble.left,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   KELP / SEA FLORA
============================================================ */
function Kelp({
  left,
  scale,
  delay,
  isLight,
}: {
  left: string;
  scale: number;
  delay: number;
  isLight: boolean;
}) {
  const stem1 = isLight ? 'rgba(13,148,136,0.50)' : 'rgba(27,126,105,0.52)';
  const stem2 = isLight ? 'rgba(16,185,129,0.40)' : 'rgba(33,154,122,0.38)';
  const leaf1 = isLight ? 'rgba(20,184,166,0.35)' : 'rgba(40,170,138,0.32)';
  const leaf2 = isLight ? 'rgba(52,211,153,0.30)' : 'rgba(56,189,148,0.24)';

  return (
    <div
      className="absolute bottom-0 pointer-events-none origin-bottom kelp-sway"
      style={{
        left,
        transform: `scale(${scale})`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg width="120" height="260" viewBox="0 0 120 260" fill="none">
        <path
          d="M60 260C55 220 67 190 51 153C37 121 51 94 39 58C31 34 39 15 29 0"
          stroke={stem1}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M65 260C72 221 56 196 70 164C83 133 69 105 82 74C91 52 82 29 91 8"
          stroke={stem2}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M47 205C25 188 18 169 21 143"
          stroke={leaf1}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M70 183C95 171 103 151 101 130"
          stroke={leaf1}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M53 119C29 105 22 86 25 66"
          stroke={leaf2}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M76 95C100 82 106 65 101 47"
          stroke={leaf2}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ============================================================
   SEA FLOOR FLORA
============================================================ */
function SeaFloor({ isLight }: { isLight: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background: isLight
            ? 'linear-gradient(to top, rgba(14,116,144,0.30), transparent)'
            : 'linear-gradient(to top, rgba(1,18,27,0.92), transparent)',
        }}
      />
      <Kelp left="1%"  scale={0.75} delay={-2} isLight={isLight} />
      <Kelp left="7%"  scale={0.55} delay={-5} isLight={isLight} />
      <Kelp left="14%" scale={0.9}  delay={-1} isLight={isLight} />
      <Kelp left="24%" scale={0.6}  delay={-7} isLight={isLight} />
      <Kelp left="34%" scale={0.8}  delay={-3} isLight={isLight} />
      <Kelp left="48%" scale={0.55} delay={-9} isLight={isLight} />
      <Kelp left="58%" scale={0.9}  delay={-4} isLight={isLight} />
      <Kelp left="69%" scale={0.65} delay={-8} isLight={isLight} />
      <Kelp left="78%" scale={0.82} delay={-2} isLight={isLight} />
      <Kelp left="88%" scale={0.6}  delay={-6} isLight={isLight} />
      <Kelp left="95%" scale={0.8}  delay={-10} isLight={isLight} />
    </div>
  );
}

/* ============================================================
   UNDERWATER LIGHT RAYS
============================================================ */
function LightRays({ isLight }: { isLight: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`water-ray ray-one ${isLight ? 'water-ray-light' : ''}`} />
      <div className={`water-ray ray-two ${isLight ? 'water-ray-light' : ''}`} />
      <div className={`water-ray ray-three ${isLight ? 'water-ray-light' : ''}`} />
      <div className={`water-ray ray-four ${isLight ? 'water-ray-light' : ''}`} />
    </div>
  );
}

/* ============================================================
   EXPORTED WATER BACKGROUND COMPONENT
============================================================ */
export default function WaterBackground({ showSeaFloor = true }: { showSeaFloor?: boolean }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  return (
    <>
      <style>{`
        @keyframes waterDriftOne {
          0% {
            transform: translate3d(-3%, 0, 0) scale(1.08);
          }
          50% {
            transform: translate3d(3%, 2%, 0) scale(1.12);
          }
          100% {
            transform: translate3d(-3%, 0, 0) scale(1.08);
          }
        }

        @keyframes waterDriftTwo {
          0% {
            transform: translate3d(4%, -2%, 0) scale(1.15);
          }
          50% {
            transform: translate3d(-4%, 3%, 0) scale(1.08);
          }
          100% {
            transform: translate3d(4%, -2%, 0) scale(1.15);
          }
        }

        @keyframes waterFlow {
          0% {
            transform: translateX(-8%) skewX(-4deg);
          }
          50% {
            transform: translateX(8%) skewX(4deg);
          }
          100% {
            transform: translateX(-8%) skewX(-4deg);
          }
        }

        @keyframes waterFlowReverse {
          0% {
            transform: translateX(8%) skewX(3deg);
          }
          50% {
            transform: translateX(-8%) skewX(-3deg);
          }
          100% {
            transform: translateX(8%) skewX(3deg);
          }
        }

        @keyframes causticMove {
          0% {
            transform: translate3d(-4%, -2%, 0) rotate(-3deg) scale(1.1);
          }
          50% {
            transform: translate3d(5%, 3%, 0) rotate(2deg) scale(1.18);
          }
          100% {
            transform: translate3d(-4%, -2%, 0) rotate(-3deg) scale(1.1);
          }
        }

        @keyframes fishSwim {
          0% {
            transform: translateX(-130px) translateY(0);
          }
          25% {
            transform: translateX(25vw) translateY(-18px);
          }
          50% {
            transform: translateX(55vw) translateY(12px);
          }
          75% {
            transform: translateX(85vw) translateY(-10px);
          }
          100% {
            transform: translateX(115vw) translateY(4px);
          }
        }

        @keyframes bubbleRise {
          0% {
            transform: translateY(110vh) translateX(0) scale(0.7);
            opacity: 0;
          }
          10% {
            opacity: 0.35;
          }
          50% {
            transform: translateY(50vh) translateX(12px) scale(1);
            opacity: 0.24;
          }
          100% {
            transform: translateY(-15vh) translateX(-15px) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes kelpSway {
          0% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(3deg);
          }
          100% {
            transform: rotate(-2deg);
          }
        }

        @keyframes rayMove {
          0% {
            opacity: 0.05;
            transform: translateX(-20px) rotate(13deg);
          }
          50% {
            opacity: 0.13;
            transform: translateX(20px) rotate(10deg);
          }
          100% {
            opacity: 0.05;
            transform: translateX(-20px) rotate(13deg);
          }
        }

        @keyframes shimmer {
          0% {
            opacity: 0.12;
            transform: translateX(-10%);
          }
          50% {
            opacity: 0.28;
            transform: translateX(10%);
          }
          100% {
            opacity: 0.12;
            transform: translateX(-10%);
          }
        }

        .water-bubble {
          position: absolute;
          bottom: -20px;
          display: block;
          border-radius: 9999px;
          border: 1px solid rgba(160,235,245,0.22);
          background: radial-gradient(
            circle at 30% 25%,
            rgba(255,255,255,0.35),
            rgba(72,190,215,0.04) 45%,
            transparent 70%
          );
          box-shadow:
            0 0 10px rgba(65,190,220,0.10),
            inset 1px 1px 2px rgba(255,255,255,0.18);
          animation: bubbleRise linear infinite;
        }

        .fish-swim {
          animation-name: fishSwim;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .kelp-sway {
          animation-name: kelpSway;
          animation-duration: 5s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .water-ray {
          position: absolute;
          top: -20%;
          width: 25%;
          height: 150%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(125,225,235,0.10),
            rgba(125,225,235,0.03),
            transparent
          );
          filter: blur(8px);
          transform-origin: top center;
          animation: rayMove 9s ease-in-out infinite;
        }

        .ray-one {
          left: 7%;
          animation-delay: -2s;
        }

        .ray-two {
          left: 28%;
          width: 18%;
          animation-duration: 12s;
          animation-delay: -5s;
        }

        .ray-three {
          right: 25%;
          width: 22%;
          animation-duration: 10s;
          animation-delay: -1s;
        }

        .ray-four {
          right: 3%;
          width: 18%;
          animation-duration: 14s;
          animation-delay: -7s;
        }

        .water-caustic {
          position: absolute;
          inset: -15%;
          background:
            radial-gradient(
              ellipse 18% 5% at 15% 20%,
              rgba(183,239,240,0.18),
              transparent 70%
            ),
            radial-gradient(
              ellipse 22% 6% at 45% 28%,
              rgba(110,215,225,0.14),
              transparent 70%
            ),
            radial-gradient(
              ellipse 20% 5% at 75% 18%,
              rgba(178,238,240,0.15),
              transparent 70%
            ),
            radial-gradient(
              ellipse 30% 7% at 30% 52%,
              rgba(77,192,208,0.12),
              transparent 70%
            ),
            radial-gradient(
              ellipse 25% 5% at 70% 62%,
              rgba(123,224,231,0.12),
              transparent 70%
            ),
            radial-gradient(
              ellipse 35% 8% at 45% 80%,
              rgba(42,160,180,0.10),
              transparent 70%
            );
          filter: blur(7px);
          mix-blend-mode: screen;
          animation: causticMove 18s ease-in-out infinite;
        }

        .water-stream {
          position: absolute;
          left: -10%;
          width: 120%;
          height: 90px;
          border-radius: 50%;
          border-top: 1px solid rgba(138,222,230,0.10);
          border-bottom: 1px solid rgba(67,173,192,0.06);
          filter: blur(4px);
          animation: waterFlow 14s ease-in-out infinite;
        }

        .water-stream-two {
          animation-name: waterFlowReverse;
          animation-duration: 18s;
          opacity: 0.7;
        }

        .water-shimmer {
          position: absolute;
          left: -10%;
          top: 5%;
          width: 120%;
          height: 40%;
          background:
            repeating-linear-gradient(
              175deg,
              transparent 0px,
              transparent 18px,
              rgba(174,238,241,0.035) 20px,
              rgba(174,238,241,0.09) 24px,
              transparent 31px,
              transparent 58px
            );
          filter: blur(5px);
          animation: shimmer 11s ease-in-out infinite;
        }
        .water-bubble-light {
          border: 1px solid rgba(14,165,233,0.38) !important;
          background: radial-gradient(
            circle at 30% 25%,
            rgba(255,255,255,0.75),
            rgba(14,165,233,0.12) 45%,
            transparent 70%
          ) !important;
          box-shadow:
            0 0 10px rgba(14,165,233,0.20),
            inset 1px 1px 2px rgba(255,255,255,0.60) !important;
        }

        .water-ray-light {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.38),
            rgba(14,165,233,0.14),
            transparent
          ) !important;
        }

        .water-stream-light {
          border-top-color: rgba(14,165,233,0.18) !important;
          border-bottom-color: rgba(6,182,212,0.12) !important;
        }
      `}</style>

      <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-700 ${isLight ? 'bg-[#edf8fd]' : 'bg-[#020b16]'}`}>
        {/* Ocean gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: isLight
              ? `
                radial-gradient(
                  ellipse 100% 60% at 50% 0%,
                  rgba(14,165,233,0.22),
                  transparent 65%
                ),
                linear-gradient(
                  180deg,
                  #f0f9ff 0%,
                  #e0f2fe 26%,
                  #bae6fd 56%,
                  #7dd3fc 82%,
                  #38bdf8 100%
                )
              `
              : `
                radial-gradient(
                  ellipse 100% 60% at 50% 0%,
                  rgba(16,100,125,0.30),
                  transparent 62%
                ),
                linear-gradient(
                  180deg,
                  #031421 0%,
                  #031b2b 22%,
                  #021522 52%,
                  #010b15 78%,
                  #01070d 100%
                )
              `,
          }}
        />

        {/* Large moving water volume 1 */}
        <div
          className="absolute inset-[-10%]"
          style={{
            background: isLight
              ? `
                radial-gradient(
                  ellipse 45% 18% at 20% 20%,
                  rgba(14,165,233,0.16),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 50% 20% at 80% 35%,
                  rgba(6,182,212,0.14),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 60% 20% at 40% 65%,
                  rgba(56,189,248,0.12),
                  transparent 70%
                )
              `
              : `
                radial-gradient(
                  ellipse 45% 18% at 20% 20%,
                  rgba(76,184,198,0.18),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 50% 20% at 80% 35%,
                  rgba(38,137,165,0.15),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 60% 20% at 40% 65%,
                  rgba(25,113,145,0.13),
                  transparent 70%
                )
              `,
            filter: 'blur(18px)',
            animation: 'waterDriftOne 18s ease-in-out infinite',
          }}
        />

        {/* Large moving water volume 2 */}
        <div
          className="absolute inset-[-10%]"
          style={{
            background: isLight
              ? `
                radial-gradient(
                  ellipse 40% 12% at 70% 15%,
                  rgba(6,182,212,0.14),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 55% 16% at 20% 48%,
                  rgba(14,165,233,0.12),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 45% 14% at 78% 76%,
                  rgba(56,189,248,0.15),
                  transparent 70%
                )
              `
              : `
                radial-gradient(
                  ellipse 40% 12% at 70% 15%,
                  rgba(128,220,224,0.13),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 55% 16% at 20% 48%,
                  rgba(39,145,166,0.12),
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 45% 14% at 78% 76%,
                  rgba(20,100,130,0.16),
                  transparent 70%
                )
              `,
            filter: 'blur(22px)',
            animation: 'waterDriftTwo 23s ease-in-out infinite',
          }}
        />

        {/* Water caustics */}
        <div
          className="water-caustic"
          style={{
            mixBlendMode: isLight ? 'soft-light' : 'screen',
            opacity: isLight ? 0.75 : 1,
          }}
        />

        {/* Moving water streams */}
        <div className={`water-stream ${isLight ? 'water-stream-light' : ''}`} style={{ top: '18%' }} />
        <div className={`water-stream water-stream-two ${isLight ? 'water-stream-light' : ''}`} style={{ top: '34%' }} />
        <div className={`water-stream ${isLight ? 'water-stream-light' : ''}`} style={{ top: '53%', opacity: 0.45 }} />
        <div className={`water-stream water-stream-two ${isLight ? 'water-stream-light' : ''}`} style={{ top: '72%', opacity: 0.35 }} />

        {/* Surface shimmer */}
        <div className="water-shimmer" />

        {/* Underwater sunlight rays */}
        <LightRays isLight={isLight} />

        {/* Swimming fish school */}
        <FishSchool isLight={isLight} />

        {/* Rising bubbles */}
        <Bubbles isLight={isLight} />

        {/* Sea floor flora (kelp) */}
        {showSeaFloor && <SeaFloor isLight={isLight} />}

        {/* Deep bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            background: isLight
              ? 'linear-gradient(to top, rgba(14,116,144,0.22), transparent)'
              : 'linear-gradient(to top, rgba(0,5,10,0.72), transparent)',
          }}
        />

        {/* Ambient vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: isLight
              ? 'radial-gradient(circle at center, transparent 50%, rgba(186,230,253,0.25) 100%)'
              : 'radial-gradient(circle at center, transparent 35%, rgba(0,5,12,0.40) 100%)',
          }}
        />
      </div>
    </>
  );
}
