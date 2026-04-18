/* Projects catalog — single source of truth for Gallery & Virtual Tours
   hasTour: true marks projects exposed on the Virtual Tours page (15 total).
   tour: Matterport/360° URL — "#" = coming soon. */
window.PROJECTS = [
  { slug: "Chipotle Mexican Grill 492 Edinburgh Rd. S. Guelph, ON", title: "Chipotle Mexican Grill", location: "Guelph, ON", category: "restaurant", brand: "Chipotle", images: 34, hasTour: true, tour: "#" },
  { slug: "Chipotle- Markville Mall 5000 Hwy#7, Markham, ON", title: "Chipotle Mexican Grill", location: "Markville Mall, Markham, ON", category: "restaurant", brand: "Chipotle", images: 37, hasTour: true, tour: "#" },
  { slug: "Firehouse Subs - 608 Santa Maria Blvd. Milton, ON", title: "Firehouse Subs", location: "Milton, ON", category: "restaurant", brand: "Firehouse Subs", images: 25, hasTour: true, tour: "#" },
  { slug: "Fresh Since 1999 Restaurant- Sherway Gardens Mall, Etobicoke, ON", title: "Fresh Restaurant", location: "Sherway Gardens, Etobicoke, ON", category: "restaurant", brand: "Fresh", images: 21, hasTour: true, tour: "#" },
  { slug: "Indochino-Retail Store in Square One Shopping Centre, Mississauga, ON", title: "Indochino Retail", location: "Square One, Mississauga, ON", category: "retail", brand: "Indochino", images: 16, hasTour: false, tour: "#" },
  { slug: "New Plaza Development - 171 George Reynolds Dr. Courtice, ON", title: "New Plaza Development", location: "Courtice, ON", category: "commercial", brand: "Platinum", images: 59, hasTour: true, tour: "#" },
  { slug: "Noodles & Company - Pickering, ON", title: "Noodles & Company", location: "Pickering, ON", category: "restaurant", brand: "Noodles & Company", images: 39, hasTour: true, tour: "#" },
  { slug: "Orangeville Nissan Automotive Dealership Facade Renovation- 633224 Hwy 10 Mono, ON", title: "Orangeville Nissan", location: "Mono, ON", category: "automotive", brand: "Nissan", images: 24, hasTour: true, tour: "#" },
  { slug: "STARBUCKS -1170 Fischer-Hallman Rd. Kitchener", title: "Starbucks", location: "Fischer-Hallman, Kitchener, ON", category: "coffee", brand: "Starbucks", images: 20, hasTour: true, tour: "#" },
  { slug: "Simply Smart Child Care & Montessori - Courtice, ON", title: "Simply Smart Child Care", location: "Courtice, ON", category: "education", brand: "Simply Smart", images: 40, hasTour: true, tour: "#" },
  { slug: "Sola Salon -1900 W 18th St. Houston, TX, USA", title: "Sola Salon Studios", location: "Calgary, AB", category: "salon", brand: "Sola Salon", images: 19, hasTour: true, tour: "https://my.matterport.com/show/?m=ZkpKZxawnHd" },
  { slug: "Starbucks - 1177 Ritson Rd. Oshawa, ON", title: "Starbucks", location: "Ritson Rd, Oshawa, ON", category: "coffee", brand: "Starbucks", images: 41, hasTour: true, tour: "#" },
  { slug: "Starbucks -4140 Garden St, Whitby, ON", title: "Starbucks", location: "Garden St, Whitby, ON", category: "coffee", brand: "Starbucks", images: 29, hasTour: true, tour: "#" },
  { slug: "Starbucks- 9281 County Road 93, Midland, ON", title: "Starbucks", location: "Midland, ON", category: "coffee", brand: "Starbucks", images: 25, hasTour: true, tour: "#" },
  { slug: "Starbucks-122 Martindale Cr. Ancaster, ON", title: "Starbucks", location: "Ancaster, ON", category: "coffee", brand: "Starbucks", images: 25, hasTour: true, tour: "#" },
  { slug: "Starbucks-265 Weber St. Waterloo, ON", title: "Starbucks", location: "Weber St, Waterloo, ON", category: "coffee", brand: "Starbucks", images: 30, hasTour: true, tour: "#" },
  { slug: "Starbucks-431 Stone Road, Guelph ON", title: "Starbucks", location: "Stone Rd, Guelph, ON", category: "coffee", brand: "Starbucks", images: 17, hasTour: false, tour: "#" },
  { slug: "Tim Horton's-ONroute Cambridge NORTH, ON", title: "Tim Hortons", location: "ONroute Cambridge North", category: "coffee", brand: "Tim Hortons", images: 19, hasTour: false, tour: "#" },
  { slug: "Tim Horton's-ONroute Cambridge SOUTH", title: "Tim Hortons", location: "ONroute Cambridge South", category: "coffee", brand: "Tim Hortons", images: 13, hasTour: false, tour: "#" },
  { slug: "Tim Hortons -152 West Dr Brampton", title: "Tim Hortons", location: "West Dr, Brampton, ON", category: "coffee", brand: "Tim Hortons", images: 23, hasTour: true, tour: "#" },
  { slug: "Wendy's - Airport Rd. Brampton", title: "Wendy's", location: "Airport Rd, Brampton, ON", category: "restaurant", brand: "Wendy's", images: 16, hasTour: false, tour: "#" }
];

/* Virtual Tours — official 15-client list (source: legacy site).
   cover: optional image path; if omitted, a branded placeholder tile is used.
   tour: Matterport URL — "#" = pending client. */
window.TOURS = [
  { brand: "Sola Salons", title: "Sola Salons", location: "Calgary, AB", category: "salon", cover: "projects/Sola Salon -1900 W 18th St. Houston, TX, USA/image_0.jpg", tour: "https://my.matterport.com/show/?m=ZkpKZxawnHd" },
  { brand: "Starbucks", title: "Starbucks", location: "Mississauga, ON", category: "coffee", tour: "#" },
  { brand: "Starbucks", title: "Starbucks", location: "Bramalea City Centre", category: "coffee", tour: "#" },
  { brand: "Firehouse Subs", title: "Firehouse Subs", location: "Hamilton, ON", category: "restaurant", cover: "projects/Firehouse Subs - 608 Santa Maria Blvd. Milton, ON/image_0.jpg", tour: "#" },
  { brand: "Sola Salons", title: "Sola Salons", location: "East York, ON", category: "salon", cover: "projects/Sola Salon -1900 W 18th St. Houston, TX, USA/image_1.jpg", tour: "#" },
  { brand: "Starbucks Reserve", title: "Starbucks Reserve", location: "Cadillac Fairview Don Mills", category: "coffee", tour: "#" },
  { brand: "Fionn MacCool's", title: "Fionn MacCool's Restaurant & Bar", location: "Bowmanville, ON", category: "restaurant", tour: "#" },
  { brand: "Starbucks", title: "Starbucks", location: "Erin Mills Town Centre", category: "coffee", tour: "#" },
  { brand: "Montana's BBQ & Bar", title: "Montana's BBQ & Bar", location: "Bowmanville, ON", category: "restaurant", tour: "#" },
  { brand: "Firehouse Subs", title: "Firehouse Subs", location: "Gwillimbury · Peterborough · Kitchener · London", category: "restaurant", tour: "#" },
  { brand: "KFC", title: "KFC", location: "Keswick, ON", category: "restaurant", tour: "#" },
  { brand: "The Bier Markt", title: "The Bier Markt", location: "Toronto, ON", category: "restaurant", tour: "#" },
  { brand: "Noodles & Company", title: "Noodles & Company", location: "Pickering · Toronto", category: "restaurant", cover: "projects/Noodles & Company - Pickering, ON/image_0.jpg", tour: "#" },
  { brand: "Panera Bread", title: "Panera Bread", location: "Aurora, ON", category: "restaurant", tour: "#" },
  { brand: "Planet Fitness", title: "Planet Fitness", location: "Scarborough, ON", category: "wellness", tour: "#" }
];

window.CATEGORY_LABELS = {
  all: "All",
  coffee: "Coffee",
  restaurant: "Restaurants",
  retail: "Retail",
  salon: "Salon",
  automotive: "Automotive",
  commercial: "Commercial",
  education: "Education",
  wellness: "Wellness"
};
