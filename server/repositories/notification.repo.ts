export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
}

const inMemoryNotifications: NotificationEntity[] = [
  {
    id: 'notif-sample-01',
    userId: 'user-landlord-01',
    title: 'New Maintenance Request',
    message: 'Sarah Jenkins reported an HVAC issue for Skyline Heights Unit 101A.',
    type: 'WARNING',
    link: '/dashboard/maintenance',
    isRead: false,
    createdAt: new Date('2026-02-10T14:30:00Z'),
  },
  {
    id: 'notif-sample-02',
    userId: 'user-tenant-01',
    title: 'Technician Assigned',
    message: 'Technician Alex Rivers was assigned to your HVAC repair ticket.',
    type: 'INFO',
    link: '/dashboard/maintenance',
    isRead: true,
    createdAt: new Date('2026-02-10T15:00:00Z'),
  },
  {
    id: 'notif-sample-03',
    userId: 'user-tech-01',
    title: 'New Work Order Assigned',
    message: 'You have been dispatched to investigate HVAC Air Conditioning for Unit 101A.',
    type: 'INFO',
    link: '/dashboard/maintenance',
    isRead: false,
    createdAt: new Date('2026-02-10T15:00:00Z'),
  },
];

export class NotificationRepository {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    link?: string | null;
  }): Promise<NotificationEntity> {
    const notif: NotificationEntity = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      link: data.link || null,
      isRead: false,
      createdAt: new Date(),
    };

    inMemoryNotifications.unshift(notif);
    return notif;
  }

  async findByUserId(userId: string): Promise<NotificationEntity[]> {
    return inMemoryNotifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string, userId: string): Promise<NotificationEntity | null> {
    const notif = inMemoryNotifications.find((n) => n.id === id && n.userId === userId);
    if (!notif) return null;
    notif.isRead = true;
    return notif;
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const n of inMemoryNotifications) {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    }
    return count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return inMemoryNotifications.filter((n) => n.userId === userId && !n.isRead).length;
  }
}

export const notificationRepo = new NotificationRepository();
export const notificationRepository = notificationRepo;
