export const categories = [
  {
    id: 'all',
    name: 'All',
    slug: 'all',
    description: 'Every little handmade treasure',
  },
  {
    id: 'crochet-toys',
    name: 'Crochet Toys',
    slug: 'crochet-toys',
    description: 'Soft amigurumi friends, made to be hugged',
    accent: 'blush',
  },
  {
    id: 'flowers',
    name: 'Flowers & Bouquets',
    slug: 'flowers',
    description: 'Blooms that never wilt',
    accent: 'peach',
  },
  {
    id: 'personalized',
    name: 'Personalized Gifts',
    slug: 'personalized',
    description: 'Pieces with names, initials, and meaning',
    accent: 'lavender',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Flower bandanas, juda pins, and hair pieces',
    accent: 'sage',
  },
  {
    id: 'keychains',
    name: 'Keychains',
    slug: 'keychains',
    description: 'Tiny keepsakes for bags, keys, and pockets',
    accent: 'petal',
  },
  {
    id: 'custom',
    name: 'Custom Creations',
    slug: 'custom',
    description: 'Your idea, our yarn, a little bit of magic',
    accent: 'lilac',
  },
]

export const shopCategories = categories.filter((c) => c.id !== 'all')
