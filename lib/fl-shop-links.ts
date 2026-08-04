// Direct shop links to the FL team's site, one per store — supplied by Avanti
// (2026-08-04, "JB FL Locations List.docx"): "for now" the Florida stores
// shop OFF-SITE at jungleboysflorida.com rather than through embed shells
// here. The utm_source=jbca params are theirs — keep them intact so the FL
// team can see traffic we send. Keys are OUR store slugs (lib/owned-stores).
//
// st-petersburg's store() entry landed 2026-08-04 — NAP read off the live
// jungleboys.com/locations listing. Its hand-drawn illustration is still
// owed; the directory card falls back to the brand mark until it arrives.
export const FL_SHOP_LINKS: Record<string, string> = {
  'bonita-springs':
    'https://jungleboysflorida.com/locations/jungle-boys-bonita-springs/?retailer=jungle-boys-bonita-springs&utm_source=jbca&utm_campaign=bonita-springs&utm_content=website',
  'daytona-beach':
    'https://jungleboysflorida.com/locations/jungle-boys-daytona-beach/?retailer=jungle-boys-daytona-beach&utm_source=jbca&utm_campaign=daytona-beach&utm_content=website',
  'deerfield-beach':
    'https://jungleboysflorida.com/locations/jungle-boys-deerfield-beach/?retailer=jungle-boys-deerfield-beach&utm_source=jbca&utm_campaign=deerfield-beach&utm_content=website',
  gainesville:
    'https://jungleboysflorida.com/locations/jungle-boys-gainesville/?retailer=jungle-boys-gainesville&utm_source=jbca&utm_campaign=gainesville&utm_content=website',
  jacksonville:
    'https://jungleboysflorida.com/locations/jungle-boys-jacksonville/?retailer=jungle-boys-jacksonville&utm_source=jbca&utm_campaign=jacksonville&utm_content=website',
  miami:
    'https://jungleboysflorida.com/locations/jungle-boys-miami/?retailer=jungle-boys-miami&utm_source=jbca&utm_campaign=miami&utm_content=website',
  'miami-beach':
    'https://jungleboysflorida.com/locations/jungle-boys-miami-beach/?retailer=jungle-boys-miami-beach&utm_source=jbca&utm_campaign=miami-beach&utm_content=website',
  'north-miami-beach':
    'https://jungleboysflorida.com/locations/jungle-boys-north-miami-beach/?retailer=jungle-boys-north-miami-beach&utm_source=jbca&utm_campaign=north-miami-beach&utm_content=website',
  ocala:
    'https://jungleboysflorida.com/locations/jungle-boys-ocala/?retailer=jungle-boys-ocala&utm_source=jbca&utm_campaign=ocala&utm_content=website',
  orlando:
    'https://jungleboysflorida.com/locations/jungle-boys-orlando/?retailer=jungle-boys-orlando&utm_source=jbca&utm_campaign=orlando&utm_content=website',
  'palm-harbor':
    'https://jungleboysflorida.com/locations/jungle-boys-palm-harbor/?retailer=jungle-boys-palm-harbor&utm_source=jbca&utm_campaign=palm-harbor&utm_content=website',
  'st-petersburg':
    'https://jungleboysflorida.com/locations/jungle-boys-st-pete/?retailer=jungle-boys-st-pete&utm_source=jbca&utm_campaign=st-pete&utm_content=website',
  tallahassee:
    'https://jungleboysflorida.com/locations/jungle-boys-tallahassee/?retailer=jungle-boys-tallahassee&utm_source=jbca&utm_campaign=tallahassee&utm_content=website',
  tampa:
    'https://jungleboysflorida.com/locations/jungle-boys-tampa/?retailer=jungle-boys-tampa&utm_source=jbca&utm_campaign=tampa&utm_content=website',
  'west-palm-beach':
    'https://jungleboysflorida.com/locations/jungle-boys-west-palm-beach/?retailer=jungle-boys-west-palm-beach&utm_source=jbca&utm_campaign=west-palm-beach&utm_content=website',
}

export const FL_SITE_URL = 'https://www.jungleboysflorida.com'
