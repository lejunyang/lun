import { arrayFrom } from '@lun-web/utils';

export default () => {
  const items = arrayFrom(1000, () => 25 + Math.round(Math.random() * 100));
  return (
    <>
      <l-virtual-renderer
        style={{ height: '300px', width: '100%', overflow: 'auto' }}
        observeContainerSize
        items={items}
        fixedSize={(i) => i}
        renderer={(m) => (
          <div
            data-index={m.index}
            style={{
              height: `${m.size}px`,
              width: '100%',
              position: 'absolute',
              left: 0,
              top: m.offsetStart + 'px',
              outline: '1px solid gray',
              outlineOffset: '-1px',
              padding: '4px',
            }}
          >
            Row {m.index} Height: {m.size}px
          </div>
        )}
      />
    </>
  );
};
