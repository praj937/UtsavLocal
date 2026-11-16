const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');

const seedDatabase = async (isStandalone = true) => {
  try {
    if (isStandalone) {
      console.log('🌱 Connecting to database for seeding...');
      await connectDB();
    }

    console.log('🧹 Clearing existing Users and Events collections...');
    await User.deleteMany({});
    await Event.deleteMany({});

    console.log('👥 Creating demo user accounts...');
    // Create demo users
    const adminUser = await User.create({
      name: 'Pooja Hegde (Community Admin)',
      email: 'admin@utsavlocal.in',
      password: 'Admin@123',
      role: 'admin',
    });

    const organizerUser = await User.create({
      name: 'Ramesh Gowda (Namma Bengaluru Cultural Trust)',
      email: 'organizer@utsavlocal.in',
      password: 'Org@123',
      role: 'organizer',
    });

    const citizenUser = await User.create({
      name: 'Ananya Rao (Local Citizen)',
      email: 'user@utsavlocal.in',
      password: 'User@123',
      role: 'user',
    });

    console.log('📍 Generating 10 authentic Bengaluru neighborhood events & festivals...');

    // Dynamic dates relative to today for realistic upcoming/weekend testing
    const today = new Date();

    const getFutureDate = (daysAhead) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysAhead);
      return d;
    };

    // Calculate nearest upcoming weekend Saturday & Sunday
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
    const weekendSat = new Date(today);
    weekendSat.setDate(today.getDate() + daysUntilSaturday);
    const weekendSun = new Date(weekendSat);
    weekendSun.setDate(weekendSat.getDate() + 1);

    const eventsList = [
      {
        title: 'Kadalekayi Parishe Heritage Walk & Groundnut Fair',
        description:
          'Experience the 500-year-old historic groundnut fair at Bull Temple. Walk through centuries-old banyan lanes, taste roasted and spiced groundnuts from local farmers of Karnataka & Tamil Nadu, and witness traditional folk music performances like Dollu Kunitha.',
        category: 'Cultural Festival',
        date: weekendSat,
        startTime: '07:30 AM',
        endTime: '11:30 AM',
        venueName: 'Dodda Ganesha & Bull Temple Road',
        address: 'Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560004',
        neighborhood: 'Basavanagudi',
        isFree: true,
        ticketPrice: 0,
        organizerId: organizerUser._id,
        status: 'approved',
        attendeesCount: 142,
        bannerImage:
          'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Malleshwaram Classical Veena Evening & Carnatic Recital',
        description:
          'An intimate open-air twilight Carnatic classical concert featuring veteran Veena exponents accompanied by Mridangam and Ghatam. Enjoy the timeless acoustics of the traditional Malleshwaram temple courtyard as fragrance of jasmine and filter coffee fills the evening air.',
        category: 'Music & Arts',
        date: getFutureDate(3),
        startTime: '05:30 PM',
        endTime: '08:30 PM',
        venueName: 'Seetha Rama Bhavana & Heritage Courtyard',
        address: '8th Cross, Margosa Road, Malleshwaram, Bengaluru 560003',
        neighborhood: 'Malleshwaram',
        isFree: true,
        ticketPrice: 0,
        organizerId: organizerUser._id,
        status: 'approved',
        attendeesCount: 88,
        bannerImage:
          'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Indiranagar Zero-Waste Pottery & Terracotta Workshop',
        description:
          'Learn traditional hand-building terracotta pottery techniques from artisan potters of Pottery Town. Create your own diyas, kulhads, and eco-friendly plant pots while discovering sustainable clay sourcing and natural glazing methods.',
        category: 'Workshop',
        date: weekendSun,
        startTime: '10:30 AM',
        endTime: '01:30 PM',
        venueName: 'Courtyard Kula Creative Center',
        address: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
        neighborhood: 'Indiranagar',
        isFree: false,
        ticketPrice: 450,
        organizerId: organizerUser._id,
        status: 'approved',
        attendeesCount: 35,
        bannerImage:
          'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Cubbon Park Sunday Book Swap & Community Art Bazaar',
        description:
          'Bring your pre-loved books and exchange them under the majestic bamboo groves of Cubbon Park. Features live watercolor sketching sessions, indie zine pop-ups, children storytelling circles, and handmade craft stalls by local Bengaluru artists.',
        category: 'Food & Bazaar',
        date: weekendSun,
        startTime: '08:00 AM',
        endTime: '01:00 PM',
        venueName: 'Bandstand Lawn, Cubbon Park',
        address: 'Kasturba Road, Sampangi Rama Nagar, Bengaluru 560001',
        neighborhood: 'Sampangi Rama Nagar',
        isFree: true,
        ticketPrice: 0,
        organizerId: adminUser._id,
        status: 'approved',
        attendeesCount: 110,
        bannerImage:
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Sankey Tank Community Lake Cleanup & Birdwatching Walk',
        description:
          'Join neighborhood volunteers and urban ecologists for a morning lake restoration and shoreline de-weeding initiative. Followed by a guided wetland bird census spotting Spot-billed Pelicans, Little Grebes, and Purple Herons.',
        category: 'Community Drive',
        date: getFutureDate(5),
        startTime: '06:30 AM',
        endTime: '09:30 AM',
        venueName: 'Sankey Tank Forest Gate',
        address: '11th Cross, Sadashivanagar / Malleshwaram, Bengaluru 560080',
        neighborhood: 'Sadashivanagar',
        isFree: true,
        ticketPrice: 0,
        organizerId: organizerUser._id,
        status: 'approved',
        attendeesCount: 64,
        bannerImage:
          'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Jayanagar Street Food Carnival & Traditional Filter Coffee Fest',
        description:
          'Celebrate the beloved culinary heritage of South Bengaluru! Savor authentic Davangere benne dosas, crispy paddu, piping hot mangalore bajjis, holige, and freshly brewed Mysore filter coffee served in traditional brass dabara-tumblers.',
        category: 'Food & Bazaar',
        date: getFutureDate(6),
        startTime: '04:00 PM',
        endTime: '10:00 PM',
        venueName: 'Jayanagar 4th Block Complex Promenade',
        address: '9th Main Road, 4th Block, Jayanagar, Bengaluru 560011',
        neighborhood: 'Jayanagar',
        isFree: true,
        ticketPrice: 0,
        organizerId: organizerUser._id,
        status: 'approved',
        attendeesCount: 220,
        bannerImage:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Koramangala Acoustic Indie Sundowner & Open Mic Night',
        description:
          'An intimate rooftop gathering for homegrown singer-songwriters, poets, and acoustic instrumentalists. Featuring performances in Kannada, Hindi, and English with community drum circles and artisan chai corners.',
        category: 'Music & Arts',
        date: getFutureDate(7),
        startTime: '06:00 PM',
        endTime: '09:30 PM',
        venueName: 'The Terra Rooftop Community Amphitheatre',
        address: '80 Feet Road, 6th Block, Koramangala, Bengaluru 560095',
        neighborhood: 'Koramangala',
        isFree: false,
        ticketPrice: 200,
        organizerId: organizerUser._id,
        status: 'approved',
        attendeesCount: 75,
        bannerImage:
          'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Hebbal Sunrise 5K Heritage Run & Community Yoga Session',
        description:
          'Kickstart your fitness weekend with a scenic 5K community run along the scenic Hebbal lake promenade, followed by 45 minutes of Pranayama and Hatha Yoga led by certified yogis under the morning sun.',
        category: 'Sports',
        date: weekendSat,
        startTime: '06:00 AM',
        endTime: '08:30 AM',
        venueName: 'Hebbal Lake Park Pavilion',
        address: 'Bellary Road, Hebbal Flyover Junction, Bengaluru 560024',
        neighborhood: 'Hebbal',
        isFree: true,
        ticketPrice: 0,
        organizerId: organizerUser._id,
        status: 'approved',
        attendeesCount: 92,
        bannerImage:
          'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
      },
      // Pending submissions for Admin Moderation Panel demo
      {
        title: 'Bengaluru Karaga Shaktyotsava Midnight Photography Walk',
        description:
          'Documentary photo-walk exploring the historic Pete (old city) alleys during the Karaga preparations. Observe the vibrant floral decoration rituals, sword-bearing Veerakumaras, and historic dargah-temple interfaith traditions.',
        category: 'Cultural Festival',
        date: getFutureDate(8),
        startTime: '10:00 PM',
        endTime: '02:00 AM',
        venueName: 'Dharmaraya Swamy Temple Square',
        address: 'OTC Road, Tigalarpet, Nagarathpet, Bengaluru 560002',
        neighborhood: 'Tigalarpet',
        isFree: true,
        ticketPrice: 0,
        organizerId: organizerUser._id,
        status: 'pending',
        attendeesCount: 0,
        bannerImage:
          'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
      },
      {
        title: 'Basavanagudi Native Tree Planting & Seedball Workshop',
        description:
          'Help restore Bengaluru’s garden city canopy! We will make 1,000 seedballs using indigenous species (Neem, Honge, Tamarind) and plant 50 native shade saplings along neighborhood public avenues and school grounds.',
        category: 'Community Drive',
        date: getFutureDate(9),
        startTime: '08:00 AM',
        endTime: '11:00 AM',
        venueName: 'Bugle Rock Eco Park',
        address: 'Bull Temple Road, Basavanagudi, Bengaluru 560019',
        neighborhood: 'Basavanagudi',
        isFree: true,
        ticketPrice: 0,
        organizerId: organizerUser._id,
        status: 'pending',
        attendeesCount: 0,
        bannerImage:
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      },
    ];

    const insertedEvents = await Event.insertMany(eventsList);
    console.log(`✅ Successfully seeded ${insertedEvents.length} events (8 approved, 2 pending)!`);

    // Attach sample saved and RSVP'd events to the demo citizen user
    const firstEvent = insertedEvents[0];
    const secondEvent = insertedEvents[1];

    citizenUser.savedEvents.push(firstEvent._id, secondEvent._id);
    citizenUser.rsvpedEvents.push(firstEvent._id);
    await citizenUser.save();

    console.log('\n=============================================================');
    console.log('🎉 UTSAVLOCAL DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('📋 DEMO ACCOUNTS CREATED:');
    console.log('-------------------------------------------------------------');
    console.log('1. Community Admin:');
    console.log('   Email:    admin@utsavlocal.in');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin (full moderation rights)');
    console.log('-------------------------------------------------------------');
    console.log('2. Event Organizer:');
    console.log('   Email:    organizer@utsavlocal.in');
    console.log('   Password: Org@123');
    console.log('   Role:     organizer (submit, edit, manage own events)');
    console.log('-------------------------------------------------------------');
    console.log('3. Local Citizen User:');
    console.log('   Email:    user@utsavlocal.in');
    console.log('   Password: User@123');
    console.log('   Role:     user (RSVP, bookmark, discover local events)');
    console.log('=============================================================\n');

    if (isStandalone) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
    if (isStandalone) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
