import { useState, useEffect, useCallback } from 'react';
import { cloneDeep, isNumber } from 'lodash';
import useDownloadCSV from 'hook/use-downloadCSV';
import classes from './TableSelection.module.scss';

function TableSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const downloadCSV = useDownloadCSV();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const url = new URL('https://randomuser.me/api/')
      url.search = new URLSearchParams({
        results: 20,
        inc: 'login,name,location,dob',
        nat: 'US',
        noinfo: true,
      })
      const response = await fetch(url);
      if (!response.ok) {
        setError(true);
      }
      const data = await response.json();
      if (data.error) {
        setError(true);
      }
      const list = data.results.map(row => ({
        id: row.login.uuid,
        name: `${row.name.first} ${row.name.last}`,
        age: row.dob.age,
        address: `${row.location.city} ${row.location.street.number} ${row.location.street.name}`,
        active: Math.random() > 0.3,
        selected: false,
      }));
      setDataList(list);
    } catch (error) {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <p>Now Loading...</p>
    );
  }

  if (error) {
    return (
      <p>Something went wrong, please try again later.</p>
    );
  }

  const exportHandler = () => {
    const selectedList = dataList.filter(row => row.selected);
    downloadCSV(selectedList, 'User List');
  }

  const selectAllHandler = () => {
    const newStatus = !selectAll;
    setSelectAll(newStatus);
    setDataList(list => list.map(row => ({
      ...row,
      selected: row.active ? newStatus : false
    })));
  }
  
  const selectHandler = (e, index) => {
    const newList = cloneDeep(dataList);
    const newStatus = !dataList[index].selected;
    if (e.nativeEvent.shiftKey && isNumber(lastSelectedIndex)) {
      if (index >= lastSelectedIndex) {
        for (let j = index; j >= lastSelectedIndex; j--) {
          newList[j].selected = newList[j].active ? newStatus : false;
        }
      } else {
        for (let j = index; j <= lastSelectedIndex; j++) {
          newList[j].selected = newList[j].active ? newStatus : false;
        }
      }
    } else {
      newList[index].selected = newStatus;
    }
    if (!newStatus) {
      setSelectAll(newStatus);
    }
    setDataList(newList);
    setLastSelectedIndex(index);
  }

  return (
    <div className={classes.tableSelection}>
      <table>
        {
          <thead>
            <tr>
              <button onClick={exportHandler}>Export</button>
            </tr>
            <tr>
              <td>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={selectAllHandler}
                />
              </td>
              <td>Name</td>
              <td>Age</td>
              <td>Address</td>
            </tr>
          </thead>
        }
        <tbody>
          {
            dataList.map((row, index) => <tr key={row.id}>
              <td>
                <input
                  type="checkbox"
                  disabled={!row.active}
                  checked={row.selected}
                  onChange={(e) => selectHandler(e, index)}
                />
              </td>
              <td>{row.name}</td>
              <td>{row.age}</td>
              <td>{row.address}</td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}
export default TableSelection;
