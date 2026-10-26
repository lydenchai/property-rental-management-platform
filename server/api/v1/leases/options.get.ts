import { defineEventHandler } from 'h3';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { UnitStatus } from '../../../../shared/types/enums/unit-status.enum';
import { prisma } from '../../../utils/db';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);

    // 1. Fetch available units belonging to the landlord or all if admin
    const unitWhere: any = {
      status: { in: [UnitStatus.AVAILABLE, UnitStatus.RESERVED] },
    };

    if (user.role !== UserRole.ADMIN) {
      unitWhere.property = { landlordId: user.id };
    }

    const units = await prisma.unit.findMany({
      where: unitWhere,
      select: {
        id: true,
        unitNumber: true,
        rentAmount: true,
        depositAmount: true,
        status: true,
        property: {
          select: {
            id: true,
            title: true,
            city: true,
          },
        },
      },
      orderBy: [{ property: { title: 'asc' } }, { unitNumber: 'asc' }],
    });

    // 2. Fetch registered tenants
    const tenants = await prisma.user.findMany({
      where: {
        role: UserRole.TENANT,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return createApiResponse({
      units: units.map((u) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        rentAmount: u.rentAmount,
        depositAmount: u.depositAmount,
        propertyId: u.property.id,
        propertyTitle: u.property.title,
        city: u.property.city,
      })),
      tenants,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
