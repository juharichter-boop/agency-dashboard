import axios, { AxiosInstance } from 'axios';
import { HarvestUser, HarvestTimeEntry, HarvestProject, HarvestClient } from '@/types';

interface HarvestPaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total_pages: number;
  total_entries: number;
}

export class HarvestAPI {
  private client: AxiosInstance;
  private accountId: string;
  private token: string;

  constructor() {
    this.accountId = process.env.HARVEST_ACCOUNT_ID || '';
    this.token = process.env.HARVEST_ACCESS_TOKEN || '';

    this.client = axios.create({
      baseURL: 'https://api.harvestapp.com/v2',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Harvest-Account-ID': this.accountId,
        'User-Agent': 'Agency Dashboard (support@example.com)',
      },
    });
  }

  private async getAllPages<T>(
    endpoint: string,
    params: any = {}
  ): Promise<T[]> {
    const allData: T[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.client.get<HarvestPaginatedResponse<T>>(
        endpoint,
        { params: { ...params, page } }
      );

      allData.push(...response.data.data);

      if (page >= response.data.total_pages) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allData;
  }

  async getUsers(): Promise<HarvestUser[]> {
    try {
      return await this.getAllPages('/users');
    } catch (error) {
      console.error('Error fetching Harvest users:', error);
      throw error;
    }
  }

  async getTimeEntries(
    from: string,
    to: string,
    userId?: number
  ): Promise<HarvestTimeEntry[]> {
    try {
      const params: any = {
        from,
        to,
      };

      if (userId) {
        params.user_id = userId;
      }

      return await this.getAllPages('/time_entries', params);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  }

  async getProjects(): Promise<HarvestProject[]> {
    try {
      return await this.getAllPages('/projects', { is_active: true });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getClients(): Promise<HarvestClient[]> {
    try {
      return await this.getAllPages('/clients', { is_active: true });
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getUserMetrics(userId: number, from: string, to: string) {
    try {
      const entries = await this.getTimeEntries(from, to, userId);

      const billable = entries.filter((e) => e.billable);
      const nonBillable = entries.filter((e) => !e.billable);

      const billableHours = billable.reduce((sum, e) => sum + e.hours, 0);
      const nonBillableHours = nonBillable.reduce((sum, e) => sum + e.hours, 0);
      const billableAmount = billable.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalHours = billableHours + nonBillableHours;

      return {
        billableHours,
        nonBillableHours,
        billableRatio: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
        billableAmount,
        utilizationRate: 0, // Calculated based on billable hours / capacity
      };
    } catch (error) {
      console.error('Error calculating user metrics:', error);
      throw error;
    }
  }

  async getProjectMetrics(projectId: number, from: string, to: string) {
    try {
      const entries = await this.getTimeEntries(from, to);
      const projectEntries = entries.filter((e) => e.project_id === projectId);

      const billable = projectEntries.filter((e) => e.billable);
      const nonBillable = projectEntries.filter((e) => !e.billable);

      const billableHours = billable.reduce((sum, e) => sum + e.hours, 0);
      const nonBillableHours = nonBillable.reduce((sum, e) => sum + e.hours, 0);
      const revenue = billable.reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        billableHours,
        nonBillableHours,
        revenue,
        entryCount: projectEntries.length,
      };
    } catch (error) {
      console.error('Error calculating project metrics:', error);
      throw error;
    }
  }

  async getTeamMetrics(from: string, to: string) {
    try {
      const entries = await this.getTimeEntries(from, to);

      const billable = entries.filter((e) => e.billable);
      const nonBillable = entries.filter((e) => !e.billable);

      const billableHours = billable.reduce((sum, e) => sum + e.hours, 0);
      const nonBillableHours = nonBillable.reduce((sum, e) => sum + e.hours, 0);
      const totalRevenue = billable.reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        billableHours,
        nonBillableHours,
        totalRevenue,
        utilizationRate:
          billableHours > 0 ? (billableHours / (billableHours + nonBillableHours)) * 100 : 0,
        averageTrackedHoursPerDay: Math.round(
          (billableHours + nonBillableHours) / 30
        ),
      };
    } catch (error) {
      console.error('Error calculating team metrics:', error);
      throw error;
    }
  }
}

export const harvestAPI = new HarvestAPI();
