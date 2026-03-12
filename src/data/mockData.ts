// Mock data for the JustMe platform

export interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
}

export interface AvailableSlot {
  date: string;       // ISO date string e.g. '2026-03-12'
  slots: string[];     // e.g. ['9:00 AM', '10:00 AM', ...]
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: number;
  price: number;
  bio: string;
  services: string[];
  availability: string;
  responseTime: string;
  completedServices: number;
  location: { lat: number; lng: number; address: string };
  portfolio: string[];
  walletBalance: number;
  joinDate: string;
  verified: boolean;
  isFavorite: boolean;
  availableSlots: AvailableSlot[];
}

export interface Booking {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  location: string;
  locationType: 'professional' | 'home';
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

export interface Transaction {
  id: string;
  type: 'payment' | 'commission' | 'recharge' | 'payout';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'user' | 'professional' | 'admin';
  loyaltyPoints?: number;
  addresses: { label: string; address: string }[];
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  expiresAt: string;
}

export interface ScheduleConfig {
  workingDays: Record<string, boolean>;
  hours: { start: string; end: string };
  breaks: { title: string; start: string; end: string }[];
  maxDailyAppointments: number;
  bufferMinutes: number;
}

export interface IncentiveProgram {
  id: string;
  title: string;
  description: string;
  targetServices: number;
  currentServices: number;
  rewardValue: number;
  rewardType: 'bonus' | 'commission_free';
}

// Generate available slots for next 7 days
function generateSlots(busyPattern: number[] = []): AvailableSlot[] {
  const allSlots = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    // Remove some slots based on busyPattern
    const slots = allSlots.filter((_, si) => !busyPattern.includes(si));
    return { date: dateStr, slots };
  });
}

// Service Categories
export const serviceCategories: Service[] = [
  { id: '1', name: 'Barber', icon: 'scissors', category: 'hair', description: 'Professional barber services' },
  { id: '2', name: 'Hair Stylist', icon: 'sparkles', category: 'hair', description: 'Hair styling and coloring' },
  { id: '3', name: 'Haircut', icon: 'scissors', category: 'hair', description: 'Precision haircuts' },
  { id: '4', name: 'Makeup', icon: 'palette', category: 'beauty', description: 'Professional makeup services' },
  { id: '5', name: 'Waxing', icon: 'flower2', category: 'body', description: 'Full body waxing services' },
  { id: '6', name: 'Nails', icon: 'hand', category: 'beauty', description: 'Manicure and pedicure' },
  { id: '7', name: 'Massage', icon: 'heart', category: 'wellness', description: 'Relaxation and therapeutic massage' },
  { id: '8', name: 'Skincare', icon: 'droplets', category: 'beauty', description: 'Facial treatments and skincare' },
  { id: '9', name: 'Grooming', icon: 'user', category: 'grooming', description: 'Complete grooming services' },
  { id: '10', name: 'Spa', icon: 'waves', category: 'wellness', description: 'Full spa experience' },
];

// Mock Professionals
export const mockProfessionals: Professional[] = [
  {
    id: 'p1', name: 'Sofia Martinez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    rating: 4.9, reviewCount: 234, distance: 0.8, price: 35, bio: 'Master stylist with 8+ years experience specializing in modern cuts and color.',
    services: ['Hair Stylist', 'Haircut', 'Makeup'], availability: 'Available today', responseTime: '~5 min',
    completedServices: 1250, location: { lat: 4.711, lng: -74.0721, address: '123 Salon Ave, Bogotá' },
    portfolio: [], walletBalance: 450, joinDate: '2023-06-15', verified: true,
    isFavorite: true, availableSlots: generateSlots([2, 5]),
  },
  {
    id: 'p2', name: 'Carlos Reyes', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    rating: 4.8, reviewCount: 189, distance: 1.2, price: 25, bio: 'Expert barber offering classic and contemporary styles.',
    services: ['Barber', 'Grooming', 'Haircut'], availability: 'Available today', responseTime: '~3 min',
    completedServices: 980, location: { lat: 4.715, lng: -74.068, address: '456 Barber St, Bogotá' },
    portfolio: [], walletBalance: 320, joinDate: '2023-01-20', verified: true,
    isFavorite: false, availableSlots: generateSlots([0, 3, 7]),
  },
  {
    id: 'p3', name: 'Valentina Torres', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    rating: 4.95, reviewCount: 312, distance: 1.5, price: 50, bio: 'Celebrity makeup artist with passion for bridal and editorial looks.',
    services: ['Makeup', 'Skincare', 'Nails'], availability: 'Next slot: 2pm', responseTime: '~10 min',
    completedServices: 1580, location: { lat: 4.705, lng: -74.075, address: '789 Beauty Blvd, Bogotá' },
    portfolio: [], walletBalance: 890, joinDate: '2022-09-01', verified: true,
    isFavorite: false, availableSlots: generateSlots([1, 4, 6, 8]),
  },
  {
    id: 'p4', name: 'Andrés Gómez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    rating: 4.7, reviewCount: 156, distance: 2.1, price: 40, bio: 'Licensed massage therapist specializing in deep tissue and sports massage.',
    services: ['Massage', 'Spa'], availability: 'Available tomorrow', responseTime: '~15 min',
    completedServices: 720, location: { lat: 4.698, lng: -74.08, address: '321 Wellness Way, Bogotá' },
    portfolio: [], walletBalance: 200, joinDate: '2023-03-10', verified: true,
    isFavorite: false, availableSlots: generateSlots([0, 1, 9]),
  },
  {
    id: 'p5', name: 'Isabella López', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    rating: 4.85, reviewCount: 278, distance: 0.5, price: 30, bio: 'Nail art specialist and skincare expert. Luxury treatments at affordable prices.',
    services: ['Nails', 'Skincare', 'Waxing'], availability: 'Available today', responseTime: '~7 min',
    completedServices: 1100, location: { lat: 4.713, lng: -74.07, address: '654 Nail Studio, Bogotá' },
    portfolio: [], walletBalance: 560, joinDate: '2023-04-22', verified: true,
    isFavorite: true, availableSlots: generateSlots([3, 6]),
  },
  {
    id: 'p6', name: 'Diego Herrera', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    rating: 4.6, reviewCount: 98, distance: 3.2, price: 20, bio: 'Modern barber with focus on fades, beard styling and grooming.',
    services: ['Barber', 'Grooming'], availability: 'Available today', responseTime: '~8 min',
    completedServices: 450, location: { lat: 4.72, lng: -74.065, address: '987 Cut Corner, Bogotá' },
    portfolio: [], walletBalance: 150, joinDate: '2024-01-05', verified: false,
    isFavorite: false, availableSlots: generateSlots([2, 5, 8]),
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  { id: 'b1', professionalId: 'p1', professionalName: 'Sofia Martinez', professionalAvatar: mockProfessionals[0].avatar, service: 'Haircut & Styling', date: '2026-03-15', time: '10:00 AM', status: 'confirmed', price: 45, location: '123 Salon Ave, Bogotá', locationType: 'professional' },
  { id: 'b2', professionalId: 'p5', professionalName: 'Isabella López', professionalAvatar: mockProfessionals[4].avatar, service: 'Manicure', date: '2026-03-17', time: '2:00 PM', status: 'pending', price: 30, location: 'My Home Address', locationType: 'home' },
  { id: 'b3', professionalId: 'p2', professionalName: 'Carlos Reyes', professionalAvatar: mockProfessionals[1].avatar, service: 'Beard Trim', date: '2026-03-10', time: '11:00 AM', status: 'completed', price: 20, location: '456 Barber St, Bogotá', locationType: 'professional' },
  { id: 'b4', professionalId: 'p3', professionalName: 'Valentina Torres', professionalAvatar: mockProfessionals[2].avatar, service: 'Bridal Makeup', date: '2026-03-08', time: '9:00 AM', status: 'completed', price: 80, location: 'My Home Address', locationType: 'home' },
  { id: 'b5', professionalId: 'p4', professionalName: 'Andrés Gómez', professionalAvatar: mockProfessionals[3].avatar, service: 'Deep Tissue Massage', date: '2026-03-05', time: '4:00 PM', status: 'completed', price: 55, location: '321 Wellness Way, Bogotá', locationType: 'professional' },
];

// Mock Reviews
export const mockReviews: Review[] = [
  { id: 'r1', userName: 'María García', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Absolutely amazing! Sofia transformed my hair completely. Best stylist in Bogotá!', date: '2026-03-09' },
  { id: 'r2', userName: 'Juan Pérez', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Carlos is the best barber I have ever had. Clean fade every time.', date: '2026-03-07' },
  { id: 'r3', userName: 'Laura Rodríguez', userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face', rating: 4, comment: 'Great nails, very creative designs. Would definitely book again!', date: '2026-03-05' },
  { id: 'r4', userName: 'Camila Sánchez', userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'The massage was pure bliss. Andrés has magical hands!', date: '2026-03-03' },
  { id: 'r5', userName: 'Pedro Morales', userAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Valentina made me look stunning for my wedding. Highly recommend!', date: '2026-02-28' },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  { id: 't1', type: 'payment', amount: 45, date: '2026-03-15', description: 'Haircut & Styling — Sofia Martinez', status: 'completed' },
  { id: 't2', type: 'commission', amount: 4.05, date: '2026-03-15', description: '9% commission — Booking #b1', status: 'completed' },
  { id: 't3', type: 'recharge', amount: 100, date: '2026-03-14', description: 'Wallet recharge', status: 'completed' },
  { id: 't4', type: 'payment', amount: 80, date: '2026-03-08', description: 'Bridal Makeup — Valentina Torres', status: 'completed' },
  { id: 't5', type: 'commission', amount: 7.2, date: '2026-03-08', description: '9% commission — Booking #b4', status: 'completed' },
  { id: 't6', type: 'payout', amount: 250, date: '2026-03-07', description: 'Weekly payout to bank', status: 'completed' },
];

// Mock Current User
export const mockCurrentUser: UserProfile = {
  id: 'u1', name: 'Santiago Rivera', email: 'santiago@justme.com', phone: '+57 310 555 1234',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
  role: 'user',
  loyaltyPoints: 350,
  addresses: [
    { label: 'Home', address: 'Calle 85 #15-23, Bogotá, Colombia' },
    { label: 'Office', address: 'Carrera 7 #71-52, Bogotá, Colombia' },
  ],
};

// Mock Coupons for UserRewards
export const mockCoupons: Coupon[] = [
  { id: 'c1', code: 'WELCOME15', discount: 15, description: 'Welcome to JustMe!', expiresAt: '2026-12-31' },
  { id: 'c2', code: 'LOYALTY20', discount: 20, description: 'For reaching 300 points in our loyalty program.', expiresAt: '2026-06-30' },
  { id: 'c3', code: 'BIRTHDAY30', discount: 30, description: 'Happy Birthday! Treat yourself to a premium service.', expiresAt: '2026-04-15' },
];

export const mockScheduleConfig: ScheduleConfig = {
  workingDays: { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false },
  hours: { start: '09:00', end: '18:00' },
  breaks: [{ title: 'Lunch Break', start: '13:00', end: '14:00' }],
  maxDailyAppointments: 8,
  bufferMinutes: 15,
};

export const mockIncentiveProgram: IncentiveProgram = {
  id: 'inc1', title: 'Super Pro Status', description: 'Complete 200 services this month to unlock a $50 Wallet Bonus.',
  targetServices: 200, currentServices: 142, rewardValue: 50, rewardType: 'bonus'
};

// Admin stats
export const adminStats = {
  totalUsers: 12450,
  totalProfessionals: 3280,
  totalBookings: 45600,
  totalRevenue: 1250000,
  commissionsCollected: 112500,
  activeServices: 10,
  monthlyGrowth: 12.5,
  avgRating: 4.78,
};
