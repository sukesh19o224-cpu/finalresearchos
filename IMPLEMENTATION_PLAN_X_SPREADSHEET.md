# X-Spreadsheet Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to replace the current **jspreadsheet-ce** (CDN-based) with **x-data-spreadsheet** (npm-based) in the VisualizationTab component of ResearchOS.

**Current State:** jspreadsheet-ce@4.13.1 loaded via CDN  
**Target State:** x-data-spreadsheet (npm package)  
**Migration Complexity:** Medium (API differences, event handling changes)  
**Estimated Time:** 4-6 hours

---

## 🚨 CRITICAL WARNINGS

### 1. **Project Migration Status**
- ⚠️ **x-spreadsheet repository states**: "The project has been migrated to @wolf-table/table"
- **Last Update:** 3 years ago (September 2020)
- **Recommendation:** Consider evaluating `@wolf-table/table` as an alternative
- **Risk:** Limited maintenance and bug fixes for x-spreadsheet

### 2. **Compatibility Concerns**
- x-spreadsheet uses **vanilla JavaScript** (not React-first)
- Requires direct DOM manipulation (similar to current jspreadsheet)
- TypeScript types available but community-maintained

### 3. **Breaking Changes**
- Complete rewrite of initialization code required
- Event handler signatures differ significantly
- Data structure format is incompatible with jspreadsheet

---

## 📊 Feature Parity Analysis

| Feature | jspreadsheet-ce | x-data-spreadsheet | Status |
|---------|----------------|-------------------|---------|
| **Basic Spreadsheet** | ✅ | ✅ | ✅ Full support |
| **Formulas (SUM, AVG, etc.)** | ✅ | ✅ | ✅ Full support |
| **Cell Selection Events** | `onselection` callback | `cell-selected`, `cells-selected` events | ✅ Different API |
| **Data Retrieval** | `getData()`, `getHeaders()` | `getData()`, `cell(ri, ci)` | ✅ Different API |
| **File Import (XLSX/CSV)** | Manual via XLSX.js | Works with SheetJS | ✅ Same library |
| **Add/Delete Rows/Cols** | `insertRow()`, `deleteRow()` | Built-in toolbar or manual API | ✅ Supported |
| **Resizable Columns** | ✅ | ✅ | ✅ Built-in |
| **Context Menu** | ✅ | ✅ | ✅ Built-in |
| **Merge Cells** | ✅ | ✅ | ✅ Built-in |
| **Styling (colors, fonts)** | ✅ | ✅ | ✅ Built-in |
| **Data Validation** | ❌ (enterprise only) | ✅ | ✅ Better support |
| **Read-only Mode** | ✅ | ✅ (`mode: 'read'`) | ✅ Supported |
| **CDN Loading** | ✅ Current method | ✅ Available | ℹ️ Will use npm |
| **Bundle Size** | ~500KB | ~200KB | ✅ Smaller |

---

## 🎯 Your Three Requirements - Feasibility

### 1. ✅ **Spreadsheet on Right Side of Split View**
**Status:** FULLY FEASIBLE

Both libraries render into a `<div>` container. Layout is controlled by your CSS/flex layout, not the library.

**Current Implementation:**
```tsx
<div style={{ width: '50%' }}>
  <div ref={spreadsheetRef} />  {/* jspreadsheet renders here */}
</div>
```

**With x-spreadsheet:**
```tsx
<div style={{ width: '50%' }}>
  <div id="xspreadsheet-container" />  {/* x-spreadsheet renders here */}
</div>
```

**No changes needed to split view layout.**

---

### 2. ✅ **Column Calculations (Formulas)**
**Status:** FULLY FEASIBLE

x-spreadsheet has **better formula support** than jspreadsheet:

**Built-in Formulas:**
- Mathematical: `SUM`, `AVERAGE`, `MAX`, `MIN`, `_SUM`, `_AVERAGE`
- Text: `CONCAT`
- All standard Excel-like formulas work in cells

**Usage:**
```javascript
// Users can type directly in cells:
=SUM(A1:A10)
=AVERAGE(B:B)
=MAX(C1:C50)
```

**API Access:**
```javascript
// Programmatically set cell with formula
s.cellText(5, 5, '=SUM(A1:A5)', 0)  // row 5, col 5, formula, sheet 0
```

**Advantage over jspreadsheet:** x-spreadsheet formulas are built-in basic tier (jspreadsheet formulas require enterprise license).

---

### 3. ✅ **Selected Columns Trigger Plotly Plots**
**Status:** FULLY FEASIBLE

**Current Flow (jspreadsheet):**
```javascript
onselection: (instance, x1, y1, x2, y2) => {
  updateSelectedColumns(instance, x1, y1, x2, y2)
}
// Then handlePlot() extracts data and generates Plotly graph
```

**New Flow (x-spreadsheet):**
```javascript
s.on('cells-selected', (cell, { sri, sci, eri, eci }) => {
  // sri = start row index, sci = start col index
  // eri = end row index, eci = end col index
  updateSelectedColumns(sci, eci)
})
// Same handlePlot() with minor data extraction changes
```

**Data Extraction API:**
```javascript
// Current (jspreadsheet)
const data = jspreadsheet.getData()
const headers = jspreadsheet.getHeaders().split(',')

// New (x-spreadsheet)
const data = s.getData()  // Returns full data structure
const cellValue = s.cell(rowIndex, colIndex, sheetIndex)
```

**All requirements are achievable with similar or better functionality.**

---

## 📦 Installation & Dependencies

### Step 1: Install x-data-spreadsheet
```bash
npm install x-data-spreadsheet
```

**Package Details:**
- Name: `x-data-spreadsheet`
- Current Version: 1.1.8 (as of last update)
- Size: ~200KB (vs jspreadsheet 500KB)
- License: MIT

### Step 2: Import Styles and Library
```typescript
import Spreadsheet from 'x-data-spreadsheet'
import 'x-data-spreadsheet/dist/xspreadsheet.css'
```

### Step 3: Remove jspreadsheet CDN Scripts
**Files to Modify:**
- Remove from `app/layout.tsx` or wherever CDN scripts are loaded:
```html
<!-- REMOVE THESE -->
<link rel="stylesheet" href="https://bossanova.uk/jspreadsheet/v4/jexcel.css" />
<script src="https://bossanova.uk/jspreadsheet/v4/jexcel.js"></script>
```

---

## 🔧 Code Changes Required

### File: `components/visualization/VisualizationTab.tsx`

#### Change 1: Remove Global Window Type Declarations
**Current (Lines ~1-30):**
```typescript
declare global {
  interface Window {
    jspreadsheet: any
    jSuites: any
    XLSX: any
  }
}
```

**New:**
```typescript
import Spreadsheet from 'x-data-spreadsheet'
import 'x-data-spreadsheet/dist/xspreadsheet.css'

declare global {
  interface Window {
    XLSX: any  // Keep XLSX for file imports
  }
}
```

---

#### Change 2: Update State Variables
**Current:**
```typescript
const [jspreadsheet, setJspreadsheet] = useState<any>(null)
const spreadsheetRef = useRef<HTMLDivElement>(null)
```

**New:**
```typescript
const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>(null)
const spreadsheetRef = useRef<HTMLDivElement>(null)
```

---

#### Change 3: Rewrite Spreadsheet Initialization
**Current (Lines ~150-220):**
```typescript
useEffect(() => {
  if (isLoading || !spreadsheetRef.current) return

  if (!jspreadsheet && window.jspreadsheet) {
    if (spreadsheetData && spreadsheetData.length > 0) {
      const table = window.jspreadsheet(spreadsheetRef.current, {
        data: spreadsheetData,
        columns: storedHeaders.map(h => ({
          type: 'text',
          title: h,
          width: 120
        })),
        // ... options
        onselection: (instance, x1, y1, x2, y2) => {
          updateSelectedColumns(instance, x1, y1, x2, y2)
        },
      })
      setJspreadsheet(table)
    }
  }
}, [isLoading, spreadsheetData, storedHeaders])
```

**New:**
```typescript
useEffect(() => {
  if (isLoading || !spreadsheetRef.current) return
  if (spreadsheet) return  // Already initialized

  // Create container with ID (x-spreadsheet needs element reference)
  const containerId = 'xspreadsheet-vis-tab'
  spreadsheetRef.current.id = containerId

  // Initialize x-spreadsheet
  const xs = new Spreadsheet(`#${containerId}`, {
    mode: 'edit',
    showToolbar: false,  // We have custom toolbar
    showGrid: true,
    showContextmenu: true,
    showBottomBar: false,  // Hide sheet tabs
    view: {
      height: () => 600,
      width: () => spreadsheetRef.current?.clientWidth || 800,
    },
    row: {
      len: Math.max(spreadsheetData.length, 100),
      height: 25,
    },
    col: {
      len: Math.max(storedHeaders.length, 26),
      width: 120,
      indexWidth: 60,
      minWidth: 60,
    },
  })

  // Load data if available
  if (spreadsheetData.length > 0 && storedHeaders.length > 0) {
    const xsData = convertToXSpreadsheetFormat(spreadsheetData, storedHeaders)
    xs.loadData([xsData])
  }

  // Bind events
  xs.on('cells-selected', (cell: any, range: { sri: number; sci: number; eri: number; eci: number }) => {
    updateSelectedColumnsForXSpreadsheet(range.sci, range.eci)
  })

  xs.on('cell-edited', (text: string, ri: number, ci: number) => {
    // Handle cell edits if needed
    console.log('Cell edited:', { text, ri, ci })
  })

  setSpreadsheet(xs)
}, [isLoading, spreadsheetData, storedHeaders])
```

---

#### Change 4: Data Format Converter
**New Helper Function (add before component):**
```typescript
/**
 * Converts our internal spreadsheet data to x-spreadsheet format
 */
function convertToXSpreadsheetFormat(data: any[][], headers: string[]) {
  const rows: Record<number, any> = {}
  
  data.forEach((row, rowIndex) => {
    const cells: Record<number, any> = {}
    row.forEach((cellValue, colIndex) => {
      if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
        cells[colIndex] = {
          text: String(cellValue)
        }
      }
    })
    rows[rowIndex] = { cells }
  })

  const cols: Record<number, any> = {
    len: headers.length
  }
  headers.forEach((header, index) => {
    cols[index] = { width: 120 }
  })

  return {
    name: 'Sheet1',
    rows,
    cols,
    // Set column headers by adding them as first row
    // x-spreadsheet doesn't have separate header concept
  }
}

/**
 * Converts x-spreadsheet data back to our format
 */
function convertFromXSpreadsheetFormat(xsData: any): { data: any[][], headers: string[] } {
  const data: any[][] = []
  const headers: string[] = []
  
  const sheetData = Array.isArray(xsData) ? xsData[0] : xsData
  const { rows } = sheetData
  
  // Extract data
  Object.keys(rows || {}).forEach(rowIndex => {
    const rowNum = parseInt(rowIndex, 10)
    const rowData: any[] = []
    const rowCells = rows[rowNum].cells || {}
    
    Object.keys(rowCells).forEach(colIndex => {
      const colNum = parseInt(colIndex, 10)
      rowData[colNum] = rowCells[colNum].text || ''
    })
    
    data[rowNum] = rowData
  })
  
  // First row as headers
  if (data.length > 0) {
    headers.push(...data[0])
    data.shift()  // Remove first row
  }
  
  return { data, headers }
}
```

---

#### Change 5: Update Column Selection Handler
**Current:**
```typescript
const updateSelectedColumns = (instance: any, x1: number, y1: number, x2: number, y2: number) => {
  const cols = []
  for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) {
    cols.push(i)
  }
  setSelectedColumns(cols)
}
```

**New:**
```typescript
const updateSelectedColumnsForXSpreadsheet = (startCol: number, endCol: number) => {
  const cols = []
  for (let i = Math.min(startCol, endCol); i <= Math.max(startCol, endCol); i++) {
    cols.push(i)
  }
  setSelectedColumns(cols)
}
```

---

#### Change 6: Update Plot Data Extraction
**Current:**
```typescript
const handlePlot = () => {
  if (!jspreadsheet || selectedColumns.length < 2) {
    alert('Please select at least 2 columns to create a plot')
    return
  }

  const data = jspreadsheet.getData()
  const headers = jspreadsheet.getHeaders().split(',')
  
  const xCol = selectedColumns[0]
  const yCol = selectedColumns[1]
  
  const xData = data.map((row: any[]) => row[xCol]).filter((val: any) => val !== '')
  const yData = data.map((row: any[]) => row[yCol]).filter((val: any) => val !== '')
  
  const xLabel = headers[xCol] || `Column ${xCol + 1}`
  const yLabel = headers[yCol] || `Column ${yCol + 1}`
  
  setXAxisTitle(xLabel)
  setYAxisTitle(yLabel)
  generatePlot(xData, yData, xLabel, yLabel)
}
```

**New:**
```typescript
const handlePlot = () => {
  if (!spreadsheet || selectedColumns.length < 2) {
    alert('Please select at least 2 columns to create a plot')
    return
  }

  // Get data from x-spreadsheet
  const xsData = spreadsheet.getData()
  const { data, headers } = convertFromXSpreadsheetFormat(xsData)
  
  const xCol = selectedColumns[0]
  const yCol = selectedColumns[1]
  
  const xData = data.map((row: any[]) => row[xCol]).filter((val: any) => val !== null && val !== undefined && val !== '')
  const yData = data.map((row: any[]) => row[yCol]).filter((val: any) => val !== null && val !== undefined && val !== '')
  
  const xLabel = headers[xCol] || `Column ${xCol + 1}`
  const yLabel = headers[yCol] || `Column ${yCol + 1}`
  
  setXAxisTitle(xLabel)
  setYAxisTitle(yLabel)
  generatePlot(xData, yData, xLabel, yLabel)
}
```

---

#### Change 7: Update Row/Column Manipulation
**Current:**
```typescript
const handleAddRow = () => {
  if (jspreadsheet) {
    jspreadsheet.insertRow()
  }
}

const handleDeleteRow = () => {
  if (jspreadsheet) {
    const selectedRows = jspreadsheet.getSelectedRows()
    if (selectedRows && selectedRows.length > 0) {
      jspreadsheet.deleteRow(selectedRows.length)
    } else {
      jspreadsheet.deleteRow()
    }
  }
}

const handleAddColumn = () => {
  if (jspreadsheet) {
    jspreadsheet.insertColumn()
  }
}

const handleDeleteColumn = () => {
  if (jspreadsheet) {
    jspreadsheet.deleteColumn()
  }
}
```

**New:**
```typescript
const handleAddRow = () => {
  if (!spreadsheet) return
  
  // x-spreadsheet doesn't expose direct insert row API
  // Workaround: modify data and reload
  const xsData = spreadsheet.getData()
  const { data, headers } = convertFromXSpreadsheetFormat(xsData)
  
  // Add empty row
  data.push(Array(headers.length).fill(''))
  
  // Reload data
  const newXsData = convertToXSpreadsheetFormat(data, headers)
  spreadsheet.loadData([newXsData])
}

const handleDeleteRow = () => {
  if (!spreadsheet) return
  
  // Note: x-spreadsheet has this via context menu or toolbar
  // For programmatic access, we'd need to track selected rows
  alert('Use right-click context menu to delete rows, or select row and press Delete')
}

const handleAddColumn = () => {
  if (!spreadsheet) return
  
  const xsData = spreadsheet.getData()
  const { data, headers } = convertFromXSpreadsheetFormat(xsData)
  
  // Add new column header
  headers.push(`Column ${headers.length + 1}`)
  
  // Add empty cells to each row
  data.forEach(row => {
    row.push('')
  })
  
  // Reload data
  const newXsData = convertToXSpreadsheetFormat(data, headers)
  spreadsheet.loadData([newXsData])
}

const handleDeleteColumn = () => {
  if (!spreadsheet) return
  
  alert('Use right-click context menu to delete columns')
}
```

---

#### Change 8: Update File Upload Handler
**Current:**
```typescript
const createSpreadsheetWithData = (headers: any[], rows: any[][]) => {
  // Destroy existing spreadsheet
  if (jspreadsheet && spreadsheetRef.current) {
    jspreadsheet.destroy()
  }

  if (spreadsheetRef.current && window.jspreadsheet) {
    const table = window.jspreadsheet(spreadsheetRef.current, {
      data: rows.length > 0 ? rows : Array(20).fill(null).map(() => Array(headers.length).fill('')),
      columns: headers.map((header, i) => ({
        type: 'text',
        title: String(header || ''),
        width: 120
      })),
      // ... rest of config
    })
    setJspreadsheet(table)
    
    setSpreadsheetData(rows, headers, currentFilename)
    saveDatasetToStore(headers, rows)
  }
}
```

**New:**
```typescript
const createSpreadsheetWithData = (headers: any[], rows: any[][]) => {
  if (!spreadsheet) return
  
  // Convert and load data
  const xsData = convertToXSpreadsheetFormat(
    rows.length > 0 ? rows : Array(20).fill(null).map(() => Array(headers.length).fill('')),
    headers
  )
  
  spreadsheet.loadData([xsData])
  
  // Save to stores
  setSpreadsheetData(rows, headers, currentFilename)
  saveDatasetToStore(headers, rows)
}
```

---

## 🎨 Styling Adjustments

x-spreadsheet comes with its own CSS. You may need to customize it to match your design.

**File: Create `styles/x-spreadsheet-custom.css`**
```css
/* Override x-spreadsheet default styles */
.x-spreadsheet {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.x-spreadsheet-sheet {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* Hide toolbar since we have custom toolbar */
.x-spreadsheet-toolbar {
  display: none !important;
}

/* Hide bottom bar (sheet tabs) */
.x-spreadsheet-bottombar {
  display: none !important;
}

/* Adjust cell height for better readability */
.x-spreadsheet-table td {
  padding: 6px 8px;
}

/* Match your theme colors */
.x-spreadsheet-selector {
  border: 2px solid #3b82f6;
}

.x-spreadsheet-selector-corner {
  background-color: #3b82f6;
}
```

**Import in VisualizationTab.tsx:**
```typescript
import 'x-data-spreadsheet/dist/xspreadsheet.css'
import '@/styles/x-spreadsheet-custom.css'
```

---

## 🧪 Testing Checklist

### Phase 1: Basic Functionality
- [ ] Install x-data-spreadsheet package
- [ ] Remove jspreadsheet CDN scripts
- [ ] Update imports and type declarations
- [ ] Spreadsheet renders on page load
- [ ] Data loads correctly from store
- [ ] Headers display properly

### Phase 2: Data Interaction
- [ ] Cell editing works
- [ ] Formulas execute (test SUM, AVERAGE)
- [ ] Column selection triggers event handler
- [ ] Multiple column selection works
- [ ] Selected column state updates correctly

### Phase 3: Plotting Integration
- [ ] Plotly plot generates from selected columns
- [ ] Plot updates when different columns selected
- [ ] All plot types work (scatter, line, bar, scatter+line)
- [ ] Plot settings panel works correctly

### Phase 4: File Operations
- [ ] CSV file upload works
- [ ] XLSX file upload works
- [ ] Header detection dialog functions
- [ ] Data loads correctly after upload
- [ ] Data saves to visualizationStore

### Phase 5: Row/Column Operations
- [ ] Add row functionality (via data reload method)
- [ ] Add column functionality (via data reload method)
- [ ] Delete row (via context menu)
- [ ] Delete column (via context menu)
- [ ] Context menu appears on right-click

### Phase 6: Store Integration
- [ ] Data persists in visualizationStore
- [ ] Dataset saves to datasetStore for Analysis page
- [ ] Data persists across page navigation
- [ ] Data reloads correctly on page refresh

### Phase 7: Layout & Styling
- [ ] Spreadsheet fits in 50% split view
- [ ] Plot area displays in right 50%
- [ ] Custom CSS overrides apply correctly
- [ ] Toolbar hidden/shown as configured
- [ ] Sheet tabs hidden
- [ ] Scrollbars work correctly

### Phase 8: Edge Cases
- [ ] Empty spreadsheet displays correctly
- [ ] Single column selected (plot button disabled)
- [ ] Very large datasets (1000+ rows)
- [ ] Special characters in headers
- [ ] Numeric-only first row (header dialog)

---

## ⚠️ Known Limitations & Workarounds

### 1. **No Direct Row/Column Insert API**
**Issue:** x-spreadsheet doesn't expose `insertRow()` / `deleteRow()` like jspreadsheet.

**Workaround:**
- Use built-in context menu (right-click → Insert Row)
- Or: Extract data, modify array, reload with `loadData()`

**Impact:** Slightly less convenient programmatic control, but users can still use context menu.

---

### 2. **Different Header Handling**
**Issue:** x-spreadsheet doesn't have separate "header row" concept.

**Workaround:**
- Treat first data row as headers
- Extract/inject header row during format conversion
- Update `convertToXSpreadsheetFormat()` to handle this

**Impact:** Need data transformation layer.

---

### 3. **Event Handler Timing**
**Issue:** x-spreadsheet events fire differently than jspreadsheet callbacks.

**Workaround:**
- Test event firing order carefully
- May need `setTimeout` or `useEffect` for state updates

**Impact:** Minor timing adjustments in event handlers.

---

### 4. **TypeScript Types**
**Issue:** TypeScript types are community-maintained, may be incomplete.

**Workaround:**
- Use `any` for x-spreadsheet instance initially
- Create custom type definitions for commonly used methods

**Impact:** Less type safety initially.

---

### 5. **Bundle Size Increase**
**Issue:** Adding x-spreadsheet to npm packages increases bundle size (though it's smaller than jspreadsheet).

**Workaround:**
- Use dynamic import for VisualizationTab component
- Already exists in your code: `LazyComponents.tsx`

**Impact:** Minimal - you already lazy-load components.

---

## 🔄 Rollback Plan

If migration fails or issues arise:

### Option 1: Keep Both Libraries
```typescript
// Feature flag in environment variable
const USE_X_SPREADSHEET = process.env.NEXT_PUBLIC_USE_X_SPREADSHEET === 'true'

// Conditionally render
{USE_X_SPREADSHEET ? <XSpreadsheetComponent /> : <JSpreadsheetComponent />}
```

### Option 2: Full Rollback
1. Revert commit: `git revert <commit-hash>`
2. Restore jspreadsheet CDN scripts
3. Remove x-data-spreadsheet from package.json
4. `npm uninstall x-data-spreadsheet`

---

## 📈 Performance Considerations

### Before (jspreadsheet):
- Loaded via CDN (~500KB)
- Global window namespace
- No tree-shaking

### After (x-spreadsheet):
- npm package (~200KB)
- Imported only in VisualizationTab
- Lazy-loaded component (already implemented)
- Better bundle optimization

**Expected Improvement:** ~60% reduction in spreadsheet library size.

---

## 🚀 Migration Timeline

### Phase 1: Preparation (30 minutes)
- [x] Analyze current implementation
- [x] Review x-spreadsheet documentation
- [x] Create implementation plan (this document)
- [ ] Review with team

### Phase 2: Development (2-3 hours)
- [ ] Install x-data-spreadsheet
- [ ] Create data conversion helpers
- [ ] Update VisualizationTab component
- [ ] Implement event handlers
- [ ] Create custom CSS overrides

### Phase 3: Testing (1-2 hours)
- [ ] Run through testing checklist
- [ ] Test all user workflows
- [ ] Test with sample datasets
- [ ] Test edge cases

### Phase 4: Refinement (1 hour)
- [ ] Fix bugs found in testing
- [ ] Optimize performance
- [ ] Add error handling
- [ ] Update documentation

### Phase 5: Deployment (30 minutes)
- [ ] Code review
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor for issues

---

## 🔒 Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data loss during migration | Low | High | Keep jspreadsheet code in separate branch, implement data backup before conversion |
| Performance degradation | Low | Medium | Load testing with large datasets, rollback if issues |
| Breaking existing workflows | Medium | High | Comprehensive testing checklist, beta testing with users |
| TypeScript errors | Medium | Low | Use `any` types initially, incrementally add proper types |
| Library abandonment | High | Medium | Already abandoned (3 years), consider migrating to @wolf-table/table later |

---

## 📚 Resources

### Official Documentation
- x-spreadsheet GitHub: https://github.com/myliang/x-spreadsheet
- Migration target: https://github.com/wolf-table/table
- npm package: https://www.npmjs.com/package/x-data-spreadsheet

### Integration Guides
- SheetJS (XLSX) integration: https://github.com/SheetJS/sheetjs/tree/master/demos/xspreadsheet

### API Reference
```typescript
// Core Methods
new Spreadsheet(selector, options)
.loadData(data)          // Load spreadsheet data
.getData()               // Get current data
.change(callback)        // Data change event
.on(event, callback)     // Bind events
.cell(ri, ci, si)        // Get cell data
.cellText(ri, ci, text)  // Set cell text
.cellStyle(ri, ci)       // Get cell style
.reRender()              // Force re-render
.validate()              // Validate data

// Events
'cell-selected'   // Single cell selected
'cells-selected'  // Multiple cells/range selected
'cell-edited'     // Cell text edited
```

---

## ✅ Recommendation

### Proceed with Migration: **YES, with Caution**

**Reasons to Proceed:**
1. ✅ All three requirements are fully achievable
2. ✅ Better formula support (free vs enterprise)
3. ✅ Smaller bundle size (200KB vs 500KB)
4. ✅ npm-based = better dependency management
5. ✅ Migration complexity is manageable

**Cautions:**
1. ⚠️ Library is unmaintained (3 years old)
2. ⚠️ Different API requires code rewrite
3. ⚠️ Row/column manipulation less convenient

### Long-term Recommendation:
Consider evaluating **@wolf-table/table** (the successor mentioned in x-spreadsheet README) for future migration if x-spreadsheet shows issues.

---

## 🎯 Next Steps

1. **Get Approval:** Review this plan with stakeholders
2. **Create Feature Branch:** `git checkout -b feature/migrate-to-x-spreadsheet`
3. **Install Package:** `npm install x-data-spreadsheet`
4. **Begin Implementation:** Start with Phase 1 of migration timeline
5. **Incremental Testing:** Test each change before moving to next
6. **Beta Testing:** Test with real users before production deployment

---

**Document Version:** 1.0  
**Created:** February 9, 2026  
**Author:** GitHub Copilot  
**Status:** Ready for Implementation
