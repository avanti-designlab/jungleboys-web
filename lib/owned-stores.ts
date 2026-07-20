// Jungle Boys owned dispensaries for /locations — the store directory grouped by
// state (4 CA native menus + 14 FL embed menus). Hand-drawn store illustrations
// live in public/locations/stores/<slug>.png. St. Petersburg is a live listing
// with no menu page yet, so it's intentionally omitted until its embed exists.
// SEPARATE from the Product Finder's 3rd-party stockist list (two-map rule).

export type OwnedStore = {
  slug: string
  name: string
  address: string
  phone: string
  hours: string
  state: 'CA' | 'FL'
  image: string
  menuUrl: string
  external?: boolean // link opens off-site (e.g. the clothing store)
  cta?: string // override the button label
}

const CA_HOURS_OC = '8AM – 8PM Mon–Thu · 8AM–9PM Fri–Sat · 9AM–8PM Sun'
const FL_HOURS = '8:30AM – 8:30PM Mon–Sat · 10AM – 6PM Sun'

function store(state: 'CA' | 'FL', slug: string, name: string, address: string, phone: string, hours: string): OwnedStore {
  return {
    slug,
    name,
    address,
    phone,
    hours,
    state,
    image: `/locations/stores/${slug}.png`,
    menuUrl: `/menu/${state === 'CA' ? 'california' : 'florida'}/${slug}`,
  }
}

export const OWNED_STORES: OwnedStore[] = [
  // ── California ──
  store('CA', 'downtown-los-angeles', 'Downtown Los Angeles', '1530 S Alameda St #7, Los Angeles, CA 90021', '(213) 221-4043', '9AM – 9PM · Mon–Sun'),
  store('CA', 'orange-county', 'Orange County', '2911 Tech Center Dr, Santa Ana, CA 92705', '(714) 486-3831', CA_HOURS_OC),
  store('CA', 'pomona', 'Pomona', '196 University Pkwy, Pomona, CA 91768', '(909) 594-2627', '9AM – 9:45PM · Mon–Sun'),
  store('CA', 'san-diego', 'San Diego', '8160 Parkway Dr, La Mesa, CA 91942', '(619) 439-6457', '7AM – 9PM · Mon–Sun'),
  {
    slug: 'jungle-boys-clothing',
    name: 'Jungle Boys Clothing',
    address: '1530 S Alameda St #5, Los Angeles, CA 90021',
    phone: '(213) 221-4043',
    hours: '8:30AM – 8:30PM Mon–Sat · 10AM – 6PM Sun',
    state: 'CA',
    image: '/locations/stores/jungle-boys-clothing.png',
    menuUrl: 'https://jungleboysclothing.com',
    external: true,
    cta: 'Shop Clothing →',
  },
  // ── Florida ──
  store('FL', 'bonita-springs', 'Bonita Springs', '28751 S Tamiami Trl, Bonita Springs, FL 34134', '(239) 488-2007', FL_HOURS),
  store('FL', 'daytona-beach', 'Daytona Beach', '1392 W International Speedway Blvd, Daytona Beach, FL 32114', '(386) 610-6930', FL_HOURS),
  store('FL', 'deerfield-beach', 'Deerfield Beach', '1299 S Military Trail, Deerfield Beach, FL 33442', '(714) 486-3831', FL_HOURS),
  store('FL', 'gainesville', 'Gainesville', '1120 W University Ave, Gainesville, FL 32601', '(352) 810-3050', FL_HOURS),
  store('FL', 'jacksonville', 'Jacksonville', '3655 University Blvd W, Jacksonville, FL 32217', '(904) 361-9900', FL_HOURS),
  store('FL', 'miami', 'Miami', '8994 SW 40th St, Miami, FL 33165', '(786) 839-6980', FL_HOURS),
  store('FL', 'miami-beach', 'Miami Beach', '6958 Collins Ave, Miami Beach, FL 33141', '(305) 703-8450', FL_HOURS),
  store('FL', 'north-miami-beach', 'North Miami Beach', '3495 NE 163rd St, North Miami Beach, FL 33160', '(786) 998-1500', FL_HOURS),
  store('FL', 'ocala', 'Ocala', '2301 N Pine Ave, Ocala, FL 34475', '(352) 820-6420', FL_HOURS),
  store('FL', 'orlando', 'Orlando', '11401 University Blvd, Orlando, FL 32817', '(689) 278-3560', FL_HOURS),
  store('FL', 'palm-harbor', 'Palm Harbor', '31650 US Hwy 19 N, Palm Harbor, FL 34684', '(813) 934-2601', FL_HOURS),
  store('FL', 'tallahassee', 'Tallahassee', '1719 W Tennessee St, Tallahassee, FL 32304', '(850) 756-7060', FL_HOURS),
  store('FL', 'tampa', 'Tampa', '602 N Dale Mabry Hwy, Tampa, FL 33609', '(352) 723-3010', FL_HOURS),
  store('FL', 'west-palm-beach', 'West Palm Beach', '4561 Okeechobee Blvd, West Palm Beach, FL 33417', '(728) 231-5570', FL_HOURS),
]

export const CA_OWNED = OWNED_STORES.filter((s) => s.state === 'CA')
export const FL_OWNED = OWNED_STORES.filter((s) => s.state === 'FL')
