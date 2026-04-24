'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const urlCategory = searchParams.get('category');
  const urlRegion = searchParams.get('region');
  const urlQuery = searchParams.get('q');

  // 스플래시: URL에 상태 있거나 세션에서 이미 본 경우 스킵 (뒤로가기 재진입 시 재노출 방지)
  const splashSeen = typeof window !== 'undefined' && !!sessionStorage.getItem('splashSeen');
  const skipSplash = !!urlTab || splashSeen;
  const [showSplash, setShowSplash] = useState(!skipSplash);
  const [appReady, setAppReady] = useState(skipSplash);
  const [activeTab, setActiveTab] = useState(urlTab || 'home');
  const [searchCategory, setSearchCategory] = useState(urlCategory || '');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(urlQuery || '');
  const [tabKey, setTabKey] = useState(0);

  // 상태 → URL 동기화 (뒤로가기로 복원 시 사용). home/빈 필터는 쿼리 생략.
  useEffect(() => {
    if (showSplash) return;
    const params = new URLSearchParams();
    if (activeTab !== 'home') params.set('tab', activeTab);
    if (searchCategory) params.set('category', searchCategory);
    if (searchQuery) params.set('q', searchQuery);
    if (urlRegion) params.set('region', urlRegion);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/?${qs}` : '/');
  }, [activeTab, searchCategory, searchQuery, urlRegion, showSplash]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    setAppReady(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('splashSeen', '1');
    }
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
    router.push(`/academy/${academyId}`);
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
