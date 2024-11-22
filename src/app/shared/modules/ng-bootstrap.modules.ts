import { NgModule } from "@angular/core";
import { NgbAlertModule, NgbDropdownModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({

    imports: [
        NgbDropdownModule,
        NgbTooltipModule,
        NgbAlertModule
     
    ],
    exports: [
        NgbDropdownModule,
        NgbTooltipModule,
        NgbAlertModule
    ]
  })
  export class ngbootstrapModule { }