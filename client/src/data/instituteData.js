// Burhani Tutorials — Official Institute Data & Information Architecture

export const INSTITUTE_INFO = {
  name: 'Burhani Tutorials',
  tagline: 'Quality Education. Strong Foundations. Brighter Futures.',
  subtagline: 'Empowering students from Class 5th to 12th with dedicated teaching, academic guidance and a strong learning environment.',
  established: 1996,
  legacyYears: '30+',
  studentsEducated: '5000+',
  totalBranches: 3,
  phones: ['9827252114', '9301262721'],
  email: 'burhanitutorials1@gmail.com',
  whatsappBookingNumber: '8319651437',
  whatsappBookingDisplay: '+91 83196 51437',
  hours: 'Mon – Sat: 8:00 AM – 8:00 PM | Sun: 9:00 AM – 1:00 PM',
};

export const BRANCHES = [
  {
    id: 'noorani-nagar',
    name: 'Burhani Tutorials — Noorani Nagar',
    shortName: 'Noorani Nagar Branch',
    branchKey: 'Noorani Nagar',
    address: '46, 47 Noorani Nagar, Dhar Road, Indore',
    landmark: 'Dhar Road Main Access',
    phone: '9827252114',
    mapQuery: '46, 47 Noorani Nagar, Dhar Road, Indore',
    mapEmbedUrl: 'https://maps.google.com/maps?q=46%2047%20Noorani%20Nagar%20Dhar%20Road%20Indore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Spacious Classrooms', 'Dedicated Study Zones', 'Classes 5th to 12th', 'PCM, PCB & Commerce'],
  },
  {
    id: 'saify-nagar',
    name: 'Burhani Tutorials — Saify Nagar',
    shortName: 'Saify Nagar Branch',
    branchKey: 'Saify Nagar',
    address: 'Plot No. 101, Scheme 102, Saify Nagar, Indore',
    landmark: 'Near Pulse Hospital',
    phone: '9301262721',
    mapQuery: 'Plot No. 101, Scheme 102, Saify Nagar, Indore Near Pulse Hospital',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Plot%20101%20Scheme%20102%20Saify%20Nagar%20Indore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    features: ['Near Pulse Hospital', 'Interactive Smart Teaching', 'Doubt Solving Desk', 'Science & Commerce Lab Support'],
  },
  {
    id: 'masakin-e-saifiya',
    name: 'Burhani Tutorials — Masakin-E-Saifiya',
    shortName: 'Masakin-E-Saifiya Branch',
    branchKey: 'Masakin-E-Saifiya',
    address: '616 Row House, Masakin-E-Saifiya, Indore',
    landmark: 'Row House Academic Center',
    phone: '9827252114',
    mapQuery: '616 Row House, Masakin-E-Saifiya, Indore',
    mapEmbedUrl: 'https://maps.google.com/maps?q=616%20Row%20House%20Masakin%20E%20Saifiya%20Indore&t=&z=15&ie=UTF8&iwloc=&output=embed',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    features: ['Prime Residential Access', 'Focused Small Batches', 'Complete 5th–12th Coverage', 'Personal Mentorship'],
  },
];

export const TEACHERS = [
  {
    id: 'yusuf-ali',
    name: 'Yusuf Ali Khargon Wala',
    role: 'Partner & Teacher',
    image: null, // Will use actual photo when provided; elegant placeholder now
    initials: 'YA',
    focus: 'Senior Academic Guidance & Core Instruction',
    statement: 'Direct teaching and personal mentorship to bring out every student’s true potential.',
  },
  {
    id: 'mazhar-husain',
    name: 'Mazhar Husain Darugar Wala',
    role: 'Partner & Teacher',
    image: null, // Will use actual photo when provided; elegant placeholder now
    initials: 'MH',
    focus: 'Foundational Mastery & Academic Rigor',
    statement: 'Building conceptual clarity and strong discipline that endures throughout academic life.',
  },
];

export const CLASS_GROUPS = [
  {
    category: 'Middle School',
    classes: ['5th', '6th', '7th', '8th'],
    title: 'Classes 5th – 8th',
    badge: 'Foundation Years',
    description: 'Developing rock-solid conceptual understanding in Mathematics, Science, and Languages during vital formative years.',
    highlights: ['Concept-driven learning', 'Regular assessments', 'Doubt clearing sessions', 'Disciplined study habits'],
  },
  {
    category: 'Secondary School',
    classes: ['9th', '10th'],
    title: 'Classes 9th & 10th',
    badge: 'Board Preparation',
    description: 'Thorough preparation for high school board examinations with rigorous practice, test series, and personalized guidance.',
    highlights: ['Comprehensive syllabus coverage', 'Board-pattern test series', 'Formula & theorem workshops', 'Time-management training'],
  },
  {
    category: 'Higher Secondary',
    classes: ['11th', '12th'],
    title: 'Classes 11th & 12th',
    badge: 'Specialized Streams',
    description: 'In-depth focus on Science (PCM / PCB) and Commerce streams to secure top marks and build careers.',
    highlights: ['Expert subject specialization', 'Deep numerical practice', 'Structured revision cycles', 'Board exam mastery'],
  },
];

export const STREAMS = [
  {
    id: 'pcm',
    streamKey: 'PCM',
    title: 'Science — PCM',
    badge: 'Engineering & Pure Sciences',
    icon: '⚡',
    subjects: [
      { name: 'Physics', desc: 'Mechanics, Electromagnetism, Optics & Modern Physics' },
      { name: 'Chemistry', desc: 'Physical, Inorganic & Organic Chemistry' },
      { name: 'Mathematics', desc: 'Calculus, Algebra, Coordinate Geometry & Vectors' },
    ],
    description: 'Comprehensive curriculum tailored for students pursuing careers in Engineering, Architecture, Computing, and Pure Sciences.',
    suitableFor: 'Class 11th & 12th',
  },
  {
    id: 'pcb',
    streamKey: 'PCB',
    title: 'Science — PCB',
    badge: 'Medical & Life Sciences',
    icon: '🧬',
    subjects: [
      { name: 'Physics', desc: 'Core physical concepts and numerical problem solving' },
      { name: 'Chemistry', desc: 'In-depth molecular, structural & reaction mechanisms' },
      { name: 'Biology', desc: 'Botany, Zoology, Human Physiology & Genetics' },
    ],
    description: 'Rigorous conceptual preparation for students aiming for Medicine, Pharmacy, Biotechnology, and Life Science careers.',
    suitableFor: 'Class 11th & 12th',
  },
  {
    id: 'commerce',
    streamKey: 'Commerce',
    title: 'Commerce',
    badge: 'Finance & Business',
    icon: '📊',
    subjects: [
      { name: 'Accounts', desc: 'Financial Accounting, Partnership & Company Accounts' },
      { name: 'Business Studies', desc: 'Principles of Management, Marketing & Finance' },
      { name: 'Arts', desc: 'Economics, Commercial Art & Humanities subjects' },
      { name: 'Other Commerce Subjects', desc: 'Institute offered specialized commerce electives' },
    ],
    description: 'Mastery in financial ledgering, business operations, and economic systems for Chartered Accountancy, Management, and Finance.',
    suitableFor: 'Class 11th & 12th',
  },
];

export const HERO_SLIDES = [
  {
    id: 1,
    image: '/photos/landing-1.1.jpeg',
    title: 'Burhani Tutorials',
    subtitle: 'Noorani Nagar • Saify Nagar • Masakin-E-Saifiya',
    alt: 'Burhani Tutorials Classroom and Students',
  },
  {
    id: 2,
    image: '/photos/landing-1.2.jpeg',
    title: 'Dedicated Academic Coaching',
    subtitle: 'Classes 5th to 12th — Science & Commerce',
    alt: 'Burhani Tutorials Interactive Teaching Session',
  },
  {
    id: 3,
    image: '/photos/landing-1.3.jpeg',
    title: '30+ Years of Excellence',
    subtitle: 'Direct Partner Instruction & Mentorship',
    alt: 'Burhani Tutorials Students and Mentors',
  },
  {
    id: 4,
    image: '/photos/landing-1.4.jpeg',
    title: 'Strong Conceptual Foundation',
    subtitle: 'Over 5000+ Students Educated in Indore',
    alt: 'Burhani Tutorials Academic Environment',
  },
];

export const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Teachers’ Day Celebration — Mentors & Students',
    category: 'Teachers’ Day',
    image: '/photos/teachers-day-3.1.jpeg',
    caption: 'Celebrating the guiding light of teachers and the special bond with our students on Teachers’ Day.',
  },
  {
    id: 2,
    title: 'Teachers’ Day Celebration — Special Moments',
    category: 'Teachers’ Day',
    image: '/photos/teachers-day-3.2.jpeg',
    caption: 'Honoring dedication, inspiration, and student appreciation at Burhani Tutorials.',
  },
  {
    id: 3,
    title: 'Teachers’ Day Celebration — Student Felicitations',
    category: 'Teachers’ Day',
    image: '/photos/teachers-day-3.3.jpeg',
    caption: 'Joyful gathering and celebrations with teachers and bright young minds.',
  },
  {
    id: 4,
    title: 'Teachers’ Day Celebration — Tributes & Memories',
    category: 'Teachers’ Day',
    image: '/photos/teachers-day-3.4.jpeg',
    caption: 'Cherished memories and celebrations honoring educator excellence at the institute.',
  },
  {
    id: 5,
    title: 'Burhani Tutorials Learning Center',
    category: 'Institute',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    caption: 'Modern academic infrastructure designed for optimal learning and concentration.',
  },
  {
    id: 6,
    title: 'Interactive Classroom Session',
    category: 'Classrooms',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Engaging, interactive classroom coaching with individualized teacher attention.',
  },
  {
    id: 7,
    title: 'Senior Science Instruction',
    category: 'Teaching',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    caption: 'Concept-focused teaching sessions for higher secondary Science and Commerce.',
  },
  {
    id: 8,
    title: 'Saify Nagar Study Center',
    category: 'Branches',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    caption: 'Saify Nagar branch located conveniently near Pulse Hospital, Indore.',
  },
  {
    id: 9,
    title: 'Mathematics & Problem Solving',
    category: 'Teaching',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    caption: 'Step-by-step problem resolution and doubt clarification workshops.',
  },
  {
    id: 10,
    title: 'Dedicated Study & Practice Environment',
    category: 'Classrooms',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    caption: 'Well-lit, quiet study desks supporting student self-practice and test preparation.',
  },
  {
    id: 11,
    title: 'Noorani Nagar Branch Facility',
    category: 'Branches',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Noorani Nagar branch on Dhar Road, Indore serving students since establishment.',
  },
  {
    id: 12,
    title: 'Group Discussion & Doubt Clearing',
    category: 'Teaching',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    caption: 'Personal interaction ensuring every student feels heard and supported.',
  },
];
