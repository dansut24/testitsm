import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToCSV = (data, filename = "export.csv") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

export const exportToXLSX = (data, filename = "export.xlsx") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");
  XLSX.writeFile(workbook, filename);
};

export const exportToPDF = (data, filename = "export.pdf") => {
  const doc = new jsPDF();
  const columns = Object.keys(data[0]);
  const rows = data.map(item => columns.map(col => item[col]));
  autoTable(doc, { head: [columns], body: rows });
  doc.save(filename);
};
