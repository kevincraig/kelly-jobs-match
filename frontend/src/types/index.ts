export interface User {
  userId: string;
  username: string;
  signInDetails?: {
    loginId: string;
    authFlowType: string;
  };
  attributes?: {
    email?: string;
    email_verified?: boolean;
    sub?: string;
  };
}

export interface Skill {
  id: string;
  name: string;
  level: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface UserPreferences {
  jobTypes: string[];
  locations: string[];
  remote: boolean;
  minSalary: number;
  maxSalary: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  jobType: string;
  remote: boolean;
  requiredSkills: Skill[];
  distance?: number;
  matchData?: {
    score: number;
    matchedSkills: Skill[];
    missingSkills: Skill[];
  };
  postedDate: string;
  applyUrl: string;
  url: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface SearchFilters {
  keywords: string;
  jobType: string;
  remote: boolean;
  useMySkills: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface HeaderProps {
  currentView: 'profile' | 'jobs';
  setCurrentView: (view: 'profile' | 'jobs') => void;
  user: User | null;
  onLogout: () => void;
}

export interface JobDetailProps {
  job: Job;
  onClose: () => void;
  onApply: (jobId: string) => void;
}

export interface LoginFormProps {
  onLogin: (response: AuthResponse) => Promise<void>;
}

export interface SkillsModalProps {
  onClose: () => void;
  onSave: (skills: Skill[]) => void;
} 