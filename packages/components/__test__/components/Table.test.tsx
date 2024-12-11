import { render } from 'vitest-browser-vue';

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
  Array.from(column!.shadowRoot!.firstElementChild!.children) as HTMLElement[];

describe('Table', () => {
  it('nested sticky columns', async () => {
    render(() => (
      <l-table data={tableData} data-persist="true">
        <l-table-column label="name" name="name" sticky width={100} id="name"></l-table-column>
        <l-table-column label="GrandParent" sticky="left" id="grandParent">
          <l-table-column label="Parent1" id="parent1">
            <l-table-column label="age" name="age" width={100}></l-table-column>
            <l-table-column label="age" name="age" width={100}></l-table-column>
          </l-table-column>
          <l-table-column label="Parent2" id="parent2">
            <l-table-column label="age" name="age" width={100}></l-table-column>
            <l-table-column label="age" name="age" width={100}></l-table-column>
          </l-table-column>
        </l-table-column>
        <l-table-column name="tel" label="tel" headColSpan={2}></l-table-column>
        <l-table-column name="phone" label="phone"></l-table-column>
        <l-table-column name="address" label="address"></l-table-column>
        <l-table-column label="name" name="name"></l-table-column>
        <l-table-column name="tel" label="tel"></l-table-column>
        <l-table-column name="phone" label="phone"></l-table-column>
        <l-table-column label="age" name="age" sticky="right"></l-table-column>
        <l-table-column name="address" label="address"></l-table-column>
      </l-table>
    ));

    const name = document.getElementById('name'),
      grandParent = document.getElementById('grandParent');

    const nameCells = getColumnCells(name);

    await vi.waitFor(() => expect(nameCells[0].style.gridRow).toBe('span 3'));
    nameCells.forEach((cell) => {
      expect(cell.style.position).toBe('sticky');
      expect(cell.style.left).toBe('0px');
    });

    const grandParentCells = getColumnCells(grandParent);

    expect(grandParentCells.length).toBe(27);
    const headers = grandParentCells.filter((cell) => cell.classList.contains('l-table-column__header'));
    expect(headers.length).toBe(7);
    // GrandParent header
    expect(headers[0].style.left).toBe('100px');
    expect(headers[0].style.gridColumn).toBe('span 4');
    // Parent1 header
    expect(headers[1].style.left).toBe('100px');
    expect(headers[1].style.gridColumn).toBe('span 2');
    // age header
    expect(headers[2].style.left).toBe('100px');
    expect(headers[3].style.left).toBe('200px');
    // Parent2 header
    expect(headers[4].style.left).toBe('300px');
    expect(headers[4].style.gridColumn).toBe('span 2');
    // age header
    expect(headers[5].style.left).toBe('300px');
    expect(headers[6].style.left).toBe('400px');
  });
});
