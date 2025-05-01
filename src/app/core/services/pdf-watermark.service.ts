import { Injectable } from '@angular/core';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as mammoth from 'mammoth';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
} from 'docx';

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



  // async createWatermarkedDocx(content: string, watermarkText: string, fileName: string) {
  //   const watermarkHeader = new Header({
  //     children: [
  //       new Paragraph({
  //         children: [
  //           new TextRun({
  //             text: watermarkText,
  //             color: 'CCCCCC',
  //             bold: true,
  //             size: 48,
  //           }),
  //         ],
  //       }),
  //     ],
  //   });

  //   const doc = new Document({
  //     sections: [
  //       {
  //         headers: { default: watermarkHeader },
  //         children: [new Paragraph(content)],
  //       },
  //     ],
  //   });

  //   const blob = await Packer.toBlob(doc);

  //   // Trigger download manually without file-saver
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = fileName;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // }



    // Extract content from DOCX using Mammoth.js
    async extractContentFromDocx(file: Uint8Array): Promise<string> {
      try {
        const arrayBuffer = file.buffer;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return result.value;
      } catch (err) {
        console.error('Error extracting content from .docx:', err);
        throw new Error('Failed to extract content');
      }
    }
  
    // Create a new DOCX with watermark and content
    private htmlToDocxParagraphs(html: string): Paragraph[] {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
  
      const paragraphs: Paragraph[] = [];
      const elements = tempDiv.querySelectorAll('p');
      elements.forEach((element) => {
        const textRun = new TextRun({
          text: element.textContent || '',
          font: 'Arial',
          size: 24,
        });
  
        const paragraph = new Paragraph({
          children: [textRun],
        });
  
        paragraphs.push(paragraph);
      });
      return paragraphs;
    }
  
    // Create watermarked DOCX with the given content
    async createWatermarkedDocx(content: string, watermarkText: string, fileName: string): Promise<void> {
      // Create watermark header
      const watermarkHeader = new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: watermarkText,
                color: 'CCCCCC',
                bold: true,
                size: 48,
              }),
            ],
          }),
        ],
      });
  
      // Convert HTML content to DOCX paragraphs
      const docxContent = this.htmlToDocxParagraphs(content);
  
      // Create the document with watermark and content
      const doc = new Document({
        sections: [
          {
            headers: { default: watermarkHeader },
            children: docxContent,
          },
        ],
      });
  
      // Convert to Blob and trigger download
      const blob = await Packer.toBlob(doc);
      this.triggerDownload(blob, fileName);
    }
  
    // Trigger DOCX download
    private triggerDownload(blob: Blob, fileName: string): void {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up URL object after download
    }


   
}
