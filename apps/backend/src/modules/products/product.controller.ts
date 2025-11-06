import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';

import { BadRequestException } from '@nestjs/common';

import { UpsertProductDto } from './product.types';
import { ProductService } from './product.service';

class DeleteProductDto {
  @IsString()
  @IsNotEmpty()
  confirmation!: string;
}

@Controller('api/products')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async list(@Req() request: Request & { companyId: string }) {
    return this.productService.list(request.companyId);
  }

  @Post()
  async create(@Req() request: Request & { companyId: string; user: { sub: string } }, @Body() body: UpsertProductDto) {
    return this.productService.create(request.companyId, body);
  }

  @Patch(':id')
  async update(
    @Req() request: Request & { companyId: string },
    @Param('id') id: string,
    @Body() body: UpsertProductDto,
  ) {
    return this.productService.update(request.companyId, id, body);
  }

  @Delete(':id')
  async remove(
    @Req() request: Request & { companyId: string; user: { sub: string } },
    @Param('id') id: string,
    @Body() body: DeleteProductDto,
  ) {
    if (body.confirmation !== 'ELIMINAR') {
      throw new BadRequestException('Debe escribir ELIMINAR para confirmar.');
    }
    await this.productService.softDelete(request.companyId, id, request.user.sub);
    return { success: true };
  }
}
