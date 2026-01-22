import { Injectable, inject, signal, computed } from "@angular/core";
import { forkJoin } from "rxjs";
import { AnalyticsSummary } from "../models/analytics-summary.model";
import { PageView } from "../models/page-view.model";
import { AnalyticsApiService } from "../services/analytics-api.service";

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private api = inject(AnalyticsApiService);

  // raw data
  summary = signal<AnalyticsSummary[]>([]);
  pageViews = signal<PageView[]>([]);
  loading = signal(true);

  // derived data (dashboard KPIs)
  totalPageViews = computed(() =>
    this.summary().reduce((sum, d) => sum + d.pageViews, 0)
  );

  daysTracked = computed(() => this.summary().length);

  avgPerDay = computed(() =>
    this.daysTracked()
      ? Math.round(this.totalPageViews() / this.daysTracked())
      : 0
  );

  uniqueUsers = computed(() =>
    new Set(this.pageViews().map(p => p.userSeed)).size
  );

  topPages = computed(() =>
    Object.entries(
      this.pageViews().reduce<Record<string, number>>((acc, pv) => {
        acc[pv.path] = (acc[pv.path] ?? 0) + 1;
        return acc;
      }, {})
    )
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  );

  returningUsers = computed(() =>
    Object.values(
      this.pageViews().reduce<Record<string, number>>((acc, pv) => {
        acc[pv.userSeed] = (acc[pv.userSeed] ?? 0) + 1;
        return acc;
      }, {})
    ).filter(c => c > 1).length
  );

  load() {
    this.loading.set(true);

    forkJoin({
      summary: this.api.getSummary(),
      pageViews: this.api.getPageViews()
    }).subscribe(res => {
      this.summary.set(res.summary);
      this.pageViews.set(res.pageViews);
      this.loading.set(false);
    });
  }
}
