function useDownloadCSV() {
  return (data, fileName = 'file') => {
    const arrayData = [['Name', 'Age', 'Address']];
    data.forEach(row => {
      arrayData.push([row.name, row.age, row.address]);
    });

    let csvContent = '';
    arrayData.forEach(row => {
      let dataString = row.join(',') + '\n';
      csvContent += dataString;
    });
    
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,\ufeff' + encodeURI(csvContent);
    link.download = `${fileName}.csv`;
    link.click();
  }
}

export default useDownloadCSV;
