/**
 * LaTeX Export System
 * Export equations, tables, and reports to LaTeX format
 */

export interface LaTeXExportOptions {
  documentClass?: 'article' | 'report' | 'book'
  fontSize?: '10pt' | '11pt' | '12pt'
  paperSize?: 'a4paper' | 'letterpaper'
  includePackages?: string[]
  title?: string
  author?: string
  date?: string
}

export class LaTeXExporter {
  private options: Required<LaTeXExportOptions>

  constructor(options: LaTeXExportOptions = {}) {
    this.options = {
      documentClass: options.documentClass || 'article',
      fontSize: options.fontSize || '11pt',
      paperSize: options.paperSize || 'a4paper',
      includePackages: options.includePackages || [
        'amsmath',
        'amssymb',
        'graphicx',
        'booktabs',
        'siunitx',
        'chemformula',
        'hyperref',
      ],
      title: options.title || 'Electrochemistry Data Analysis',
      author: options.author || '',
      date: options.date || '\\today',
    }
  }

  /**
   * Generate complete LaTeX document
   */
  generateDocument(content: string): string {
    let latex = this.generatePreamble()
    latex += '\n\\begin{document}\n\n'

    if (this.options.title) {
      latex += '\\maketitle\n\n'
    }

    latex += content

    latex += '\n\\end{document}'

    return latex
  }

  /**
   * Generate preamble
   */
  private generatePreamble(): string {
    let preamble = `\\documentclass[${this.options.fontSize},${this.options.paperSize}]{${this.options.documentClass}}\n\n`

    // Add packages
    this.options.includePackages.forEach((pkg) => {
      preamble += `\\usepackage{${pkg}}\n`
    })

    preamble += '\n'

    // Add title information
    if (this.options.title) {
      preamble += `\\title{${this.escapeLatex(this.options.title)}}\n`
    }
    if (this.options.author) {
      preamble += `\\author{${this.escapeLatex(this.options.author)}}\n`
    }
    preamble += `\\date{${this.options.date}}\n\n`

    return preamble
  }

  /**
   * Escape LaTeX special characters
   */
  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
  }

  /**
   * Export equation
   */
  exportEquation(equation: string, label?: string, numbered: boolean = true): string {
    if (numbered) {
      let latex = '\\begin{equation}\n'
      if (label) {
        latex += `\\label{eq:${label}}\n`
      }
      latex += equation + '\n'
      latex += '\\end{equation}\n'
      return latex
    } else {
      return `\\[${equation}\\]\n`
    }
  }

  /**
   * Export table
   */
  exportTable(
    headers: string[],
    rows: (string | number)[][],
    caption?: string,
    label?: string
  ): string {
    const numCols = headers.length
    const alignment = 'c'.repeat(numCols)

    let latex = '\\begin{table}[h]\n'
    latex += '\\centering\n'

    if (caption) {
      latex += `\\caption{${this.escapeLatex(caption)}}\n`
    }
    if (label) {
      latex += `\\label{tab:${label}}\n`
    }

    latex += `\\begin{tabular}{${alignment}}\n`
    latex += '\\toprule\n'

    // Headers
    latex += headers.map((h) => this.escapeLatex(h)).join(' & ') + ' \\\\\n'
    latex += '\\midrule\n'

    // Rows
    rows.forEach((row) => {
      latex += row.map((cell) => this.formatCell(cell)).join(' & ') + ' \\\\\n'
    })

    latex += '\\bottomrule\n'
    latex += '\\end{tabular}\n'
    latex += '\\end{table}\n'

    return latex
  }

  /**
   * Format table cell
   */
  private formatCell(cell: string | number): string {
    if (typeof cell === 'number') {
      return this.formatNumber(cell)
    }
    return this.escapeLatex(String(cell))
  }

  /**
   * Format number with scientific notation if needed
   */
  private formatNumber(num: number): string {
    const abs = Math.abs(num)

    if (abs === 0) return '0'
    if (abs >= 1e-3 && abs < 1e4) {
      return num.toFixed(4)
    }

    // Scientific notation
    const exp = Math.floor(Math.log10(abs))
    const mantissa = num / Math.pow(10, exp)
    return `${mantissa.toFixed(2)} \\times 10^{${exp}}`
  }

  /**
   * Export figure reference
   */
  exportFigure(
    imagePath: string,
    caption?: string,
    label?: string,
    width: string = '0.8\\textwidth'
  ): string {
    let latex = '\\begin{figure}[h]\n'
    latex += '\\centering\n'
    latex += `\\includegraphics[width=${width}]{${imagePath}}\n`

    if (caption) {
      latex += `\\caption{${this.escapeLatex(caption)}}\n`
    }
    if (label) {
      latex += `\\label{fig:${label}}\n`
    }

    latex += '\\end{figure}\n'

    return latex
  }

  /**
   * Export section
   */
  exportSection(title: string, content: string, level: number = 1): string {
    const sectionCommand = ['section', 'subsection', 'subsubsection'][level - 1] || 'section'
    let latex = `\\${sectionCommand}{${this.escapeLatex(title)}}\n\n`
    latex += content + '\n\n'
    return latex
  }

  /**
   * Export chemical formula
   */
  exportChemicalFormula(formula: string): string {
    return `\\ch{${formula}}`
  }

  /**
   * Export unit
   */
  exportUnit(value: number | string, unit: string): string {
    return `\\SI{${value}}{${unit}}`
  }

  /**
   * Export list
   */
  exportList(items: string[], ordered: boolean = false): string {
    const env = ordered ? 'enumerate' : 'itemize'
    let latex = `\\begin{${env}}\n`

    items.forEach((item) => {
      latex += `\\item ${this.escapeLatex(item)}\n`
    })

    latex += `\\end{${env}}\n`

    return latex
  }

  /**
   * Export curve fitting equation
   */
  exportFitEquation(
    fitType: string,
    coefficients: number[],
    r2: number,
    label?: string
  ): string {
    let equation = ''

    switch (fitType) {
      case 'linear':
        equation = `y = ${this.formatNumber(coefficients[0])}x + ${this.formatNumber(coefficients[1])}`
        break

      case 'polynomial':
        equation = 'y = '
        equation += coefficients
          .map((c, i) => {
            if (i === 0) return this.formatNumber(c)
            if (i === 1) return `${this.formatNumber(c)}x`
            return `${this.formatNumber(c)}x^{${i}}`
          })
          .reverse()
          .join(' + ')
        break

      case 'exponential':
        equation = `y = ${this.formatNumber(coefficients[0])} e^{${this.formatNumber(coefficients[1])}x}`
        break

      case 'logarithmic':
        equation = `y = ${this.formatNumber(coefficients[0])} \\ln(x) + ${this.formatNumber(coefficients[1])}`
        break

      case 'power':
        equation = `y = ${this.formatNumber(coefficients[0])} x^{${this.formatNumber(coefficients[1])}}`
        break

      default:
        equation = 'Unknown fit type'
    }

    equation += `, \\quad R^2 = ${r2.toFixed(4)}`

    return this.exportEquation(equation, label, true)
  }

  /**
   * Export statistics table
   */
  exportStatistics(stats: {
    mean: number
    median: number
    stdDev: number
    variance: number
    min: number
    max: number
    count: number
  }): string {
    const rows = [
      ['Mean', stats.mean],
      ['Median', stats.median],
      ['Standard Deviation', stats.stdDev],
      ['Variance', stats.variance],
      ['Minimum', stats.min],
      ['Maximum', stats.max],
      ['Count', stats.count],
    ]

    return this.exportTable(['Statistic', 'Value'], rows, 'Statistical Summary')
  }

  /**
   * Export electrochemistry equations
   */
  exportNernstEquation(E0: number, n: number, T: number = 298.15): string {
    const RT_nF = (8.314 * T) / (n * 96485)

    const equation = `E = E^0 + \\frac{RT}{nF} \\ln\\frac{[\\text{Ox}]}{[\\text{Red}]} = ${this.formatNumber(E0)} + ${this.formatNumber(RT_nF)} \\ln\\frac{[\\text{Ox}]}{[\\text{Red}]}`

    return this.exportEquation(equation, 'nernst', true)
  }

  exportButlerVolmer(): string {
    const equation =
      'i = i_0 \\left[ \\exp\\left(\\frac{\\alpha_a nF\\eta}{RT}\\right) - \\exp\\left(-\\frac{\\alpha_c nF\\eta}{RT}\\right) \\right]'

    return this.exportEquation(equation, 'butler-volmer', true)
  }

  exportCottrell(): string {
    const equation = 'i(t) = \\frac{nFAD^{1/2}C^*}{\\pi^{1/2}t^{1/2}}'

    return this.exportEquation(equation, 'cottrell', true)
  }
}

/**
 * Quick export helpers
 */
export function exportAnalysisToLaTeX(
  data: {
    title: string
    equations?: Array<{ eq: string; label?: string }>
    tables?: Array<{ headers: string[]; rows: any[][]; caption?: string }>
    figures?: Array<{ path: string; caption?: string }>
    statistics?: any
  },
  options?: LaTeXExportOptions
): string {
  const exporter = new LaTeXExporter(options)

  let content = ''

  // Add equations
  if (data.equations) {
    content += exporter.exportSection('Equations', '', 1)
    data.equations.forEach((eq) => {
      content += exporter.exportEquation(eq.eq, eq.label) + '\n'
    })
  }

  // Add tables
  if (data.tables) {
    content += exporter.exportSection('Tables', '', 1)
    data.tables.forEach((table) => {
      content += exporter.exportTable(table.headers, table.rows, table.caption) + '\n'
    })
  }

  // Add figures
  if (data.figures) {
    content += exporter.exportSection('Figures', '', 1)
    data.figures.forEach((fig) => {
      content += exporter.exportFigure(fig.path, fig.caption) + '\n'
    })
  }

  // Add statistics
  if (data.statistics) {
    content += exporter.exportSection('Statistical Analysis', '', 1)
    content += exporter.exportStatistics(data.statistics) + '\n'
  }

  return exporter.generateDocument(content)
}
