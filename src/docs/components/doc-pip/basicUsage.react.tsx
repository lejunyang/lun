import { useEffect, useRef, useState } from 'react';

const CountDown = ({ seconds }) => {
  const [remain, setRemain] = useState(seconds);
  const timer = useRef<number>();
  if (remain <= 0) clearInterval(timer.current);
  useEffect(() => {
    if (!seconds) return;
    clearInterval(timer.current);
    setRemain(seconds);
    timer.current = setInterval(() => {
      setRemain((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer.current);
  }, [seconds]);
  return (
    <div
      style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'var(--l-accent-a7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {remain}s
    </div>
  );
};

const C = () => {
  const pip = useRef<any>();
  const [count, setCount] = useState(60);
  return (
    <>
      <l-doc-pip ref={pip}>
        <CountDown seconds={count} />
      </l-doc-pip>
      <l-button onClick={() => pip.current?.togglePip()}>toggle Pip</l-button>
      <l-button onClick={() => setCount(Date.now() % 1000)}>reset</l-button>
    </>
  );
};

export default <C />;
