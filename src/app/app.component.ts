import {Component, ElementRef, ViewChild} from '@angular/core';
import { FormControl } from "@angular/forms";
import {map, Observable, of, startWith} from "rxjs";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {ApiService} from "./api.service";

enum Steps {
  initial = 'initial',
  termsAgreement = 'termsAgreement',
  symptomsForm = 'symptomsForm',
  diagnoseResult = 'diagnoseResult'
}

class Prediction {
  constructor(public disease: string, public probability: number) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'diagnose-me';
  step: string = Steps.initial;
  Steps = Steps;
  termsAgreementChecked: boolean = false;
  diagnoses: Prediction[] = [];

  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  symptomInputCtrl = new FormControl();
  filteredSymptoms: Observable<string[][]> | null = null;
  selectedSymptoms: string[][] = [];

  @ViewChild('symptomInput', {static: false}) symptomInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete | undefined;

  constructor(private apiService: ApiService) {
    this.symptomInputCtrl.valueChanges.subscribe(
      {
        next: val => {
          this.filteredSymptoms = this._filter(val);
        }
      }
    )
  }

  showTermsOfUsage() {
    this.step = Steps.termsAgreement;
  }

  showSymptomsForm() {
    this.step = Steps.symptomsForm;
  }

  remove(symptom: string[]): void {
    const index = this.selectedSymptoms.indexOf(symptom);

    if (index >= 0) {
      this.selectedSymptoms.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedSymptoms.push(event.option.value);
    if (this.symptomInput) {
      this.symptomInput.nativeElement.value = '';
    }
    this.symptomInputCtrl.setValue(null);
  }

  private _filter(value: string): Observable<string[][]> {
    // let allSymptoms: string[][] = [['Apple', 'apple'], ['Lemon', 'lemon'], ['Lime', 'lime'], ['Orange', 'orange'], ['Strawberry', 'straw']];
    // return allSymptoms.filter(symptom => symptom[1].indexOf(value) === 0);
    if (!value) {
      return of([]);
    }

    return this.apiService.searchSymptom(value).pipe(map(res => res as string[][]));
  }

  predictDiagnose() {
    let symptomTokens = [];
    for (let symptom of this.selectedSymptoms) {
      symptomTokens.push(symptom[1])
    }

    console.log(symptomTokens);

    this.apiService.predictDisease(symptomTokens).subscribe({
      next: (data: any) => {
        this.diagnoses = data;
        this.step = Steps.diagnoseResult;
      }
    });
  }

}
