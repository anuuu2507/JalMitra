import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Community, WaterTank, DashboardData, Alert } from '../types';
import { fetchCommunities, fetchTanks, fetchDashboard } from '../api';
import { translations, TranslationStrings } from '../translations';

interface Toast {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  language: 'en' | 'te';
  setLanguage: (lang: 'en' | 'te') => void;
  t: TranslationStrings;
  communities: Community[];
  tanks: WaterTank[];
  selectedTankId: number;
  setSelectedTankId: (id: number) => void;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  isPhoneSimOpen: boolean;
  setIsPhoneSimOpen: (open: boolean) => void;
  phonePreviewAlert: Alert | null;
  openPhonePreview: (alert: Alert) => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'te'>('en');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [tanks, setTanks] = useState<WaterTank[]>([]);
  const [selectedTankId, setSelectedTankId] = useState<number>(1);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isPhoneSimOpen, setIsPhoneSimOpen] = useState<boolean>(false);
  const [phonePreviewAlert, setPhonePreviewAlert] = useState<Alert | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const t = translations[language];

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const setLanguage = (lang: 'en' | 'te') => {
    setLanguageState(lang);
    localStorage.setItem('jalmitra_lang', lang);
  };

  const updateDashboardState = (data: DashboardData) => {
    setDashboardData(data);
    try {
      localStorage.setItem('jalmitra_dashboard_data', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not cache dashboard data to localStorage:', e);
    }
  };

  const refreshData = async () => {
    try {
      const data = await fetchDashboard(selectedTankId);
      updateDashboardState(data);
      const allTanks = await fetchTanks();
      setTanks(allTanks);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const openPhonePreview = (alert: Alert) => {
    setPhonePreviewAlert(alert);
    setIsPhoneSimOpen(true);
  };

  // Initial load
  useEffect(() => {
    const savedLang = localStorage.getItem('jalmitra_lang') as 'en' | 'te' | null;
    if (savedLang) setLanguageState(savedLang);

    // Fast hydration from cache
    const cachedData = localStorage.getItem('jalmitra_dashboard_data');
    if (cachedData) {
      try {
        setDashboardData(JSON.parse(cachedData));
      } catch (e) {}
    }

    const init = async () => {
      setIsLoading(true);
      try {
        const comms = await fetchCommunities();
        setCommunities(comms);
        const tnks = await fetchTanks();
        setTanks(tnks);
        if (tnks.length > 0) {
          setSelectedTankId(tnks[0].id);
          const dash = await fetchDashboard(tnks[0].id);
          updateDashboardState(dash);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        showToast('Unable to connect to JalMitra Backend. Please check if Python server is running.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Update when tank selection changes
  useEffect(() => {
    if (selectedTankId) {
      fetchDashboard(selectedTankId)
        .then((data) => updateDashboardState(data))
        .catch((err) => console.error('Error fetching tank data:', err));
    }
  }, [selectedTankId]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        communities,
        tanks,
        selectedTankId,
        setSelectedTankId,
        dashboardData,
        isLoading,
        refreshData,
        isDemoModalOpen,
        setIsDemoModalOpen,
        isPhoneSimOpen,
        setIsPhoneSimOpen,
        phonePreviewAlert,
        openPhonePreview,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
