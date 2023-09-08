import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ApiService{

  constructor(private http: HttpClient){ }

  searchSymptom(query: string){
    return this.http.post('search-symptom', {query});
  }

  predictDisease(symptoms: string[]) {
    return this.http.post('predict', {symptoms});
  }
}
