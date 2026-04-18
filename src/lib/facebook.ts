/**
 * Facebook Pixel integration utilities for tracking e-commerce events.
 * Uses the fbq function that Facebook Pixel provides globally.
 */

// Declare the global fbq function type
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Get the fbq function safely, returns null if not available.
 */
function getFbq(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined') return null;
  if (window.fbq) return window.fbq;
  return null;
}

/**
 * Initialize Facebook Pixel with the given pixel ID.
 * This loads the Pixel script and initializes tracking.
 */
export function initFacebookPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;
  if (!pixelId) return;

  // Check if already initialized
  if (window.fbq) return;

  // Define fbq function stub with queue mechanism
  const fbqQueue: unknown[] = [];
  const fbq = function (...args: unknown[]) {
    fbqQueue.push(args);
  };

  // Set up the queue
  if (!(window._fbq as unknown as { loaded?: boolean })?.loaded) {
    const fbqObj = fbq as unknown as {
      push: (...args: unknown[]) => void;
      loaded: boolean;
      version: string;
      queue: unknown[];
    };
    fbqObj.push = fbq;
    fbqObj.loaded = true;
    fbqObj.version = '2.0';
    fbqObj.queue = [];
  }

  window.fbq = fbq;
  window._fbq = fbq;

  // Initialize with the pixel ID
  fbq('init', pixelId);

  // Load the Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
}

/**
 * Track a standard PageView event.
 */
export function trackPageView(): void {
  const fbq = getFbq();
  if (!fbq) return;
  fbq('track', 'PageView');
}

/**
 * Track an AddToCart event with product details.
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}): void {
  const fbq = getFbq();
  if (!fbq) return;
  fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'TND',
    contents: [
      {
        id: product.id,
        quantity: product.quantity ?? 1,
        item_price: product.price,
      },
    ],
  });
}

/**
 * Track an InitiateCheckout event with checkout data.
 */
export function trackInitCheckout(data: {
  value: number;
  currency?: string;
  numItems?: number;
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
}): void {
  const fbq = getFbq();
  if (!fbq) return;
  fbq('track', 'InitiateCheckout', {
    value: data.value,
    currency: data.currency ?? 'DZD',
    num_items: data.numItems,
    content_type: 'product',
    contents: data.contents,
  });
}

/**
 * Track a Purchase event with order data.
 */
export function trackPurchase(orderData: {
  orderId: string;
  value: number;
  currency?: string;
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
  numItems?: number;
}): void {
  const fbq = getFbq();
  if (!fbq) return;
  fbq('track', 'Purchase', {
    content_ids: orderData.orderId,
    value: orderData.value,
    currency: orderData.currency ?? 'DZD',
    content_type: 'product',
    contents: orderData.contents,
    num_items: orderData.numItems,
  });
}

/**
 * Open a Facebook share dialog for a product.
 * Falls back to opening a new window with the share URL.
 */
export function shareOnFacebook(productUrl: string, productName: string): void {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(productName)}`;

  if (typeof window === 'undefined') return;

  window.open(
    shareUrl,
    'facebook-share-dialog',
    'width=626,height=436,scrollbars=yes'
  );
}
