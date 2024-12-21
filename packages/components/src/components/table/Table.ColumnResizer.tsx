import { getRect, setStyle } from '@lun-web/utils';
import { ref } from 'vue';
import { InternalColumn } from './internalType';

export default (updateColumnWidth: (column: InternalColumn, width: number) => void) => {
  const resizer = ref<HTMLElement>(),
    hideStyle = { position: 'absolute' as const, opacity: 0, pointerEvents: 'none' as const };
  let /** pointer down start clientX */ startClientX = 0,
    /** if resize starts */ resizeStart = 0,
    /** original column width */ originalWidth = 0,
    /** initial offset from resizer to the left of the column */ initialLeft = 0,
    currentColumn: InternalColumn | undefined,
    lastTarget: HTMLElement | undefined;

  const cancel = () => {
    resizeStart = 0;
    setStyle(resizer.value, hideStyle);
    setStyle(lastTarget, {
      display: '',
    });
  };

  const handler = {
    onPointerup: (e: PointerEvent) => {
      cancel();
      currentColumn && updateColumnWidth(currentColumn, originalWidth + e.clientX - startClientX);
    },
    onPointerout: cancel,
    onPointerdown: (e: PointerEvent) => {
      if (!lastTarget) return;
      resizeStart = 1;
      startClientX = e.clientX;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointermove: (e: PointerEvent) => {
      if (!resizeStart) return;
      const { clientX } = e;
      if (clientX < startClientX - originalWidth + 2) return;
      setStyle(resizer.value, {
        left: `${initialLeft + clientX - startClientX}px`,
      });
    },
  };

  return [
    (props: Record<string, any>) => <div ref={resizer} style={hideStyle} {...handler} {...props}></div>,
    (target: HTMLElement, column: InternalColumn) => {
      if (resizeStart) return;
      currentColumn = column;
      const cell = target.parentElement!;
      originalWidth = getRect(cell).width;

      setStyle(resizer.value, {
        opacity: 1,
        left: `${(initialLeft = target.offsetLeft + cell.offsetLeft)}px`,
        pointerEvents: 'all',
      });
      setStyle((lastTarget = target), {
        display: 'none',
      });
    },
  ] as const;
};
