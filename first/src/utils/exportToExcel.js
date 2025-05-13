import * as XLSX from 'xlsx'

const exportToExcel = (tableId) => {
    const table = document.getElementById(tableId)
    if (table) {
        const copy = table.cloneNode(true)
        const workbook = XLSX.utils.table_to_book(copy, { sheet: 'sheet1' });
        XLSX.writeFile(workbook, `${tableId}.xlsx`);
    }
}

const exportSortedFeedbacksToExcel = (tableData) => {
    const workbook = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Feedback Data');
    XLSX.writeFile(workbook, 'sorted_feedbacks.xlsx');
};

const exportReportsToExcel = (combinedTable, type, infoObject) => {
        if (type) {
            const workbook = XLSX.utils.book_new();

            const sheet = XLSX.utils.table_to_sheet(combinedTable, {origin: 'A1'});


            XLSX.utils.book_append_sheet(workbook, sheet, `Sheet`);


            XLSX.writeFile(workbook, `${infoObject.date}` + `${infoObject.type}` + `${infoObject.filter}.xlsx`, {raw: true});
        }
};

const exportEmployeesTable = (tableData) => {
    const workbook = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Employees Data');
    XLSX.writeFile(workbook, 'employees_table.xlsx');
};

export { exportToExcel, exportSortedFeedbacksToExcel, exportReportsToExcel, exportEmployeesTable };
