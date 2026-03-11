import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, CheckCircle, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import { Button, Avatar, Rating, Card, Badge } from '../../components/ui';
import { mockProfessionals, mockReviews } from '../../data/mockData';
import './ProfessionalProfile.css';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pro = mockProfessionals.find(p => p.id === id) || mockProfessionals[0];

  const servicesList = [
    { name: 'Basic Haircut', duration: '30 min', price: pro.price },
    { name: 'Haircut & Styling', duration: '45 min', price: pro.price + 10 },
    { name: 'Premium Service', duration: '60 min', price: pro.price + 25 },
    { name: 'Full Treatment', duration: '90 min', price: pro.price + 40 },
  ];

  return (
    <div className="pro-profile-page">
      {/* Hero */}
      <motion.div className="pro-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="pro-hero-bg" />
        <div className="pro-hero-content">
          <Avatar src={pro.avatar} name={pro.name} size="xl" />
          <div className="pro-hero-info">
            <div className="pro-hero-name">
              <h1>{pro.name}</h1>
              {pro.verified && <Badge variant="success" size="md"><CheckCircle size={12} /> Verified</Badge>}
            </div>
            <Rating value={pro.rating} size="md" showValue count={pro.reviewCount} />
            <div className="pro-hero-meta">
              <span><MapPin size={14} /> {pro.distance} km away</span>
              <span><Clock size={14} /> {pro.responseTime} response</span>
              <span><Star size={14} /> {pro.completedServices} services</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="pro-profile-body">
        {/* Bio */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2>About</h2>
          <p className="pro-bio">{pro.bio}</p>
        </motion.section>

        {/* Services */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2>Services & Prices</h2>
          <div className="services-list">
            {servicesList.map((svc, i) => (
              <Card key={i} variant="default" padding="sm" hover className="service-row"
                onClick={() => navigate(`/user/booking/${pro.id}`)}>
                <div className="service-info">
                  <h4>{svc.name}</h4>
                  <span className="service-dur"><Clock size={13} /> {svc.duration}</span>
                </div>
                <div className="service-price-action">
                  <span className="service-price">${svc.price}</span>
                  <ChevronRight size={16} />
                </div>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Availability */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2>Availability</h2>
          <Card variant="glass" padding="md">
            <div className="availability-info">
              <Calendar size={20} />
              <div>
                <p className="avail-status">{pro.availability}</p>
                <p className="avail-location"><MapPin size={13} /> {pro.location.address}</p>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Portfolio */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2>Portfolio</h2>
          <div className="portfolio-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="portfolio-item">
                <div className="portfolio-placeholder">
                  <Star size={20} />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Reviews */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2>Reviews ({pro.reviewCount})</h2>
          <div className="reviews-list">
            {mockReviews.slice(0, 3).map(review => (
              <Card key={review.id} variant="default" padding="md" className="review-card">
                <div className="review-header">
                  <Avatar src={review.userAvatar} name={review.userName} size="sm" />
                  <div>
                    <p className="review-name">{review.userName}</p>
                    <p className="review-date">{review.date}</p>
                  </div>
                  <Rating value={review.rating} size="sm" />
                </div>
                <p className="review-text">{review.comment}</p>
              </Card>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Sticky Book CTA */}
      <div className="pro-book-cta glass">
        <div className="cta-price-info">
          <span className="cta-from">From</span>
          <span className="cta-price">${pro.price}</span>
        </div>
        <Button size="lg" onClick={() => navigate(`/user/booking/${pro.id}`)} iconRight={<DollarSign size={18} />}>
          Book Now
        </Button>
      </div>
    </div>
  );
}
