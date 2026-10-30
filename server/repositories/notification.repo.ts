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
    id: 'notif-admin-01',
    userId: 'user-admin-01',
    title: 'High Priority Maintenance Alert',
    message: 'HVAC Air Conditioning issue reported for Unit 101A requires dispatch confirmation.',
    type: 'WARNING',
    link: '/dashboard/maintenance',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'notif-admin-02',
    userId: 'user-admin-01',
    title: 'New Rental Application',
    message: 'Sophea Kem submitted an application for BKK1 Premier Luxury Residences Unit 101A.',
    type: 'INFO',
    link: '/dashboard/applications',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'notif-admin-03',
    userId: 'user-admin-01',
    title: 'Rent Payment Confirmed',
    message: 'Rent payment of $1,650 for Invoice INV-2026-000 was confirmed via Bank Transfer.',
    type: 'SUCCESS',
    link: '/dashboard/invoices',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'notif-sample-01',
    userId: 'user-landlord-01',
    title: 'New Maintenance Request',
    message: 'Sarah Jenkins reported an HVAC issue for Skyline Heights Unit 101A.',
    type: 'WARNING',
    link: '/dashboard/maintenance',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'notif-sample-02',
    userId: 'user-tenant-01',
    title: 'Technician Assigned',
    message: 'Technician Alex Rivers was assigned to your HVAC repair ticket.',
    type: 'INFO',
    link: '/dashboard/maintenance',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'notif-sample-03',
    userId: 'user-tech-01',
    title: 'New Work Order Assigned',
    message: 'You have been dispatched to investigate HVAC Air Conditioning for Unit 101A.',
    type: 'INFO',
    link: '/dashboard/maintenance',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 50),
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

  async findByUserId(userId: string, isAdmin = false): Promise<NotificationEntity[]> {
    return inMemoryNotifications
      .filter((n) => n.userId === userId || (isAdmin && (n.userId === 'user-admin-01' || !n.userId)))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string, userId: string, isAdmin = false): Promise<NotificationEntity | null> {
    const notif = inMemoryNotifications.find((n) => n.id === id && (isAdmin || n.userId === userId));
    if (!notif) return null;
    notif.isRead = true;
    return notif;
  }

  async markAllAsRead(userId: string, isAdmin = false): Promise<number> {
    let count = 0;
    for (const n of inMemoryNotifications) {
      if ((isAdmin || n.userId === userId) && !n.isRead) {
        n.isRead = true;
        count++;
      }
    }
    return count;
  }

  async getUnreadCount(userId: string, isAdmin = false): Promise<number> {
    return inMemoryNotifications.filter(
      (n) => (n.userId === userId || (isAdmin && (n.userId === 'user-admin-01' || !n.userId))) && !n.isRead
    ).length;
  }
}

export const notificationRepo = new NotificationRepository();
export const notificationRepository = notificationRepo;
