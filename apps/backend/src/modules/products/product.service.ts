import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { UpsertProductDto } from './product.types';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async create(companyId: string, data: UpsertProductDto) {
    return this.prisma.product.create({
      data: {
        ...data,
        companyId,
        price: new Prisma.Decimal(data.price),
      },
    });
  }

  async update(companyId: string, productId: string, data: UpsertProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
      },
    });
  }

  async softDelete(companyId: string, productId: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        entity: 'product',
        entityId: productId,
        action: 'delete',
        userId,
        before: product as Prisma.JsonValue,
        after: null,
      },
    });
  }
}
