import { Link, useNavigate } from 'react-router-dom';
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
