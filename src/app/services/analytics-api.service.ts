import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageView } from '../models/page-view.model';
import { AnalyticsSummary } from '../models/analytics-summary.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly baseUrl = 'https://starwatchr-api.azurewebsites.net/metrics';
  private http = inject(HttpClient);

  getPageViews(): Observable<PageView[]> {
    return this.http.get<PageView[]>(`${this.baseUrl}/pageviews`);
  }

  getSummary(): Observable<AnalyticsSummary[]> {
    console.log("get?")
    return this.http.get<AnalyticsSummary[]>(`${this.baseUrl}/summary`);
  }
}
