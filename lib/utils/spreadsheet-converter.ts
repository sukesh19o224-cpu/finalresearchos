/**
 * Utility functions to convert between internal spreadsheet format and x-spreadsheet format
 */

/**
 * Converts internal spreadsheet data (rows + headers) to x-spreadsheet format
 */
export function convertToXSpreadsheetFormat(data: any[][], headers: string[]) {
  const rows: Record<number, any> = {}
  
  // Add header row as first row (row 0)
  const headerCells: Record<number, any> = {}
  headers.forEach((header, colIndex) => {
    headerCells[colIndex] = {
      text: String(header),
      style: 0  // Use default style for headers
    }
  })
  rows[0] = { cells: headerCells }
  
  // Add data rows (starting from row 1)
  data.forEach((row, rowIndex) => {
    const cells: Record<number, any> = {}
    row.forEach((cellValue, colIndex) => {
      if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
        cells[colIndex] = {
          text: String(cellValue)
        }
      }
    })
    rows[rowIndex + 1] = { cells }
  })

  const cols: Record<string, any> = {
    len: Math.max(headers.length, 26)
  }
  
  headers.forEach((header, index) => {
    cols[index] = { width: 120 }
  })

  return {
    name: 'Sheet1',
    rows,
    cols,
    styles: [
      {
        bgcolor: '#f4f5f8',
        align: 'center',
        bold: true,
        color: '#000000'
      }
    ]
  }
}

/**
 * Converts x-spreadsheet data back to internal format (rows + headers)
 */
export function convertFromXSpreadsheetFormat(xsData: any): { 
  data: any[][], 
  headers: string[] 
} {
  const allRows: any[][] = []
  const headers: string[] = []
  
  const sheetData = Array.isArray(xsData) ? xsData[0] : xsData
  const { rows } = sheetData
  
  if (!rows) {
    return { data: [], headers: [] }
  }

  // Get all row indices and sort them
  const rowIndices = Object.keys(rows)
    .map(idx => parseInt(idx, 10))
    .sort((a, b) => a - b)
  
  // Extract all rows
  rowIndices.forEach(rowIndex => {
    const rowData: any[] = []
    const rowCells = rows[rowIndex]?.cells || {}
    
    // Get all column indices for this row
    const colIndices = Object.keys(rowCells)
      .map(idx => parseInt(idx, 10))
      .sort((a, b) => a - b)
    
    // Find max column index to determine row length
    const maxCol = Math.max(...colIndices, 0)
    
    // Fill row with data
    for (let colNum = 0; colNum <= maxCol; colNum++) {
      const cell = rowCells[colNum]
      rowData[colNum] = cell?.text || ''
    }
    
    allRows[rowIndex] = rowData
  })
  
  // First row as headers
  if (allRows.length > 0 && allRows[0]) {
    headers.push(...allRows[0].map(h => String(h || '')))
    // Remove header row from data
    allRows.shift()
  }
  
  // Filter out undefined entries and return
  const data = allRows.filter(row => row !== undefined)
  
  return { data, headers }
}

/**
 * Extract data from specific columns for plotting
 */
export function extractColumnData(
  xsData: any,
  columnIndices: number[]
): { [key: number]: any[] } {
  const { data, headers } = convertFromXSpreadsheetFormat(xsData)
  const result: { [key: number]: any[] } = {}
  
  columnIndices.forEach(colIndex => {
    result[colIndex] = data.map(row => row[colIndex] || '').filter(val => val !== '')
  })
  
  return result
}
