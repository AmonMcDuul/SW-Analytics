import { Component, inject, OnInit } from '@angular/core';
import { AnalyticsStore } from '../../store/analytics.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit{
  store = inject(AnalyticsStore);

  ngOnInit(){
    this.store.load();
  }
}