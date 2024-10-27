import { arrayFrom } from '@lun-web/utils';

export default () => {
  const items = arrayFrom(1000, () => 50 + Math.round(Math.random() * 200));
  return (
    <>
      <l-virtual-renderer
        style={{ height: '400px', width: '612px', flexShrink: 0, overflow: 'auto' }}
        observeContainerSize
        items={items}
        estimatedSize={(i) => i}
        lanes={4}
        gap={10}
        renderer={(m) => (
          <div
            data-index={m.index}
            style={{
              position: 'absolute',
              top: 0,
              left: `calc(${m.lane * 150}px + ${m.lane > 0 ? 4 * m.lane : 0}px)`,
              width: '150px',
              height: `${m.size}px`,
              transform: `translateY(${m.offsetStart + (m.index > 3 ? 10 : 0)}px)`,
              outline: '1px solid gray',
              outlineOffset: '-1px',
            }}
          >
            Index: {m.index}, size: {m.size}
            {/* <img src={`https://picsum.photos/seed/${m.index}/200/${m.size}`} width="200" height={m.size} /> */}
          </div>
        )}
      />
    </>
  );
};
