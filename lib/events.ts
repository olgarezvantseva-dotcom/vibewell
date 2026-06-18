import type { WellnessEvent } from './types';

/**
 * Tallinn city centre (Vabaduse väljak / Freedom Square) used as the base
 * reference point. Each event is placed at its real Tallinn venue using an
 * approximate offset in km from this point. The recommendation engine
 * computes real distance from the user's GPS location to each venue.
 *
 * Events are curated from real upcoming Tallinn listings (AllEvents.in,
 * organiser pages). Titles, venues, descriptions and registration URLs are
 * real; start times are expressed relative to "now" so the demo always shows
 * upcoming events, and coordinates are approximate venue locations.
 */
const BASE_LAT = 59.4329;
const BASE_LNG = 24.7423;

/** Roughly 1km in degrees at Tallinn's latitude. */
const KM_LAT = 1 / 111;
const KM_LNG = 1 / 56.6;

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

/** Place a venue at an approximate offset (in km) from the city centre. */
function at(latKm: number, lngKm: number) {
  return { lat: BASE_LAT + latKm * KM_LAT, lng: BASE_LNG + lngKm * KM_LNG };
}

export const EVENTS: WellnessEvent[] = [
  {
    id: 'e1',
    title: 'Jooga Stroomi rannapargis',
    category: 'movement',
    intensity: 'restorative',
    tags: ['yoga', 'mindfulness', 'breathwork', 'nature'],
    helpsWith: ['high-stress', 'poor-sleep', 'low-energy'],
    description:
      'Free outdoor yoga in Stroomi beach park. A grounding, all-levels session by the sea to release tension and reset an overstimulated nervous system.',
    venue: 'Stroomi rannapark',
    ...at(3.6, -3.1),
    startsAt: hoursFromNow(20),
    durationMin: 60,
    price: 0,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: true,
    imageColor: '#e8b9cf',
    registrationUrl: 'https://allevents.in/tallinn/jooga-stroomi-rannapargis/200030232819544',
  },
  {
    id: 'e2',
    title: 'Sunset Run 2026',
    category: 'outdoor',
    intensity: 'energizing',
    tags: ['running', 'fitness', 'nature', 'social'],
    helpsWith: ['low-mood', 'social-need'],
    description:
      'A friendly community sunset run along Stroomi beach. All paces welcome — a feel-good evening mood boost with great views over the bay.',
    venue: 'Stroomi rand',
    ...at(3.9, -3.4),
    startsAt: hoursFromNow(28),
    durationMin: 75,
    price: 0,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: true,
    imageColor: '#d9c2e6',
    registrationUrl: 'https://allevents.in/tallinn/sunset-run-2026/200030148965610',
  },
  {
    id: 'e3',
    title: 'Närvisüsteemi konverents Liquid Blomiga',
    category: 'mind',
    intensity: 'restorative',
    tags: ['breathwork', 'meditation', 'mindfulness', 'therapy'],
    helpsWith: ['high-stress', 'poor-sleep'],
    description:
      'A nervous-system conference with breathwork and regulation practices to calm the body and settle a busy mind. Held at Viimsi Artium.',
    venue: 'Viimsi Artium',
    ...at(6.4, 6.8),
    startsAt: hoursFromNow(30),
    durationMin: 120,
    price: 25,
    groupSize: 'large',
    familyFriendly: false,
    outdoor: false,
    imageColor: '#c2cdec',
    registrationUrl:
      'https://allevents.in/tallinn/n%C3%A4rvis%C3%BCsteemi-konverents-liquid-blomiga/200030139506649',
  },
  {
    id: 'e4',
    title: 'Kristiine ringtreeningud — esimene trenn',
    category: 'movement',
    intensity: 'energizing',
    tags: ['fitness', 'social'],
    helpsWith: ['low-mood', 'social-need'],
    description:
      'Free circuit training at Lilleküla Gümnaasium. High-energy intervals and strength stations to get the blood pumping and endorphins flowing.',
    venue: 'Tallinna Lilleküla Gümnaasium',
    ...at(-1.4, -2.6),
    startsAt: hoursFromNow(10),
    durationMin: 60,
    price: 0,
    groupSize: 'large',
    familyFriendly: false,
    outdoor: false,
    imageColor: '#f0c4a8',
    registrationUrl:
      'https://allevents.in/tallinn/kristiine-ringtreeningud-%7C-esimene-trenn/200030230384632',
  },
  {
    id: 'e5',
    title: 'Candlelight: Hans Zimmeri parimad teosed',
    category: 'creative',
    intensity: 'restorative',
    tags: ['music', 'mindfulness'],
    helpsWith: ['high-stress', 'low-mood'],
    description:
      'A candlelit concert of Hans Zimmer’s finest film scores at Tallinn Creative Hub. Sit back, let the strings wash over you and let the week melt away.',
    venue: 'Tallinn Creative Hub (Kultuurikatel)',
    ...at(1.4, 1.0),
    startsAt: hoursFromNow(48),
    durationMin: 75,
    price: 25,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: false,
    imageColor: '#e3b6dc',
    registrationUrl:
      'https://allevents.in/tallinn/candlelight-hans-zimmeri-parimad-teosed/2700030035493907',
  },
  {
    id: 'e6',
    title: 'Tales of the Coastal Folk — Mega Estonia',
    category: 'family',
    intensity: 'moderate',
    tags: ['nature', 'social'],
    helpsWith: ['low-mood', 'social-need', 'low-energy'],
    description:
      'A family-friendly open-air day of coastal culture and storytelling at the Viimsi Open Air Museum. Easygoing fun and fresh sea air for all ages.',
    venue: 'Viimsi Vabaõhumuuseum',
    ...at(7.2, 7.5),
    startsAt: hoursFromNow(36),
    durationMin: 180,
    price: 8,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: true,
    imageColor: '#c9dcc6',
    registrationUrl:
      'https://allevents.in/tallinn/tales-of-the-coastal-folk-mega-estonia-2026/200030098432334',
  },
  {
    id: 'e7',
    title: 'Yin & taastava jooga koolitus',
    category: 'movement',
    intensity: 'restorative',
    tags: ['yoga', 'breathwork', 'mindfulness'],
    helpsWith: ['high-stress', 'poor-sleep'],
    description:
      'A Yin & restorative yoga session in Kalamaja — long-held, gentle floor poses and deep relaxation to wind down and prepare body and mind for sleep.',
    venue: 'Vana-Kalamaja 41 Studio',
    ...at(1.9, -1.4),
    startsAt: hoursFromNow(12),
    durationMin: 90,
    price: 18,
    groupSize: 'small',
    familyFriendly: false,
    outdoor: false,
    imageColor: '#e8c4d0',
    registrationUrl:
      'https://allevents.in/tallinn/yin-and-taastava-jooga-%C3%95petajate-koolitus-yin-and-restorative-yoga-teacher-training/200030014981330',
  },
  {
    id: 'e8',
    title: 'Tallinn Food Truck Festival',
    category: 'creative',
    intensity: 'moderate',
    tags: ['cooking', 'nutrition', 'social', 'music'],
    helpsWith: ['low-mood', 'social-need'],
    description:
      'A lively festival of food trucks at Telliskivi Creative City — taste seasonal dishes, share a meal with friends and soak up the buzzy outdoor atmosphere.',
    venue: 'Telliskivi Creative City',
    ...at(2.2, -2.0),
    startsAt: hoursFromNow(54),
    durationMin: 240,
    price: 0,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: true,
    imageColor: '#f2cf9e',
    registrationUrl:
      'https://allevents.in/tallinn/tallinn-food-truck-festival-2026/200029585854105',
  },
  {
    id: 'e9',
    title: 'Mõttetuba Vabamus',
    category: 'mind',
    intensity: 'restorative',
    tags: ['reading', 'mindfulness', 'social'],
    helpsWith: ['high-stress', 'social-need'],
    description:
      'A thoughtful discussion circle at the Vabamu museum. A calm, reflective space to slow down, listen and think together in good company.',
    venue: 'Vabamu',
    ...at(0.4, 1.6),
    startsAt: hoursFromNow(26),
    durationMin: 90,
    price: 0,
    groupSize: 'small',
    familyFriendly: false,
    outdoor: false,
    imageColor: '#cdd2ee',
    registrationUrl:
      'https://allevents.in/tallinn/m%C3%B5ttetuba-vabamus-kas-populismi-laine-muudab-demokraatia-tulevikku/200030134643235',
  },
  {
    id: 'e10',
    title: 'Musicality Weekender — Bachata Workshops & Party',
    category: 'social',
    intensity: 'energizing',
    tags: ['dance', 'music', 'social'],
    helpsWith: ['low-mood', 'social-need', 'low-energy'],
    description:
      'Bachata dance workshops followed by a social party in Kopli. No partner needed — just come to move, connect and shake off the week.',
    venue: 'Kopli 25 Dance Studio',
    ...at(3.0, -3.8),
    startsAt: hoursFromNow(42),
    durationMin: 150,
    price: 15,
    groupSize: 'large',
    familyFriendly: false,
    outdoor: false,
    imageColor: '#eab4cd',
    registrationUrl:
      'https://allevents.in/tallinn/musicality-weekender-bachata-workshops-party/200030034302595',
  },
  {
    id: 'e11',
    title: 'Sunday Service Club: Pilates + Breakfast',
    category: 'movement',
    intensity: 'moderate',
    tags: ['fitness', 'nutrition', 'social', 'mindfulness'],
    helpsWith: ['low-energy', 'social-need', 'low-mood'],
    description:
      'A gentle morning Pilates flow in the gardens of Kadriorg Palace, followed by a shared power breakfast. A nourishing, social way to start the day.',
    venue: 'Kadriorg Palace',
    ...at(1.2, 4.2),
    startsAt: hoursFromNow(60),
    durationMin: 90,
    price: 20,
    groupSize: 'small',
    familyFriendly: false,
    outdoor: true,
    imageColor: '#d2bfe8',
    registrationUrl:
      'https://allevents.in/tallinn/sunday-service-club-power-breakfast-pilates-breakfast-at-kadriorg-palace/200030205281841',
  },
  {
    id: 'e12',
    title: 'Eesti Tervisemess — Liikuma!',
    category: 'family',
    intensity: 'moderate',
    tags: ['fitness', 'nutrition', 'social', 'nature'],
    helpsWith: ['low-energy', 'social-need'],
    description:
      'Estonia’s health and wellbeing fair at Kalev Central Stadium. Movement sessions, healthy living stands and family activities — something for every age.',
    venue: 'Kalevi Keskstaadion',
    ...at(0.9, 2.4),
    startsAt: hoursFromNow(34),
    durationMin: 180,
    price: 0,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: true,
    imageColor: '#bfe0d6',
    registrationUrl:
      'https://allevents.in/tallinn/eesti-tervisemess-liikuma-kalev-125-vii-eestimaa-v%C3%B5imlemispidu-maaelu-v%C3%B5lu/200029698419637',
  },
  {
    id: 'e13',
    title: 'Põhja-Tallinna jaanipäev',
    category: 'outdoor',
    intensity: 'moderate',
    tags: ['nature', 'music', 'social'],
    helpsWith: ['low-mood', 'high-stress', 'social-need'],
    description:
      'A midsummer celebration on Stroomi beach with live music, bonfire and community spirit. Fresh sea air, good people and a warm summer-night mood.',
    venue: 'Stroomi rand',
    ...at(3.8, -3.2),
    startsAt: hoursFromNow(72),
    durationMin: 240,
    price: 0,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: true,
    imageColor: '#cfe0c4',
    registrationUrl:
      'https://allevents.in/tallinn/p%C3%B5hja-tallinna-jaanip%C3%A4ev/200029973566520',
  },
  {
    id: 'e14',
    title: 'Candlelight: Ed Sheeran & Coldplay',
    category: 'creative',
    intensity: 'restorative',
    tags: ['music', 'mindfulness'],
    helpsWith: ['poor-sleep', 'high-stress', 'low-mood'],
    description:
      'A candlelit string-quartet concert of Ed Sheeran and Coldplay favourites at Tallinn Creative Hub. A soothing, atmospheric evening to deeply unwind.',
    venue: 'Tallinn Creative Hub (Kultuurikatel)',
    ...at(1.4, 1.0),
    startsAt: hoursFromNow(16),
    durationMin: 75,
    price: 25,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: false,
    imageColor: '#c6cdec',
    registrationUrl:
      'https://allevents.in/tallinn/candlelight-ed-sheeran-and-coldplay/2700029815334831',
  },
  {
    id: 'e15',
    title: 'Kesklinna suvekontsert — Koit Toome & Bänd',
    category: 'social',
    intensity: 'moderate',
    tags: ['music', 'social', 'nature'],
    helpsWith: ['low-mood', 'social-need'],
    description:
      'A free open-air summer concert in Falgi Park with Koit Toome & band. Bring a blanket, enjoy live music in the green heart of the city and lift your mood.',
    venue: 'Falgi Park',
    ...at(0.7, 0.2),
    startsAt: hoursFromNow(8),
    durationMin: 120,
    price: 0,
    groupSize: 'large',
    familyFriendly: true,
    outdoor: true,
    imageColor: '#d6cfee',
    registrationUrl:
      'https://allevents.in/tallinn/kesklinna-suvekontsert-koit-toome-and-b%C3%A4nd/200030097006650',
  },
];
