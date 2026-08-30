import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Lightbox from '../components/Lightbox';
import AppointmentModal from '../components/AppointmentModal';
import FreeSessionModal from '../components/FreeSessionModal';
import {
  INSTITUTE_INFO,
  BRANCHES,
  TEACHERS,
  CLASS_GROUPS,
  STREAMS,
  HERO_SLIDES,
  GALLERY_ITEMS,
} from '../data/instituteData';
import './Landing.css';

export default function Landing() {
  // Modal states
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [freeSessionModalOpen, setFreeSessionModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Noorani Nagar');
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedStream, setSelectedStream] = useState('');

  // Hero carousel state
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Auto slide hero carousel every 3 seconds
  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  const nextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Gallery & Lightbox states
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filtered gallery items
  const filteredGallery = galleryCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === galleryCategory);

  const openAppointment = (branch = 'Noorani Nagar', cls = '10', stream = '') => {
    setSelectedBranch(branch);
    setSelectedClass(cls);
    setSelectedStream(stream);
    setAppointmentModalOpen(true);
  };

  const openFreeSession = (branch = 'Noorani Nagar', cls = '10') => {
    setSelectedBranch(branch);
    setSelectedClass(cls);
    setFreeSessionModalOpen(true);
  };

  const openLightboxAt = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="landing-page">
      {/* Sticky Institutional Navbar */}
      <Navbar
        onOpenAppointment={() => openAppointment()}
        onOpenFreeSession={() => openFreeSession()}
      />

      {/* ── 1. HERO SECTION ── */}
      <section id="hero" className="hero-section">
        <div className="hero-backdrop" aria-hidden="true">
          <div className="hero-radial-glow glow-1" />
          <div className="hero-radial-glow glow-2" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge-pill">
              <span className="badge-sparkle">★</span>
              <span>SINCE 1996 • 30+ YEARS OF EXCELLENCE</span>
            </div>

            <h1 className="hero-main-title">
              Quality Education.<br />
              <span className="gold-gradient-text">Strong Foundations.</span><br />
              Brighter Futures.
            </h1>

            <p className="hero-lead-text">
              Empowering students from <strong>Class 5th to 12th</strong> with dedicated teaching,
              rigorous academic guidance, and a supportive learning environment across Indore.
            </p>

            {/* Quick Hero Numbers */}
            <div className="hero-quick-stats">
              <div className="hero-stat-item">
                <div className="stat-num">1996</div>
                <div className="stat-lbl">Established</div>
              </div>
              <div className="stat-divider" />
              <div className="hero-stat-item">
                <div className="stat-num">5000+</div>
                <div className="stat-lbl">Students Educated</div>
              </div>
              <div className="stat-divider" />
              <div className="hero-stat-item">
                <div className="stat-num">3</div>
                <div className="stat-lbl">Branches in Indore</div>
              </div>
              <div className="stat-divider" />
              <div className="hero-stat-item">
                <div className="stat-num">5th–12th</div>
                <div className="stat-lbl">Classes Offered</div>
              </div>
            </div>

            {/* Primary Hero Actions */}
            <div className="hero-action-buttons">
              <button
                type="button"
                className="btn btn-accent btn-lg hero-cta-btn"
                onClick={() => openAppointment()}
              >
                📅 Book an Appointment
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg hero-trial-btn"
                onClick={() => openFreeSession()}
              >
                ✨ 2-Day Free Session
              </button>
              <Link to="/admission" className="btn btn-ghost btn-lg hero-portal-btn">
                📝 Admission Form →
              </Link>
            </div>
          </div>

          {/* Hero Visual Card with Carousel */}
          <div className="hero-visual-col">
            <div
              className="hero-card-frame"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              <div className="hero-carousel-wrapper">
                <div className="hero-img-box">
                  {HERO_SLIDES.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`hero-carousel-slide ${index === currentHeroSlide ? 'active' : ''}`}
                      aria-hidden={index !== currentHeroSlide}
                    >
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className="hero-main-img"
                      />
                      <div className="hero-img-overlay" />
                      <div className="hero-overlay-tag">
                        <div className="tag-icon">🏛️</div>
                        <div>
                          <div className="tag-title">{slide.title}</div>
                          <div className="tag-subtitle">{slide.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Carousel Left / Right Navigation */}
                  <button
                    type="button"
                    className="hero-carousel-arrow prev"
                    onClick={prevHeroSlide}
                    aria-label="Previous slide"
                  >
                    ❮
                  </button>
                  <button
                    type="button"
                    className="hero-carousel-arrow next"
                    onClick={nextHeroSlide}
                    aria-label="Next slide"
                  >
                    ❯
                  </button>

                  {/* Carousel Pagination Dots */}
                  <div className="hero-carousel-dots">
                    {HERO_SLIDES.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        className={`hero-dot-btn ${index === currentHeroSlide ? 'active' : ''}`}
                        onClick={() => setCurrentHeroSlide(index)}
                        aria-label={`Slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Highlight Badges */}
              <div className="floating-badge badge-top-right">
                <span className="badge-icon">🔬</span>
                <div>
                  <div className="badge-bold">PCM • PCB • Commerce</div>
                  <div className="badge-tiny">Classes 11th & 12th</div>
                </div>
              </div>

              <div className="floating-badge badge-bottom-left">
                <span className="badge-icon">👨‍🏫</span>
                <div>
                  <div className="badge-bold">Taught Personally by Partners</div>
                  <div className="badge-tiny">Yusuf Ali & Mazhar Husain</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. ABOUT BURHANI TUTORIALS ── */}
      <section id="about" className="section about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image-column">
              <div className="about-image-stack">
                <div className="about-img-primary-wrap">
                  <img
                    src="/photos/about-2.1.jpeg"
                    alt="Classroom teaching and students at Burhani Tutorials"
                    className="about-img-primary"
                  />
                </div>
                <div className="about-experience-card">
                  <div className="exp-number">30+</div>
                  <div className="exp-text">Years of Teaching Legacy Since 1996</div>
                </div>
              </div>
            </div>

            <div className="about-text-column">
              <div className="section-pre-title">ABOUT THE INSTITUTE</div>
              <h2 className="section-main-title">A Legacy of Learning Since 1996</h2>
              <p className="about-body-text">
                Established in 1996, <strong>Burhani Tutorials</strong> has been helping students build
                strong academic foundations for decades. With more than <strong>5,000+ students</strong> having
                studied at the institute over the years, Burhani Tutorials continues to focus on dedicated teaching,
                conceptual clarity, and student-focused learning.
              </p>

              <div className="about-highlights-list">
                <div className="about-highlight-item">
                  <div className="highlight-bullet">✓</div>
                  <div>
                    <h4 className="highlight-title">Class 5th to Class 12th Complete Academic Pathway</h4>
                    <p className="highlight-desc">Continuous, trusted coaching supporting students from middle school through higher secondary board exams.</p>
                  </div>
                </div>

                <div className="about-highlight-item">
                  <div className="highlight-bullet">✓</div>
                  <div>
                    <h4 className="highlight-title">Direct Partner Involvement & Teaching</h4>
                    <p className="highlight-desc">The institute is personally run and taught by its two founding partners, ensuring direct connection with every student.</p>
                  </div>
                </div>

                <div className="about-highlight-item">
                  <div className="highlight-bullet">✓</div>
                  <div>
                    <h4 className="highlight-title">3 Well-Connected Branches in Indore</h4>
                    <p className="highlight-desc">Convenient centers located at Noorani Nagar, Saify Nagar, and Masakin-E-Saifiya.</p>
                  </div>
                </div>

                <div className="about-highlight-item">
                  <div className="highlight-bullet">✓</div>
                  <div>
                    <h4 className="highlight-title">Specialized Science (PCM/PCB) & Commerce</h4>
                    <p className="highlight-desc">Structured, focused preparation for higher secondary board curricula and professional future streams.</p>
                  </div>
                </div>
              </div>

              <div className="about-cta-row">
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={() => openAppointment()}
                >
                  Book a Visit / Appointment →
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  onClick={() => openFreeSession()}
                >
                  Request 2-Day Trial Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. STATS / LEGACY COUNTER BANNER ── */}
      <section className="stats-banner-section">
        <div className="container">
          <div className="stats-banner-grid">
            <div className="banner-stat-card">
              <div className="banner-stat-icon">🏛️</div>
              <div className="banner-stat-number">1996</div>
              <div className="banner-stat-label">Established</div>
              <div className="banner-stat-sub">30+ Years of Excellence</div>
            </div>

            <div className="banner-stat-card">
              <div className="banner-stat-icon">🎓</div>
              <div className="banner-stat-number">5000+</div>
              <div className="banner-stat-label">Students Educated</div>
              <div className="banner-stat-sub">Generations of Achievers</div>
            </div>

            <div className="banner-stat-card">
              <div className="banner-stat-icon">📍</div>
              <div className="banner-stat-number">3</div>
              <div className="banner-stat-label">Branches in Indore</div>
              <div className="banner-stat-sub">Convenient Locations</div>
            </div>

            <div className="banner-stat-card">
              <div className="banner-stat-icon">📚</div>
              <div className="banner-stat-number">5th–12th</div>
              <div className="banner-stat-label">Classes Available</div>
              <div className="banner-stat-sub">Science & Commerce Streams</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CLASSES WE OFFER ── */}
      <section id="classes" className="section classes-section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-pre-title">ACADEMIC JOURNEY</div>
            <h2 className="section-main-title">Classes We Offer (5th to 12th)</h2>
            <p className="section-desc">
              Supporting students continuously from middle school foundational concepts to higher secondary board excellence.
            </p>
          </div>

          {/* Visual Progression Timeline */}
          <div className="class-progression-bar" aria-label="Class progression from 5th to 12th">
            {['5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((cls, idx) => (
              <div key={cls} className="progression-node">
                <div className="progression-pill">
                  <span className="node-num">{cls}</span>
                </div>
                {idx < 7 && <div className="progression-line" />}
              </div>
            ))}
          </div>

          {/* 3 Main Class Groups */}
          <div className="class-groups-grid">
            {CLASS_GROUPS.map((group) => (
              <div key={group.category} className="class-group-card">
                <div className="group-card-header">
                  <span className="group-badge">{group.badge}</span>
                  <h3 className="group-title">{group.title}</h3>
                  <div className="group-chips">
                    {group.classes.map((c) => (
                      <span key={c} className="class-chip">
                        Class {c}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="group-desc">{group.description}</p>

                <div className="group-highlights">
                  <div className="highlights-header">Key Focus:</div>
                  <ul>
                    {group.highlights.map((h, i) => (
                      <li key={i}>
                        <span className="check-icon">✓</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="group-card-footer">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-block"
                    onClick={() => openAppointment('Noorani Nagar', group.classes[0].replace('th', ''))}
                  >
                    Enquire for {group.title} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. COURSES / STREAMS SECTION ── */}
      <section id="courses" className="section courses-section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-pre-title">HIGHER SECONDARY CURRICULUM</div>
            <h2 className="section-main-title">Academic Streams for Classes 11th & 12th</h2>
            <p className="section-desc">
              Rigorous, subject-specialized coaching for Science and Commerce students to achieve top board scores.
            </p>
          </div>

          <div className="streams-grid">
            {STREAMS.map((st) => (
              <div key={st.id} className="stream-card">
                <div className="stream-card-top">
                  <div className="stream-icon-circle">{st.icon}</div>
                  <div>
                    <span className="stream-badge">{st.badge}</span>
                    <h3 className="stream-title">{st.title}</h3>
                  </div>
                </div>

                <p className="stream-description">{st.description}</p>

                <div className="stream-subjects-box">
                  <div className="subjects-heading">Core Subjects Covered:</div>
                  <div className="subjects-list">
                    {st.subjects.map((subj, idx) => (
                      <div key={idx} className="subject-item">
                        <div className="subject-name">
                          <span className="subject-bullet">•</span> {subj.name}
                        </div>
                        <div className="subject-sub">{subj.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stream-card-bottom">
                  <button
                    type="button"
                    className="btn btn-accent btn-block"
                    onClick={() => openAppointment('Noorani Nagar', '11', st.streamKey)}
                  >
                    Enquire for {st.title} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. OUR TEACHERS / LEADERSHIP SECTION ── */}
      <section id="teachers" className="section teachers-section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-pre-title">OUR TEACHERS & LEADERSHIP</div>
            <h2 className="section-main-title">Led by Experience. Taught with Dedication.</h2>
            <p className="section-desc">
              Burhani Tutorials is guided and taught by its partners, <strong>Yusuf Ali Khargon Wala</strong> and{' '}
              <strong>Mazhar Husain Darugar Wala</strong>, bringing direct teaching experience and personal involvement into the institute.
            </p>
          </div>

          <div className="teachers-grid">
            {TEACHERS.map((teacher) => (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-avatar-wrap">
                  {teacher.image ? (
                    <img src={teacher.image} alt={teacher.name} className="teacher-photo" />
                  ) : (
                    <div className="teacher-placeholder-avatar">
                      <div className="teacher-initials">{teacher.initials}</div>
                      <div className="teacher-mortarboard">🎓</div>
                    </div>
                  )}
                </div>

                <div className="teacher-details">
                  <span className="teacher-role-badge">{teacher.role}</span>
                  <h3 className="teacher-name">{teacher.name}</h3>
                  <div className="teacher-focus">{teacher.focus}</div>
                  <div className="teacher-quote">
                    <span className="quote-mark">“</span>
                    {teacher.statement}
                    <span className="quote-mark">”</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="teachers-trust-box">
            <div className="trust-icon">🤝</div>
            <div className="trust-text">
              <strong>Personal Teacher Connection:</strong> The institute is personally run and taught by its two partners,
              maintaining a direct connection between management, teaching, and students at every stage.
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. BRANCHES / LOCATIONS SECTION ── */}
      <section id="branches" className="section branches-section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-pre-title">OUR LOCATIONS IN INDORE</div>
            <h2 className="section-main-title">Find Burhani Tutorials Near You</h2>
            <p className="section-desc">
              Three well-equipped, student-friendly academic centers across prime residential hubs of Indore.
            </p>
          </div>

          <div className="branches-grid">
            {BRANCHES.map((branch) => (
              <div key={branch.id} className="branch-card">
                {branch.image ? (
                  <div className="branch-img-box">
                    <img src={branch.image} alt={branch.name} className="branch-photo" />
                    <div className="branch-badge-overlay">{branch.shortName}</div>
                  </div>
                ) : (
                  <div className="branch-header-placeholder">
                    <div className="branch-placeholder-badge">{branch.shortName}</div>
                    <div className="branch-placeholder-icon">🏛️</div>
                  </div>
                )}

                <div className="branch-card-body">
                  <h3 className="branch-title">{branch.name}</h3>
                  <div className="branch-address">
                    <span className="branch-pin-icon">📍</span>
                    <span>{branch.address}</span>
                  </div>

                  {branch.landmark && (
                    <div className="branch-landmark-pill">
                      <span>Landmark:</span> <strong>{branch.landmark}</strong>
                    </div>
                  )}

                  <div className="branch-features-list">
                    {branch.features.map((f, i) => (
                      <span key={i} className="branch-feat-tag">
                        ✓ {f}
                      </span>
                    ))}
                  </div>

                  <div className="branch-actions">
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      onClick={() => openAppointment(branch.branchKey)}
                    >
                      Book Appointment Here
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      Get Directions ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. IMAGE GALLERY & LIGHTBOX ── */}
      <section id="gallery" className="section gallery-section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-pre-title">INSTITUTE GLIMPSES</div>
            <h2 className="section-main-title">Life & Learning at Burhani Tutorials</h2>
            <p className="section-desc">
              Click on any photograph to preview it full-screen in our interactive viewer without downloading.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="gallery-filter-tabs">
            {['All', ...Array.from(new Set(GALLERY_ITEMS.map((item) => item.category)))].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-tab ${galleryCategory === cat ? 'active' : ''}`}
                onClick={() => setGalleryCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Responsive Gallery Grid */}
          <div className="gallery-grid">
            {filteredGallery.map((item, idx) => (
              <div
                key={item.id}
                className="gallery-item-card"
                onClick={() => openLightboxAt(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightboxAt(idx);
                  }
                }}
                aria-label={`View photo: ${item.title}`}
              >
                <div className="gallery-img-wrap">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="gallery-thumbnail"
                    loading="lazy"
                  />
                  <div className="gallery-hover-overlay">
                    <span className="gallery-zoom-icon">🔍</span>
                    <h4 className="gallery-overlay-title">{item.title}</h4>
                    <span className="gallery-overlay-cat">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. 2-DAY FREE TRIAL BANNER CTA ── */}
      <section className="free-trial-banner-section">
        <div className="container">
          <div className="trial-banner-card">
            <div className="trial-banner-content">
              <div className="trial-badge">COMPLIMENTARY ACADEMIC TRIAL</div>
              <h2 className="trial-banner-title">Experience Burhani Tutorials with a 2-Day Free Session</h2>
              <p className="trial-banner-text">
                Experience the Burhani Tutorials learning environment with a complimentary 2-day session.
                Attend real classes, interact with teachers, and observe our teaching methods firsthand.
              </p>
              <div className="trial-banner-buttons">
                <button
                  type="button"
                  className="btn btn-accent btn-lg"
                  onClick={() => openFreeSession()}
                >
                  ✨ Get 2-Day Free Session Now
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-lg nav-btn-white"
                  onClick={() => openAppointment()}
                >
                  📅 Book In-Person Appointment
                </button>
              </div>
            </div>
            <div className="trial-banner-icon-side">
              <div className="trial-icon-burst">🎓</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. PRESERVED STUDENT FORMS & ADMISSION PORTAL CARD ── */}
      <section id="admissions" className="section admissions-gateway-section">
        <div className="container">
          <div className="gateway-card">
            <div className="gateway-header">
              <div className="gateway-badge">STUDENT ADMISSION & REGISTRATION</div>
              <h2 className="gateway-title">Online Admission & Board Examination Portal</h2>
              <p className="gateway-subtitle">
                Apply online for new admissions or complete board registration and document submissions.
              </p>
            </div>

            <div className="gateway-grid">
              <div className="gateway-option-card">
                <div className="option-icon">📝</div>
                <h3 className="option-title">Tutorial Admission Form</h3>
                <p className="option-desc">
                  For regular coaching admission across <strong>Classes 5th, 6th, 7th, 8th, 9th, 10th, 11th, and 12th</strong>.
                </p>
                <div className="option-chips">
                  <span>Class 5th–12th</span>
                  <span>Science & Commerce</span>
                  <span>Instant Verification</span>
                </div>
                <Link to="/admission" className="btn btn-accent btn-md btn-block">
                  Open Admission Form →
                </Link>
              </div>

              <div className="gateway-option-card">
                <div className="option-icon">🎓</div>
                <h3 className="option-title">Board Examination Registration</h3>
                <p className="option-desc">
                  Official digital board examination form and document submission for <strong>Classes 9th to 12th</strong>.
                </p>
                <div className="option-chips">
                  <span>Class 9th</span>
                  <span>Class 10th</span>
                  <span>Class 11th</span>
                  <span>Class 12th</span>
                </div>
                <Link to="/select-class" className="btn btn-primary btn-md btn-block" style={{ background: '#0f2238' }}>
                  Start Board Form →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. CONTACT US SECTION ── */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-side">
              <div className="section-pre-title">GET IN TOUCH</div>
              <h2 className="section-main-title">Contact Burhani Tutorials</h2>
              <p className="contact-subtext">
                Have questions regarding admissions, batch timings, or our academic programs?
                Reach out to us directly or visit any of our three branches in Indore.
              </p>

              <div className="contact-details-cards">
                <div className="contact-info-card">
                  <div className="contact-card-icon">📞</div>
                  <div>
                    <div className="contact-card-label">Direct Phone Numbers:</div>
                    <div className="contact-phone-links">
                      <a href="tel:9827252114" className="phone-btn-link">
                        9827252114
                      </a>
                      <span className="phone-sep">|</span>
                      <a href="tel:9301262721" className="phone-btn-link">
                        9301262721
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-card-icon">✉️</div>
                  <div>
                    <div className="contact-card-label">Official Email Address:</div>
                    <a href="mailto:burhanitutorials1@gmail.com" className="email-link">
                      burhanitutorials1@gmail.com
                    </a>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-card-icon">💬</div>
                  <div>
                    <div className="contact-card-label">WhatsApp Notification & Enquiry:</div>
                    <a
                      href="https://wa.me/918319651437"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-quick-link"
                    >
                      +91 83196 51437 (Click to Chat)
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-cta-buttons">
                <button
                  type="button"
                  className="btn btn-accent btn-md"
                  onClick={() => openAppointment()}
                >
                  📅 Book In-Person Appointment
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-md"
                  onClick={() => openFreeSession()}
                >
                  ✨ Request 2-Day Free Session
                </button>
              </div>
            </div>

            <div className="contact-branches-side">
              <h3 className="branches-box-title">Our 3 Indore Branches</h3>
              <div className="compact-branches-list">
                {BRANCHES.map((b) => (
                  <div key={b.id} className="compact-branch-item">
                    <div className="compact-branch-header">
                      <span className="compact-branch-name">{b.name}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="compact-map-link"
                      >
                        Map ↗
                      </a>
                    </div>
                    <div className="compact-branch-addr">{b.address}</div>
                    {b.landmark && <div className="compact-branch-landmark">Near: {b.landmark}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. INSTITUTIONAL FOOTER ── */}
      <footer className="footer-institutional">
        <div className="container">
          <div className="footer-top-grid">
            {/* Brand column */}
            <div className="footer-col brand-col">
              <div className="footer-brand-header">
                <div className="navbar-logo">
                  <img src="/bt-logo.jpeg" alt="Burhani Tutorials Logo" />
                </div>
                <div>
                  <div className="footer-brand-title">Burhani Tutorials</div>
                  <div className="footer-brand-sub">Since 1996 • Indore</div>
                </div>
              </div>
              <p className="footer-brand-bio">
                Building strong academic foundations and shaping successful futures for Classes 5th to 12th with over 30 years of dedicated teaching legacy.
              </p>
              <div className="footer-legacy-tag">
                <span>🏆 5000+ Students Educated</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Quick Links</h4>
              <ul className="footer-links-list">
                <li><a href="#hero">Home</a></li>
                <li><a href="#about">About Institute</a></li>
                <li><a href="#classes">Classes (5th–12th)</a></li>
                <li><a href="#courses">Courses / Streams</a></li>
                <li><a href="#teachers">Our Teachers</a></li>
                <li><a href="#branches">Our Branches</a></li>
                <li><a href="#gallery">Gallery</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Student Portals & Forms */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Admission & Forms</h4>
              <ul className="footer-links-list">
                <li><Link to="/admission">Tutorial Admission Form (5th–12th)</Link></li>
                <li><Link to="/select-class">Board Registration (9th–12th)</Link></li>
                <li><Link to="/apply/9">Class 9th Board Form</Link></li>
                <li><Link to="/apply/10">Class 10th Board Form</Link></li>
                <li><Link to="/apply/11">Class 11th Board Form</Link></li>
                <li><Link to="/apply/12">Class 12th Board Form</Link></li>
                <li><Link to="/admin/login">Staff / Admin Portal</Link></li>
              </ul>
            </div>

            {/* Contact & Branches */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Indore Centers</h4>
              <div className="footer-branch-text">
                <strong>Noorani Nagar:</strong><br />
                46, 47 Noorani Nagar, Dhar Road, Indore
              </div>
              <div className="footer-branch-text">
                <strong>Saify Nagar:</strong><br />
                Plot No. 101, Scheme 102 (Near Pulse Hospital)
              </div>
              <div className="footer-branch-text">
                <strong>Masakin-E-Saifiya:</strong><br />
                616 Row House, Masakin-E-Saifiya, Indore
              </div>
              <div className="footer-phone-row">
                <span>📞 9827252114 / 9301262721</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>
              © {new Date().getFullYear()} Burhani Tutorials. All rights reserved. Established 1996.
            </div>
            <div className="footer-bottom-links">
              <button type="button" onClick={() => openAppointment()} className="footer-action-link">
                Book Appointment
              </button>
              <span className="footer-sep">•</span>
              <button type="button" onClick={() => openFreeSession()} className="footer-action-link">
                2-Day Free Session
              </button>
              <span className="footer-sep">•</span>
              <Link to="/admin/login" className="footer-action-link">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Lightbox Viewer */}
      <Lightbox
        isOpen={lightboxOpen}
        images={filteredGallery}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredGallery.length - 1))}
        onNext={() => setLightboxIndex((prev) => (prev < filteredGallery.length - 1 ? prev + 1 : 0))}
      />

      {/* Appointment Booking Modal */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        initialBranch={selectedBranch}
        initialClass={selectedClass}
        initialStream={selectedStream}
      />

      {/* 2-Day Free Session Modal */}
      <FreeSessionModal
        isOpen={freeSessionModalOpen}
        onClose={() => setFreeSessionModalOpen(false)}
        initialBranch={selectedBranch}
        initialClass={selectedClass}
      />
    </div>
  );
}
