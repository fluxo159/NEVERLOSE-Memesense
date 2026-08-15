import { useState, useMemo, useEffect } from 'react';
import { YouthProfile } from '../types';

export function useYouthFilters(
  youthList: YouthProfile[], 
  initialMakhalla: string, 
  initialFilterStatus?: string,
  onMakhallaChange?: (makhalla: string) => void
) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus || 'all');
  const [makhallaFilter, setMakhallaFilterState] = useState<string>(initialMakhalla !== 'all' ? initialMakhalla : 'all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [neetOnly, setNeetOnly] = useState<boolean>(false);

  useEffect(() => {
    setMakhallaFilterState(initialMakhalla !== 'all' ? initialMakhalla : 'all');
  }, [initialMakhalla]);

  const setMakhallaFilter = (val: string) => {
    setMakhallaFilterState(val);
    if (onMakhallaChange) {
      onMakhallaChange(val);
    }
  };

  const filteredYouth = useMemo(() => {
    return youthList.filter(youth => {
      if (makhallaFilter !== 'all' && youth.makhalla !== makhallaFilter) return false;

      if (statusFilter !== 'all') {
        if (statusFilter === 'neet_pending') {
          if (!youth.is_neet || youth.neet_verification !== 'pending_verification') return false;
        } else if (statusFilter === 'supported') {
          if (!youth.assigned_program && youth.employment_status !== 'направлен на обучение') return false;
        } else if (youth.employment_status !== statusFilter) {
          return false;
        }
      }

      if (neetOnly && !youth.is_neet) return false;
      if (genderFilter !== 'all' && youth.gender !== genderFilter) return false;

      if (ageFilter === '18-21' && (youth.age < 18 || youth.age > 21)) return false;
      if (ageFilter === '22-25' && (youth.age < 22 || youth.age > 25)) return false;
      if (ageFilter === '26-30' && (youth.age < 26 || youth.age > 30)) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          youth.full_name_demo.toLowerCase().includes(q) ||
          youth.makhalla.toLowerCase().includes(q) ||
          youth.activity_type.toLowerCase().includes(q) ||
          (youth.specialty && youth.specialty.toLowerCase().includes(q)) ||
          youth.skills.some(s => s.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [youthList, makhallaFilter, statusFilter, neetOnly, genderFilter, ageFilter, searchQuery]);

  const resetFilters = () => {
    setStatusFilter('all');
    setMakhallaFilter('all');
    setAgeFilter('all');
    setGenderFilter('all');
    setNeetOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || makhallaFilter !== 'all' || ageFilter !== 'all' || genderFilter !== 'all' || neetOnly || searchQuery !== '';

  return {
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    makhallaFilter, setMakhallaFilter,
    genderFilter, setGenderFilter,
    ageFilter, setAgeFilter,
    neetOnly, setNeetOnly,
    filteredYouth,
    resetFilters,
    hasActiveFilters
  };
}
