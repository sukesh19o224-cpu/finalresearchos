import { BaseParser } from './base-parser'
import type { ParsedData } from '@/types'

export class BioLogicMPTParser extends BaseParser {
  canParse(file: File): boolean {
    return file.name.endsWith('.mpt') || file.name.endsWith('.mpr')
  }

  async parse(file: File): Promise<ParsedData> {
    // Check if it's a binary .mpr file
    if (file.name.endsWith('.mpr')) {
      // .mpr files are binary format - for now, we'll return a placeholder
      // In production, you'd need a proper .mpr parser library
      return {
        technique: 'CV' as const, // Default technique
        instrument: 'BioLogic',
        metadata: {
          comments: `.mpr files require binary parsing. Please convert to .mpt format or use BioLogic EC-Lab software to export as text. File: ${file.name}, Size: ${file.size} bytes`
        },
        data: {
          columns: ['time', 'voltage', 'current'],
          rows: []
        },
        units: {}
      }
    }

    // Parse .mpt text files
    const text = await file.text()
    const lines = text.split('\n')

    // MPT files have three sections separated by blank lines
    // 1. Header section (Nb header lines: X)
    // 2. Settings section
    // 3. Data section (tab-delimited)

    const sections = this.splitSections(lines)
    const metadata = this.parseMetadata(sections.header)
    const settings = this.parseSettings(sections.settings)
    const { columns, rows } = this.parseData(sections.data)

    const technique = this.detectTechnique(columns, text)
    const units = this.extractUnits(columns)

    return {
      technique,
      instrument: 'BioLogic',
      metadata: {
        ...metadata,
        settings,
      },
      data: {
        columns,
        rows,
      },
      units,
    }
  }

  private splitSections(lines: string[]) {
    // Find header line count
    const headerCountLine = lines.find(l => l.startsWith('Nb header lines :'))
    const headerCount = headerCountLine
      ? parseInt(headerCountLine.split(':')[1].trim())
      : 0

    // Header section
    const header = lines.slice(0, headerCount)

    // Find where data starts (column headers line)
    let dataStartIndex = lines.findIndex((l, i) => {
      return i > headerCount && (
        l.includes('mode\t') ||
        l.includes('Ewe/V\t') ||
        l.includes('freq/Hz\t') ||
        l.toLowerCase().includes('time')
      )
    })

    if (dataStartIndex === -1) {
      dataStartIndex = headerCount
    }

    // Settings section (between header and data)
    const settings = lines.slice(headerCount, dataStartIndex)

    // Data section
    const data = lines.slice(dataStartIndex)

    return { header, settings, data }
  }

  private parseMetadata(header: string[]): Record<string, any> {
    const metadata: Record<string, any> = {}

    for (const line of header) {
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim())
        metadata[key] = value
      }
    }

    return metadata
  }

  private parseSettings(settings: string[]): Record<string, any> {
    const settingsObj: Record<string, any> = {}

    for (const line of settings) {
      if (line.trim() && !line.startsWith('Nb header lines')) {
        const parts = line.split('\t').filter(p => p.trim())
        if (parts.length >= 2) {
          settingsObj[parts[0].trim()] = parts[1].trim()
        }
      }
    }

    return settingsObj
  }

  private parseData(data: string[]): { columns: string[]; rows: number[][] } {
    // First non-empty line is the header
    const headerLine = data.find(l => l.trim())
    if (!headerLine) {
      return { columns: [], rows: [] }
    }

    const columns = headerLine.split('\t').map(c => c.trim()).filter(c => c)

    // Parse data rows
    const rows: number[][] = []
    for (let i = 1; i < data.length; i++) {
      const line = data[i].trim()
      if (!line) continue

      const values = line.split('\t').map(v => {
        const num = parseFloat(v)
        return isNaN(num) ? 0 : num
      })

      if (values.length === columns.length) {
        rows.push(values)
      }
    }

    return { columns, rows }
  }
}
