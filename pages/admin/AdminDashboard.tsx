import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Package, LayoutDashboard, ArrowUpRight, Layers, Users, LogOut, Menu, X, HelpCircle, MessageSquare, Images, Megaphone, Mail, GalleryHorizontalEnd, Map } from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';

const groups = [
    { title: '문의·고객', items: [
        { path: '/admin/bookings', label: '전체 문의 관리', icon: MessageSquare, desc: '견적·제휴 요청과 고객 문의를 한곳에서 확인합니다.' },
        { path: '/admin/users', label: '회원 관리', icon: Users, desc: '가입 회원 정보와 권한을 관리합니다.' },
    ] },
    { title: '메인 화면', items: [
        { path: '/admin/service-overview', label: '서비스 소개 이미지', icon: Images, desc: '공간·장비 / 비품·제작물 / 인력·운영 사진을 교체합니다.' },
        { path: '/admin/spacelist', label: '장소 갤러리', icon: Map, desc: '메인 화면의 장소 사진과 소개를 관리합니다.' },
        { path: '/admin/eventlist', label: '행사 갤러리', icon: GalleryHorizontalEnd, desc: '움직이는 행사 사진 목록을 관리합니다.' },
    ] },
    { title: '상품·콘텐츠', items: [
        { path: '/admin/products', label: '상품 관리', icon: Package, desc: '렌탈 상품의 사진, 설명, 가격을 관리합니다.' },
        { path: '/admin/sections', label: '상품 섹션 분류', icon: Layers, desc: '상품 편집에서 사용하는 섹션 분류를 관리합니다.' },
        { path: '/admin/cases', label: '현장 사례', icon: Images, desc: '실제 수행 사례와 메인 대표 사례를 관리합니다.' },
        { path: '/admin/notices', label: '공지사항', icon: Megaphone, desc: '고객에게 전달할 소식을 관리합니다.' },
        { path: '/admin/faqs', label: '자주 묻는 질문', icon: HelpCircle, desc: '고객센터의 질문과 답변을 관리합니다.' },
    ] },
    { title: '사이트 설정', items: [
        { path: '/admin/menus', label: '사이트 메뉴', icon: Menu, desc: '상단 메뉴와 상품 탐색 메뉴를 관리합니다.' },
        { path: '/admin/booking-email', label: '견적 메일 설정', icon: Mail, desc: '견적 알림 메일의 수신 설정을 관리합니다.' },
    ] },
];

export const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userProfile, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const isRoot = location.pathname.replace(/\/$/, '') === '/admin';
    const current = groups.flatMap(group => group.items).find(item => location.pathname === item.path);
    const handleLogout = async () => { if (confirm('로그아웃 하시겠습니까?')) { await logout(); navigate('/admin/login'); } };
    return <div className="min-h-screen bg-[#f5f7f5] text-slate-800">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-7">
            <div className="flex items-center gap-3"><button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label={menuOpen ? '관리 메뉴 닫기' : '관리 메뉴 열기'} aria-expanded={menuOpen} aria-controls="admin-navigation">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button><Link to="/admin" className="text-xl font-extrabold tracking-tight text-green-900">행사어때 <span className="ml-2 text-xs font-medium tracking-normal text-slate-400">관리자</span></Link></div>
            <div className="flex items-center gap-3 md:gap-5"><a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-600 sm:text-sm">사이트 보기 <ArrowUpRight size={15} /></a><span className="hidden text-sm text-slate-500 md:block">{userProfile?.name || '관리자'}</span><button onClick={handleLogout} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="로그아웃"><LogOut size={17} /></button></div>
        </header>
        <div className="flex">
            {menuOpen && <button aria-label="관리 메뉴 닫기" onClick={() => setMenuOpen(false)} className="fixed inset-0 top-16 z-10 bg-black/30 lg:hidden" />}
            <aside id="admin-navigation" className={`${menuOpen ? 'block' : 'hidden'} fixed bottom-0 top-16 z-20 w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-white lg:sticky lg:block lg:h-[calc(100vh-4rem)]`}>
                <nav className="space-y-6 p-4" aria-label="관리자 메뉴"><Link to="/admin" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${isRoot ? 'bg-green-50 text-green-900' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard size={18} />관리 홈</Link>
                    {groups.map(group => <div key={group.title}><p className="mb-2 px-3 text-[11px] font-semibold tracking-wide text-slate-400">{group.title}</p><ul className="space-y-1">{group.items.map(item => <li key={item.path}><Link to={item.path} onClick={() => setMenuOpen(false)} aria-current={current?.path === item.path ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${current?.path === item.path ? 'bg-green-50 font-semibold text-green-900' : 'text-slate-600 hover:bg-slate-50'}`}><item.icon size={17} />{item.label}</Link></li>)}</ul></div>)}
                </nav>
            </aside>
            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-9">
                <p className="mb-6 text-xs text-slate-400">관리자 / {isRoot ? '관리 홈' : current?.label || '관리'}</p>
                {isRoot ? <div className="max-w-6xl">
                    <div className="mb-9"><p className="mb-2 text-sm font-medium text-green-800">오늘의 운영을 한곳에서</p><h1 className="text-3xl font-bold tracking-tight">무엇을 관리할까요?</h1><p className="mt-3 text-sm leading-6 text-slate-500">실제 화면과 업무에 맞춰 관리 항목을 정리했습니다. 수정할 영역을 선택하세요.</p></div>
                    <Link to="/admin/service-overview" className="mb-9 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#214a34] p-6 text-white sm:p-8"><div><span className="text-xs text-green-200">메인 화면 관리</span><h2 className="mt-2 text-xl font-bold">서비스 소개 사진을 직접 바꿔보세요.</h2><p className="mt-2 text-sm text-green-100/80">사진 선택 → 미리보기 확인 → 저장</p></div><span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm">이미지 관리 <ArrowUpRight size={18} /></span></Link>
                    {groups.map(group => <section key={group.title} className="mb-8"><h2 className="mb-4 text-base font-bold">{group.title}</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{group.items.map(item => <Link key={item.path} to={item.path} className="group rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-green-700"><div className="mb-4 flex items-center justify-between"><item.icon size={22} strokeWidth={1.6} className="text-green-800" /><ArrowUpRight size={16} className="text-slate-300 group-hover:text-green-800" /></div><h3 className="font-semibold">{item.label}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{item.desc}</p></Link>)}</div></section>)}
                </div> : <Outlet />}
            </main>
        </div>
    </div>;
};
