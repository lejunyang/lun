import { ensureNumber } from '@lun/utils';
import { datePanelProps, DatePanelSetupProps, DateValueType } from './type';
import { defineComponent, VNode } from 'vue';
import { GlobalStaticConfig } from '../config/config.static';

const datePanelOptions = {
  props: datePanelProps,
  setup(props: DatePanelSetupProps) {
    const {
      getYear,
      getMonth,
      getDate,
      getWeekDay,
      setDate,
      addDate,
      locale: { getWeekFirstDay },
    } = GlobalStaticConfig.date;
    function isSameYear(year1: DateValueType, year2: DateValueType) {
      return getYear(year1) === getYear(year2);
    }
    function isSameMonth(month1: DateValueType, month2: DateValueType) {
      return getMonth(month1) === getMonth(month2);
    }
    function getWeekStartDate(locale: string, value: DateValueType) {
      const weekFirstDay = getWeekFirstDay(locale);
      const monthStartDate = setDate(value, 1);
      const startDateWeekDay = getWeekDay(monthStartDate);
      let alignStartDate = addDate(monthStartDate, weekFirstDay - startDateWeekDay);
      if (getMonth(alignStartDate) === getMonth(value) && getDate(alignStartDate) > 1) {
        alignStartDate = addDate(alignStartDate, -7);
      }
      return alignStartDate;
    }

    const cellInfo: { disabled: boolean; date: DateValueType }[][] = [];
    const tableHandlers = {
      onClick(e: MouseEvent) {},
      onDblclick() {},
      onMouseenter() {},
      onMouseleave() {},
    };

    return () => {
      let { rows, cols, getCellDate, getCellContent, viewDate, headerCells, disabledDate, type, lang } =
        props as Required<DatePanelSetupProps>;
      (rows = ensureNumber(rows, 0)), (cols = ensureNumber(cols, 0));
      const weekFirstDay = getWeekFirstDay(lang);
      const monthStartDate = setDate(viewDate, 1);
      const baseDate = getWeekStartDate(lang, monthStartDate);
      const month = getMonth(viewDate);

      const bodyNodes: VNode[] = [];
      for (let row = 0; row < rows; row++) {
        cellInfo[row] ||= [];
        let rowStartDate: DateValueType;
        const rowNodes: VNode[] = [];
        bodyNodes.push(<tr data-index={row}>{rowNodes}</tr>);
        for (let col = 0; col < cols; col++) {
          const offset = row * cols + col;
          const currentDate = getCellDate(baseDate, offset);
          if (!col) rowStartDate = currentDate;
          const disabled = disabledDate(currentDate, { type });
          cellInfo[row][col] = {
            disabled,
            date: currentDate,
          };
          rowNodes.push(<td data-index={col}>{getCellContent(currentDate)}</td>);
        }
      }

      return (
        <table {...tableHandlers}>
          {headerCells && (
            <thead>
              <tr>{headerCells}</tr>
            </thead>
          )}
          <tbody>{bodyNodes}</tbody>
        </table>
      );
    };
  },
};

export const VDatePanel = defineComponent(datePanelOptions);
