import { at, deepCopy, getRect } from '@lun-web/utils';
import { render } from 'vitest-browser-vue';
import { nextTick, ref } from 'vue';

const tableData = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    tel: '0571-22098909',
    phone: 18889898989,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    tel: '0571-22098333',
    phone: 18889898888,
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    tel: '0575-22098909',
    phone: 18900010002,
    address: 'Sydney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 18,
    tel: '0575-22098909',
    phone: 18900010002,
    address: 'London No. 2 Lake Park',
  },
  {
    key: '5',
    name: 'Jake White',
    age: 18,
    tel: '0575-22098909',
    phone: 18900010002,
    address: 'Dublin No. 2 Lake Park',
  },
];

const getColumnCells = (column: HTMLElement | null) =>
  (Array.from(column!.shadowRoot!.firstElementChild!.children) as HTMLElement[]).filter((i) => i.tagName !== 'SLOT');

const columns = [
  { header: 'name', name: 'name', width: 100, id: 'name', sticky: true },
  {
    header: 'GrandParent',
    sticky: 'left' as const,
    id: 'grandParent',
    children: [
      {
        header: 'Parent1',
        id: 'parent1',
        children: [
          { header: 'age', name: 'age', width: 100 },
          { header: 'age', name: 'age', width: 100 },
        ],
      },
      {
        header: 'Parent2',
        id: 'parent2',
        children: [
          { header: 'age', name: 'age', width: 100 },
          { header: 'age', name: 'age', width: 100 },
        ],
      },
    ],
  },
  { header: 'tel', name: 'tel', headerColSpan: 2 },
  { header: 'phone', name: 'phone' },
  { header: 'address', name: 'address' },
  { header: 'name', name: 'name' },
  { header: 'tel', name: 'tel' },
  { header: 'phone', name: 'phone' },
  { header: 'age', name: 'age', sticky: 'right' as const },
  { header: 'address', name: 'address' },
];

describe('Table', () => {
  const nestedTestCase = async (useColumns?: boolean) => {
    const table = ref<HTMLElement>();
    render(() => (
      <l-table ref={table} data={tableData} columns={useColumns ? columns : undefined}>
        {!useColumns && (
          <>
            <l-table-column header="name" name="name" sticky width={100} id="name"></l-table-column>
            <l-table-column header="GrandParent" sticky="left" id="grandParent">
              <l-table-column header="Parent1" id="parent1">
                <l-table-column header="age" name="age" width={100}></l-table-column>
                <l-table-column header="age" name="age" width={100}></l-table-column>
              </l-table-column>
              <l-table-column header="Parent2" id="parent2">
                <l-table-column header="age" name="age" width={100}></l-table-column>
                <l-table-column header="age" name="age" width={100}></l-table-column>
              </l-table-column>
            </l-table-column>
            <l-table-column name="tel" header="tel" headerColSpan={2}></l-table-column>
            <l-table-column name="phone" header="phone"></l-table-column>
            <l-table-column name="address" header="address"></l-table-column>
            <l-table-column header="name" name="name"></l-table-column>
            <l-table-column name="tel" header="tel"></l-table-column>
            <l-table-column name="phone" header="phone"></l-table-column>
            <l-table-column header="age" name="age" sticky="right"></l-table-column>
            <l-table-column name="address" header="address"></l-table-column>
          </>
        )}
      </l-table>
    ));

    await nextTick();

    const queryTarget = useColumns ? table.value!.shadowRoot! : document;
    const name = queryTarget.getElementById('name')!,
      grandParent = queryTarget.getElementById('grandParent')!;

    let nameCells = getColumnCells(name);

    await vi.waitFor(() => {
      nameCells = getColumnCells(name);
      expect(nameCells[0].style.gridRow).toBe('span 3');
    });
    nameCells.forEach((cell) => {
      expect(cell.style.position).toBe('sticky');
      expect(cell.style.left).toBe('0px');
    });

    const grandParentCells = getColumnCells(grandParent);
    // GrandParent header
    expect(grandParentCells[0].style.left).toBe('100px');
    expect(grandParentCells[0].style.gridColumn).toBe('span 4');

    const parent1 = grandParent.children[0] as HTMLElement,
      parent2 = grandParent.children[1] as HTMLElement;
    const parent1Cells = getColumnCells(parent1),
      parent2Cells = getColumnCells(parent2);
    // Parent1 header
    expect(parent1Cells[0].style.left).toBe('100px');
    expect(parent1Cells[0].style.gridColumn).toBe('span 2');
    // Parent2 header
    expect(parent2Cells[0].style.left).toBe('300px');
    expect(parent2Cells[0].style.gridColumn).toBe('span 2');

    const secondAgeColumn = parent1.children[1] as HTMLElement,
      fourthAgeColumn = parent2.children[1] as HTMLElement;
    const secondAgeCells = getColumnCells(secondAgeColumn),
      fourthAgeCells = getColumnCells(fourthAgeColumn);
    // Second age column
    secondAgeCells.forEach((cell) => {
      expect(cell.style.position).toBe('sticky');
      expect(cell.style.left).toBe('200px');
    });
    // Fourth age column
    fourthAgeCells.forEach((cell) => {
      expect(cell.style.position).toBe('sticky');
      expect(cell.style.left).toBe('400px');
    });
  };
  it('nested sticky columns with dom children', async () => {
    await nestedTestCase();
  });

  it('nested sticky columns with columns prop', async () => {
    await nestedTestCase(true);
  });

  it('resizable columns', async () => {
    const resizableColumns = deepCopy(columns);
    // @ts-ignore
    resizableColumns[0].resizable = true;
    // @ts-ignore
    resizableColumns[1].children![0].children.forEach((column) => (column.resizable = true));

    const table = l('l-table', {
      data: tableData,
      columns: resizableColumns,
    });

    await nextTick();
    const queryTarget = table.shadowRoot!;
    const tableResizer = queryTarget.querySelector('.l-table__resizer') as HTMLElement;
    expect(tableResizer).not.toBeNull();
    expect(tableResizer.style.opacity).toBe('0');
    const name = queryTarget.getElementById('name')!;

    const nameCells = getColumnCells(name);
    const cellResizer = nameCells[0].querySelector('.l-table-column__resizer') as HTMLElement;
    expect(cellResizer).not.toBeNull();

    cellResizer.dispatchEvent(new PointerEvent('pointerenter'));
    expect(tableResizer.style.opacity).toBe('1');

    const rect = getRect(tableResizer),
      startX = rect.x + rect.width / 2,
      startY = rect.y + rect.height / 2;
    tableResizer.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, pointerId: 1 }));
    tableResizer.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 50, clientY: startY }));
    tableResizer.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 100, clientY: startY }));
    tableResizer.dispatchEvent(new PointerEvent('pointerup', { clientX: startX + 100, clientY: startY }));

    await vi.waitFor(() => expect(getRect(getColumnCells(name)[0]).width).toBe(200));
  });

  it('expandable rows', async () => {
    const expanded = ref(new Set()),
      table = ref<HTMLElement>();
    render(() => (
      <l-table
        ref={table}
        data={tableData}
        actions="rowExpand.toggle"
        columns={[
          { header: 'name', name: 'name', width: '1fr' },
          { header: 'age', name: 'age', width: '1fr' },
        ]}
        rowExpandedRenderer={(row: any) => row.address}
        rowExpanded={expanded.value}
        onRowExpand={(e) => {
          expanded.value = e.detail.raw;
        }}
      ></l-table>
    ));
    await nextTick();
    const tableShadowRoot = table.value!.shadowRoot!;
    const expandedEls = Array.from(tableShadowRoot.firstElementChild!.children).slice(0, 5) as HTMLElement[];
    expandedEls.forEach((el) => {
      expect(el.classList.contains('l-table__expanded-content')).toBe(true);
      expect(el.offsetHeight).toBe(0);
    });

    const firstCol = tableShadowRoot.querySelector('l-table-column');
    const colCells = getColumnCells(firstCol);
    at(colCells, -1)!.click();

    await nextTick();
    expect(expanded.value).to.deep.equal(new Set(['5']));
    await vi.waitFor(() => expect(at(expandedEls, -1)!.offsetHeight).toBeGreaterThan(0));
  });
});
