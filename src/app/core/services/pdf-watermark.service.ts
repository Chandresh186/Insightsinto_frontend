import { Injectable } from '@angular/core';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class PdfWatermarkService {

  constructor() { }

  async addWatermarkToPdf(pdfBytes: Uint8Array, watermarkText: string): Promise<Uint8Array> {
    try {
      // Load the existing PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
  
      // const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
      // Get all pages in the PDF
      const pages = pdfDoc.getPages();
  

      for (var i = 0; i < pages.length; i++) {
        //Fonsize = MaxChar
        var page = pages[i];
        var fontSize = 40;
        var maxChar = 43;
        var { width, height } = page.getSize();
        var degree = Math.atan(width / height) * (180 / Math.PI);

        var degree = 90 - Math.atan(width / height) * (180 / Math.PI);
        var diag = Math.sqrt(width * width + height * height) - fontSize * 2;

        var spaceCharToCenter = (maxChar - watermarkText.length) / 2;
        var finalText =
          '-'.repeat(spaceCharToCenter) +
          watermarkText +
          '-'.repeat(spaceCharToCenter);

        page.drawText(finalText, {
          x: fontSize,
          y: fontSize / 3,
          size: fontSize,
          // font: courierFont,
          opacity: 0.4,
          color: rgb(1, 109 / 255, 67 / 255),
          rotate: degrees(degree),
        });
      }

  
      // Save the updated PDF
      return await pdfDoc.save();

    } catch (err) {
      console.error('Error adding watermark:', err);
      throw new Error('Failed to add watermark to PDF');
    }
  }
}
