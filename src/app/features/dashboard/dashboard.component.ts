import { Component, inject, Inject, OnInit } from '@angular/core';
import { AnalyticsSummary } from '../../models/analytics-summary.model';
import { AnalyticsApiService } from '../../services/analytics-api.service';
import { AnalyticsStore } from '../../store/analytics.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  store = inject(AnalyticsStore);

  constructor() {
    this.store.load();
  }
}