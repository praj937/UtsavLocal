// Pre-seeded initial data for standalone online deployment (Vercel / Netlify)
export const getInitialEvents = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sun, 6 is Sat
  const daysUntilSat = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
  const sat = new Date(today);
  sat.setDate(today.getDate() + daysUntilSat);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);

  const future = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  return [
    {
      _id: '1',
      title: 'Kadalekayi Parishe Heritage Walk & Groundnut Fair',
      description:
        'Experience the 500-year-old historic groundnut fair at Bull Temple. Walk through centuries-old banyan lanes, taste roasted and spiced groundnuts from local farmers of Karnataka & Tamil Nadu, and witness traditional folk music performances like Dollu Kunitha.',
      category: 'Cultural Festival',
      date: sat.toISOString(),
      startTime: '07:30 AM',
      endTime: '11:30 AM',
      venueName: 'Dodda Ganesha & Bull Temple Road',
      address: 'Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560004',
      neighborhood: 'Basavanagudi',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 142,
      bannerImage:
        'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '2',
      title: 'Malleshwaram Classical Veena Evening & Carnatic Recital',
      description:
        'An intimate open-air twilight Carnatic classical concert featuring veteran Veena exponents accompanied by Mridangam and Ghatam. Enjoy the timeless acoustics of the traditional Malleshwaram temple courtyard as fragrance of jasmine and filter coffee fills the evening air.',
      category: 'Music & Arts',
      date: future(3),
      startTime: '05:30 PM',
      endTime: '08:30 PM',
      venueName: 'Seetha Rama Bhavana & Heritage Courtyard',
      address: '8th Cross, Margosa Road, Malleshwaram, Bengaluru 560003',
      neighborhood: 'Malleshwaram',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 88,
      bannerImage:
        'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '3',
      title: 'Indiranagar Zero-Waste Pottery & Terracotta Workshop',
      description:
        'Learn traditional hand-building terracotta pottery techniques from artisan potters of Pottery Town. Create your own diyas, kulhads, and eco-friendly plant pots while discovering sustainable clay sourcing and natural glazing methods.',
      category: 'Workshop',
      date: sun.toISOString(),
      startTime: '10:30 AM',
      endTime: '01:30 PM',
      venueName: 'Courtyard Kula Creative Center',
      address: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      neighborhood: 'Indiranagar',
      isFree: false,
      ticketPrice: 450,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 35,
      bannerImage:
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '4',
      title: 'Cubbon Park Sunday Book Swap & Community Art Bazaar',
      description:
        'Bring your pre-loved books and exchange them under the majestic bamboo groves of Cubbon Park. Features live watercolor sketching sessions, indie zine pop-ups, children storytelling circles, and handmade craft stalls by local Bengaluru artists.',
      category: 'Food & Bazaar',
      date: sun.toISOString(),
      startTime: '08:00 AM',
      endTime: '01:00 PM',
      venueName: 'Bandstand Lawn, Cubbon Park',
      address: 'Kasturba Road, Sampangi Rama Nagar, Bengaluru 560001',
      neighborhood: 'Sampangi Rama Nagar',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'admin1', name: 'Pooja Hegde (Community Admin)', email: 'admin@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 110,
      bannerImage:
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '5',
      title: 'Sankey Tank Community Lake Cleanup & Birdwatching Walk',
      description:
        'Join neighborhood volunteers and urban ecologists for a morning lake restoration and shoreline de-weeding initiative. Followed by a guided wetland bird census spotting Spot-billed Pelicans, Little Grebes, and Purple Herons.',
      category: 'Community Drive',
      date: future(5),
      startTime: '06:30 AM',
      endTime: '09:30 AM',
      venueName: 'Sankey Tank Forest Gate',
      address: '11th Cross, Sadashivanagar / Malleshwaram, Bengaluru 560080',
      neighborhood: 'Sadashivanagar',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 64,
      bannerImage:
        'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '6',
      title: 'Jayanagar Street Food Carnival & Traditional Filter Coffee Fest',
      description:
        'Celebrate the beloved culinary heritage of South Bengaluru! Savor authentic Davangere benne dosas, crispy paddu, piping hot mangalore bajjis, holige, and freshly brewed Mysore filter coffee served in traditional brass dabara-tumblers.',
      category: 'Food & Bazaar',
      date: future(6),
      startTime: '04:00 PM',
      endTime: '10:00 PM',
      venueName: 'Jayanagar 4th Block Complex Promenade',
      address: '9th Main Road, 4th Block, Jayanagar, Bengaluru 560011',
      neighborhood: 'Jayanagar',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 220,
      bannerImage:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '7',
      title: 'Koramangala Acoustic Indie Sundowner & Open Mic Night',
      description:
        'An intimate rooftop gathering for homegrown singer-songwriters, poets, and acoustic instrumentalists. Featuring performances in Kannada, Hindi, and English with community drum circles and artisan chai corners.',
      category: 'Music & Arts',
      date: future(7),
      startTime: '06:00 PM',
      endTime: '09:30 PM',
      venueName: 'The Terra Rooftop Community Amphitheatre',
      address: '80 Feet Road, 6th Block, Koramangala, Bengaluru 560095',
      neighborhood: 'Koramangala',
      isFree: false,
      ticketPrice: 200,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 75,
      bannerImage:
        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '8',
      title: 'Hebbal Sunrise 5K Heritage Run & Community Yoga Session',
      description:
        'Kickstart your fitness weekend with a scenic 5K community run along the scenic Hebbal lake promenade, followed by 45 minutes of Pranayama and Hatha Yoga led by certified yogis under the morning sun.',
      category: 'Sports',
      date: sat.toISOString(),
      startTime: '06:00 AM',
      endTime: '08:30 AM',
      venueName: 'Hebbal Lake Park Pavilion',
      address: 'Bellary Road, Hebbal Flyover Junction, Bengaluru 560024',
      neighborhood: 'Hebbal',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'approved',
      attendeesCount: 92,
      bannerImage:
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    },
    // 2 Pending submissions for Admin Moderation
    {
      _id: '9',
      title: 'Bengaluru Karaga Shaktyotsava Midnight Photography Walk',
      description:
        'Documentary photo-walk exploring the historic Pete (old city) alleys during the Karaga preparations. Observe the vibrant floral decoration rituals, sword-bearing Veerakumaras, and historic dargah-temple interfaith traditions.',
      category: 'Cultural Festival',
      date: future(8),
      startTime: '10:00 PM',
      endTime: '02:00 AM',
      venueName: 'Dharmaraya Swamy Temple Square',
      address: 'OTC Road, Tigalarpet, Nagarathpet, Bengaluru 560002',
      neighborhood: 'Tigalarpet',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'pending',
      attendeesCount: 0,
      bannerImage:
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    },
    {
      _id: '10',
      title: 'Basavanagudi Native Tree Planting & Seedball Workshop',
      description:
        'Help restore Bengaluru’s garden city canopy! We will make 1,000 seedballs using indigenous species (Neem, Honge, Tamarind) and plant 50 native shade saplings along neighborhood public avenues and school grounds.',
      category: 'Community Drive',
      date: future(9),
      startTime: '08:00 AM',
      endTime: '11:00 AM',
      venueName: 'Bugle Rock Eco Park',
      address: 'Bull Temple Road, Basavanagudi, Bengaluru 560019',
      neighborhood: 'Basavanagudi',
      isFree: true,
      ticketPrice: 0,
      organizerId: { _id: 'org1', name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)', email: 'organizer@utsavlocal.in' },
      status: 'pending',
      attendeesCount: 0,
      bannerImage:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    },
  ];
};

export const DEMO_USERS = [
  {
    _id: 'admin1',
    name: 'Pooja Hegde (Community Admin)',
    email: 'admin@utsavlocal.in',
    password: 'Admin@123',
    role: 'admin',
    savedEvents: [],
    rsvpedEvents: [],
  },
  {
    _id: 'org1',
    name: 'Ramesh Gowda (Namma Cultural Trust)',
    email: 'organizer@utsavlocal.in',
    password: 'Org@123',
    role: 'organizer',
    savedEvents: [],
    rsvpedEvents: [],
  },
  {
    _id: 'user1',
    name: 'Ananya Rao (Local Citizen)',
    email: 'user@utsavlocal.in',
    password: 'User@123',
    role: 'user',
    savedEvents: ['1', '2'],
    rsvpedEvents: ['1'],
  },
];
