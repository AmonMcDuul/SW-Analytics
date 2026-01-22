import { Component, inject } from '@angular/core';
import { AnalyticsStore } from '../../store/analytics.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  store = inject(AnalyticsStore);

  constructor() {
    this.store.load();
  }
}