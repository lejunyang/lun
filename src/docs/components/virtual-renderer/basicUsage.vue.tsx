import { arrayFrom } from '@lun-web/utils';

const commonStyle = {
  width: '100%',
  outline: '1px solid gray',
  outlineOffset: '-1px',
  padding: '4px',
};
export default () => {
  const items = arrayFrom(1000, () => 25 + Math.round(Math.random() * 100)),
    commonProps = {
      style: { height: '300px', width: '100%', overflow: 'auto' },
      observeContainerSize: true,
      items,
      fixedSize: (i: any) => i,
    };
  return (
    <>
      绝对定位
      <l-virtual-renderer
        {...commonProps}
        renderer={(m) => (
          <div
            data-index={m.index}
            style={{
              height: `${m.size}px`,
              position: 'absolute',
              left: 0,
              top: m.offsetStart + 'px',
              ...commonStyle,
            }}
          >
            Row {m.index} Height: {m.size}px
          </div>
        )}
      />
      <p style={{ marginTop: '20px' }}>静态定位：添加staticPosition</p>
      <l-virtual-renderer
        {...commonProps}
        staticPosition
        renderer={(m) => (
          <div
            data-index={m.index}
            style={{
              height: `${m.size}px`,
              ...commonStyle,
            }}
          >
            Row {m.index} Height: {m.size}px
          </div>
        )}
      />
      <p style={{ marginTop: '20px' }}>静态定位2：自行设置transform</p>
      <l-virtual-renderer
        {...commonProps}
        renderer={(m, arr) => (
          <div
            data-index={m.index}
            style={{
              height: `${m.size}px`,
              transform: `translateY(${arr[0].offsetStart}px)`,
              ...commonStyle,
            }}
          >
            Row {m.index} Height: {m.size}px
          </div>
        )}
      />
    </>
  );
};
