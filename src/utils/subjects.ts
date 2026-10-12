import { SubjectConfig, SubjectType } from '../types';

export const STANDARD_SUBJECTS: SubjectConfig[] = [
  {
    name: 'Combined Mathematics',
    shortName: 'Maths',
    color: '#ef4444',
    borderColor: 'border-red-500/40',
    bgTint: 'bg-red-500/10',
    accentBg: 'bg-red-500',
  },
  {
    name: 'Physics',
    shortName: 'Physics',
    color: '#3b82f6',
    borderColor: 'border-blue-500/40',
    bgTint: 'bg-blue-500/10',
    accentBg: 'bg-blue-500',
  },
  {
    name: 'Chemistry',
    shortName: 'Chemistry',
    color: '#10b981',
    borderColor: 'border-emerald-500/40',
    bgTint: 'bg-emerald-500/10',
    accentBg: 'bg-emerald-500',
  },
];

export function getSubjectColor(subject: SubjectType): string {
  if (subject === 'Combined Mathematics') return '#ef4444';
  if (subject === 'Physics') return '#3b82f6';
  if (subject === 'Chemistry') return '#10b981';
  return '#a855f7'; // Purple fallback for any custom subjects
}

export function getSubjectShortName(subject: SubjectType): string {
  if (subject === 'Combined Mathematics') return 'Maths';
  if (subject === 'Physics') return 'Physics';
  if (subject === 'Chemistry') return 'Chemistry';
  return subject;
}
