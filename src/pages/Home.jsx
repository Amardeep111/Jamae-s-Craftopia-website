import BrandHighlights from '../components/home/BrandHighlights'
import BrandStory from '../components/home/BrandStory'
import Categories from '../components/home/Categories'
import CustomOrderCTA from '../components/home/CustomOrderCTA'
import FeaturedProducts from '../components/home/FeaturedProducts'
import FinalCTA from '../components/home/FinalCTA'
import Hero from '../components/home/Hero'
import HowItWorks from '../components/home/HowItWorks'
import SocialGallery from '../components/home/SocialGallery'
import Testimonials from '../components/home/Testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <BrandHighlights />
      <Categories />
      <FeaturedProducts />
      <BrandStory />
      <CustomOrderCTA />
      <HowItWorks />
      <SocialGallery />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
