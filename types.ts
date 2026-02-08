
export enum Language {
  EN = 'en',
  ES = 'es'
}

export enum ThemeType {
  MODERN = 'MODERN',
  DARK = 'DARK',
  MINIMAL = 'MINIMAL',
  CYBERPUNK = 'CYBERPUNK',
  SUNSET = 'SUNSET',
  RETRO = 'RETRO',
  FOREST = 'FOREST',
  MIDNIGHT = 'MIDNIGHT',
  VAPORWAVE = 'VAPORWAVE',
  NEO_GLASS = 'NEO_GLASS',
  DEEP_NAVY = 'DEEP_NAVY',
  ROSE_GOLD = 'ROSE_GOLD',
  NORDIC = 'NORDIC',
  SLATE_PROFESSIONAL = 'SLATE_PROFESSIONAL',
  // Nuevos temas tipo VS Code / IDEs
  VS_CODE_DARK = 'VS_CODE_DARK',
  VS_CODE_LIGHT = 'VS_CODE_LIGHT',
  GITHUB_DARK = 'GITHUB_DARK',
  GITHUB_LIGHT = 'GITHUB_LIGHT',
  MONOKAI = 'MONOKAI',
  DRACULA = 'DRACULA',
  ONE_DARK = 'ONE_DARK',
  SOLARIZED_LIGHT = 'SOLARIZED_LIGHT',
  SOLARIZED_DARK = 'SOLARIZED_DARK',
  PANDA_SYNTAX = 'PANDA_SYNTAX'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  email?: string;
  lastLogin?: string;
  createdAt?: string;
  password?: string;
}

export interface LocalizedString {
  en: string;
  es: string;
}

export interface Project {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  longDescription: LocalizedString;
  image: string;
  tags: string[];
  link?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: 'Frontend' | 'Backend' | 'Design' | 'Others';
}

export interface WorkExperience {
  id: string;
  role: LocalizedString;
  company: string;
  location: string;
  dates: string;
  description: LocalizedString;
}

export interface PortfolioData {
  name: string;
  role: LocalizedString;
  bio: LocalizedString;
  avatar: string;
  cvUrl?: string;
  email: string;
  github: string;
  linkedin: string;
  projects: Project[];
  skills: Skill[];
  workExperience: WorkExperience[];
  theme: ThemeType;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  role: UserRole | null;
}

export interface SystemHealth {
  api: 'online' | 'offline';
  database: 'online' | 'offline';
  gemini: 'configured' | 'missing';
  latency: number;
}
