import { LANGUAGES as LanguageData } from './language-config';

// Define the type for a single language configuration
interface Language {
  name: string;
  prismLang: string;
  systemPrompt: string;
  initialPrompt: string;
  enabled: boolean;
  categories: {
    category: string;
    modules: {
      id: number;
      title: string;
      focus: string;
    }[];
  }[];
}

// Define the type for the entire LANGUAGES object
export interface LANGUAGES {
  [key: string]: Language;
}

export const LANGUAGES: LANGUAGES = LanguageData;
