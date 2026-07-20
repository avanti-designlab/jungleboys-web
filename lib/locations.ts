// California store directory for the contact/locations map. CA-only (the 4
// owned, natively-menued stores). Shop links point at each store's menu page.
// Coordinates are approximate (address-derived) — fine for map pins; the
// authoritative store record lives in the Dutchie query layer (Phase 3).
// `image` is a shared branded placeholder until per-store photos are supplied.

export type Store = {
  slug: string
  name: string
  address: string
  city: string
  zip: string
  phone: string
  hours: string
  lat: number
  lng: number
  shopUrl: string
  image: string
}

export const CA_STORES: Store[] = [
  {
    slug: 'downtown-los-angeles',
    name: 'Downtown Los Angeles',
    address: '1530 S Alameda St #7',
    city: 'Los Angeles',
    zip: '90021',
    phone: '(213) 221-4043',
    hours: '9AM – 9PM · Mon–Sun',
    lat: 34.0287,
    lng: -118.2337,
    shopUrl: '/menu/california/downtown-los-angeles',
    image: '/contact/contact-bg.jpg',
  },
  {
    slug: 'orange-county',
    name: 'Orange County',
    address: '2911 Tech Center Dr',
    city: 'Santa Ana',
    zip: '92705',
    phone: '(714) 486-3831',
    hours: '8AM – 8PM · Mon–Thu · later Fri–Sat',
    lat: 33.7148,
    lng: -117.8553,
    shopUrl: '/menu/california/orange-county',
    image: '/contact/contact-bg.jpg',
  },
  {
    slug: 'pomona',
    name: 'Pomona',
    address: '196 University Pkwy',
    city: 'Pomona',
    zip: '91768',
    phone: '(909) 594-2627',
    hours: '9AM – 9:45PM · Mon–Sun',
    lat: 34.0592,
    lng: -117.8093,
    shopUrl: '/menu/california/pomona',
    image: '/contact/contact-bg.jpg',
  },
  {
    slug: 'san-diego',
    name: 'San Diego',
    address: '8160 Parkway Dr',
    city: 'La Mesa',
    zip: '91942',
    phone: '(619) 439-6457',
    hours: '7AM – 9PM · Mon–Sun',
    lat: 32.7758,
    lng: -117.0186,
    shopUrl: '/menu/california/san-diego',
    image: '/contact/contact-bg.jpg',
  },
]
