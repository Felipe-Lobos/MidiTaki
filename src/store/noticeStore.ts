import { create } from 'zustand';

export type NoticeLevel = 'error' | 'warn' | 'info';
export interface Notice {
  id: string;
  level: NoticeLevel;
  text: string;
  action?: { label: string; run: () => void };
}
type NewNotice = Omit<Notice, 'id'> & { id?: string; timeoutMs?: number };

interface NoticeState {
  notices: Notice[];
  notify: (n: NewNotice) => string;
  dismiss: (id: string) => void;
}

let counter = 0;

export const useNoticeStore = create<NoticeState>((set, get) => ({
  notices: [],
  // Un aviso con el mismo id reemplaza al anterior (no se acumulan duplicados)
  notify: ({ id = `n${++counter}`, timeoutMs, ...rest }) => {
    set((s) => ({ notices: [...s.notices.filter((n) => n.id !== id), { id, ...rest }] }));
    if (timeoutMs) setTimeout(() => get().dismiss(id), timeoutMs);
    return id;
  },
  dismiss: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
}));

export const notify = (n: NewNotice) => useNoticeStore.getState().notify(n);
