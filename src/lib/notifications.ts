// Advanced notification and alert system
import { logger } from './logging';

export enum NotificationType {
  ISSUE_REPORTED = 'ISSUE_REPORTED',
  ISSUE_ASSIGNED = 'ISSUE_ASSIGNED',
  ISSUE_COMPLETED = 'ISSUE_COMPLETED',
  ISSUE_CRITICAL = 'ISSUE_CRITICAL',
  WORKORDER_CREATED = 'WORKORDER_CREATED',
  WORKORDER_UPDATED = 'WORKORDER_UPDATED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  recipient: string;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  error?: string;
}

export class NotificationService {
  private queue: Notification[] = [];
  private processing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  async send(notification: Partial<Notification>): Promise<Notification> {
    const fullNotification: Notification = {
      id: this.generateId(),
      type: notification.type || NotificationType.SYSTEM_ALERT,
      priority: notification.priority || NotificationPriority.MEDIUM,
      title: notification.title || 'Notification',
      message: notification.message || '',
      recipient: notification.recipient!,
      channels: notification.channels || [NotificationChannel.IN_APP],
      data: notification.data,
      scheduledAt: notification.scheduledAt,
      status: 'pending',
      retryCount: 0,
    };

    this.queue.push(fullNotification);
    logger.info('Notification queued', {
      id: fullNotification.id,
      type: fullNotification.type,
      recipient: fullNotification.recipient,
    }, ['notification']);

    this.processQueue();
    return fullNotification;
  }

  async sendBulk(notifications: Partial<Notification>[]): Promise<Notification[]> {
    const fullNotifications = await Promise.all(
      notifications.map(n => this.send(n))
    );
    return fullNotifications;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const notification = this.queue.shift()!;

        if (notification.scheduledAt && notification.scheduledAt > new Date()) {
          this.queue.push(notification); // Requeue for later
          break;
        }

        await this.sendNotification(notification);
      }
    } finally {
      this.processing = false;
    }
  }

  private async sendNotification(notification: Notification): Promise<void> {
    try {
      const promises = notification.channels.map(channel =>
        this.sendToChannel(notification, channel)
      );

      await Promise.all(promises);

      notification.status = 'sent';
      notification.sentAt = new Date();
      logger.info('Notification sent', {
        id: notification.id,
        channels: notification.channels,
      }, ['notification']);
    } catch (error) {
      notification.status = 'failed';
      notification.error = error instanceof Error ? error.message : 'Unknown error';
      
      if (notification.retryCount < this.maxRetries) {
        notification.retryCount++;
        setTimeout(() => {
          notification.status = 'pending';
          this.queue.push(notification);
          this.processQueue();
        }, this.retryDelay);
      }

      logger.error('Notification failed', error as Error, {
        id: notification.id,
        retryCount: notification.retryCount,
      }, ['notification']);
    }
  }

  private async sendToChannel(notification: Notification, channel: NotificationChannel): Promise<void> {
    switch (channel) {
      case NotificationChannel.IN_APP:
        return this.sendInApp(notification);
      case NotificationChannel.EMAIL:
        return this.sendEmail(notification);
      case NotificationChannel.SMS:
        return this.sendSMS(notification);
      case NotificationChannel.WEBHOOK:
        return this.sendWebhook(notification);
      default:
        throw new Error(`Unknown notification channel: ${channel}`);
    }
  }

  private async sendInApp(notification: Notification): Promise<void> {
    // Store in database for in-app display
    logger.debug('In-app notification', {
      id: notification.id,
      recipient: notification.recipient,
    }, ['notification']);
  }

  private async sendEmail(notification: Notification): Promise<void> {
    // Integrate with email service (SendGrid, Mailgun, etc.)
    logger.debug('Email notification', {
      id: notification.id,
      recipient: notification.recipient,
      subject: notification.title,
    }, ['notification', 'email']);
  }

  private async sendSMS(notification: Notification): Promise<void> {
    // Integrate with SMS service (Twilio, etc.)
    logger.debug('SMS notification', {
      id: notification.id,
      recipient: notification.recipient,
    }, ['notification', 'sms']);
  }

  private async sendWebhook(notification: Notification): Promise<void> {
    // Send to configured webhook endpoints
    logger.debug('Webhook notification', {
      id: notification.id,
      data: notification.data,
    }, ['notification', 'webhook']);
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  // Template methods
  issueReported(issueId: string, fleetNumber: string, severity: string): Partial<Notification> {
    return {
      type: NotificationType.ISSUE_REPORTED,
      priority: severity === 'CRITICAL' ? NotificationPriority.URGENT : NotificationPriority.HIGH,
      title: `New Issue Reported - ${fleetNumber}`,
      message: `A new ${severity.toLowerCase()} issue has been reported for fleet ${fleetNumber}.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      data: { issueId, fleetNumber, severity },
    };
  }

  issueAssigned(issueId: string, assignedTo: string): Partial<Notification> {
    return {
      type: NotificationType.ISSUE_ASSIGNED,
      priority: NotificationPriority.HIGH,
      title: 'Issue Assigned to You',
      message: `You have been assigned to issue #${issueId}.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      data: { issueId, assignedTo },
    };
  }

  workOrderCreated(workOrderId: string, startAt: Date): Partial<Notification> {
    return {
      type: NotificationType.WORKORDER_CREATED,
      priority: NotificationPriority.MEDIUM,
      title: 'Work Order Created',
      message: `A new work order has been scheduled for ${startAt.toLocaleDateString()}.`,
      channels: [NotificationChannel.IN_APP],
      data: { workOrderId, startAt },
    };
  }
}

// Automation engine for issue workflow
export class WorkflowEngine {
  private rules: Array<{
    name: string;
    condition: (data: any) => boolean;
    action: (data: any) => Promise<void>;
    enabled: boolean;
  }> = [];

  registerRule(rule: {
    name: string;
    condition: (data: any) => boolean;
    action: (data: any) => Promise<void>;
    enabled?: boolean;
  }): void {
    this.rules.push({
      ...rule,
      enabled: rule.enabled ?? true,
    });
    logger.info('Workflow rule registered', { name: rule.name }, ['workflow']);
  }

  async execute(event: string, data: any): Promise<void> {
    logger.info('Workflow execution started', { event }, ['workflow']);

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        if (rule.condition(data)) {
          logger.info('Workflow rule triggered', {
            rule: rule.name,
            event,
          }, ['workflow']);

          await rule.action(data);
        }
      } catch (error) {
        logger.error('Workflow rule failed', error as Error, {
          rule: rule.name,
          event,
        }, ['workflow']);
      }
    }
  }

  async executeAll(event: string, data: any): Promise<void> {
    await Promise.allSettled([
      this.execute(event, data),
    ]);
  }
}

// Pre-configured notification service
export const notificationService = new NotificationService();

// Pre-configured workflow engine
export const workflowEngine = new WorkflowEngine();

// Register default workflow rules
workflowEngine.registerRule({
  name: 'auto_assign_critical_issues',
  enabled: true,
  condition: (data) => 
    data.event === 'issue_created' && 
    data.issue.severity === 'CRITICAL',
  action: async (data) => {
    const notification = notificationService.issueReported(
      data.issue.id,
      data.issue.fleetNumber,
      data.issue.severity
    );
    notification.priority = NotificationPriority.URGENT;
    notification.channels = [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS];
    await notificationService.send(notification);
  },
});

workflowEngine.registerRule({
  name: 'notify_on_workorder_creation',
  enabled: true,
  condition: (data) => data.event === 'workorder_created',
  action: async (data) => {
    const notification = notificationService.workOrderCreated(
      data.workOrder.id,
      data.workOrder.startAt
    );
    await notificationService.send(notification);
  },
});