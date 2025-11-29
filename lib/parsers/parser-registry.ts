import { BaseParser } from './base-parser'
import { CSVParser } from './csv-parser'
import { BioLogicMPTParser } from './biologic-parser'
import { GamryDTAParser } from './gamry-parser'
import type { ParsedData } from '@/types'

export class ParserRegistry {
  private parsers: BaseParser[]

  constructor() {
    this.parsers = [
      new BioLogicMPTParser(),
      new GamryDTAParser(),
      new CSVParser(), // Fallback parser
    ]
  }

  async parseFile(file: File): Promise<ParsedData> {
    for (const parser of this.parsers) {
      if (parser.canParse(file)) {
        try {
          return await parser.parse(file)
        } catch (error) {
          console.error(`Parser failed for ${file.name}:`, error)
          // Try next parser
          continue
        }
      }
    }

    throw new Error(`No parser found for file type: ${file.name}`)
  }

  getSupportedFormats(): string[] {
    return [
      '.mpt (BioLogic Text)',
      '.mpr (BioLogic Binary)',
      '.dta (Gamry)',
      '.csv (Generic)',
      '.txt (Generic)',
    ]
  }
}

// Export singleton instance
export const parserRegistry = new ParserRegistry()
