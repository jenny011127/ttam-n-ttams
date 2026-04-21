export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  academyCount: number;
}

export interface Academy {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  address: string;
  addressShort: string;
  phone: string;
  passRate: number;
  totalStudents: number;
  avgRating: number;
  reviewCount: number;
  isGovernmentFunded: boolean;
  governmentFundAmount: number;
  hasEmploymentSupport: boolean;
  facilities: string[];
  thumbnail: string;
  isVerified: boolean;
}

export interface Course {
  id: string;
  academyId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  governmentFundedPrice: number;
  isGovernmentFunded: boolean;
  durationWeeks: number;
  totalHours: number;
  scheduleText: string;
  startDate: string;
  capacity: number;
  enrolled: number;
}

export interface Review {
  id: string;
  academyId: string;
  rating: number;
  ratingCurriculum: number;
  ratingInstructor: number;
  ratingFacility: number;
  ratingValue: number;
  title: string;
  content: string;
  authorName: string;
  authorAgeGroup: string;
  certificationName: string;
  passed: boolean;
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
}
