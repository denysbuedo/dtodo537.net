import { ConflictException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { TenancyService } from './tenancy.service';

describe('TenancyService', () => {
  it('provisions tenant, owner membership, business, showroom and subscription', async () => {
    const tx = {
      tenant: {
        create: vi.fn().mockResolvedValue({
          id: 'tenant-1',
          name: 'Muebles Habana',
          slug: 'muebles-habana',
          status: 'ACTIVE',
        }),
      },
      membership: {
        create: vi.fn().mockResolvedValue({
          id: 'membership-1',
          role: 'BUSINESS_OWNER',
          status: 'ACTIVE',
        }),
      },
      business: {
        create: vi.fn().mockResolvedValue({
          id: 'business-1',
          tenantId: 'tenant-1',
          name: 'Muebles Habana',
          slug: 'muebles-habana',
          status: 'DRAFT',
        }),
      },
      showroom: {
        create: vi.fn().mockResolvedValue({
          id: 'showroom-1',
          tenantId: 'tenant-1',
          businessId: 'business-1',
          subdomain: 'muebles-habana',
          status: 'DRAFT',
        }),
      },
      themeConfiguration: {
        create: vi.fn().mockResolvedValue({ id: 'theme-configuration-1' }),
      },
      subscription: {
        create: vi.fn().mockResolvedValue({
          id: 'subscription-1',
          status: 'TRIALING',
        }),
      },
    };
    const prisma = {
      showroom: { findUnique: vi.fn().mockResolvedValue(null) },
      businessType: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'business-type-1',
          code: 'retail',
          name: 'Comercio minorista',
        }),
      },
      subscriptionPlan: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'plan-1',
          code: 'free',
          name: 'Free',
        }),
      },
      theme: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'theme-1',
          code: 'minimal',
          name: 'Minimal',
        }),
      },
      $transaction: vi.fn().mockImplementation((callback: (transaction: typeof tx) => unknown) =>
        callback(tx),
      ),
    };
    const service = new TenancyService(
      prisma as never,
      { del: vi.fn() } as never,
      { currentUser: vi.fn().mockResolvedValue({ id: 'user-1', status: 'ACTIVE' }) } as never,
    );

    const result = await service.provision('session-token', {
      businessName: 'Muebles Habana',
      businessTypeCode: 'retail',
      subdomain: 'Muebles-Habana',
    });

    expect(result.tenant.slug).toBe('muebles-habana');
    expect(result.membership.role).toBe('BUSINESS_OWNER');
    expect(result.business.status).toBe('DRAFT');
    expect(result.showroom.subdomain).toBe('muebles-habana');
    expect(result.subscription.status).toBe('TRIALING');
    expect(tx.membership.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        userId: 'user-1',
        role: 'BUSINESS_OWNER',
        status: 'ACTIVE',
      },
    });
  });

  it('rejects duplicate subdomains before provisioning', async () => {
    const service = new TenancyService(
      {
        showroom: { findUnique: vi.fn().mockResolvedValue({ id: 'showroom-existing' }) },
      } as never,
      { del: vi.fn() } as never,
      { currentUser: vi.fn().mockResolvedValue({ id: 'user-1', status: 'ACTIVE' }) } as never,
    );

    await expect(
      service.provision('session-token', {
        businessName: 'Muebles Habana',
        businessTypeCode: 'retail',
        subdomain: 'muebles-habana',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects a tenant context not backed by active membership', async () => {
    const service = new TenancyService(
      {
        membership: { findFirst: vi.fn().mockResolvedValue(null) },
      } as never,
      { get: vi.fn(), setJson: vi.fn(), del: vi.fn() } as never,
      { currentUser: vi.fn().mockResolvedValue({ id: 'user-a', status: 'ACTIVE' }) } as never,
    );

    await expect(service.resolveContext('session-token', 'tenant-b')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
