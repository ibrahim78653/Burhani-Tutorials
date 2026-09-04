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
    image: null,
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
    image: null,
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
    image: null,
    features: ['Prime Residential Access', 'Focused Small Batches', 'Complete 5th–12th Coverage', 'Personal Mentorship'],
  },
];

export const TEACHERS = [
  {
    id: 'yusuf-ali',
    name: 'Yusuf Ali Khargon Wala',
    role: 'Partner & Teacher',
    image: '/photos/partner-1.jpeg',
    initials: 'YA',
    focus: 'Senior Academic Guidance & Core Instruction',
    statement: 'Direct teaching and personal mentorship to bring out every student’s true potential.',
  },
  {
    id: 'mazhar-husain',
    name: 'Mazhar Husain Darugar Wala',
    role: 'Partner & Teacher',
    image: '/photos/partner-2.jpeg',
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
    image: '/photos/landing-1.1.webp',
    title: 'Burhani Tutorials',
    subtitle: 'Noorani Nagar • Saify Nagar • Masakin-E-Saifiya',
    alt: 'Burhani Tutorials Classroom and Students',
  },
  {
    id: 2,
    image: '/photos/landing-1.2.webp',
    title: 'Dedicated Academic Coaching',
    subtitle: 'Classes 5th to 12th — Science & Commerce',
    alt: 'Burhani Tutorials Interactive Teaching Session',
  },
  {
    id: 3,
    image: '/photos/landing-1.3.webp',
    title: '30+ Years of Excellence',
    subtitle: 'Direct Partner Instruction & Mentorship',
    alt: 'Burhani Tutorials Students and Mentors',
  },
  {
    id: 4,
    image: '/photos/landing-1.4.webp',
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
    image: '/photos/teachers-day-3.1.webp',
    caption: 'Celebrating the guiding light of teachers and the special bond with our students on Teachers’ Day.',
  },
  {
    id: 2,
    title: 'Teachers’ Day Celebration — Special Moments',
    category: 'Teachers’ Day',
    image: '/photos/teachers-day-3.2.webp',
    caption: 'Honoring dedication, inspiration, and student appreciation at Burhani Tutorials.',
  },
  {
    id: 3,
    title: 'Teachers’ Day Celebration — Student Felicitations',
    category: 'Teachers’ Day',
    image: '/photos/teachers-day-3.3.webp',
    caption: 'Joyful gathering and celebrations with teachers and bright young minds.',
  },
  {
    id: 4,
    title: 'Teachers’ Day Celebration — Tributes & Memories',
    category: 'Teachers’ Day',
    image: '/photos/teachers-day-3.4.webp',
    caption: 'Cherished memories and celebrations honoring educator excellence at the institute.',
  },
  {
    id: 5,
    title: 'Classroom Guidance & Mentorship',
    category: 'Classroom & Campus',
    image: '/photos/landing-1.1.webp',
    caption: 'Engaging, interactive classroom coaching with individualized teacher attention and mentorship.',
  },
  {
    id: 6,
    title: 'Interactive Teaching & Practice Sessions',
    category: 'Classroom & Campus',
    image: '/photos/landing-1.2.webp',
    caption: 'Dedicated coaching sessions focused on concept clarity and problem-solving.',
  },
  {
    id: 7,
    title: 'Academic Focus & Direct Instruction',
    category: 'Classroom & Campus',
    image: '/photos/landing-1.3.webp',
    caption: 'Direct partner teaching ensuring foundational mastery across Science and Commerce.',
  },
  {
    id: 8,
    title: 'Student Learning Environment',
    category: 'Classroom & Campus',
    image: '/photos/landing-1.4.webp',
    caption: 'Supportive and disciplined atmosphere empowering students to achieve board excellence.',
  },
  {
    id: 9,
    title: 'Classroom Engagement & Academic Legacy',
    category: 'Classroom & Campus',
    image: '/photos/about-2.1.webp',
    caption: 'Over 30+ years of dedicated teaching legacy shaping brighter futures since 1996.',
  },
];
