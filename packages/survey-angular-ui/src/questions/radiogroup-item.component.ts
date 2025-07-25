import { Component, Input } from "@angular/core";
@Component({
  selector: "sv-ng-radiogroup-item, '[sv-ng-radiogroup-item]'",
  templateUrl: "./radiogroup-item.component.html",
  styleUrls: ["./radiogroup-item.component.scss"]
})
export class RadiogroupItemComponent {
  @Input() question: any;
  @Input() model: any;
  @Input() ariaLabel?: string;
  constructor() {
  }
  public get renderedValue(): any {
    return this.question.renderedValue;
  }
  public set renderedValue(val: any) {
    this.question.clickItemHandler(this.model);
  }
}
