import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  
  constructor() { }

  // async generatePDF(data: any[]) {
  //   const doc = await PDFDocument.create();
  //   var page: any = doc.addPage();
  //   const { width, height } = page.getSize();
  //   const fontSize = 12;
  //   const margin = 50;
  //   let yPosition = height - margin;
  //   const headerHeight = 100;
  //   const maxWidth = width - 2 * margin;

  //   const headerDetails = {
  //     institutionName: "ABC Institute",
  //     paperName: "Economics Final Exam",
  //     totalMarks: "100",
  //     time: "2 Hours"
  //   };

  //   const font = await doc.embedFont(StandardFonts.HelveticaBold);
  //   const regularFont = await doc.embedFont(StandardFonts.Helvetica);

  //   // Add institution name and paper title
  //   const headerFontSize = 16;
  //   const subFontSize = 12;
  //   yPosition = height - margin - 20;

  //   const institutionNameWidth = font.widthOfTextAtSize(headerDetails.institutionName, headerFontSize);
  //   const paperNameWidth = font.widthOfTextAtSize(headerDetails.paperName, headerFontSize);

  //   const marksText = `Total Marks: ${headerDetails.totalMarks}`;
  //   const timeText = `Time Allowed: ${headerDetails.time}`;
  //   yPosition -= 20;

  //   const marksWidth = regularFont.widthOfTextAtSize(marksText, subFontSize);
  //   const timeWidth = regularFont.widthOfTextAtSize(timeText, subFontSize);

  //   page.drawText(headerDetails.institutionName, {
  //     x: (width - institutionNameWidth) / 2,
  //     y: yPosition,
  //     size: headerFontSize,
  //     font,
  //     color: rgb(0, 0, 0),
  //   });

  //   yPosition -= 20;
  //   page.drawText(headerDetails.paperName, {
  //     x: (width - paperNameWidth) / 2,
  //     y: yPosition,
  //     size: headerFontSize,
  //     font,
  //     color: rgb(0, 0, 0),
  //   });

  //   yPosition -= 20;
  //   page.drawText(marksText, {
  //     x: margin,
  //     y: yPosition,
  //     size: subFontSize,
  //     font: regularFont,
  //     color: rgb(0.2, 0.2, 0.2),
  //   });

  //   page.drawText(timeText, {
  //     x: width - margin - timeWidth,
  //     y: yPosition,
  //     size: subFontSize,
  //     font: regularFont,
  //     color: rgb(0.2, 0.2, 0.2),
  //   });

  //   // Draw a horizontal line to separate the header
  //   page.drawLine({
  //     start: { x: margin, y: yPosition - 10 },
  //     end: { x: width - margin, y: yPosition - 10 },
  //     thickness: 1,
  //     color: rgb(0, 0, 0),
  //   });

  //   // Reserve space for content
  //   yPosition = height - headerHeight - margin - 20;

  //   // Lazy loading: Load images only when the page is being rendered
  //   const imageCache: any = {};

  //   let currentPageNumber = 1;
  //   const rightMargin = 200;

  //   for (const [index, item] of data.entries()) {
  //     if (yPosition < margin) {
  //       page = doc.addPage();
  //       yPosition = height - margin;
  //       currentPageNumber++;
  //     }

  //     page.drawText(`Q${index + 1}.`, {
  //       x: margin,
  //       y: yPosition,
  //       size: fontSize + 2,
  //       font,
  //       color: rgb(0, 0, 0),
  //     });

  //     if (item.question.startsWith("http")) {
  //       // Lazy load the image
  //       if (!imageCache[item.question]) {
  //         const imgBytes = await fetch(item.question).then(res => res.arrayBuffer());
  //         imageCache[item.question] = await doc.embedJpg(imgBytes);
  //       }

  //       const img = imageCache[item.question];
  //       const imgDims = img.scaleToFit(300, 250);
  //       page.drawImage(img, {
  //         x: margin + 30,
  //         y: yPosition - imgDims.height + 10,
  //         width: imgDims.width,
  //         height: imgDims.height,
  //       });

  //       yPosition -= imgDims.height + 10;

  //       // Draw options
  //       const imgOptions = [item.a, item.b, item.c, item.d];
  //       const optionPromises = imgOptions.map(async (url, i) => {
  //         if (!imageCache[url]) {
  //           const optionImgBytes = await fetch(url).then(res => res.arrayBuffer());
  //           imageCache[url] = await doc.embedJpg(optionImgBytes);
  //         }
  //         return imageCache[url];
  //       });

  //       const images = await Promise.all(optionPromises);

  //       // Draw images asynchronously with proper positioning
  //       for (let i = 0; i < images.length; i++) {
  //         const optionImg = images[i];
  //         const optionImgDims = optionImg.scaleToFit(100, 50);
  //         const optionKey = ['a', 'b', 'c', 'd'][i];
  //         page.drawText(`${optionKey.toUpperCase()})`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
  //         yPosition -= fontSize + 5;

  //         page.drawImage(optionImg, {
  //           x: margin + 40,
  //           y: yPosition - optionImgDims.height + 25,
  //           width: optionImgDims.width,
  //           height: optionImgDims.height,
  //         });
  //         yPosition -= optionImgDims.height + 10;
  //       }
  //     } else {
  //       // For text questions
  //       page.drawText(item.question, {
  //         x: margin + 30,
  //         y: yPosition,
  //         size: fontSize,
  //         font,
  //         color: rgb(0, 0, 0),
  //       });
  //       yPosition -= fontSize * 1.5;

  //       page.drawText(`A) ${item.a}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
  //       yPosition -= fontSize * 1.5;
  //       page.drawText(`B) ${item.b}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
  //       yPosition -= fontSize * 1.5;
  //       page.drawText(`C) ${item.c}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
  //       yPosition -= fontSize * 1.5;
  //       page.drawText(`D) ${item.d}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
  //       yPosition -= fontSize * 3;
  //     }

  //     page.drawLine({
  //       start: { x: margin, y: margin + 5 },
  //       end: { x: width - margin, y: margin + 5 },
  //       thickness: 0.5,
  //       color: rgb(0, 0, 0),
  //     });
  //     page.drawText(`Page ${currentPageNumber}`, {
  //       x: width / 2 - 15,
  //       y: margin - 8,
  //       size: 10,
  //       font: regularFont,
  //       color: rgb(0, 0, 0),
  //     });
  //   }

  //   const pdfBytes = await doc.save();
  //   return pdfBytes;
  // }






  async  generatePDF(data: any[], headerVal: any) {
    // const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const doc = await PDFDocument.create();
    let page = doc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.5;
    let yPosition = height - margin;
    const headerHeight = 100;
    const maxWidth = width - 2 * margin;

    const headerDetails = {
      institutionName: headerVal.institutionName,
      paperName: headerVal.paperName,
      totalMarks: headerVal.totalMarks,
      time: headerVal.time
    };

    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await doc.embedFont(StandardFonts.Helvetica);

    // Add institution name and paper title
    const headerFontSize = 16;
    const subFontSize = 12;
    yPosition = height - margin - 20;

    const institutionNameWidth = font.widthOfTextAtSize(headerDetails.institutionName, headerFontSize);
    const paperNameWidth = font.widthOfTextAtSize(headerDetails.paperName, headerFontSize);

    // Add total marks and time
    const marksText = `Total Marks: ${headerDetails.totalMarks}`;
    const timeText = `Time Allowed: ${headerDetails.time}`;
    yPosition -= 20;

    // Calculate the width of each text to center them
    const marksWidth = regularFont.widthOfTextAtSize(marksText, subFontSize);
    const timeWidth = regularFont.widthOfTextAtSize(timeText, subFontSize);

    page.drawText(headerDetails.institutionName, {
      x: (width - institutionNameWidth) / 2,
      y: yPosition,
      size: headerFontSize,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
    page.drawText(headerDetails.paperName, {
      x: (width - paperNameWidth) / 2,
      y: yPosition,
      size: headerFontSize,
      font,
      color: rgb(0, 0, 0),
    });

    // Add total marks and time
    yPosition -= 20;
    page.drawText(marksText, {
      x: margin,
      y: yPosition,
      size: subFontSize,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(timeText, {
      x: width - margin - timeWidth,
      y: yPosition,
      size: subFontSize,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Draw a horizontal line to separate the header
    page.drawLine({
      start: { x: margin, y: yPosition - 10 },
      end: { x: width - margin, y: yPosition - 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Reserve space for content
    yPosition = height - headerHeight - margin - 20;

    // Questions data
     // Use your function to generate large dataset

    // Lazy loading: Load images only when the page is being rendered
    const imageCache: any = {};

    let currentPageNumber = 1;
    const rightMargin = 200;  // Adjust this value as per your need
    const pageWidth = page.getWidth();  // Get the page width

    for (const [index, item] of data.entries()) {
      // Check if new page is needed
      if (yPosition < margin) {
        page = doc.addPage();
        yPosition = height - margin;
        currentPageNumber++;
      }

      // Highlight question number
      page.drawText(`Q${index + 1}.`, {
        x: margin,
        y: yPosition,
        size: fontSize + 2,
        font,
        color: rgb(0, 0, 0),
      });

      // Check if the current question is an image
      if (item.question.startsWith("http")) {
        if (!imageCache[item.question]) {
          // Lazy load the image when it's about to be displayed
          const imgBytes = await fetch(item.question).then(res => res.arrayBuffer());
          imageCache[item.question] = await doc.embedJpg(imgBytes);
        }

        const img = imageCache[item.question];
        const imgDims = img.scaleToFit(300, 250);
        page.drawImage(img, {
          x: margin + 30,
          y: yPosition - imgDims.height + 10,
          width: imgDims.width,
          height: imgDims.height,
        });

        yPosition -= imgDims.height + 10;

        const imgOptions = [item.a, item.b, item.c, item.d];
        const optionPromises = imgOptions.map(async (url, i) => {
          if (!imageCache[url]) {
            const optionImgBytes = await fetch(url).then(res => res.arrayBuffer());
            imageCache[url] = await doc.embedJpg(optionImgBytes);
          }
          return imageCache[url];
        });

        const images = await Promise.all(optionPromises);

        // Draw images asynchronously with proper positioning
        for (let i = 0; i < images.length; i++) {
          const optionImg = images[i];
          const optionImgDims = optionImg.scaleToFit(100, 50);
          const optionKey = ['a', 'b', 'c', 'd'][i];
          
          // Update the position using a switch statement based on the index
       
          switch (i) {
            case 0:
               // First option, keep xOffset as is
               page.drawText(`${optionKey.toUpperCase()})`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
              yPosition -= lineHeight + 5;
      
       
              page.drawImage(optionImg, {
                x: margin + 40,
                y: yPosition - optionImgDims.height + 25,
                width: optionImgDims.width,
                height: optionImgDims.height,
              });
              yPosition -= optionImgDims.height + 10;
              break;
            case 1:
              page.drawText(`${optionKey.toUpperCase()})`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
              yPosition -= lineHeight + 5;
              page.drawImage(optionImg, {
                x: margin + 40,
                y: yPosition - optionImgDims.height + 25,
                width: optionImgDims.width,
                height: optionImgDims.height,
              });
              yPosition -= optionImgDims.height + 10;
              break;
            case 2:
              page.drawText(`${optionKey.toUpperCase()})`, { x: pageWidth - rightMargin - optionImgDims.width - 20, y: yPosition  + 155, size: fontSize, font: regularFont });
              yPosition -= lineHeight + 5;
      
       
              page.drawImage(optionImg, {
                x:  pageWidth - rightMargin - optionImgDims.width,
                y: yPosition  + 140,
                width: optionImgDims.width,
                height: optionImgDims.height,
              });
              yPosition -= optionImgDims.height + 10;
              break;

            case 3:
              page.drawText(`${optionKey.toUpperCase()})`, { x: pageWidth - rightMargin - optionImgDims.width - 20, y: yPosition + 155, size: fontSize, font: regularFont });
              yPosition -= lineHeight + 5;
              
              page.drawImage(optionImg, {
                x: pageWidth - rightMargin - optionImgDims.width,
                y: yPosition  + 140,
                width: optionImgDims.width,
                height: optionImgDims.height,
              });
              yPosition -= optionImgDims.height + 10;
              break;
            default:
              break;
          }






        }
      } else {
        page.drawText(item.question, {
          x: margin + 30,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;

        page.drawText(`A) ${item.a}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
        yPosition -= lineHeight + 5;
        page.drawText(`B) ${item.b}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
        yPosition -= lineHeight + 5;
        page.drawText(`C) ${item.c}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
        yPosition -= lineHeight + 5;
        page.drawText(`D) ${item.d}`, { x: margin + 20, y: yPosition - 10, size: fontSize, font: regularFont });
        yPosition -= lineHeight + 20; // Add spacing after each question
      }

      // Footer
      page.drawLine({
        start: { x: margin, y: margin + 5 },
        end: { x: width - margin, y: margin + 5 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Page ${currentPageNumber}`, {
        x: width / 2 - 15,
        y: margin - 8,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    }

    const pdfBytes = await doc.save();

   
    return pdfBytes;
  }

}
