import { useEffect, useMemo, useState } from 'react';
import {
    ChevronRight,
    Edit2,
    FileText,
    Folder,
    Loader2,
    Menu as MenuIcon,
    Plus,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
} from 'lucide-react';
import {
    NavMenuItem,
    addNavMenuItem,
    deleteNavMenuItem,
    getAllNavMenuItems,
    updateNavMenuItem,
} from '../../src/api/cmsApi';
import { slugifyCategoryName } from '../../src/utils/productCategoryRoutes';

type GroupRow =
    | (NavMenuItem & { type: 'real' })
    | {
          type: 'implicit';
          id: string;
          name: string;
          display_order: number;
          is_active: true;
          category: null;
      };

type FormState = {
    name: string;
    link: string;
    slug: string;
    category: string;
    display_order: number;
    is_active: boolean;
};

const createDefaultFormState = (): FormState => ({
    name: '',
    link: '',
    slug: '',
    category: '',
    display_order: 0,
    is_active: true,
});

export const NavMenuManager = () => {
    const [items, setItems] = useState<NavMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'parent' | 'child'>('parent');
    const [editingItem, setEditingItem] = useState<NavMenuItem | null>(null);
    const [formData, setFormData] = useState<FormState>(createDefaultFormState());

    useEffect(() => {
        void loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const navData = await getAllNavMenuItems();
            setItems(navData);
        } catch (error) {
            console.error('Failed to load navigation menu data:', error);
        } finally {
            setLoading(false);
        }
    };

    const parentItems = useMemo(
        () => items.filter((item) => !item.category).sort((a, b) => a.display_order - b.display_order),
        [items],
    );

    const orphanCategories = useMemo(() => {
        const parentNames = new Set(parentItems.map((item) => item.name));
        return Array.from(
            new Set(
                items
                    .filter((item) => item.category && !parentNames.has(item.category))
                    .map((item) => item.category as string),
            ),
        );
    }, [items, parentItems]);

    const allGroups = useMemo<GroupRow[]>(
        () => [
            ...parentItems.map((item) => ({ ...item, type: 'real' as const })),
            ...orphanCategories.map((categoryName) => ({
                type: 'implicit' as const,
                id: `implicit-${categoryName}`,
                name: categoryName,
                display_order: 9999,
                is_active: true as const,
                category: null,
            })),
        ],
        [orphanCategories, parentItems],
    );

    const selectedGroup = allGroups.find((group) => group.id === selectedParentId) || null;
    const childItems = selectedGroup
        ? items
              .filter((item) => item.category === selectedGroup.name)
              .sort((a, b) => a.display_order - b.display_order)
        : [];

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData(createDefaultFormState());
    };

    const openModal = (type: 'parent' | 'child', item?: NavMenuItem) => {
        setModalType(type);
        setEditingItem(item || null);

        if (item) {
            setFormData({
                name: item.name,
                link: item.link,
                slug: item.slug || '',
                category: item.category || '',
                display_order: item.display_order,
                is_active: item.is_active,
            });
        } else {
            setFormData({
                name: '',
                link: type === 'parent' ? '#' : '/products',
                slug: '',
                category: type === 'child' && selectedGroup ? selectedGroup.name : '',
                display_order: type === 'parent' ? parentItems.length + 1 : childItems.length + 1,
                is_active: true,
            });
        }

        setShowModal(true);
    };

    const getChildItemsForGroup = (groupName: string) =>
        items.filter((item) => item.category === groupName);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);

        try {
            const payload: Omit<NavMenuItem, 'id' | 'created_at'> = {
                ...formData,
                slug: formData.slug.trim() || slugifyCategoryName(formData.name),
            };

            if (editingItem?.id) {
                if (modalType === 'parent' && editingItem.name !== formData.name) {
                    const children = items.filter((item) => item.category === editingItem.name);
                    await Promise.all(
                        children.map((child) =>
                            updateNavMenuItem(child.id!, {
                                category: formData.name,
                            }),
                        ),
                    );
                }

                await updateNavMenuItem(editingItem.id, payload);
            } else {
                await addNavMenuItem(payload);
            }

            await loadData();
            closeModal();
        } catch (error) {
            console.error('Failed to save nav menu item:', error);
            alert('메뉴 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item: GroupRow | NavMenuItem) => {
        const isImplicitGroup = String(item.id || '').startsWith('implicit-');
        const isParentGroup = !isImplicitGroup && !('category' in item && item.category);
        const children = getChildItemsForGroup(item.name);

        if (isParentGroup && children.length > 0) {
            alert(
                `'${item.name}' 아래에 ${children.length}개의 2차 메뉴가 있습니다.\n먼저 하위 메뉴를 삭제하거나 다른 1차 메뉴로 옮겨주세요.`,
            );
            return;
        }

        const confirmed = window.confirm(
            isImplicitGroup
                ? `'${item.name}' 그룹과 연결된 ${children.length}개의 하위 메뉴를 모두 삭제하시겠습니까?`
                : `'${item.name}' 메뉴를 삭제하시겠습니까?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            if (isImplicitGroup) {
                await Promise.all(children.map((child) => deleteNavMenuItem(child.id!)));
            } else if (item.id) {
                await deleteNavMenuItem(item.id);
            }

            await loadData();
            if (selectedParentId === item.id) {
                setSelectedParentId(null);
            }
        } catch (error) {
            console.error('Failed to delete nav menu item:', error);
            alert('메뉴 삭제에 실패했습니다.');
        }
    };

    const toggleActive = async (item: NavMenuItem) => {
        try {
            await updateNavMenuItem(item.id!, { is_active: !item.is_active });
            setItems((current) =>
                current.map((currentItem) =>
                    currentItem.id === item.id
                        ? { ...currentItem, is_active: !currentItem.is_active }
                        : currentItem,
                ),
            );
        } catch (error) {
            console.error('Failed to toggle nav menu item:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-100px)] flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">전체 메뉴 관리</h2>
                <p className="mt-1 text-sm text-slate-500">
                    사이트 전체 서비스 메뉴 구조와 영문 slug를 함께 관리합니다.
                </p>
            </div>

            <div className="flex h-full flex-1 gap-6 overflow-hidden">
                <div className="flex w-1/3 flex-col rounded-lg border border-slate-200 bg-white shadow-md">
                    <div className="flex items-center justify-between rounded-t-xl border-b bg-slate-50 p-4">
                        <div>
                            <h3 className="flex items-center gap-2 font-bold">
                                <Folder size={18} className="text-[#39B54A]" />
                                1차 메뉴
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">상위 카테고리 그룹을 관리합니다.</p>
                        </div>
                        <button
                            onClick={() => openModal('parent')}
                            className="flex items-center gap-1 rounded bg-[#39B54A] px-2 py-1.5 text-xs text-white transition hover:bg-slate-800"
                        >
                            <Plus size={14} />
                            추가
                        </button>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto p-2">
                        {allGroups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => setSelectedParentId(group.id!)}
                                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
                                    selectedParentId === group.id
                                        ? 'border-blue-200 bg-blue-50 shadow-sm'
                                        : 'border-transparent bg-white hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {group.type === 'real' ? (
                                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-500">
                                            {group.display_order}
                                        </span>
                                    ) : (
                                        <span className="rounded border border-red-100 bg-red-50 px-1 py-0.5 text-[10px] font-bold text-red-400">
                                            orphan
                                        </span>
                                    )}

                                    <div>
                                        <p
                                            className={`font-medium ${
                                                selectedParentId === group.id ? 'text-[#39B54A]' : 'text-slate-700'
                                            }`}
                                        >
                                            {group.name}
                                        </p>
                                        {'slug' in group ? (
                                            <p className="text-xs text-slate-400 font-mono">
                                                {group.slug || slugifyCategoryName(group.name)}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {group.type === 'real' ? (
                                        <>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    toggleActive(group);
                                                }}
                                                className="rounded p-1.5 text-slate-400 hover:text-green-600"
                                            >
                                                {group.is_active ? (
                                                    <ToggleRight size={20} className="text-green-500" />
                                                ) : (
                                                    <ToggleLeft size={20} />
                                                )}
                                            </button>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openModal('parent', group);
                                                }}
                                                className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </>
                                    ) : null}

                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDelete(group);
                                        }}
                                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <ChevronRight
                                        size={16}
                                        className={`transition-transform ${
                                            selectedParentId === group.id
                                                ? 'translate-x-1 text-blue-500'
                                                : 'text-slate-300'
                                        }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-md">
                    <div className="flex items-center justify-between rounded-t-xl border-b bg-slate-50 p-4">
                        <h3 className="flex items-center gap-2 font-bold">
                            <FileText size={18} className="text-[#39B54A]" />
                            2차 메뉴
                            {selectedGroup ? (
                                <span className="ml-2 text-sm font-normal text-slate-400">- {selectedGroup.name}</span>
                            ) : null}
                        </h3>
                        <button
                            onClick={() =>
                                selectedGroup
                                    ? openModal('child')
                                    : alert('왼쪽에서 1차 메뉴를 먼저 선택해주세요.')
                            }
                            disabled={!selectedGroup}
                            className="flex items-center gap-1 rounded bg-[#39B54A] px-2 py-1.5 text-xs text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={14} />
                            추가
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {!selectedGroup ? (
                            <div className="flex h-full flex-col items-center justify-center text-slate-400">
                                <MenuIcon size={48} className="mb-4 opacity-20" />
                                <p>왼쪽에서 관리할 1차 메뉴를 선택해주세요.</p>
                            </div>
                        ) : childItems.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-slate-50 py-12 text-center text-slate-400">
                                이 그룹에 등록된 하위 메뉴가 없습니다.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500">
                                    <tr>
                                        <th className="w-16 px-3 py-2 text-left">순서</th>
                                        <th className="px-3 py-2 text-left">메뉴명</th>
                                        <th className="px-3 py-2 text-left">이동 링크</th>
                                        <th className="px-3 py-2 text-left">Slug</th>
                                        <th className="w-20 px-3 py-2 text-center">상태</th>
                                        <th className="w-24 px-3 py-2 text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {childItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 text-slate-500">{item.display_order}</td>
                                            <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                                            <td className="max-w-[220px] truncate px-3 py-2 text-slate-500">{item.link}</td>
                                            <td className="px-3 py-2 font-mono text-xs text-slate-500">
                                                {item.slug || slugifyCategoryName(item.name)}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button onClick={() => toggleActive(item)} className="align-middle">
                                                    {item.is_active ? (
                                                        <ToggleRight size={24} className="text-green-500" />
                                                    ) : (
                                                        <ToggleLeft size={24} className="text-slate-300" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="flex justify-center gap-1 px-3 py-2">
                                                <button
                                                    onClick={() => openModal('child', item)}
                                                    className="rounded p-1.5 text-blue-500 hover:bg-blue-50"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {showModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b p-4">
                            <h3 className="text-lg font-bold">
                                {modalType === 'parent' ? '1차 메뉴' : '2차 메뉴'} {editingItem ? '수정' : '추가'}
                            </h3>
                            <button onClick={closeModal}>
                                <X size={24} className="text-slate-400 hover:text-black" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-bold text-slate-700">메뉴명</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(event) =>
                                        setFormData((current) => ({ ...current, name: event.target.value }))
                                    }
                                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#39B54A]"
                                    placeholder="메뉴 이름 입력"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-bold text-slate-700">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(event) =>
                                        setFormData((current) => ({ ...current, slug: event.target.value }))
                                    }
                                    className="w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[#39B54A]"
                                    placeholder={slugifyCategoryName(formData.name || 'sample-menu')}
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                    비워두면 메뉴명 기준 기본 영문 slug가 자동 생성됩니다.
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-bold text-slate-700">이동 링크</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(event) =>
                                        setFormData((current) => ({ ...current, link: event.target.value }))
                                    }
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#39B54A]"
                                    placeholder="/products 또는 #"
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                    상위 메뉴는 `#`로 두고 그룹 진입용으로만 써도 됩니다.
                                </p>
                            </div>

                            <div className="flex justify-between gap-4">
                                <div className="flex-1">
                                    <label className="mb-1 block text-sm font-bold text-slate-700">표시 순서</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(event) =>
                                            setFormData((current) => ({
                                                ...current,
                                                display_order: Number(event.target.value) || 0,
                                            }))
                                        }
                                        className="w-full rounded-lg border px-3 py-2 outline-none"
                                    />
                                </div>

                                <div className="flex items-center pt-6">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(event) =>
                                                setFormData((current) => ({
                                                    ...current,
                                                    is_active: event.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 accent-[#39B54A]"
                                        />
                                        <span className="text-sm font-medium">노출 활성화</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border px-4 py-2 hover:bg-slate-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-[#39B54A] px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {saving ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default NavMenuManager;
