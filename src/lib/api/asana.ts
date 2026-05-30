import axios, { AxiosInstance } from 'axios';
import { AsanaUser, AsanaTask } from '@/types';

interface AsanaTaskResponse {
  gid: string;
  name: string;
  assignee?: { gid: string; name: string };
  due_on?: string;
  completed: boolean;
  completed_at?: string;
}

interface AisanaPaginatedResponse<T> {
  data: T[];
  next_page?: {
    offset: string;
    path: string;
    uri: string;
  };
}

export class AsanaAPI {
  private client: AxiosInstance;
  private token: string;

  constructor() {
    this.token = process.env.ASANA_ACCESS_TOKEN || '';

    this.client = axios.create({
      baseURL: 'https://app.asana.com/api/1.0',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  private async getAllPages<T>(
    endpoint: string,
    params: any = {}
  ): Promise<T[]> {
    const allData: T[] = [];
    let nextOffset: string | undefined;

    do {
      const response = await this.client.get<AisanaPaginatedResponse<T>>(
        endpoint,
        {
          params: {
            ...params,
            ...(nextOffset ? { offset: nextOffset } : {}),
            limit: 100,
          },
        }
      );

      allData.push(...response.data.data);
      nextOffset = response.data.next_page?.offset;
    } while (nextOffset);

    return allData;
  }

  async getMe(): Promise<AsanaUser> {
    try {
      const response = await this.client.get('/users/me');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async getTeamUsers(teamId: string): Promise<AsanaUser[]> {
    try {
      return await this.getAllPages(`/teams/${teamId}/users`);
    } catch (error) {
      console.error('Error fetching team users:', error);
      throw error;
    }
  }

  async getProjectTasks(projectId: string): Promise<AsanaTaskResponse[]> {
    try {
      return await this.getAllPages(`/projects/${projectId}/tasks`);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  async getTask(taskId: string): Promise<AsanaTaskResponse> {
    try {
      const response = await this.client.get(`/tasks/${taskId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async getUserTasks(userId: string): Promise<AsanaTaskResponse[]> {
    try {
      return await this.getAllPages('/tasks', {
        assignee: userId,
      });
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  async getTasksByProject(
    projectId: string,
    completed?: boolean
  ): Promise<AsanaTaskResponse[]> {
    try {
      const params: any = {};
      if (completed !== undefined) {
        params.completed = completed;
      }

      return await this.getAllPages(`/projects/${projectId}/tasks`, params);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  async getUserMetrics(userId: string) {
    try {
      const tasks = await this.getUserTasks(userId);

      const completed = tasks.filter((t) => t.completed);
      const overdue = tasks.filter(
        (t) =>
          !t.completed &&
          t.due_on &&
          new Date(t.due_on) < new Date()
      );

      const completedWithDates = completed.filter(
        (t) => t.completed_at && t.due_on
      );
      const completionTimes = completedWithDates.map((t) => {
        const due = new Date(t.due_on!).getTime();
        const completedAt = new Date(t.completed_at!).getTime();
        return (completedAt - due) / (1000 * 60 * 60 * 24); // days
      });

      const avgCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((a, b) => a + b, 0) /
            completionTimes.length
          : 0;

      return {
        completedTasks: completed.length,
        openTasks: tasks.length - completed.length,
        overdueTasks: overdue.length,
        completionRate:
          tasks.length > 0
            ? (completed.length / tasks.length) * 100
            : 0,
        averageCompletionTime: Math.round(avgCompletionTime),
      };
    } catch (error) {
      console.error('Error calculating user metrics:', error);
      throw error;
    }
  }

  async getProjectMetrics(projectId: string) {
    try {
      const allTasks = await this.getTasksByProject(projectId);
      const completed = await this.getTasksByProject(projectId, true);
      const open = await this.getTasksByProject(projectId, false);

      const overdue = open.filter(
        (t) =>
          t.due_on &&
          new Date(t.due_on) < new Date()
      );

      return {
        totalTasks: allTasks.length,
        completedTasks: completed.length,
        openTasks: open.length,
        overdueTasks: overdue.length,
        progressRate:
          allTasks.length > 0
            ? (completed.length / allTasks.length) * 100
            : 0,
      };
    } catch (error) {
      console.error('Error calculating project metrics:', error);
      throw error;
    }
  }

  async getTeamMetrics(teamId: string) {
    try {
      const users = await this.getTeamUsers(teamId);
      let totalCompleted = 0;
      let totalOpen = 0;
      let totalOverdue = 0;

      for (const user of users) {
        const metrics = await this.getUserMetrics(user.gid);
        totalCompleted += metrics.completedTasks;
        totalOpen += metrics.openTasks;
        totalOverdue += metrics.overdueTasks;
      }

      return {
        totalCompletedTasks: totalCompleted,
        totalOpenTasks: totalOpen,
        totalOverdueTasks: totalOverdue,
        completionRate:
          totalCompleted + totalOpen > 0
            ? (totalCompleted / (totalCompleted + totalOpen)) * 100
            : 0,
      };
    } catch (error) {
      console.error('Error calculating team metrics:', error);
      throw error;
    }
  }
}

export const asanaAPI = new AsanaAPI();
