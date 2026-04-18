import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/seed - Seed the database with sample data for بذور الحياة store
export async function POST() {
  try {
    // Check if data already exists
    const existingCategories = await db.category.count();
    if (existingCategories > 0) {
      return NextResponse.json(
        { error: 'Database already seeded. Clear existing data first.' },
        { status: 400 }
      );
    }

    // Create categories
    const categories = await db.$transaction(async (tx) => {
      const cosmetics = await tx.category.create({
        data: {
          name: 'Cosmetics',
          nameAr: 'مستحضرات تجميل',
          icon: 'Sparkles',
          image: '/categories/cosmetics.jpg',
        },
      });

      const herbs = await tx.category.create({
        data: {
          name: 'Natural Herbs',
          nameAr: 'أعشاب طبيعية',
          icon: 'Leaf',
          image: '/categories/herbs.jpg',
        },
      });

      const cleaning = await tx.category.create({
        data: {
          name: 'Cleaning Products',
          nameAr: 'مواد تنظيف',
          icon: 'Droplets',
          image: '/categories/cleaning.jpg',
        },
      });

      const skincare = await tx.category.create({
        data: {
          name: 'Skincare',
          nameAr: 'العناية بالبشرة',
          icon: 'Heart',
          image: '/categories/skincare.jpg',
        },
      });

      // Create products for مستحضرات تجميل (Cosmetics)
      const cosmeticsProducts = [
        {
          name: 'Natural Lipstick',
          nameAr: 'أحمر شفاه طبيعي',
          description: 'Natural lipstick made from organic ingredients, long-lasting color',
          descriptionAr: 'أحمر شفاه طبيعي مصنوع من مكونات عضوية، لون يدوم طويلاً بدون أذية للشفاه',
          price: 25.000,
          comparePrice: 35.000,
          images: JSON.stringify(['/products/lipstick-1.jpg', '/products/lipstick-2.jpg']),
          categoryId: cosmetics.id,
          stock: 80,
          featured: true,
          active: true,
          sku: 'COS-001',
          weight: 0.03,
        },
        {
          name: 'Foundation Cream',
          nameAr: 'كريم أساس مات',
          description: 'Matte foundation cream with full coverage and SPF 30 protection',
          descriptionAr: 'كريم أساس مات بتغطية كاملة وحماية SPF 30، مناسب لجميع أنواع البشرة',
          price: 42.000,
          comparePrice: 55.000,
          images: JSON.stringify(['/products/foundation-1.jpg', '/products/foundation-2.jpg']),
          categoryId: cosmetics.id,
          stock: 60,
          featured: true,
          active: true,
          sku: 'COS-002',
          weight: 0.05,
        },
        {
          name: 'Eye Shadow Palette',
          nameAr: 'لوحة ظلال العيون',
          description: '12-color eye shadow palette with shimmer and matte shades',
          descriptionAr: 'لوحة ظلال عيون 12 لون بألوان لامعة ومات، ألوان متنوعة لكل المناسبات',
          price: 38.000,
          comparePrice: 50.000,
          images: JSON.stringify(['/products/eyeshadow-1.jpg', '/products/eyeshadow-2.jpg', '/products/eyeshadow-3.jpg']),
          categoryId: cosmetics.id,
          stock: 45,
          featured: true,
          active: true,
          sku: 'COS-003',
          weight: 0.12,
        },
        {
          name: 'Mascara Volume',
          nameAr: 'مسكارا تكثيف الرموش',
          description: 'Volume-boosting mascara with natural formula, waterproof',
          descriptionAr: 'مسكارا تكثيف الرموش بتركيبة طبيعية، مقاومة للماء وتدوم طوال اليوم',
          price: 22.000,
          comparePrice: 30.000,
          images: JSON.stringify(['/products/mascara-1.jpg']),
          categoryId: cosmetics.id,
          stock: 100,
          featured: false,
          active: true,
          sku: 'COS-004',
          weight: 0.03,
        },
        {
          name: 'Makeup Brush Set',
          nameAr: 'طقم فرش مكياج',
          description: 'Professional 12-piece makeup brush set with synthetic bristles',
          descriptionAr: 'طقم فرش مكياج احترافي 12 قطعة بشعيرات صناعية ناعمة، يأتي مع حقيبة أنيقة',
          price: 55.000,
          comparePrice: 75.000,
          images: JSON.stringify(['/products/brushes-1.jpg', '/products/brushes-2.jpg']),
          categoryId: cosmetics.id,
          stock: 35,
          featured: true,
          active: true,
          sku: 'COS-005',
          weight: 0.25,
        },
      ];

      // Create products for أعشاب طبيعية (Natural Herbs)
      const herbsProducts = [
        {
          name: 'Sage Tea',
          nameAr: 'ميرمية طبيعية',
          description: 'Premium dried sage leaves for traditional tea, rich in antioxidants',
          descriptionAr: 'أوراق ميرمية طبيعية مجففة للشاي التقليدي، غنية بمضادات الأكسدة ومفيدة للصحة',
          price: 12.000,
          comparePrice: 18.000,
          images: JSON.stringify(['/products/sage-1.jpg', '/products/sage-2.jpg']),
          categoryId: herbs.id,
          stock: 200,
          featured: true,
          active: true,
          sku: 'HRB-001',
          weight: 0.1,
        },
        {
          name: 'Moringa Powder',
          nameAr: 'مورينغا بودرة',
          description: 'Organic moringa powder, superfood rich in vitamins and minerals',
          descriptionAr: 'بودرة مورينغا عضوية، سوبرفود غنية بالفيتامينات والمعادن، تعزز المناعة والطاقة',
          price: 35.000,
          comparePrice: 45.000,
          images: JSON.stringify(['/products/moringa-1.jpg', '/products/moringa-2.jpg']),
          categoryId: herbs.id,
          stock: 80,
          featured: true,
          active: true,
          sku: 'HRB-002',
          weight: 0.2,
        },
        {
          name: 'Natural Honey with Herbs',
          nameAr: 'عسل طبيعي بالأعشاب',
          description: 'Pure honey infused with natural herbs, traditional remedy',
          descriptionAr: 'عسل طبيعي نقي مع أعشاب طبيعية مختارة، علاج تقليدي للسعال ونزلات البرد',
          price: 45.000,
          comparePrice: 58.000,
          images: JSON.stringify(['/products/honey-herbs-1.jpg', '/products/honey-herbs-2.jpg']),
          categoryId: herbs.id,
          stock: 50,
          featured: true,
          active: true,
          sku: 'HRB-003',
          weight: 0.5,
        },
        {
          name: 'Chamomile Flowers',
          nameAr: 'بابونج طبيعي',
          description: 'Dried chamomile flowers for calming tea, aids sleep and relaxation',
          descriptionAr: 'زهور بابونج طبيعية مجففة لشاي مهدئ، تساعد على النوم والاسترخاء وتخفيف التوتر',
          price: 10.000,
          comparePrice: 15.000,
          images: JSON.stringify(['/products/chamomile-1.jpg']),
          categoryId: herbs.id,
          stock: 150,
          featured: false,
          active: true,
          sku: 'HRB-004',
          weight: 0.08,
        },
        {
          name: 'Black Seed Oil',
          nameAr: 'زيت حبة البركة',
          description: 'Cold-pressed black seed oil, traditional remedy with multiple health benefits',
          descriptionAr: 'زيت حبة البركة المعصور على البارد، علاج تقليدي بفوائد صحية متعددة للمناعة والبشرة',
          price: 28.000,
          comparePrice: 38.000,
          images: JSON.stringify(['/products/blackseed-1.jpg', '/products/blackseed-2.jpg']),
          categoryId: herbs.id,
          stock: 70,
          featured: true,
          active: true,
          sku: 'HRB-005',
          weight: 0.25,
        },
      ];

      // Create products for مواد تنظيف (Cleaning Products)
      const cleaningProducts = [
        {
          name: 'Natural Floor Cleaner',
          nameAr: 'منظف أرضيات طبيعي',
          description: 'Eco-friendly floor cleaner with natural ingredients and fresh scent',
          descriptionAr: 'منظف أرضيات صديق للبيئة بمكونات طبيعية ورائحة منعشة، آمن للأطفال',
          price: 8.500,
          comparePrice: 12.000,
          images: JSON.stringify(['/products/floor-cleaner-1.jpg']),
          categoryId: cleaning.id,
          stock: 200,
          featured: true,
          active: true,
          sku: 'CLN-001',
          weight: 1.0,
        },
        {
          name: 'Dishwashing Liquid',
          nameAr: 'سائل غسيل الأطباق',
          description: 'Natural dishwashing liquid, tough on grease gentle on hands',
          descriptionAr: 'سائل غسيل أطباق طبيعي، قوي على الدهون ونعوم على اليدين بتركيبة آمنة',
          price: 6.500,
          comparePrice: 9.000,
          images: JSON.stringify(['/products/dish-liquid-1.jpg', '/products/dish-liquid-2.jpg']),
          categoryId: cleaning.id,
          stock: 250,
          featured: false,
          active: true,
          sku: 'CLN-002',
          weight: 0.75,
        },
        {
          name: 'Laundry Detergent',
          nameAr: 'مسحوق غسيل طبيعي',
          description: 'Organic laundry detergent powder, suitable for sensitive skin',
          descriptionAr: 'مسحوق غسيل عضوي طبيعي، مناسب للبشرة الحساسة ويزيل البقع بفعالية',
          price: 15.000,
          comparePrice: 22.000,
          images: JSON.stringify(['/products/laundry-1.jpg', '/products/laundry-2.jpg']),
          categoryId: cleaning.id,
          stock: 120,
          featured: true,
          active: true,
          sku: 'CLN-003',
          weight: 1.5,
        },
        {
          name: 'Glass Cleaner Spray',
          nameAr: 'رش منظف الزجاج',
          description: 'Streak-free glass cleaner with natural formula',
          descriptionAr: 'منظف زجاج بدون آثار بتركيبة طبيعية، مثالي للنوافذ والمرايا',
          price: 7.000,
          comparePrice: 10.000,
          images: JSON.stringify(['/products/glass-cleaner-1.jpg']),
          categoryId: cleaning.id,
          stock: 150,
          featured: false,
          active: true,
          sku: 'CLN-004',
          weight: 0.5,
        },
        {
          name: 'All-Purpose Cleaner Set',
          nameAr: 'طقم منظفات متعددة الاستخدام',
          description: 'Set of 3 natural all-purpose cleaners for kitchen, bathroom, and surfaces',
          descriptionAr: 'طقم 3 منظفات طبيعية متعددة الاستخدام للمطبخ والحمام والأسطح، تنظيف شامل',
          price: 22.000,
          comparePrice: 30.000,
          images: JSON.stringify(['/products/all-cleaner-1.jpg', '/products/all-cleaner-2.jpg']),
          categoryId: cleaning.id,
          stock: 80,
          featured: true,
          active: true,
          sku: 'CLN-005',
          weight: 2.0,
        },
      ];

      // Create products for العناية بالبشرة (Skincare)
      const skincareProducts = [
        {
          name: 'Argan Face Cream',
          nameAr: 'كريم وجه بالأرغان',
          description: 'Moisturizing face cream with Moroccan argan oil and vitamin E',
          descriptionAr: 'كريم مرطب للوجه بزيت الأرغان المغربي وفيتامين E، يغذي البشرة ويعطيها نضارة',
          price: 32.000,
          comparePrice: 42.000,
          images: JSON.stringify(['/products/argan-cream-1.jpg', '/products/argan-cream-2.jpg']),
          categoryId: skincare.id,
          stock: 70,
          featured: true,
          active: true,
          sku: 'SKN-001',
          weight: 0.05,
        },
        {
          name: 'Rose Water Toner',
          nameAr: 'تونر ماء الورد',
          description: 'Pure rose water facial toner, natural and alcohol-free',
          descriptionAr: 'تونر ماء ورد نقي للوجه، طبيعي بدون كحول، ينقي البشرة ويعادل الحموضة',
          price: 18.000,
          comparePrice: 25.000,
          images: JSON.stringify(['/products/rose-water-1.jpg']),
          categoryId: skincare.id,
          stock: 100,
          featured: true,
          active: true,
          sku: 'SKN-002',
          weight: 0.2,
        },
        {
          name: 'Natural Face Scrub',
          nameAr: 'مقشر وجه طبيعي',
          description: 'Exfoliating face scrub with natural grains and honey extract',
          descriptionAr: 'مقشر وجه طبيعي بحبيبات ناعمة ومستخلص العسل، يزيل الخلايا الميتة بلطف',
          price: 24.000,
          comparePrice: 32.000,
          images: JSON.stringify(['/products/scrub-1.jpg', '/products/scrub-2.jpg']),
          categoryId: skincare.id,
          stock: 60,
          featured: false,
          active: true,
          sku: 'SKN-003',
          weight: 0.15,
        },
        {
          name: 'Hair Care Oil',
          nameAr: 'زيت العناية بالشعر',
          description: 'Natural hair oil blend with olive, coconut, and castor oil',
          descriptionAr: 'خليط زيوت طبيعية للشعر بزيت الزيتون وجوز الهند والخروع، يقوي الشعر ويمنع التساقط',
          price: 20.000,
          comparePrice: 28.000,
          images: JSON.stringify(['/products/hair-oil-1.jpg', '/products/hair-oil-2.jpg']),
          categoryId: skincare.id,
          stock: 90,
          featured: true,
          active: true,
          sku: 'SKN-004',
          weight: 0.15,
        },
      ];

      // Insert all products
      const allProducts = [
        ...cosmeticsProducts,
        ...herbsProducts,
        ...cleaningProducts,
        ...skincareProducts,
      ];

      await tx.product.createMany({
        data: allProducts,
      });

      // Create default store settings
      const defaultSettings = [
        { key: 'storeName', value: 'بذور الحياة' },
        { key: 'storeNameEn', value: 'Boudhour El Hayet' },
        { key: 'storeDescription', value: 'متجرك لمنتجات التجميل والأعشاب الطبيعية ومواد التنظيف' },
        { key: 'storeDescriptionEn', value: 'Your store for cosmetics, natural herbs, and cleaning products' },
        { key: 'currency', value: 'TND' },
        { key: 'facebookPixelId', value: '' },
        { key: 'whatsappNumber', value: '0021695753312' },
        { key: 'contactEmail', value: 'boudhourelhayet@gmail.com' },
        { key: 'contactPhone', value: '0021695753312' },
        { key: 'shippingFee', value: '8' },
        { key: 'freeShippingMinimum', value: '80' },
        { key: 'taxRate', value: '19' },
        { key: 'country', value: 'تونس' },
      ];

      await tx.storeSetting.createMany({
        data: defaultSettings,
      });

      return {
        categories: [cosmetics, herbs, cleaning, skincare],
        productsCount: allProducts.length,
        settingsCount: defaultSettings.length,
      };
    });

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        categories: categories.categories.length,
        products: categories.productsCount,
        settings: categories.settingsCount,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
