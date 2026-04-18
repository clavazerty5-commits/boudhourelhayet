import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/seed - Seed the database with sample data
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
      const electronics = await tx.category.create({
        data: {
          name: 'Electronics',
          nameAr: 'إلكترونيات',
          icon: 'Smartphone',
          image: '/categories/electronics.jpg',
        },
      });

      const clothing = await tx.category.create({
        data: {
          name: 'Clothing',
          nameAr: 'ملابس',
          icon: 'Shirt',
          image: '/categories/clothing.jpg',
        },
      });

      const homeSupplies = await tx.category.create({
        data: {
          name: 'Home Supplies',
          nameAr: 'مستلزمات منزلية',
          icon: 'Home',
          image: '/categories/home.jpg',
        },
      });

      const accessories = await tx.category.create({
        data: {
          name: 'Accessories',
          nameAr: 'إكسسوارات',
          icon: 'Watch',
          image: '/categories/accessories.jpg',
        },
      });

      // Create products for Electronics (إلكترونيات)
      const electronicsProducts = [
        {
          name: 'Smart Phone Pro Max',
          nameAr: 'هاتف ذكي برو ماكس',
          description: 'Latest flagship smartphone with advanced camera system and powerful processor',
          descriptionAr: 'أحدث هاتف ذكي رائد بنظام كاميرا متقدم ومعالج قوي',
          price: 2999.99,
          comparePrice: 3499.99,
          images: JSON.stringify(['/products/phone-1.jpg', '/products/phone-2.jpg']),
          categoryId: electronics.id,
          stock: 50,
          featured: true,
          active: true,
          sku: 'ELEC-001',
          weight: 0.2,
        },
        {
          name: 'Wireless Earbuds',
          nameAr: 'سماعات لاسلكية',
          description: 'Premium wireless earbuds with noise cancellation and long battery life',
          descriptionAr: 'سماعات لاسلكية ممتازة مع إلغاء الضوضاء وبطارية تدوم طويلاً',
          price: 349.99,
          comparePrice: 449.99,
          images: JSON.stringify(['/products/earbuds-1.jpg', '/products/earbuds-2.jpg']),
          categoryId: electronics.id,
          stock: 120,
          featured: true,
          active: true,
          sku: 'ELEC-002',
          weight: 0.05,
        },
        {
          name: 'Laptop Ultra Slim',
          nameAr: 'لابتوب ألترا سليم',
          description: 'Ultra-thin laptop with high-resolution display and all-day battery',
          descriptionAr: 'لابتوب رفيع جداً مع شاشة عالية الدقة وبطارية تدوم طوال اليوم',
          price: 4599.99,
          comparePrice: 5199.99,
          images: JSON.stringify(['/products/laptop-1.jpg', '/products/laptop-2.jpg', '/products/laptop-3.jpg']),
          categoryId: electronics.id,
          stock: 30,
          featured: true,
          active: true,
          sku: 'ELEC-003',
          weight: 1.5,
        },
        {
          name: 'Smart Watch Sport',
          nameAr: 'ساعة ذكية رياضية',
          description: 'Fitness-focused smartwatch with GPS, heart rate monitor, and water resistance',
          descriptionAr: 'ساعة ذكية رياضية مع نظام تحديد المواقع ومراقبة معدل ضربات القلب ومقاومة الماء',
          price: 799.99,
          comparePrice: 999.99,
          images: JSON.stringify(['/products/watch-1.jpg', '/products/watch-2.jpg']),
          categoryId: electronics.id,
          stock: 80,
          featured: false,
          active: true,
          sku: 'ELEC-004',
          weight: 0.06,
        },
        {
          name: 'Portable Bluetooth Speaker',
          nameAr: 'مكبر صوت بلوتوث محمول',
          description: 'Waterproof portable speaker with 360-degree sound and 12-hour battery',
          descriptionAr: 'مكبر صوت محمول مقاوم للماء بصوت 360 درجة وبطارية 12 ساعة',
          price: 199.99,
          comparePrice: 249.99,
          images: JSON.stringify(['/products/speaker-1.jpg']),
          categoryId: electronics.id,
          stock: 65,
          featured: false,
          active: true,
          sku: 'ELEC-005',
          weight: 0.6,
        },
      ];

      // Create products for Clothing (ملابس)
      const clothingProducts = [
        {
          name: 'Premium Cotton T-Shirt',
          nameAr: 'تيشيرت قطن ممتاز',
          description: 'Soft premium cotton t-shirt with modern fit',
          descriptionAr: 'تيشيرت قطن ناعم ممتاز بقصة عصرية',
          price: 89.99,
          comparePrice: 119.99,
          images: JSON.stringify(['/products/tshirt-1.jpg', '/products/tshirt-2.jpg']),
          categoryId: clothing.id,
          stock: 200,
          featured: true,
          active: true,
          sku: 'CLTH-001',
          weight: 0.25,
        },
        {
          name: 'Classic Denim Jeans',
          nameAr: 'بنطلون جينز كلاسيكي',
          description: 'Classic fit denim jeans made from premium quality fabric',
          descriptionAr: 'بنطلون جينز كلاسيكي مصنوع من أجود أنواع الأقمشة',
          price: 179.99,
          comparePrice: 229.99,
          images: JSON.stringify(['/products/jeans-1.jpg', '/products/jeans-2.jpg']),
          categoryId: clothing.id,
          stock: 150,
          featured: false,
          active: true,
          sku: 'CLTH-002',
          weight: 0.6,
        },
        {
          name: 'Elegant Dress Shirt',
          nameAr: 'قميص رسم أنيق',
          description: 'Elegant dress shirt perfect for formal and business occasions',
          descriptionAr: 'قميص رسم أنيق مثالي للمناسبات الرسمية والعمل',
          price: 149.99,
          comparePrice: 189.99,
          images: JSON.stringify(['/products/shirt-1.jpg', '/products/shirt-2.jpg', '/products/shirt-3.jpg']),
          categoryId: clothing.id,
          stock: 100,
          featured: true,
          active: true,
          sku: 'CLTH-003',
          weight: 0.3,
        },
        {
          name: 'Sports Hoodie',
          nameAr: 'هودي رياضي',
          description: 'Comfortable sports hoodie with warm fleece lining',
          descriptionAr: 'هودي رياضي مريح مع بطانة صوف دافئة',
          price: 129.99,
          comparePrice: 169.99,
          images: JSON.stringify(['/products/hoodie-1.jpg']),
          categoryId: clothing.id,
          stock: 80,
          featured: false,
          active: true,
          sku: 'CLTH-004',
          weight: 0.5,
        },
      ];

      // Create products for Home Supplies (مستلزمات منزلية)
      const homeProducts = [
        {
          name: 'Automatic Coffee Maker',
          nameAr: 'ماكينة قهوة أوتوماتيكية',
          description: 'Programmable coffee maker with built-in grinder and thermal carafe',
          descriptionAr: 'ماكينة قهوة قابلة للبرمجة مع مطحنة مدمجة ووعاء حراري',
          price: 599.99,
          comparePrice: 749.99,
          images: JSON.stringify(['/products/coffee-1.jpg', '/products/coffee-2.jpg']),
          categoryId: homeSupplies.id,
          stock: 40,
          featured: true,
          active: true,
          sku: 'HOME-001',
          weight: 4.5,
        },
        {
          name: 'Robot Vacuum Cleaner',
          nameAr: 'مكنسة روبوت ذكية',
          description: 'Smart robot vacuum with mapping technology and auto-charging',
          descriptionAr: 'مكنسة روبوت ذكية مع تقنية رسم الخرائط والشحن التلقائي',
          price: 1299.99,
          comparePrice: 1599.99,
          images: JSON.stringify(['/products/vacuum-1.jpg', '/products/vacuum-2.jpg', '/products/vacuum-3.jpg']),
          categoryId: homeSupplies.id,
          stock: 25,
          featured: true,
          active: true,
          sku: 'HOME-002',
          weight: 3.2,
        },
        {
          name: 'Air Purifier HEPA',
          nameAr: 'مُنقّي الهواء HEPA',
          description: 'HEPA air purifier with real-time air quality monitoring',
          descriptionAr: 'مُنقّي هواء HEPA مع مراقبة جودة الهواء في الوقت الفعلي',
          price: 449.99,
          comparePrice: 549.99,
          images: JSON.stringify(['/products/purifier-1.jpg']),
          categoryId: homeSupplies.id,
          stock: 35,
          featured: false,
          active: true,
          sku: 'HOME-003',
          weight: 5.0,
        },
        {
          name: 'Smart LED Light Set',
          nameAr: 'طقم إضاءة LED ذكي',
          description: 'Color-changing smart LED lights with app control and voice assistant support',
          descriptionAr: 'أضواء LED ذكية متغيرة الألوان مع تحكم عبر التطبيق ودعم المساعد الصوتي',
          price: 149.99,
          comparePrice: 199.99,
          images: JSON.stringify(['/products/lights-1.jpg', '/products/lights-2.jpg']),
          categoryId: homeSupplies.id,
          stock: 90,
          featured: false,
          active: true,
          sku: 'HOME-004',
          weight: 0.8,
        },
      ];

      // Create products for Accessories (إكسسوارات)
      const accessoriesProducts = [
        {
          name: 'Leather Wallet',
          nameAr: 'محفظة جلدية',
          description: 'Genuine leather wallet with RFID protection and slim design',
          descriptionAr: 'محفظة جلدية أصلية مع حماية RFID وتصميم رفيع',
          price: 129.99,
          comparePrice: 179.99,
          images: JSON.stringify(['/products/wallet-1.jpg', '/products/wallet-2.jpg']),
          categoryId: accessories.id,
          stock: 100,
          featured: true,
          active: true,
          sku: 'ACCS-001',
          weight: 0.1,
        },
        {
          name: 'Phone Case Premium',
          nameAr: 'كفر هاتف بريميوم',
          description: 'Premium protective phone case with shock absorption and elegant design',
          descriptionAr: 'كفر حماية هاتف بريميوم مع امتصاص الصدمات وتصميم أنيق',
          price: 69.99,
          comparePrice: 89.99,
          images: JSON.stringify(['/products/case-1.jpg', '/products/case-2.jpg', '/products/case-3.jpg']),
          categoryId: accessories.id,
          stock: 300,
          featured: false,
          active: true,
          sku: 'ACCS-002',
          weight: 0.05,
        },
        {
          name: 'Sunglasses Aviator',
          nameAr: 'نظارات شمسية أفييتور',
          description: 'Classic aviator sunglasses with UV400 protection and polarized lenses',
          descriptionAr: 'نظارات شمسية أفييتور كلاسيكية مع حماية UV400 وعدسات مستقطبة',
          price: 199.99,
          comparePrice: 279.99,
          images: JSON.stringify(['/products/sunglasses-1.jpg']),
          categoryId: accessories.id,
          stock: 75,
          featured: true,
          active: true,
          sku: 'ACCS-003',
          weight: 0.03,
        },
        {
          name: 'USB-C Hub 7-in-1',
          nameAr: 'موزع USB-C 7 في 1',
          description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging',
          descriptionAr: 'موزع USB-C 7 في 1 مع HDMI و USB 3.0 وقارئ بطاقات SD وشحن PD',
          price: 149.99,
          comparePrice: 199.99,
          images: JSON.stringify(['/products/hub-1.jpg', '/products/hub-2.jpg']),
          categoryId: accessories.id,
          stock: 60,
          featured: false,
          active: true,
          sku: 'ACCS-004',
          weight: 0.15,
        },
      ];

      // Insert all products
      const allProducts = [
        ...electronicsProducts,
        ...clothingProducts,
        ...homeProducts,
        ...accessoriesProducts,
      ];

      await tx.product.createMany({
        data: allProducts,
      });

      // Create default store settings
      const defaultSettings = [
        { key: 'storeName', value: 'متجر إلكتروني' },
        { key: 'storeNameEn', value: 'E-Commerce Store' },
        { key: 'storeDescription', value: 'متجرك الإلكتروني لكل ما تحتاجه' },
        { key: 'storeDescriptionEn', value: 'Your one-stop e-commerce store for everything you need' },
        { key: 'currency', value: 'SAR' },
        { key: 'facebookPixelId', value: '' },
        { key: 'whatsappNumber', value: '' },
        { key: 'contactEmail', value: 'info@store.com' },
        { key: 'shippingFee', value: '25' },
        { key: 'freeShippingMinimum', value: '200' },
        { key: 'taxRate', value: '15' },
      ];

      await tx.storeSetting.createMany({
        data: defaultSettings,
      });

      return {
        categories: [electronics, clothing, homeSupplies, accessories],
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
