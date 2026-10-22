import React, { Suspense, lazy, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container } from "../ui/Container";
import { NAV_LINKS, TOP_LINKS } from "../../constants";
import { useAuth } from "../../src/context/AuthContext";
import { usePublicContent } from "../../src/context/PublicContentContext";
import type { Notification } from "../../src/api/notificationApi";

const BellIcon = ({ className }: { className?: string }) => (
  <img src="/notifications.svg" alt="알림" className={className} decoding="async" />
);

const MenuIcon = ({ className }: { className?: string }) => (
  <img src="/menu.svg" alt="메뉴" className={className} decoding="async" />
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <img src="/person.svg" alt="프로필" className={className} decoding="async" />
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const FullMenu = lazy(() =>
  import("./FullMenu").then((module) => ({ default: module.FullMenu })),
);

let notificationApiPromise: Promise<typeof import("../../src/api/notificationApi")> | null = null;

const loadNotificationApi = () => {
  if (!notificationApiPromise) {
    notificationApiPromise = import("../../src/api/notificationApi");
  }

  return notificationApiPromise;
};

const NotificationDropdown = ({
  notifications,
  unreadCount,
  loading,
  onOpen,
  onMarkAllRead,
  onNotificationClick,
  isTransparent = false,
}: {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onOpen: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (n: Notification) => void;
  isTransparent?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);

    if (next) {
      onOpen();
    }
  };

  return (
    <div className="relative z-50">
      <button
        className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center transition-colors rounded-full hover:bg-slate-100 hover:text-[#39B54A] hover:[&>img]:brightness-100 hover:[&>img]:invert-0 ${isOpen ? "text-[#39B54A] bg-green-50" : isTransparent ? "text-white" : "text-slate-500"}`}
        onClick={toggleOpen}
      >
        <BellIcon className={`w-6 h-6 md:w-7 md:h-7 opacity-80 transition-all duration-300 ${isTransparent && !isOpen ? "brightness-0 invert" : ""}`} />
        {/* Badge - Only show if unreadCount > 0 */}
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#39B54A] rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between p-3 border-b border-gray-50 bg-gray-50/50">
              <span className="font-bold text-gray-900 text-sm">알림</span>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-gray-400 hover:text-[#39B54A]"
                >
                  모두 읽음
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="py-8 flex items-center justify-center text-gray-400 text-xs">
                  <SearchIcon className="w-4 h-4 mr-2" />
                  불러오는 중...
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {notifications.map((noti) => (
                    <button
                      key={noti.id}
                      onClick={() => {
                        onNotificationClick(noti);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors flex gap-3 ${!noti.is_read ? "bg-green-50/40" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!noti.is_read ? "bg-[#39B54A]" : "bg-gray-200"}`}
                      />
                      <div>
                        <p
                          className={`text-sm ${!noti.is_read ? "font-bold text-gray-900" : "text-gray-600"}`}
                        >
                          {noti.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {noti.message}
                        </p>
                        <p className="text-[10px] text-gray-300 mt-1">
                          {new Date(noti.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs">
                  새로운 알림이 없습니다.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { navMenuItems: rawNavMenuItems } = usePublicContent();
  const navMenuItems = rawNavMenuItems.filter(item => item.slug !== '/alliance' && item.title !== 'MICE 회원사');
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastY = React.useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      
      // isScrolled 업데이트
      const hero = document.querySelector('.hero-section-for-header');
      if (hero && location.pathname === '/') {
        const rect = hero.getBoundingClientRect();
        setIsScrolled(rect.bottom < 80);
      } else {
        setIsScrolled(currentY > 50);
      }

      // 스크롤 방향 감지 (의도치 않은 렌더링에 의한 초기화 방지를 위해 useRef 사용)
      if (currentY > lastY.current && currentY > 30 && !showDesktopMenu && !showMobileMenu && !showUserMenu) {
        setIsHidden(true);
      } else if (currentY < lastY.current || currentY <= 30) {
        setIsHidden(false);
      }
      
      lastY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, showDesktopMenu, showMobileMenu, showUserMenu]);

  const isMainPage = location.pathname === '/';
  const isTransparent = isMainPage && !isScrolled && !showDesktopMenu && !showMobileMenu && !showUserMenu;

  // Fetch notifications
  useEffect(() => {
    let isMounted = true;
    let idleHandle: number | null = null;
    let fallbackTimer: ReturnType<typeof window.setTimeout> | null = null;

    if (user) {
      const fetchUnreadCount = async () => {
        const { getUnreadCount } = await loadNotificationApi();
        const count = await getUnreadCount(user.uid);
        if (isMounted) {
          setUnreadCount(count);
        }
      };

      const scheduleUnreadCountFetch = () => {
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          idleHandle = window.requestIdleCallback(() => {
            void fetchUnreadCount();
          }, { timeout: 2000 });
          return;
        }

        fallbackTimer = window.setTimeout(() => {
          void fetchUnreadCount();
        }, 800);
      };

      scheduleUnreadCountFetch();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      isMounted = false;
      if (idleHandle !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, [user]);

  const loadNotificationList = async () => {
    if (!user) return;

    setLoadingNotifications(true);
    try {
      const { getNotifications } = await loadNotificationApi();
      const data = await getNotifications(user.uid);
      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.is_read).length);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = async (noti: Notification) => {
    if (!noti.is_read) {
      const { markAsRead } = await loadNotificationApi();
      await markAsRead(noti.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (noti.link_url) {
      window.location.href = noti.link_url;
    }
  };

  const handleMarkAllRead = async () => {
    if (user) {
      const { markAllAsRead } = await loadNotificationApi();
      await markAllAsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const secondaryNavItems = [
    // { to: '/alliance', label: 'MICE 회원사', active: location.pathname === '/alliance' },
    { to: '/cases', label: '레퍼런스', active: location.pathname === '/cases' },
    { to: '/notices', label: '공지사항', active: location.pathname === '/notices' },
  ];

  return (
    <header
      className={`w-full z-[100] transition-all duration-500 ease-in-out ${
        isMainPage
          ? `fixed left-0 right-0 ${!isTransparent ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent border-transparent"}`
          : "sticky left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
      } ${isHidden ? "-top-32 opacity-0" : "top-0 opacity-100"}`}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20 gap-4 md:gap-8 relative">
           {/* LOGO */}
           <a href="/" className="flex-shrink-0 flex items-center gap-2">
             <img src="/Miceday_Logo.png" alt="행사어때" className={`h-[24px] md:h-[28px] object-contain transition-all duration-300 ${isTransparent ? "brightness-0 invert" : ""}`} />
             <span className={`text-[0.75rem] font-bold mt-1 tracking-widest hidden lg:block transition-colors duration-300 ${isTransparent ? "text-white/60" : "text-gray-400"}`}>| MICE 행사 통합운영 플랫폼</span>
           </a>

           {/* CENTER NAVIGATION (Desktop Only) */}
           <nav className="hidden md:flex items-center justify-center h-full gap-1 lg:gap-4 flex-1 xl:flex-none xl:absolute xl:left-1/2 xl:-translate-x-1/2">
             <div 
               className="h-full flex items-center"
               onMouseEnter={() => setShowDesktopMenu(true)}
               onMouseLeave={() => setShowDesktopMenu(false)}
             >
                <button
                    onClick={() => navigate("/products")}
                    className={`font-bold text-[14px] lg:text-[15px] whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 px-2 lg:px-3 py-2 ${showDesktopMenu ? "text-[#39B54A] underline underline-offset-8 decoration-2" : isTransparent ? "text-white/90 hover:text-white hover:underline hover:underline-offset-8 hover:decoration-2" : "text-slate-700 hover:text-[#39B54A] hover:underline hover:underline-offset-8 hover:decoration-2"}`}
                >
                   <MenuIcon className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-300 ${showDesktopMenu ? "filter-green" : isTransparent ? "brightness-0 invert opacity-90" : "opacity-70"}`} /> 전체 서비스
                </button>
             </div>
             
             {secondaryNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-2 lg:px-4 py-2 text-[14px] lg:text-[15px] font-bold whitespace-nowrap transition-all duration-300 ${
                    item.active
                      ? (isTransparent ? 'text-white underline underline-offset-8 decoration-2' : 'text-[#39B54A] underline underline-offset-8 decoration-2')
                      : (isTransparent ? 'text-white/80 hover:text-white hover:underline hover:underline-offset-8 hover:decoration-2' : 'text-slate-600 hover:text-[#39B54A] hover:underline hover:underline-offset-8 hover:decoration-2')
                  }`}
                >
                  {item.label}
                </Link>
             ))}
           </nav>

           {/* RIGHT ACTIONS */}
           <div className="flex items-center gap-1 sm:gap-2 justify-end">


              {/* Notification */}
              <div className={`relative z-[60] ${isTransparent ? "hover:[&_button]:brightness-100 hover:[&_button]:invert-0" : ""}`}>
                 <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    loading={loadingNotifications}
                    onOpen={loadNotificationList}
                    onMarkAllRead={handleMarkAllRead}
                    onNotificationClick={handleNotificationClick}
                    isTransparent={isTransparent}
                 />
              </div>

              {/* User Profile / Menu */}
              <div className="relative z-[60]" onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
                 <Link
                   to={user ? "/mypage" : "/login"}
                   className={`hidden md:flex w-10 h-10 items-center justify-center transition-colors rounded-full ${isTransparent ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}`}
                 >
                   <ProfileIcon className={`w-5 h-5 transition-all duration-300 ${isTransparent ? "brightness-0 invert" : ""}`} />
                 </Link>
                 
                 {/* Desktop User Dropdown */}
                 <div className={`absolute right-0 top-full pt-2 w-48 hidden md:block transition-all duration-200 origin-top-right ${showUserMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                        {user ? (
                           <div className="py-2">
                              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                 <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || user.email}님</p>
                                 <p className="text-[11px] text-gray-500 mt-0.5">환영합니다</p>
                              </div>
                              <Link to="/mypage" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#39B54A] font-medium transition-colors">마이페이지</Link>
                              <Link to="/cs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#39B54A] font-medium transition-colors">고객센터</Link>
                              <div className="border-t border-gray-50 my-1"></div>
                              <button onClick={logout} className="w-full text-left block px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors">로그아웃</button>
                           </div>
                        ) : (
                           <div className="py-2">
                              <Link to="/login" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#39B54A] font-medium transition-colors">로그인</Link>
                              <Link to="/signup" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#39B54A] font-medium transition-colors">회원가입</Link>
                              <div className="border-t border-gray-50 my-1"></div>
                              <Link to="/cs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#39B54A] font-medium transition-colors">고객센터</Link>
                           </div>
                        )}
                    </div>
                 </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                 className={`md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}`}
                 onClick={() => setShowMobileMenu(true)}
              >
                 <MenuIcon className={`w-6 h-6 transition-all duration-300 ${isTransparent ? "brightness-0 invert" : ""}`} />
              </button>
           </div>
        </div>
      </Container>
      
      {/* Desktop Mega Menu Dropdown */}
      <div
        className={`
          absolute top-full left-0 w-full z-50 transition-all duration-300 ease-in-out origin-top block
          ${showDesktopMenu ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible pointer-events-none"}
        `}
        onMouseEnter={() => setShowDesktopMenu(true)}
        onMouseLeave={() => setShowDesktopMenu(false)}
      >
        <Suspense fallback={null}>
          <FullMenu
            variant="desktop"
            items={navMenuItems}
            onClose={() => setShowDesktopMenu(false)}
          />
        </Suspense>
      </div>

      {/* Mobile Full Menu Overlay */}
      {showMobileMenu && (
        <Suspense fallback={null}>
          <FullMenu
            variant="mobile"
            items={navMenuItems}
            onClose={() => setShowMobileMenu(false)}
          />
        </Suspense>
      )}
    </header>
  );
};
