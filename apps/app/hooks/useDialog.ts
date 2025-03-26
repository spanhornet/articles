// Zustand
import { create } from "zustand";

interface DialogProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData: (data: any) => void;
}

export const useDialog = create<DialogProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  data: null,
  setData: (data) => set({ data }),
}));