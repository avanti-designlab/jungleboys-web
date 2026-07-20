// 3rd-party retailers that stock Jungle Boys products (Product Finder /find-jb-products).
// SEPARATE data source from the owned-locations map (two-map rule). Extracted from the
// live Webflow store locator; coordinates geocoded via OpenStreetMap. Move to Supabase
// `retailers` (public read) when seeded.

export type Retailer = { name: string; address: string; state: string; lat: number; lng: number }

export const RETAILERS: Retailer[] = [
  {
    "name": "Alternatives East",
    "address": "2300 Bethards Dr Suite A Santa Rosa CA 95405",
    "state": "CA",
    "lat": 38.42622,
    "lng": -122.66601
  },
  {
    "name": "Atrium Topanga",
    "address": "5441 Topanga Canyon Blvd Woodland Hills CA 91367",
    "state": "CA",
    "lat": 34.16979,
    "lng": -118.60567
  },
  {
    "name": "Atrium Valley Village",
    "address": "12458 Magnolia Blvd Valley Village CA 91607",
    "state": "CA",
    "lat": 34.16479,
    "lng": -118.40457
  },
  {
    "name": "Blissful Moments Healing Center",
    "address": "1115 Norboe Ave Corcoran CA 93212",
    "state": "CA",
    "lat": 36.09745,
    "lng": -119.56219
  },
  {
    "name": "Bonita Springs",
    "address": "28751 South Tamiami Trl, Bonita Springs, FL, US, 34134",
    "state": "FL",
    "lat": 26.31958,
    "lng": -81.80504
  },
  {
    "name": "Bored N Stone",
    "address": "3401 W 8th Street Los Angeles CA 90005",
    "state": "CA",
    "lat": 34.05777,
    "lng": -118.30322
  },
  {
    "name": "Bud Bees",
    "address": "10237 Sepulveda Blvd Mission Hills CA 91345",
    "state": "CA",
    "lat": 34.26011,
    "lng": -118.46749
  },
  {
    "name": "Budtenders Delivery",
    "address": "880 Folsom St San Francisco CA 94107",
    "state": "CA",
    "lat": 37.78085,
    "lng": -122.40307
  },
  {
    "name": "Buzz Delivery",
    "address": "300 Pendleton Way Suite 322 Oakland CA 94621",
    "state": "CA",
    "lat": 37.73519,
    "lng": -122.20064
  },
  {
    "name": "Cana Sylmar",
    "address": "13509 W Hubbard St Sylmar CA 91342",
    "state": "CA",
    "lat": 34.297,
    "lng": -118.44203
  },
  {
    "name": "Cannaco Delivery",
    "address": "15872 Little Morongo Rd Suite 100 & 101 Desert Hot Springs CA 92240",
    "state": "CA",
    "lat": 33.96112,
    "lng": -116.50168
  },
  {
    "name": "Cloud7",
    "address": "486 7th Street Oakland CA 94607",
    "state": "CA",
    "lat": 37.79994,
    "lng": -122.27506
  },
  {
    "name": "Coachella Smoke Co. & Lounge",
    "address": "85995 Grapefruit Blvd Unit 1 Coachella CA 92236",
    "state": "CA",
    "lat": 33.6795,
    "lng": -116.17628
  },
  {
    "name": "Cookies Fresno",
    "address": "5048 North Blackstone Avenue, Fresno, CA, US, 93710",
    "state": "CA",
    "lat": 36.80911,
    "lng": -119.78943
  },
  {
    "name": "Cookies Hayward",
    "address": "1004 B St Hayward CA 94541",
    "state": "CA",
    "lat": 37.67304,
    "lng": -122.08257
  },
  {
    "name": "Cookies La Mesa",
    "address": "7935 El Cajon Blvd La Mesa CA 91942",
    "state": "CA",
    "lat": 32.76915,
    "lng": -117.02607
  },
  {
    "name": "Cookies Modesto",
    "address": "1944 Orangebug Ave W Modesto CA 95350",
    "state": "CA",
    "lat": 37.6391,
    "lng": -120.9969
  },
  {
    "name": "Cookies Napa",
    "address": "2481 2nd St Napa CA 94559",
    "state": "CA",
    "lat": 38.29786,
    "lng": -122.30121
  },
  {
    "name": "Cookies San Bernardino",
    "address": "494 West Orange Show Road RD Suite D San Bernardino CA 92408",
    "state": "CA",
    "lat": 34.1083,
    "lng": -117.2898
  },
  {
    "name": "Cookies Woodland Hills",
    "address": "5338 Alhama Drive Woodland Hills CA 91364",
    "state": "CA",
    "lat": 34.16617,
    "lng": -118.59301
  },
  {
    "name": "Crystal Nugs",
    "address": "2300 J Street Sacramento CA 95816",
    "state": "CA",
    "lat": 38.57551,
    "lng": -121.47578
  },
  {
    "name": "Curbside PCH",
    "address": "560 Pacific Coast Highway W Wilmington CA 90744",
    "state": "CA",
    "lat": 33.79119,
    "lng": -118.24086
  },
  {
    "name": "Dankory",
    "address": "10855 Vanowen St North Hollywood CA 91605",
    "state": "CA",
    "lat": 34.19403,
    "lng": -118.36749
  },
  {
    "name": "Daytona Beach",
    "address": "1392 West International Speedway Blvd, Daytona Beach, FL, US, 32114",
    "state": "FL",
    "lat": 29.19361,
    "lng": -81.06545
  },
  {
    "name": "Deerfield Beach",
    "address": "1299 South Military Tr, Deerfield Beach, FL, US, 33442",
    "state": "FL",
    "lat": 26.31099,
    "lng": -80.12652
  },
  {
    "name": "Distro Depot",
    "address": "36650 Sunair Plz Cathedral City CA 92234",
    "state": "CA",
    "lat": 33.78269,
    "lng": -116.46798
  },
  {
    "name": "Distro Depot",
    "address": "1251 Montalvo Way Unit K Palm Springs CA 92262",
    "state": "CA",
    "lat": 33.83911,
    "lng": -116.50987
  },
  {
    "name": "Double Eye",
    "address": "28201 Date Palm Dr Cathedral City CA 92234",
    "state": "CA",
    "lat": 33.77789,
    "lng": -116.45794
  },
  {
    "name": "Downtown Los Angeles",
    "address": "1530 South Alameda St, St# 7, Los Angeles, CA, US, 90021",
    "state": "CA",
    "lat": 34.02238,
    "lng": -118.23928
  },
  {
    "name": "Dr. Greenthumb's Fresno",
    "address": "1264 Wishon Ave N Fresno CA 93728",
    "state": "CA",
    "lat": 36.75728,
    "lng": -119.80105
  },
  {
    "name": "Dr. Greenthumbs Orcutt",
    "address": "1604 E Clark Ave #101 Orcutt CA 93455",
    "state": "CA",
    "lat": 34.86518,
    "lng": -120.44722
  },
  {
    "name": "EMBR Lake Elsinore",
    "address": "31881 Corydon St Suite 150 Lake Elsinore CA 92595",
    "state": "CA",
    "lat": 33.68609,
    "lng": -117.33914
  },
  {
    "name": "Earths Natural Remedy",
    "address": "1750 Iris Ave Suite 114 Sacramento CA 95815",
    "state": "CA",
    "lat": 38.61826,
    "lng": -121.42611
  },
  {
    "name": "Elevate Granada Hills",
    "address": "10721 Lindley Ave Granada Hills CA 91344",
    "state": "CA",
    "lat": 34.26504,
    "lng": -118.52733
  },
  {
    "name": "Elevate Lompoc",
    "address": "118 South H St Lompoc CA 93436",
    "state": "CA",
    "lat": 34.63867,
    "lng": -120.45807
  },
  {
    "name": "Erba Venice",
    "address": "4200 Lincoln Blvd. Marina Del Rey CA 90292",
    "state": "CA",
    "lat": 33.98176,
    "lng": -118.44044
  },
  {
    "name": "Exotix SJ",
    "address": "1859 Little Orchard St San Jose CA 95125",
    "state": "CA",
    "lat": 37.30457,
    "lng": -121.87238
  },
  {
    "name": "Fifth and Green LLC",
    "address": "1607 5th Street Crescent City CA 95531",
    "state": "CA",
    "lat": 41.75677,
    "lng": -124.19286
  },
  {
    "name": "Fig & Thistle Apothecary",
    "address": "429 Gough St San Francisco CA 94102",
    "state": "CA",
    "lat": 37.77725,
    "lng": -122.42331
  },
  {
    "name": "Gainesville",
    "address": "1120 West University Ave, Gainesville, FL, US, 32601",
    "state": "FL",
    "lat": 29.65211,
    "lng": -82.33789
  },
  {
    "name": "Garden State Nectar Inc",
    "address": "1151 Pike Ln Suite 1 Oceano CA 93445",
    "state": "CA",
    "lat": 35.10602,
    "lng": -120.61795
  },
  {
    "name": "Grand-Era",
    "address": "5324 York Blvd Los Angeles CA 90042",
    "state": "CA",
    "lat": 34.1201,
    "lng": -118.20013
  },
  {
    "name": "Green Remedy Collective",
    "address": "2928 Hilltop Mall Rd Richmond CA 94806",
    "state": "CA",
    "lat": 37.97816,
    "lng": -122.33184
  },
  {
    "name": "Harvest of Chatsworth",
    "address": "9851 TOPANGA CANYON BLVD CHATSWORTH CA 91311",
    "state": "CA",
    "lat": 34.24936,
    "lng": -118.60622
  },
  {
    "name": "Hello Cannabis",
    "address": "1017 Sycamore Ave Vista CA 92081",
    "state": "CA",
    "lat": 33.15989,
    "lng": -117.22157
  },
  {
    "name": "High-Land Cannabis",
    "address": "1344 N Highland Ave Los Angeles CA 90028",
    "state": "CA",
    "lat": 34.09519,
    "lng": -118.33853
  },
  {
    "name": "Hightend",
    "address": "3395 Indian Canyon Dr N A Palm Springs CA 92262",
    "state": "CA",
    "lat": 33.92212,
    "lng": -116.54529
  },
  {
    "name": "Holistic Healing Collective",
    "address": "15501 San Pablo Ave Suite A Richmond CA 94806",
    "state": "CA",
    "lat": 37.99012,
    "lng": -122.33588
  },
  {
    "name": "Jacksonville",
    "address": "3655 University Boulevard W, Jacksonville, FL, US, 32217",
    "state": "FL",
    "lat": 30.26272,
    "lng": -81.62544
  },
  {
    "name": "Jet Room Inc",
    "address": "17499 Adelanto Rd Adelanto CA 92301",
    "state": "CA",
    "lat": 34.56149,
    "lng": -117.40062
  },
  {
    "name": "Jungle Boys Clothing",
    "address": "1530 South Alameda St, #5, Los Angeles, CA, US, 90021",
    "state": "CA",
    "lat": 34.0746,
    "lng": -118.05343
  },
  {
    "name": "KushPlug",
    "address": "385 20th St W San Pedro CA 90731",
    "state": "CA",
    "lat": 33.72597,
    "lng": -118.28552
  },
  {
    "name": "L.A DULCE",
    "address": "2210 S Pacific Ave San Pedro CA 90731",
    "state": "CA",
    "lat": 33.72405,
    "lng": -118.28788
  },
  {
    "name": "LAHC Distro",
    "address": "2011 Pasadena Ave Los Angeles CA 90031",
    "state": "CA",
    "lat": 34.07439,
    "lng": -118.22095
  },
  {
    "name": "Lemonnade Union City",
    "address": "30545 Union City Blvd Union City CA 94587",
    "state": "CA",
    "lat": 37.59927,
    "lng": -122.08154
  },
  {
    "name": "Lytt LLC",
    "address": "2110 Palmetto Ave Pacifica CA 94044",
    "state": "CA",
    "lat": 37.63295,
    "lng": -122.49247
  },
  {
    "name": "MGPI",
    "address": "599 Embarcadero, Suite T Oakland CA 94606",
    "state": "CA",
    "lat": 37.78985,
    "lng": -122.25977
  },
  {
    "name": "MMR Green Angel",
    "address": "14000 Ventura Blvd Sherman Oaks CA 91423",
    "state": "CA",
    "lat": 34.14894,
    "lng": -118.4373
  },
  {
    "name": "Miami",
    "address": "8994 SW 40th St, Miami, FL, US, 33165",
    "state": "FL",
    "lat": 25.73267,
    "lng": -80.34148
  },
  {
    "name": "Miami Beach",
    "address": "6958 Collins Ave, Miami Beach, FL, US, 33141",
    "state": "FL",
    "lat": 25.85542,
    "lng": -80.12076
  },
  {
    "name": "Mission Hills Patients Collective",
    "address": "6944 N Reseda Blvd Reseda CA 91335",
    "state": "CA",
    "lat": 34.20276,
    "lng": -118.53607
  },
  {
    "name": "Mx3",
    "address": "10844 Alameda St Lynwood CA 90262",
    "state": "CA",
    "lat": 33.9369,
    "lng": -118.22621
  },
  {
    "name": "Mystika",
    "address": "1763 Ethanac Rd Perris CA 92570",
    "state": "CA",
    "lat": 33.74289,
    "lng": -117.18542
  },
  {
    "name": "Natural Remedies Caregivers",
    "address": "927 1/2 North Western Ave Los Angeles CA 90029",
    "state": "CA",
    "lat": 34.0918,
    "lng": -118.30919
  },
  {
    "name": "New Amsterdam Naturals - AKA: Erba Culver City",
    "address": "9021 Exposition Blvd. Los Angeles CA 90034",
    "state": "CA",
    "lat": 34.02881,
    "lng": -118.39264
  },
  {
    "name": "North Miami Beach",
    "address": "3495 NE 163rd St, North Miami Beach, FL, US, 33160",
    "state": "FL",
    "lat": 25.92621,
    "lng": -80.1538
  },
  {
    "name": "Ocala",
    "address": "2301 North Pine Ave, Ocala, FL, US, 34475",
    "state": "FL",
    "lat": 29.16102,
    "lng": -82.17496
  },
  {
    "name": "Old G Kush",
    "address": "3707 W 3rd St Los Angeles California 90020",
    "state": "CA",
    "lat": 34.06911,
    "lng": -118.29686
  },
  {
    "name": "Orange County",
    "address": "2911 Tech Center Dr, Santa Ana, CA, US, 92705",
    "state": "CA",
    "lat": 33.70565,
    "lng": -117.8556
  },
  {
    "name": "Orlando",
    "address": "11401 University Blvd, Orlando, FL, US, 32817",
    "state": "FL",
    "lat": 28.54282,
    "lng": -81.37892
  },
  {
    "name": "Pal's Association",
    "address": "1367 Rocking W Dr Bishop CA 93514",
    "state": "CA",
    "lat": 37.37729,
    "lng": -118.4226
  },
  {
    "name": "Palm Harbor",
    "address": "31650 US Hwy 19 N, Palm Harbor, FL, US, 34684",
    "state": "FL",
    "lat": 28.07807,
    "lng": -82.76371
  },
  {
    "name": "Phenotopia",
    "address": "443 Dutton Ave Ste 11 Santa Rosa CA 95407",
    "state": "CA",
    "lat": 38.43144,
    "lng": -122.72646
  },
  {
    "name": "Pipe Dreamz",
    "address": "31881 Corydon St Suite 160 Lake Elsinore CA 92530",
    "state": "CA",
    "lat": 33.91447,
    "lng": -117.58844
  },
  {
    "name": "Pirate Town Cannabis",
    "address": "134 N GAFFEY ST San Pedro CA 90731",
    "state": "CA",
    "lat": 33.7439,
    "lng": -118.29193
  },
  {
    "name": "Platinum Connection",
    "address": "685 Noble Ave Farmersville CA 93223",
    "state": "CA",
    "lat": 36.3263,
    "lng": -119.21152
  },
  {
    "name": "Pomona",
    "address": "196 University Pkwy, Pomona, CA, US, 91768",
    "state": "CA",
    "lat": 34.0497,
    "lng": -117.81042
  },
  {
    "name": "Pure Aloha",
    "address": "1377 Highway 4 Douglas Flat CA 95251",
    "state": "CA",
    "lat": 38.11437,
    "lng": -120.45492
  },
  {
    "name": "Purple Lotus Patient Center Downtown",
    "address": "66 West Santa Clara St San Jose CA 95113",
    "state": "CA",
    "lat": 37.33557,
    "lng": -121.89135
  },
  {
    "name": "Remedy Room",
    "address": "8642 Limonite Ave Jurupa Valley CA 92509",
    "state": "CA",
    "lat": 33.97533,
    "lng": -117.47285
  },
  {
    "name": "Revolution Emporium",
    "address": "3081 North State Street Ukiah CA 95482",
    "state": "CA",
    "lat": 39.16379,
    "lng": -123.21018
  },
  {
    "name": "Rootd in the 510",
    "address": "4432 Telegraph Ave Oakland CA 94609",
    "state": "CA",
    "lat": 37.83256,
    "lng": -122.26374
  },
  {
    "name": "Rosebud Delivery",
    "address": "300 Pendleton Way Suite 310 Oakland CA 94621",
    "state": "CA",
    "lat": 37.73519,
    "lng": -122.20064
  },
  {
    "name": "Royal Apothecary LLC",
    "address": "19821 Neuralia Rd California City CA 93505",
    "state": "CA",
    "lat": 35.1014,
    "lng": -117.98545
  },
  {
    "name": "San Diego",
    "address": "8160 Parkway Dr, La Mesa, CA, US, 91942",
    "state": "CA",
    "lat": 32.77641,
    "lng": -117.0218
  },
  {
    "name": "Semilla HRC Dispensary",
    "address": "7648 N Clybourn Ave Unit A Los Angeles CA 91352",
    "state": "CA",
    "lat": 34.2205,
    "lng": -118.3712
  },
  {
    "name": "Sensi Retail",
    "address": "3681 Crenshaw Blvd Los Angeles CA 90016",
    "state": "CA",
    "lat": 34.02047,
    "lng": -118.3352
  },
  {
    "name": "SkunkMasters",
    "address": "233 E Channel Island Blvd Port Hueneme CA 93041",
    "state": "CA",
    "lat": 34.1478,
    "lng": -119.1951
  },
  {
    "name": "Smart Collective",
    "address": "10745 Riverside Dr North Hollywood CA 91602",
    "state": "CA",
    "lat": 34.15223,
    "lng": -118.36426
  },
  {
    "name": "St. Petersburg",
    "address": "4500 4th St N, St. Petersburg, FL, US, 33703",
    "state": "FL",
    "lat": 27.81316,
    "lng": -82.63869
  },
  {
    "name": "Sunset Herbal Corner",
    "address": "11503 Burbank Blvd North Hollywood CA 91601",
    "state": "CA",
    "lat": 34.17224,
    "lng": -118.38244
  },
  {
    "name": "Swish Cannabis",
    "address": "10701 Burbank Blvd W North Hollywood CA 91601",
    "state": "CA",
    "lat": 34.17217,
    "lng": -118.38091
  },
  {
    "name": "Tallahassee",
    "address": "1719 West Tennessee St, Tallahassee, FL, US, 32304",
    "state": "FL",
    "lat": 30.44897,
    "lng": -84.31028
  },
  {
    "name": "Tampa",
    "address": "602 North Dale Mabry Hwy, Tampa, FL, US, 33609",
    "state": "FL",
    "lat": 27.94947,
    "lng": -82.50575
  },
  {
    "name": "The Burke Group",
    "address": "1500 Burke Ave Ste A San Francisco CA 94124",
    "state": "CA",
    "lat": 37.7439,
    "lng": -122.3849
  },
  {
    "name": "The Coachella Releaf",
    "address": "86705 Avenue 54 Unit H Coachella CA 92236",
    "state": "CA",
    "lat": 33.6803,
    "lng": -116.1739
  },
  {
    "name": "The Coughy Shop",
    "address": "64949 Mission Lakes Blvd Ste 114 Desert Hot Springs CA 92240",
    "state": "CA",
    "lat": 33.96112,
    "lng": -116.50168
  },
  {
    "name": "The Coughy Shop II",
    "address": "17003 Palm Dr. Desert Hot Springs CA 92240",
    "state": "CA",
    "lat": 33.9677,
    "lng": -116.5013
  },
  {
    "name": "The Gas Station",
    "address": "1005 E Broadway St Needles CA 92363",
    "state": "CA",
    "lat": 34.8481,
    "lng": -114.6141
  },
  {
    "name": "The Green Ant - SouthBay CannaClinic",
    "address": "1719 Pacific Coast Hwy Lomita CA 90717",
    "state": "CA",
    "lat": 33.78954,
    "lng": -118.32442
  },
  {
    "name": "The Green Chamber",
    "address": "7224 Mission Blvd Jurupa Valley CA 92509",
    "state": "CA",
    "lat": 34.01193,
    "lng": -117.44142
  },
  {
    "name": "The Woods",
    "address": "8271 Santa Monica Blvd Los Angeles CA 90046",
    "state": "CA",
    "lat": 34.09091,
    "lng": -118.36961
  },
  {
    "name": "These Days",
    "address": "19707 Nordhoff St Northridge CA 91324",
    "state": "CA",
    "lat": 34.2355,
    "lng": -118.55114
  },
  {
    "name": "Torrey Holistics Inc",
    "address": "10671 Roselle St Suite 102 San Diego CA 92121",
    "state": "CA",
    "lat": 32.89809,
    "lng": -117.22199
  },
  {
    "name": "True Deliveries",
    "address": "4901 East 12th St Unit 109 Oakland CA 94601",
    "state": "CA",
    "lat": 37.76748,
    "lng": -122.21134
  },
  {
    "name": "Tuan",
    "address": "4233 Crenshaw Blvd Unit A Los Angeles CA 90008",
    "state": "CA",
    "lat": 34.00723,
    "lng": -118.33528
  },
  {
    "name": "Vallejo Relief Center Distro",
    "address": "315 Henry St Vallejo CA 94591",
    "state": "CA",
    "lat": 38.11185,
    "lng": -122.22884
  },
  {
    "name": "Weeed Sylmar",
    "address": "13187 San Fernando Rd Sylmar CA 91342",
    "state": "CA",
    "lat": 34.30988,
    "lng": -118.47295
  },
  {
    "name": "West Coast Finest LA",
    "address": "4568 S Centinela Ave Los Angeles CA 90066",
    "state": "CA",
    "lat": 33.99167,
    "lng": -118.42162
  },
  {
    "name": "West Palm Beach",
    "address": "4561 Okeechobee Blvd, West Palm Beach, FL, US, 33417",
    "state": "FL",
    "lat": 26.70577,
    "lng": -80.05946
  }
]
