import React, { useState, useEffect } from 'react';
import { LANGUAGES } from '../constants';
import { UserProgress, CategoryProgress } from '../types';

interface SidebarProps {
  onLanguageSelect: (langKey: string) => void;
  onBackToLanguageSelect: () => void;
  selectedLanguage: string | null;
  onModuleSelect: (moduleId: number, moduleTitle: string) => void;
  activeModule: number | null;
  userProgress: UserProgress;
  isLoading: boolean;
  xpPerLevel: number;
  maxLevel: number;
}

const ProgressBar: React.FC<{xp: number, xpPerLevel: number, level: number, maxLevel: number}> = ({ xp, xpPerLevel, level, maxLevel }) => {
    const isMaxLevel = level >= maxLevel;
    const progressPercent = isMaxLevel ? 100 : (xp / xpPerLevel) * 100;

    return (
        <div className="w-full mt-1.5">
            <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
                <span className="font-bold">Stufe {level}</span>
                {!isMaxLevel && <span>{xp} / {xpPerLevel} XP</span>}
            </div>
            <div className="w-full bg-gray-900/50 rounded-full h-1.5">
                <div 
                    className={`h-1.5 rounded-full ${isMaxLevel ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${progressPercent}%`, transition: 'width 0.5s ease-in-out' }}
                ></div>
            </div>
        </div>
    );
};

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-2V5a3 3 0 00-3-3zm-1 4V5a1 1 0 112 0v1H9z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const CurrentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 10a.5.5 0 01.5-.5h2.75a.5.5 0 010 1H6a.5.5 0 01-.5-.5zM10.5 6a.5.5 0 01.5.5v2.75a.5.5 0 01-1 0V6.5a.5.5 0 01.5-.5zM14 10a.5.5 0 01-.5.5h-2.75a.5.5 0 010-1H13.5a.5.5 0 01.5.5z" />
    </svg>
)

const UpcomingIcon = () => (
    <div className="h-5 w-5 flex items-center justify-center">
        <div className="h-3 w-3 rounded-full border-2 border-gray-500 group-hover:border-emerald-500 transition-colors"></div>
    </div>
)

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ 
    onLanguageSelect,
    onBackToLanguageSelect,
    selectedLanguage,
    onModuleSelect, 
    activeModule, 
    userProgress, 
    isLoading,
    xpPerLevel,
    maxLevel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedLanguage]);

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onBackToLanguageSelect();
    }
  };
  
  const renderLanguages = () => (
    <div className="animate-fade-in">
        <h3 className="p-2 pt-0 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sprache Wählen</h3>
        <ul>
            {Object.entries(LANGUAGES).map(([key, lang]) => (
                <li key={key} className="mb-2">
                    <button
                        onClick={() => onLanguageSelect(key)}
                        disabled={isLoading || !lang.enabled}
                        className="w-full flex items-center p-3 rounded-md text-sm font-semibold text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <span className="uppercase tracking-wider">{lang.name}</span>
                        {!lang.enabled && <span className="ml-auto text-xs text-gray-500">(Bald verfügbar)</span>}
                    </button>
                </li>
            ))}
        </ul>
    </div>
  );
  
  const renderCategories = () => {
    if (!selectedLanguage) return null;
    const langConfig = LANGUAGES[selectedLanguage as keyof typeof LANGUAGES];
    const langProgress = userProgress[selectedLanguage];
    if (!langProgress) return null;
    
    let previousCategoryLevel = maxLevel;

    return (
        <div className="animate-fade-in">
            <button
                onClick={handleBack}
                className="w-full flex items-center gap-2 p-2 mb-3 rounded-md text-sm font-bold text-gray-300 hover:bg-gray-700/50 transition-colors"
            >
                <BackIcon />
                <span>Alle Sprachen</span>
            </button>
            <h3 className="p-2 pt-0 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{langConfig.name} Lehrplan</h3>
            <ul>
                {langConfig.categories.map((categoryData) => {
                    const categoryProgress = (langProgress[categoryData.category] as CategoryProgress) || { level: 1, xp: 0 };
                    const isLocked = previousCategoryLevel < maxLevel;
                    const { level, xp } = categoryProgress;
                    previousCategoryLevel = level;

                    return (
                      <li key={categoryData.category} className="mb-2">
                          <button
                              onClick={() => !isLocked && setSelectedCategory(categoryData.category)}
                              disabled={isLoading || isLocked}
                              className="w-full flex flex-col items-start p-3 rounded-md text-sm font-semibold text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                              <div className="flex justify-between items-center w-full">
                                <span className="uppercase tracking-wider">{categoryData.category}</span>
                                {isLocked && <LockIcon />}
                              </div>
                              <ProgressBar xp={xp} xpPerLevel={xpPerLevel} level={level} maxLevel={maxLevel} />
                          </button>
                      </li>
                    );
                })}
            </ul>
        </div>
    );
  };

  const renderModules = () => {
    if (!selectedLanguage || !selectedCategory) return null;
    const langConfig = LANGUAGES[selectedLanguage as keyof typeof LANGUAGES];
    const categoryData = langConfig.categories.find(cat => cat.category === selectedCategory);
    if (!categoryData) return null;
    const completedModules = new Set(userProgress[selectedLanguage]?.completedModules || []);

    return (
        <div className="animate-fade-in">
            <button
                onClick={handleBack}
                className="w-full flex items-center gap-2 p-2 mb-3 rounded-md text-sm font-bold text-gray-300 hover:bg-gray-700/50 transition-colors"
            >
                <BackIcon />
                <span>Alle {langConfig.name} Lektionen</span>
            </button>
            <h3 className="p-2 text-md font-bold text-emerald-400 uppercase tracking-wider mb-2">{categoryData.category}</h3>
            <ul>
                {categoryData.modules.map((module) => (
                    <li key={module.id} className="mb-1">
                        <button
                            onClick={() => onModuleSelect(module.id, module.title)}
                            disabled={isLoading}
                            className={`w-full text-left p-2.5 rounded-md text-sm transition-all duration-200 flex items-center group ${
                                activeModule === module.id
                                    ? 'bg-blue-500/20'
                                    : 'text-gray-200 hover:bg-blue-500/10'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            <div className="w-8 flex-shrink-0 flex items-center justify-center">
                                {completedModules.has(module.id) ? (
                                    <CheckIcon />
                                ) : activeModule === module.id ? (
                                    <CurrentIcon />
                                ) : (
                                    <UpcomingIcon />
                                )}
                            </div>
                            <span className={`${activeModule === module.id ? 'font-bold text-emerald-400' : ''}`}>{module.title}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
  };

  const getFooterText = () => {
    if (!selectedLanguage) return "Wähle eine Sprache.";
    if (!selectedCategory) return "Wähle eine Kategorie.";
    return "Wähle eine Lektion.";
  }

  return (
    <aside className="w-full h-full bg-gray-800 p-2 flex flex-col flex-shrink-0 border-r border-gray-700">
      <h2 
        className="text-lg font-bold p-3 mb-2 text-center text-emerald-400 tracking-wider"
        style={{ textShadow: '0 0 12px rgba(0, 200, 83, 0.5)' }}
      >
        LEKTIONEN
      </h2>
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <nav>
          {!selectedLanguage
            ? renderLanguages()
            : selectedCategory
            ? renderModules()
            : renderCategories()
          }
        </nav>
      </div>
      <div className="mt-2 p-2 text-center text-xs text-gray-500">
        {getFooterText()}
      </div>
    </aside>
  );
};

export default Sidebar;