// inspired by https://codepen.io/Chokcoco/pen/bGOqVqO?editors=1100
const pointStyle = {
  position: 'absolute' as const,
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: '#ff5722',
};
const observeView = [
  { target: '#point1', progressVarName: '--point1-progress' },
  { target: '#point2', progressVarName: '--point2-progress' },
  { target: '#point3', progressVarName: '--point3-progress' },
];
export default () => {
  return (
    <l-scroll-view
      style={{
        position: 'relative',
        width: '100%',
        height: '300px',
      }}
      observeView={observeView}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '2000px',
          background: 'rgb(255, 87, 34, calc(var(--scroll-y-progress) * 0.6 + 0.1) )',
        }}
      >
        <svg width="100%" height="2000px" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute' }}>
          <path
            style={{
              strokeDasharray: '2222, 2222',
              stroke: '#ff5722',
              strokeWidth: '2px',
              strokeDashoffset: 'calc(2222 * (1 - var(--scroll-y-progress)))',
            }}
            d="M 350 40 C 1200 1000, -550 1000, 350 1960"
            stroke="black"
            fill="transparent"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
            offsetPath: 'path("M 350 40 C 1200 1000, -550 1000, 350 1960")',
            background: 'linear-gradient(270deg, #673AB7, #FF5722)',
            transform: `scale( calc( 1 + min(3 * var(--scroll-y-progress), 3 - 3 * var(--scroll-y-progress)) ) )`,
            offsetDistance: 'calc(var(--scroll-y-progress) * 100%)',
          }}
        ></div>
        <div
          id="point1"
          style={{
            ...pointStyle,
            top: '510px',
            left: '570px',
            opacity: 'calc(min(2 * var(--point1-progress), 2 - 2 * var(--point1-progress)))',
            transform: `scale( calc( 1 + min(var(--point1-progress), 1 - var(--point1-progress)) ) )`,
          }}
        ></div>
        <div
          id="point2"
          style={{
            ...pointStyle,
            top: '910px',
            left: '370px',
            opacity: 'calc(min(2 * var(--point2-progress), 2 - 2 * var(--point2-progress)))',
            transform: `scale( calc( 1 + min(var(--point2-progress), 1 - var(--point2-progress)) ) )`,
          }}
        ></div>
        <div
          id="point3"
          style={{
            ...pointStyle,
            top: '1410px',
            left: '66px',
            opacity: 'calc(min(2 * var(--point3-progress), 2 - 2 * var(--point3-progress)))',
            transform: `scale( calc( 1 + min(var(--point3-progress), 1 - var(--point3-progress)) ) )`,
          }}
        ></div>
      </div>
    </l-scroll-view>
  );
};
