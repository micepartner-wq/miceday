const fs = require('fs');

const filePath = 'c:/Users/USER/Desktop/Miceday/components/Layout/Header.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const newStateLogic = `  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Removed showNotifications state as it is now inside NotificationDropdown
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector('.hero-section-for-header');
      if (hero && location.pathname === '/') {
        const rect = hero.getBoundingClientRect();
        setIsScrolled(rect.bottom < 80);
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const isMainPage = location.pathname === '/';
  const isTransparent = isMainPage && !isScrolled && !showDesktopMenu && !showMobileMenu && !showUserMenu;`;

content = content.replace(
  /  const \[showDesktopMenu, setShowDesktopMenu\] = useState\(false\);[\s\S]*?const isTransparent = isMainPage && !isScrolled && !showDesktopMenu && !showMobileMenu;/,
  newStateLogic
);

const newReturnJsx = `  return (
    <header
      className={\`w-full z-[100] transition-all duration-300 \${
        isMainPage
          ? \`fixed top-0 left-0 right-0 \${!isTransparent ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent border-transparent"}\`
          : "sticky top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
      }\`}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20 gap-4 md:gap-8">
           {/* LOGO */}
           <a href="/" className="flex-shrink-0 flex items-center gap-2">
             <img src="/Miceday_Logo.png" alt="행사어때" className={\`h-[24px] md:h-[28px] object-contain transition-all duration-300 \${isTransparent ? "brightness-0 invert" : ""}\`} />
             <span className={\`text-[0.75rem] font-bold mt-1 tracking-widest hidden lg:block transition-colors duration-300 \${isTransparent ? "text-white/60" : "text-gray-400"}\`}>| B2B MICE</span>
           </a>

           {/* CENTER NAVIGATION (Desktop Only) */}
           <nav className="hidden md:flex items-center h-full gap-2 lg:gap-4 flex-1 justify-center">
             <div 
               className="h-full flex items-center"
               onMouseEnter={() => setShowDesktopMenu(true)}
               onMouseLeave={() => setShowDesktopMenu(false)}
             >
                <button
                    onClick={() => navigate("/products")}
                    className={\`font-bold text-[15px] transition-colors duration-300 flex items-center gap-1.5 px-3 py-2 rounded-full \${showDesktopMenu ? "text-[#39B54A] bg-[#39B54A]/5" : isTransparent ? "text-white/90 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-[#39B54A] hover:bg-slate-50"}\`}
                >
                   <MenuIcon className={\`w-5 h-5 transition-all duration-300 \${showDesktopMenu ? "filter-green" : isTransparent ? "brightness-0 invert opacity-90" : "opacity-70"}\`} /> 전체 서비스
                </button>
             </div>
             
             {secondaryNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={\`px-4 py-2 text-[15px] font-bold transition-colors duration-300 rounded-full \${
                    item.active
                      ? (isTransparent ? 'text-white bg-white/10' : 'text-[#39B54A] bg-[#39B54A]/5')
                      : (isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-[#39B54A] hover:bg-slate-50')
                  }\`}
                >
                  {item.label}
                </Link>
             ))}
           </nav>

           {/* RIGHT ACTIONS */}
           <div className="flex items-center gap-1 sm:gap-2 justify-end">
              {/* Sleek Search */}
              <div className="flex relative group max-w-[140px] sm:max-w-[180px] lg:max-w-[220px]">
                  <input
                    type="text"
                    placeholder="무엇을 도와드릴까요?"
                    className={\`w-full h-9 md:h-10 pl-4 pr-10 rounded-full border text-[13px] md:text-[14px] transition-all duration-300 \${
                      isTransparent
                        ? "bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400"
                        : "bg-slate-50 border-transparent focus:border-slate-200 focus:bg-white text-slate-700 placeholder-slate-400"
                    }\`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        window.location.href = \`/search?q=\${encodeURIComponent(e.currentTarget.value)}\`;
                      }
                    }}
                  />
                  <SearchIcon className={\`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300 \${isTransparent ? "text-white/60" : "text-slate-400"}\`} />
              </div>

              {/* Notification */}
              <div className={\`relative z-[60] \${isTransparent ? "hover:[&_button]:brightness-100 hover:[&_button]:invert-0" : ""}\`}>
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
                   className={\`hidden md:flex w-10 h-10 items-center justify-center transition-colors rounded-full \${isTransparent ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}\`}
                 >
                   <ProfileIcon className={\`w-5 h-5 transition-all duration-300 \${isTransparent ? "brightness-0 invert" : ""}\`} />
                 </Link>
                 
                 {/* Desktop User Dropdown */}
                 <div className={\`absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden md:block transition-all duration-200 origin-top-right \${showUserMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}\`}>
                    {user ? (
                       <div className="py-2">
                          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                             <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || user.email}</p>
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

              {/* Mobile Menu Toggle */}
              <button
                 className={\`md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors \${isTransparent ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}\`}
                 onClick={() => setShowMobileMenu(true)}
              >
                 <MenuIcon className={\`w-6 h-6 transition-all duration-300 \${isTransparent ? "brightness-0 invert" : ""}\`} />
              </button>
           </div>
        </div>
      </Container>
      
      {/* Desktop Mega Menu Dropdown */}
      <div
        className={\`
          absolute top-full left-0 w-full z-50 transition-all duration-300 ease-in-out origin-top block
          \${showDesktopMenu ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible pointer-events-none"}
        \`}
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
  );`;

content = content.replace(
  /  return \([\s\S]*?<\/header>\n  \);/,
  newReturnJsx
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Success');
