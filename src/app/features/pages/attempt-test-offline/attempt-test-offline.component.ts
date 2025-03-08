import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/helper.service';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { ComingSoonComponent } from "../../../shared/resusable_components/coming-soon/coming-soon.component";

@Component({
  selector: 'app-attempt-test-offline',
  standalone: true,
  imports: [CommonModule, ComingSoonComponent],
  templateUrl: './attempt-test-offline.component.html',
  styleUrl: './attempt-test-offline.component.scss'
})
export class AttemptTestOfflineComponent  implements OnInit  {
  public paperData : any;
  constructor(private sharedDataService: SharedDataService) {}

  ngOnInit() {
    // Subscribe to the observable to get data
    this.sharedDataService.currentData.subscribe(data => {
      console.log(data) ;
      this.paperData = data;
    });
    // setTimeout(()=>{
    //   this.generatePDF()
    // },5000)
  }


  generatePDF() {
    const doc = new jsPDF();

    // Capture HTML content using document.querySelector
    const content: any = document.getElementById('questionPaper');
//     const content = `<div class="container" id="questionPaper" style="width: 100%; margin: 0 auto; padding: 60px; background-color: #fff; font-family: Arial, sans-serif; line-height: 1.6;">
//     <header class="header" style="text-align: center; margin-bottom: 20px;">
//         <h1 style="margin: 0;">Institution Name</h1>
//         <h3 style="margin: 0; font-size: 1.2em; color: #333;">Subject: Sample Paper</h3>
//         <p style="display: flex; justify-content: space-between; margin: 0; border-bottom: 2px solid black;">
//             <span>Total Marks: 100</span> <span>Time Allowed: 2 hours</span>
//         </p>
//     </header>

//     <section class="instructions" style="margin: 20px 0; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">
//         <h3 style="margin-top: 0;">Instructions:</h3>
//         <ul style="list-style-type: square; margin: 0; padding-left: 20px;">
//             <li>Answer all the questions.</li>
//             <li>Each question carries equal marks.</li>
//             <li>No negative marking for wrong answers.</li>
//         </ul>
//     </section>

//     <section class="questions" style="margin-top: 30px;">
//         <div class="question" style="margin-bottom: 20px;">
//             <p class="d-flex" style="font-weight: bold; display: flex; align-items: center;"><strong>Q1.&nbsp;</strong> What is the capital of France?</p>
//             <ul class="options" style="padding-left: 20px;">
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">A)&nbsp; Paris</li>
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">B)&nbsp; London</li>
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">C)&nbsp; Berlin</li>
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">D)&nbsp; Madrid</li>
//             </ul>
//         </div>

//         <div class="question" style="margin-bottom: 20px;">
//             <p class="d-flex" style="font-weight: bold; display: flex; align-items: center;"><strong>Q2.&nbsp;</strong> Who is the president of the USA?</p>
//             <ul class="options" style="padding-left: 20px;">
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">A)&nbsp; Joe Biden</li>
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">B)&nbsp; Donald Trump</li>
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">C)&nbsp; Barack Obama</li>
//                 <li class="d-flex" style="margin: 5px 0; list-style: none; display: flex; align-items: center;">D)&nbsp; George Bush</li>
//             </ul>
//         </div>
//     </section>

//     <button id="downloadBtn" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #007bff; color: #fff; border: none; border-radius: 4px;">
//         Download PDF
//     </button>
// </div>
// `
    // console.log(content)

    // Use html() method to capture the HTML content and convert it to PDF
    doc.html(content, {
      callback: (doc) => {
        // Download the PDF with a custom file name
        doc.save(`${this.paperData && this.paperData.headerVal.paperName}.pdf`);
      },
      margin: [10, 10, 10, 10],
      x: 10,
      y: 10
    });
  }
}
