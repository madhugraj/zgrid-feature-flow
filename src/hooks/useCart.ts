import { create } from 'zustand';
import { CartState, Feature, CartItem } from '@/types/Feature';

interface CartStore extends CartState {
  addItem: (feature: Feature) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  totalItems: 0,

  addItem: (feature: Feature) => {
    const state = get();
    const existingItem = state.items.find(item => item.feature.featureCode === feature.featureCode);
    
    if (existingItem) {
      set({
        items: state.items.map(item =>
          item.feature.featureCode === feature.featureCode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        totalItems: state.totalItems + 1
      });
    } else {
      const newItem: CartItem = {
        feature,
        quantity: 1,
        id: `${feature.featureCode}-${Date.now()}`
      };
      set({
        items: [...state.items, newItem],
        totalItems: state.totalItems + 1
      });
    }
  },

  removeItem: (id: string) => {
    const state = get();
    const item = state.items.find(item => item.id === id);
    if (item) {
      set({
        items: state.items.filter(item => item.id !== id),
        totalItems: state.totalItems - item.quantity
      });
    }
  },

  updateQuantity: (id: string, quantity: number) => {
    const state = get();
    const item = state.items.find(item => item.id === id);
    
    if (item && quantity > 0) {
      const quantityDiff = quantity - item.quantity;
      set({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
        totalItems: state.totalItems + quantityDiff
      });
    } else if (quantity <= 0) {
      get().removeItem(id);
    }
  },

  clearCart: () => {
    set({
      items: [],
      totalItems: 0
    });
  },

  toggleCart: () => {
    set({ isOpen: !get().isOpen });
  }
}));