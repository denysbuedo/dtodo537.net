import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ShowroomsService } from './showrooms.service';

describe('ShowroomsService', () => {
  it('does not expose draft showrooms publicly', async () => {
    const service = new ShowroomsService(
      {
        showroom: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'showroom-1',
            status: 'DRAFT',
            deletedAt: null,
            tenant: { status: 'ACTIVE', deletedAt: null },
            business: { status: 'DRAFT', deletedAt: null },
          }),
        },
      } as never,
      { del: vi.fn() } as never,
      { currentUser: vi.fn() } as never,
    );

    await expect(service.publicBySubdomain('muebles537')).rejects.toThrow(NotFoundException);
  });

  it('rejects disabled themes', async () => {
    const service = new ShowroomsService(
      {
        showroom: { findUnique: vi.fn().mockResolvedValue(showroomFixture()) },
        membership: { findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }) },
        theme: { findUnique: vi.fn().mockResolvedValue({ id: 'theme-2', status: 'DISABLED' }) },
      } as never,
      { del: vi.fn() } as never,
      { currentUser: vi.fn().mockResolvedValue({ id: 'user-1' }) } as never,
    );

    await expect(
      service.updateTheme('session-token', 'showroom-1', { themeCode: 'disabled' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('requires contact information before publishing', async () => {
    const service = new ShowroomsService(
      {
        showroom: {
          findUnique: vi.fn().mockResolvedValue(
            showroomFixture({
              business: {
                ...showroomFixture().business,
                contactChannels: [],
              },
            }),
          ),
        },
        membership: { findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }) },
      } as never,
      { del: vi.fn() } as never,
      { currentUser: vi.fn().mockResolvedValue({ id: 'user-1' }) } as never,
    );

    await expect(service.setPublication('session-token', 'showroom-1', true)).rejects.toThrow(
      BadRequestException,
    );
  });
});

function showroomFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'showroom-1',
    tenantId: 'tenant-1',
    businessId: 'business-1',
    subdomain: 'muebles537',
    status: 'DRAFT',
    publishedAt: null,
    deletedAt: null,
    tenant: { id: 'tenant-1', status: 'ACTIVE', deletedAt: null },
      business: {
      id: 'business-1',
      name: 'Muebles Habana',
      slug: 'muebles537',
      status: 'DRAFT',
      description: 'Muebles de madera para hogares.',
      shortDescription: null,
      address: null,
      phone: null,
      email: null,
      timezone: null,
      logoUrl: null,
      coverImageUrl: null,
      businessType: null,
      contactChannels: [{ id: 'contact-1', type: 'PHONE', value: '+5355555555', label: 'Teléfono', isPrimary: true }],
      socialProfiles: [],
      whatsappConfiguration: null,
      deletedAt: null,
    },
    theme: { id: 'theme-1', code: 'minimal', name: 'Minimal', description: null, version: '1.0.0', status: 'ACTIVE' },
    themeConfiguration: {
      primaryColor: '#0f766e',
      secondaryColor: '#1d1d1b',
      accentColor: '#f59e0b',
      fontFamily: 'Inter',
      coverStyle: 'solid',
      productCardStyle: 'compact',
    },
    ...overrides,
  };
}
