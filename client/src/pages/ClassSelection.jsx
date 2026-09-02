import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import './ClassSelection.css';

const classes = [
  { id: '9', label: 'Class 9th', desc: 'Secondary Education', docs: 'Aadhar, Samagra (SSMID), TC, Photo, Signature', color: '#3b82f6' },
  { id: '10', label: 'Class 10th', desc: 'Secondary Education', docs: 'Aadhar, Samagra (SSMID), TC, Photo, Signature + Bank Details', color: '#8b5cf6' },
  { id: '11', label: 'Class 11th', desc: 'Higher Secondary Education', docs: 'Aadhar, Samagra (SSMID), Class 10 Marksheet, TC, Migration, Photo, Signature', color: '#10b981' },
  { id: '12', label: 'Class 12th', desc: 'Higher Secondary Education', docs: 'Aadhar, Samagra (SSMID), Class 10 & 11 Marksheets, TC, Migration, Photo, Signature + Bank Details', color: '#f59e0b' },
];

export default function ClassSelection() {
  const navigate = useNavigate();

  return (
    <div className="class-selection">
      <Helmet>
        <title>Board Exam Registration — Burhani Tutorials Indore</title>
        <meta name="description" content="Submit your State Board examination registration form online for Class 9th, 10th, 11th, and 12th at Burhani Tutorials, Indore." />
        <link rel="canonical" href="https://burhani-tutorials-indore.in/select-class" />
        <meta property="og:title" content="Board Exam Registration — Burhani Tutorials Indore" />
        <meta property="og:description" content="Online board examination registration for Class 9th to 12th at Burhani Tutorials, Indore." />
        <meta property="og:url" content="https://burhani-tutorials-indore.in/select-class" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://burhani-tutorials-indore.in/' },
            { '@type': 'ListItem', position: 2, name: 'Board Exam Registration', item: 'https://burhani-tutorials-indore.in/select-class' },
          ],
        })}</script>
      </Helmet>

      <Navbar />
      <div className="container class-sel-body">
        <div className="class-sel-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Select Your Class</h1>
          <p>Choose the class for which you want to submit the board form</p>
        </div>

        <div className="class-sel-grid">
          {classes.map(cls => (
            <button
              key={cls.id}
              className="class-sel-card"
              onClick={() => navigate(`/apply/${cls.id}`)}
              aria-label={`Apply for ${cls.label}`}
            >
              <div className="class-sel-badge" style={{ background: cls.color + '15', color: cls.color, borderColor: cls.color + '30' }}>
                Board Forms Open
              </div>
              <div className="class-sel-num" style={{ color: cls.color }}>
                Class {cls.id}<sup>th</sup>
              </div>
              <div className="class-sel-desc">{cls.desc}</div>
              <div className="class-sel-docs-label">Required Documents:</div>
              <div className="class-sel-docs">{cls.docs}</div>
              <div className="class-sel-cta" style={{ background: cls.color }}>
                Start Board Form →
              </div>
            </button>
          ))}
        </div>

        <div className="class-sel-note">
          <span>📋</span>
          <span>Keep your documents ready before starting. You'll need to upload them during the board form submission.</span>
        </div>
      </div>
    </div>
  );
}
