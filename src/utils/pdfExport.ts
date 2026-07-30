import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { FontFamily, ImageElementData, PageElement, TextElementData } from '@/stores/editor'

export interface ExportInput {
  originalBytes: ArrayBuffer
  elementsByPage: Record<number, PageElement[]>
  scale: number
}

function mapToStandardFont(fontFamily: FontFamily, bold: boolean, italic: boolean): StandardFonts {
  switch (fontFamily) {
    case 'Times New Roman':
    case 'Georgia':
      if (bold && italic) return StandardFonts.TimesRomanBoldItalic
      if (bold) return StandardFonts.TimesRomanBold
      if (italic) return StandardFonts.TimesRomanItalic
      return StandardFonts.TimesRoman
    case 'Courier New':
      if (bold && italic) return StandardFonts.CourierBoldOblique
      if (bold) return StandardFonts.CourierBold
      if (italic) return StandardFonts.CourierOblique
      return StandardFonts.Courier
    case 'Helvetica':
    case 'Verdana':
    default:
      if (bold && italic) return StandardFonts.HelveticaBoldOblique
      if (bold) return StandardFonts.HelveticaBold
      if (italic) return StandardFonts.HelveticaOblique
      return StandardFonts.Helvetica
  }
}

function hexToRgbColor(hex: string) {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.substring(0, 2), 16) / 255
  const g = parseInt(normalized.substring(2, 4), 16) / 255
  const b = parseInt(normalized.substring(4, 6), 16) / 255
  return rgb(r || 0, g || 0, b || 0)
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function drawTextElement(
  page: PDFPage,
  element: TextElementData,
  scale: number,
  pageHeightPt: number,
  getFont: (fontFamily: FontFamily, bold: boolean, italic: boolean) => Promise<PDFFont>,
) {
  const font = await getFont(element.fontFamily, element.bold, element.italic)
  const fontSize = element.fontSize / scale
  const color = hexToRgbColor(element.color)

  const boxX = element.x / scale
  const boxTopY = pageHeightPt - element.y / scale
  const boxWidth = element.width / scale
  const lineHeight = fontSize * 1.2

  let cursorY = boxTopY - fontSize

  for (const line of element.content.split('\n')) {
    if (line.length > 0) {
      const textWidth = font.widthOfTextAtSize(line, fontSize)
      let x = boxX
      if (element.align === 'center') x = boxX + (boxWidth - textWidth) / 2
      else if (element.align === 'right') x = boxX + (boxWidth - textWidth)

      page.drawText(line, { x, y: cursorY, size: fontSize, font, color })

      if (element.underline) {
        const underlineY = cursorY - fontSize * 0.1
        page.drawLine({
          start: { x, y: underlineY },
          end: { x: x + textWidth, y: underlineY },
          thickness: Math.max(fontSize * 0.05, 0.5),
          color,
        })
      }
    }

    cursorY -= lineHeight
  }
}

async function drawImageElement(
  pdfDoc: PDFDocument,
  page: PDFPage,
  element: ImageElementData,
  scale: number,
  pageHeightPt: number,
) {
  const bytes = dataUrlToBytes(element.src)
  const image = element.mimeType.includes('png')
    ? await pdfDoc.embedPng(bytes)
    : await pdfDoc.embedJpg(bytes)

  const width = element.width / scale
  const height = element.height / scale
  const x = element.x / scale
  const y = pageHeightPt - element.y / scale - height

  page.drawImage(image, { x, y, width, height })
}

export async function buildExportedPdf({
  originalBytes,
  elementsByPage,
  scale,
}: ExportInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes)
  const pages = pdfDoc.getPages()
  const fontCache = new Map<string, PDFFont>()

  async function getFont(fontFamily: FontFamily, bold: boolean, italic: boolean) {
    const standardFont = mapToStandardFont(fontFamily, bold, italic)
    let font = fontCache.get(standardFont)
    if (!font) {
      font = await pdfDoc.embedFont(standardFont)
      fontCache.set(standardFont, font)
    }
    return font
  }

  for (const [pageNumberKey, elements] of Object.entries(elementsByPage)) {
    const page = pages[Number(pageNumberKey) - 1]
    if (!page || elements.length === 0) continue

    const { height: pageHeightPt } = page.getSize()

    for (const element of elements) {
      if (element.type === 'text') {
        await drawTextElement(page, element, scale, pageHeightPt, getFont)
      } else {
        await drawImageElement(pdfDoc, page, element, scale, pageHeightPt)
      }
    }
  }

  return pdfDoc.save()
}

export function downloadPdf(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
