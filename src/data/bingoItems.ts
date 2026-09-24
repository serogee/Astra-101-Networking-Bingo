import {
  Code, GraduationCap, CalendarRange, ImagePlus, Moon,
  PawPrint, GitBranchPlus, MessageCircle, BrainCircuit, Palette,
  Zap, Users, Star, Trophy, Search,
  BookOpen, Lightbulb, Coffee, CalendarCheck, UserX,
  Bug, User, Contact, Briefcase, Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface BingoItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** The 24 playable traits. Order here is the canonical catalogue order. */
export const BINGO_ITEMS: BingoItem[] = [
  { id: 'side-project',    label: 'Has a side project',         icon: Code },
  { id: 'another-course',  label: 'From another course',        icon: GraduationCap },
  { id: 'another-year',    label: 'From another year',          icon: CalendarRange },
  { id: 'ai-image-tool',   label: 'Tried an AI image tool',     icon: ImagePlus },
  { id: 'night-owl',       label: 'Night owl',                  icon: Moon },
  { id: 'pet',             label: 'Has a pet',                  icon: PawPrint },
  { id: 'github',          label: 'Has GitHub',                 icon: GitBranchPlus },
  { id: 'chatgpt',         label: 'Has used ChatGPT',           icon: MessageCircle },
  { id: 'ai-study',        label: 'Uses AI to study',           icon: BrainCircuit },
  { id: 'creative-hobby',  label: 'Has a creative hobby',       icon: Palette },
  { id: 'vibecoding',      label: 'Has tried vibecoding',       icon: Zap },
  { id: 'astra-followers', label: 'Follows ASTRA Developers',   icon: Users },
  { id: 'hackathon',       label: 'Has joined a hackathon',     icon: Trophy },
  { id: 'ai-research',     label: 'Uses AI for research',       icon: Search },
  { id: 'cram',            label: 'Loves to cram',              icon: BookOpen },
  { id: 'idea-to-build',   label: 'Has an idea to build',       icon: Lightbulb },
  { id: 'coffee',          label: 'Loves coffee',               icon: Coffee },
  { id: 'ai-event',        label: 'Has attended an AI event',   icon: CalendarCheck },
  { id: 'knows-nobody',    label: 'Came here knowing nobody',   icon: UserX },
  { id: 'debug-ai',        label: 'Has debugged with AI',       icon: Bug },
  { id: 'only-child',      label: 'Is an only child',           icon: User },
  { id: 'linkedin',        label: 'Has LinkedIn',               icon: Contact },
  { id: 'business-idea',   label: 'Has a business idea',        icon: Briefcase },
  { id: 'fav-ai-tool',     label: 'Has a favorite AI tool',     icon: Sparkles },
];

/** FREE SPACE metadata (not part of the shuffleable catalogue). */
export const FREE_SPACE: BingoItem = {
  id: 'free',
  label: 'FREE SPACE',
  icon: Star,
};

/** Set of all valid trait IDs for fast lookup. */
export const VALID_TRAIT_IDS = new Set(BINGO_ITEMS.map((item) => item.id));

/** Lookup a BingoItem by its ID (includes FREE SPACE). */
export function getItemById(id: string): BingoItem | undefined {
  if (id === 'free') return FREE_SPACE;
  return BINGO_ITEMS.find((item) => item.id === id);
}

/** The centre tile index in a 5×5 grid. */
export const FREE_SPACE_INDEX = 12;
