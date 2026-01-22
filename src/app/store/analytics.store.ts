import { Injectable, inject, signal, computed } from "@angular/core";
import { forkJoin } from "rxjs";
import { AnalyticsSummary } from "../models/analytics-summary.model";
import { PageView } from "../models/page-view.model";
import { AnalyticsApiService } from "../services/analytics-api.service";

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private api = inject(AnalyticsApiService);

  summary = signal<AnalyticsSummary[]>([]);
  pageViews = signal<PageView[]>([]);
  loading = signal(true);

  search = signal('');
  page = signal(1); 
  pageSize = signal(25);

  readonly TRAFFIC_WINDOWS = [7, 30, 90] as const;
  trafficDays = signal<(typeof this.TRAFFIC_WINDOWS)[number]>(30);

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

  reload(){
    this.load();
  }

  pageViewsPerUser = computed(() => {
    const users = this.uniqueUsers();
    if (users === 0) return 0;

    return Number(
        (this.totalPageViews() / users).toFixed(2)
    );
    });

  filteredPageViews = computed(() => {
    const q = this.search().toLowerCase().trim();

    if (!q) return this.pageViews();

    return this.pageViews().filter(p =>
        p.userSeed.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q)
    );
    });

    totalPages = computed(() =>
    Math.ceil(this.filteredPageViews().length / this.pageSize())
    );

    paginatedPageViews = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredPageViews().slice(start, end);
    });

    setSearch(value: string) {
    this.search.set(value);
    this.page.set(1); 
    }

    nextPage() {
    if (this.page() < this.totalPages()) {
        this.page.update(p => p + 1);
    }
    }

    prevPage() {
    if (this.page() > 1) {
        this.page.update(p => p - 1);
    }
    }

    visibleSummary = computed(() => {
        const days = this.trafficDays();
        return this.summary()
            .slice()
            .sort((a, b) => b.day.localeCompare(a.day))
            .slice(0, days)
            .reverse();
    });

    setTrafficDays(days: (typeof this.TRAFFIC_WINDOWS)[number]) {
    this.trafficDays.set(days);
    }

}
