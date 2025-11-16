/**
 * PDF Report Generation System
 * Generates publication-ready reports with plots, analysis, and data
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

export interface ReportSection {
  type: 'title' | 'subtitle' | 'text' | 'table' | 'plot' | 'analysis' | 'pagebreak'
  content?: string
  data?: any
  image?: string // Base64 encoded image
  tableData?: {
    headers: string[]
    rows: (string | number)[][]
  }
}

export interface ReportMetadata {
  title: string
  author?: string
  institution?: string
  date?: Date
  projectName?: string
  description?: string
}

export class PDFReportGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
  }

  /**
   * Generate a complete report
   */
  async generateReport(metadata: ReportMetadata, sections: ReportSection[]): Promise<Blob> {
    // Add title page
    this.addTitlePage(metadata)

    // Add sections
    for (const section of sections) {
      await this.addSection(section)
    }

    // Add footer to all pages
    this.addPageNumbers()

    // Return as blob
    return this.doc.output('blob')
  }

  /**
   * Add title page
   */
  private addTitlePage(metadata: ReportMetadata): void {
    const centerX = this.pageWidth / 2

    // Logo/Header
    this.doc.setFontSize(32)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('ElctrDc', centerX, 60, { align: 'center' })

    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Electrochemistry Research Platform', centerX, 70, { align: 'center' })

    // Title
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    const titleLines = this.doc.splitTextToSize(metadata.title, this.pageWidth - 40)
    this.doc.text(titleLines, centerX, 100, { align: 'center' })

    // Metadata
    let metaY = 100 + titleLines.length * 10 + 20

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')

    if (metadata.author) {
      this.doc.text(`Author: ${metadata.author}`, centerX, metaY, { align: 'center' })
      metaY += 8
    }

    if (metadata.institution) {
      this.doc.text(`Institution: ${metadata.institution}`, centerX, metaY, { align: 'center' })
      metaY += 8
    }

    if (metadata.projectName) {
      this.doc.text(`Project: ${metadata.projectName}`, centerX, metaY, { align: 'center' })
      metaY += 8
    }

    const dateStr = format(metadata.date || new Date(), 'MMMM d, yyyy')
    this.doc.text(`Date: ${dateStr}`, centerX, metaY, { align: 'center' })

    // Description
    if (metadata.description) {
      metaY += 20
      this.doc.setFontSize(11)
      const descLines = this.doc.splitTextToSize(
        metadata.description,
        this.pageWidth - 60
      )
      this.doc.text(descLines, centerX, metaY, { align: 'center' })
    }

    // Start new page for content
    this.doc.addPage()
    this.currentY = this.margin
  }

  /**
   * Add a section to the report
   */
  private async addSection(section: ReportSection): Promise<void> {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage()
      this.currentY = this.margin
    }

    switch (section.type) {
      case 'title':
        this.addTitle(section.content || '')
        break
      case 'subtitle':
        this.addSubtitle(section.content || '')
        break
      case 'text':
        this.addText(section.content || '')
        break
      case 'table':
        if (section.tableData) {
          this.addTable(section.tableData)
        }
        break
      case 'plot':
        if (section.image) {
          await this.addPlot(section.image, section.content)
        }
        break
      case 'analysis':
        this.addAnalysis(section.data)
        break
      case 'pagebreak':
        this.doc.addPage()
        this.currentY = this.margin
        break
    }
  }

  /**
   * Add title
   */
  private addTitle(text: string): void {
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margin, this.currentY)
    this.currentY += 10
  }

  /**
   * Add subtitle
   */
  private addSubtitle(text: string): void {
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margin, this.currentY)
    this.currentY += 8
  }

  /**
   * Add text paragraph
   */
  private addText(text: string): void {
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')

    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin)

    for (const line of lines) {
      if (this.currentY > this.pageHeight - this.margin) {
        this.doc.addPage()
        this.currentY = this.margin
      }
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 6
    }

    this.currentY += 4
  }

  /**
   * Add table
   */
  private addTable(tableData: { headers: string[]; rows: (string | number)[][] }): void {
    autoTable(this.doc, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // @ts-ignore - autoTable adds finalY
    this.currentY = this.doc.lastAutoTable.finalY + 10
  }

  /**
   * Add plot/chart image
   */
  private async addPlot(imageData: string, caption?: string): Promise<void> {
    const imgWidth = this.pageWidth - 2 * this.margin
    const imgHeight = (imgWidth * 3) / 4 // 4:3 aspect ratio

    // Check if image fits on current page
    if (this.currentY + imgHeight > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }

    this.doc.addImage(
      imageData,
      'PNG',
      this.margin,
      this.currentY,
      imgWidth,
      imgHeight
    )

    this.currentY += imgHeight + 5

    if (caption) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'italic')
      this.doc.text(caption, this.margin, this.currentY)
      this.currentY += 10
    }
  }

  /**
   * Add analysis results
   */
  private addAnalysis(data: any): void {
    if (!data) return

    this.addSubtitle('Statistical Analysis')

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')

    const metrics = [
      { label: 'Mean', value: data.mean },
      { label: 'Median', value: data.median },
      { label: 'Std Dev', value: data.stdDev },
      { label: 'Min', value: data.min },
      { label: 'Max', value: data.max },
      { label: 'R²', value: data.r2 },
    ]

    metrics.forEach((metric) => {
      if (metric.value !== undefined) {
        const text = `${metric.label}: ${
          typeof metric.value === 'number' ? metric.value.toFixed(4) : metric.value
        }`
        this.doc.text(text, this.margin + 5, this.currentY)
        this.currentY += 6
      }
    })

    this.currentY += 5
  }

  /**
   * Add page numbers
   */
  private addPageNumbers(): void {
    const pageCount = this.doc.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      )

      // Add footer line
      this.doc.setDrawColor(200, 200, 200)
      this.doc.line(
        this.margin,
        this.pageHeight - 15,
        this.pageWidth - this.margin,
        this.pageHeight - 15
      )

      // Add timestamp
      this.doc.text(
        `Generated by ElctrDc on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
        this.margin,
        this.pageHeight - 10
      )
    }
  }

  /**
   * Download the PDF
   */
  download(filename: string): void {
    this.doc.save(filename)
  }
}

/**
 * Quick report generation helper
 */
export async function generateQuickReport(
  metadata: ReportMetadata,
  plotImages: { image: string; caption: string }[],
  analysisData?: any
): Promise<Blob> {
  const generator = new PDFReportGenerator()

  const sections: ReportSection[] = []

  // Add introduction
  sections.push({
    type: 'title',
    content: 'Experimental Results',
  })

  sections.push({
    type: 'text',
    content:
      'This report contains the results of electrochemical experiments conducted using ElctrDc.',
  })

  // Add plots
  plotImages.forEach((plot, index) => {
    sections.push({
      type: 'subtitle',
      content: `Figure ${index + 1}`,
    })

    sections.push({
      type: 'plot',
      image: plot.image,
      content: plot.caption,
    })
  })

  // Add analysis
  if (analysisData) {
    sections.push({
      type: 'pagebreak',
    })

    sections.push({
      type: 'title',
      content: 'Data Analysis',
    })

    sections.push({
      type: 'analysis',
      data: analysisData,
    })
  }

  return generator.generateReport(metadata, sections)
}
