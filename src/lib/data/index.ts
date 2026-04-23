import type { Academy, Course, Review } from '@/types';

// 기피 기술직
import * as welding from './welding';
import * as plumbing from './plumbing';
import * as electrician from './electrician';
import * as tiling from './tiling';
import * as wallpaper from './wallpaper';
import * as hvac from './hvac';
import * as forklift from './forklift';
import * as waterproof from './waterproof';
import * as painting from './painting';
// 깨끗한 직종
import * as careWorker from './care-worker';
import * as beautyNail from './beauty-nail';

// 카테고리별 데이터 맵
export const dataByCategory: Record<string, { academies: Academy[]; courses: Course[]; reviews: Review[] }> = {
  'welding': welding,
  'plumbing': plumbing,
  'electrician': electrician,
  'tiling': tiling,
  'wallpaper': wallpaper,
  'hvac': hvac,
  'forklift': forklift,
  'waterproof': waterproof,
  'painting': painting,
  'care-worker': careWorker,
  'beauty-nail': beautyNail,
};

const allModules = [welding, plumbing, electrician, tiling, wallpaper, hvac, forklift, waterproof, painting, careWorker, beautyNail];

// 전체 통합 데이터
export const allAcademies: Academy[] = allModules.flatMap(m => m.academies);
export const allCourses: Course[] = allModules.flatMap(m => m.courses);
export const allReviews: Review[] = allModules.flatMap(m => m.reviews);

// 유틸리티 함수
export function getAcademiesByCategory(categoryId: string): Academy[] {
  return dataByCategory[categoryId]?.academies ?? [];
}

export function getCoursesByAcademy(academyId: string): Course[] {
  return allCourses.filter(c => c.academyId === academyId);
}

export function getReviewsByAcademy(academyId: string): Review[] {
  return allReviews.filter(r => r.academyId === academyId);
}

export function getAcademyById(id: string): Academy | undefined {
  return allAcademies.find(a => a.id === id);
}

export function getTopAcademies(count: number = 5): Academy[] {
  return [...allAcademies].sort((a, b) => b.avgRating - a.avgRating).slice(0, count);
}

export function getGovernmentFundedAcademies(): Academy[] {
  return allAcademies.filter(a => a.isGovernmentFunded);
}
