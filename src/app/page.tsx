'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import HomeTab from '@/components/tabs/HomeTab';
import SearchTab from '@/components/tabs/SearchTab';
import RankingTab from '@/components/tabs/RankingTab';
import ReviewTab from '@/components/tabs/ReviewTab';
import MyTab from '@/components/tabs/MyTab';
import SearchOverlay from '@/components/SearchOverlay';
import SplashScreen from '@/components/SplashScreen';

function MainPageContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const urlCategory = searchParams.get('category');
  const urlRegion = searchParams.get('region');

  const [showSplash, setShowSplash] = useState(!urlTab);
  const [appReady, setAppReady] = useState(!!urlTab);
  const [activeTab, setActiveTab] = useState(urlTab || 'home');
  const [searchCategory, setSearchCategory] = useState(urlCategory || '');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabKey, setTabKey] = useState(0);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    setAppReady(true);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setTabKey((k) => k + 1);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSearchCategory(categoryId);
    setSearchQuery('');
    setShowSearch(false);
    setActiveTab('search');
    setTabKey((k) => k + 1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchCategory('');
    setShowSearch(false);
    setActiveTab('search');
    setTabKey((k) => k + 1);
  };

  const handleAcademySelect = (academyId: string) => {
    window.location.href = `/academy/${academyId}`;
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <div className={`app-shell ${appReady ? 'app-shell-enter' : ''}`}>
        {activeTab !== 'my' && <Header />}

        <main>
          <div key={tabKey} className="tab-content">
            {activeTab === 'home' && (
              <HomeTab
                onCategorySelect={handleCategorySelect}
                onAcademySelect={handleAcademySelect}
                onSearchOpen={() => setShowSearch(true)}
                onTabChange={handleTabChange}
              />
            )}
            {activeTab === 'search' && (
              <SearchTab
                onAcademySelect={handleAcademySelect}
                initialCategory={searchCategory}
                initialQuery={searchQuery}
                initialRegion={urlRegion || undefined}
              />
            )}
            {activeTab === 'ranking' && (
              <RankingTab onAcademySelect={handleAcademySelect} />
            )}
            {activeTab === 'review' && <ReviewTab />}
            {activeTab === 'my' && <MyTab />}
          </div>
        </main>

        {showSearch && (
          <SearchOverlay
            onClose={() => setShowSearch(false)}
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}

export default function MainPage() {
  return (
    <Suspense>
      <MainPageContent />
    </Suspense>
  );
}
