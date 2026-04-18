'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import Header from '@/components/store/Header'
import HeroSection from '@/components/store/HeroSection'
import ProductGrid from '@/components/store/ProductGrid'
import ProductDetail from '@/components/store/ProductDetail'
import CartDrawer from '@/components/store/CartDrawer'
import CheckoutForm from '@/components/store/CheckoutForm'
import AdminPanel from '@/components/store/AdminPanel'
import Footer from '@/components/store/Footer'

export default function Home() {
  const currentPage = useStore((state) => state.currentPage)

  // Seed the database on first load
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        const res = await fetch('/api/seed', { method: 'POST' })
        if (res.ok) {
          console.log('Database seeded successfully')
        }
      } catch (error) {
        console.log('Database may already be seeded')
      }
    }
    seedDatabase()
  }, [])

  // Render the current page based on store state
  const renderPage = () => {
    switch (currentPage) {
      case 'shop':
        return (
          <>
            <HeroSection />
            <ProductGrid />
          </>
        )
      case 'product-detail':
        return <ProductDetail />
      case 'cart':
        return <CartDrawer />
      case 'checkout':
        return <CheckoutForm />
      case 'admin':
      case 'admin-products':
      case 'admin-orders':
      case 'admin-settings':
        return <AdminPanel />
      default:
        return (
          <>
            <HeroSection />
            <ProductGrid />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}
