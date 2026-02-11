import { create } from 'zustand'

interface VisualizationState {
  // Spreadsheet data
  spreadsheetData: any[][] | null
  headers: string[] | null
  currentFilename: string
  
  // Plot state
  plotData: any
  selectedColumns: number[]
  
  // Plot settings
  plotType: 'scatter' | 'line' | 'bar' | 'scatter+line'
  markerSize: number
  markerColor: string
  xAxisTitle: string
  yAxisTitle: string
  plotTitle: string
  showLegend: boolean
  showGrid: boolean
  fontSize: number
  fontBold: boolean
  fontItalic: boolean
  fontUnderline: boolean
  xTickCount: number
  yTickCount: number
  
  // Actions
  setSpreadsheetData: (data: any[][], headers: string[], filename: string) => void
  setPlotData: (data: any) => void
  setSelectedColumns: (columns: number[]) => void
  setPlotType: (type: 'scatter' | 'line' | 'bar' | 'scatter+line') => void
  setMarkerSize: (size: number) => void
  setMarkerColor: (color: string) => void
  setXAxisTitle: (title: string) => void
  setYAxisTitle: (title: string) => void
  setPlotTitle: (title: string) => void
  setShowLegend: (show: boolean) => void
  setShowGrid: (show: boolean) => void
  setFontSize: (size: number) => void
  setFontBold: (bold: boolean) => void
  setFontItalic: (italic: boolean) => void
  setFontUnderline: (underline: boolean) => void
  setXTickCount: (count: number) => void
  setYTickCount: (count: number) => void
  clearVisualization: () => void
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  // Initial state
  spreadsheetData: null,
  headers: null,
  currentFilename: '',
  plotData: null,
  selectedColumns: [],
  plotType: 'line',
  markerSize: 4,
  markerColor: '#2E3440',
  xAxisTitle: 'X Axis',
  yAxisTitle: 'Y Axis',
  plotTitle: '',
  showLegend: true,
  showGrid: false,
  fontSize: 12,
  fontBold: false,
  fontItalic: false,
  fontUnderline: false,
  xTickCount: 10,
  yTickCount: 10,
  
  // Actions
  setSpreadsheetData: (data, headers, filename) =>
    set({ spreadsheetData: data, headers, currentFilename: filename }),
  setPlotData: (data) => set({ plotData: data }),
  setSelectedColumns: (columns) => set({ selectedColumns: columns }),
  setPlotType: (type) => set({ plotType: type }),
  setMarkerSize: (size) => set({ markerSize: size }),
  setMarkerColor: (color) => set({ markerColor: color }),
  setXAxisTitle: (title) => set({ xAxisTitle: title }),
  setYAxisTitle: (title) => set({ yAxisTitle: title }),
  setPlotTitle: (title) => set({ plotTitle: title }),
  setShowLegend: (show) => set({ showLegend: show }),
  setShowGrid: (show) => set({ showGrid: show }),
  setFontSize: (size) => set({ fontSize: size }),
  setFontBold: (bold) => set({ fontBold: bold }),
  setFontItalic: (italic) => set({ fontItalic: italic }),
  setFontUnderline: (underline) => set({ fontUnderline: underline }),
  setXTickCount: (count) => set({ xTickCount: count }),
  setYTickCount: (count) => set({ yTickCount: count }),
  clearVisualization: () =>
    set({
      spreadsheetData: null,
      headers: null,
      currentFilename: '',
      plotData: null,
      selectedColumns: [],
    }),
}))
