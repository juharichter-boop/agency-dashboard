import axios, { AxiosInstance } from 'axios';
import { SlackUser, SlackActivity } from '@/types';

interface SlackMessage {
  type: string;
  user: string;
  bot_id?: string;
  ts: string;
  files?: Array<{ id: string }>;
}

interface SlackConversation {
  id: string;
  name: string;
  is_member: boolean;
}

export class SlackAPI {
  private client: AxiosInstance;
  private token: string;

  constructor() {
    this.token = process.env.SLACK_BOT_TOKEN || '';
    this.client = axios.create({
      baseURL: 'https://slack.com/api',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getUsers(): Promise<SlackUser[]> {
    try {
      const response = await this.client.get('/users.list');
      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }
      return response.data.members || [];
    } catch (error) {
      console.error('Error fetching Slack users:', error);
      throw error;
    }
  }

  async getUserConversations(userId: string): Promise<SlackConversation[]> {
    try {
      const response = await this.client.get('/users.conversations', {
        params: {
          user: userId,
          exclude_archived: true,
          types: 'public_channel,private_channel,mpim,im',
        },
      });
      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }
      return response.data.channels || [];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw error;
    }
  }

  async getConversationHistory(
    channelId: string,
    oldest?: string,
    latest?: string
  ): Promise<SlackMessage[]> {
    try {
      const response = await this.client.get('/conversations.history', {
        params: {
          channel: channelId,
          oldest,
          latest,
          limit: 1000,
        },
      });
      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }
      return response.data.messages || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  async getUserActivity(userId: string, dateStart: string, dateEnd: string): Promise<SlackActivity> {
    try {
      const conversations = await this.getUserConversations(userId);
      let totalMessages = 0;
      let totalFiles = 0;
      const channelNames: string[] = [];

      for (const conversation of conversations) {
        const messages = await this.getConversationHistory(
          conversation.id,
          dateStart,
          dateEnd
        );

        const userMessages = messages.filter(
          (m) =>
            m.user === userId &&
            m.type === 'message' &&
            !m.bot_id
        );

        totalMessages += userMessages.length;
        const filesInMessages = userMessages.reduce(
          (sum, m) => sum + (m.files?.length || 0),
          0
        );
        totalFiles += filesInMessages;

        if (userMessages.length > 0) {
          channelNames.push(conversation.name);
        }
      }

      return {
        userId,
        date: new Date(dateStart),
        messageCount: totalMessages,
        fileCount: totalFiles,
        channels: channelNames,
        isBot: false,
      };
    } catch (error) {
      console.error('Error calculating user activity:', error);
      throw error;
    }
  }

  async getChannelActivity(
    channelId: string,
    dateStart: string,
    dateEnd: string
  ): Promise<{ messageCount: number; activeUsers: Set<string> }> {
    try {
      const messages = await this.getConversationHistory(channelId, dateStart, dateEnd);

      const humanMessages = messages.filter(
        (m) => m.type === 'message' && !m.bot_id
      );

      const activeUsers = new Set(
        humanMessages.map((m) => m.user).filter(Boolean)
      );

      return {
        messageCount: humanMessages.length,
        activeUsers,
      };
    } catch (error) {
      console.error('Error calculating channel activity:', error);
      throw error;
    }
  }

  async getTeamMetrics(
    dateStart: string,
    dateEnd: string
  ): Promise<{ totalMessages: number; totalFiles: number; activeUsers: number }> {
    try {
      const users = await this.getUsers();
      const activeUserIds = new Set<string>();
      let totalMessages = 0;
      let totalFiles = 0;

      for (const user of users) {
        if (user.id === 'USLACKBOT' || user.profile?.email?.endsWith('@slackbot.com')) {
          continue; // Skip bot users
        }

        const activity = await this.getUserActivity(user.id, dateStart, dateEnd);
        if (activity.messageCount > 0) {
          activeUserIds.add(user.id);
          totalMessages += activity.messageCount;
          totalFiles += activity.fileCount;
        }
      }

      return {
        totalMessages,
        totalFiles,
        activeUsers: activeUserIds.size,
      };
    } catch (error) {
      console.error('Error calculating team metrics:', error);
      throw error;
    }
  }
}

export const slackAPI = new SlackAPI();
