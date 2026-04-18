import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products - List products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (active && active !== 'all') {
      where.active = active === 'true';
    } else if (!active) {
      where.active = true;
    }
    // if active === 'all', no filter is applied (shows both active and inactive)

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
        { descriptionAr: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ]);

    // Parse images JSON strings
    const productsWithParsedImages = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images),
    }));

    return NextResponse.json({
      products: productsWithParsedImages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      comparePrice,
      images,
      categoryId,
      stock,
      featured,
      active,
      sku,
      weight,
      facebookProductId,
    } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and categoryId are required' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        nameAr: nameAr || null,
        description: description || null,
        descriptionAr: descriptionAr || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: JSON.stringify(images || []),
        categoryId,
        stock: stock ?? 0,
        featured: featured ?? false,
        active: active ?? true,
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        facebookProductId: facebookProductId || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        ...product,
        images: JSON.parse(product.images),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
