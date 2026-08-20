import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { parse } from 'cookie';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { MAX_IMAGE_UPLOAD_BYTES } from '../media/media.constants';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto, ReorderCategoriesDto, UpdateCategoryDto } from './dto/category.dto';
import {
  CreateProductDto,
  PublishProductDto,
  QuickUpdateProductDto,
  ReorderProductImagesDto,
  UpdateProductDto,
} from './dto/product.dto';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalogService: CatalogService) {}

  @Get('businesses/:businessId/catalog')
  getBusinessCatalog(@Req() request: Request, @Param('businessId') businessId: string) {
    return this.catalogService.getBusinessCatalog(this.readSessionCookie(request), businessId);
  }

  @Post('businesses/:businessId/categories')
  createCategory(
    @Req() request: Request,
    @Param('businessId') businessId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.catalogService.createCategory(this.readSessionCookie(request), businessId, dto);
  }

  @Patch('businesses/:businessId/categories/reorder')
  reorderCategories(
    @Req() request: Request,
    @Param('businessId') businessId: string,
    @Body() dto: ReorderCategoriesDto,
  ) {
    return this.catalogService.reorderCategories(this.readSessionCookie(request), businessId, dto);
  }

  @Patch('categories/:categoryId')
  updateCategory(
    @Req() request: Request,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.catalogService.updateCategory(this.readSessionCookie(request), categoryId, dto);
  }

  @Patch('categories/:categoryId/archive')
  archiveCategory(@Req() request: Request, @Param('categoryId') categoryId: string) {
    return this.catalogService.archiveCategory(this.readSessionCookie(request), categoryId);
  }

  @Post('businesses/:businessId/products')
  createProduct(
    @Req() request: Request,
    @Param('businessId') businessId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.catalogService.createProduct(this.readSessionCookie(request), businessId, dto);
  }

  @Patch('products/:productId')
  updateProduct(
    @Req() request: Request,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalogService.updateProduct(this.readSessionCookie(request), productId, dto);
  }

  @Patch('products/:productId/quick')
  quickUpdateProduct(
    @Req() request: Request,
    @Param('productId') productId: string,
    @Body() dto: QuickUpdateProductDto,
  ) {
    return this.catalogService.quickUpdateProduct(this.readSessionCookie(request), productId, dto);
  }

  @Patch('products/:productId/publication')
  setProductPublication(
    @Req() request: Request,
    @Param('productId') productId: string,
    @Body() dto: PublishProductDto,
  ) {
    return this.catalogService.setProductPublication(this.readSessionCookie(request), productId, dto);
  }

  @Post('products/:productId/images/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
    }),
  )
  uploadProductImage(
    @Req() request: Request,
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.catalogService.uploadProductImage(this.readSessionCookie(request), productId, file);
  }

  @Patch('products/:productId/images/reorder')
  reorderProductImages(
    @Req() request: Request,
    @Param('productId') productId: string,
    @Body() dto: ReorderProductImagesDto,
  ) {
    return this.catalogService.reorderProductImages(this.readSessionCookie(request), productId, dto);
  }

  @Delete('products/:productId/images/:imageId')
  deleteProductImage(
    @Req() request: Request,
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.catalogService.deleteProductImage(this.readSessionCookie(request), productId, imageId);
  }

  @Get('public/showrooms/:subdomain/products')
  publicCatalog(@Param('subdomain') subdomain: string) {
    return this.catalogService.publicCatalogBySubdomain(subdomain);
  }

  @Get('public/showrooms/:subdomain/products/:slug')
  publicProduct(@Param('subdomain') subdomain: string, @Param('slug') slug: string) {
    return this.catalogService.publicProductBySlug(subdomain, slug);
  }

  private readSessionCookie(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    return parse(cookieHeader)[SESSION_COOKIE_NAME];
  }
}
