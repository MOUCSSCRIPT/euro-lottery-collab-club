import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartGrid {
  id: string;
  predictions: Record<string, string>;
  playerName?: string;
  drawDate: string;
  cost: number;
  createdAt: number;
}

interface CartStore {
  grids: CartGrid[];
  addGrid: (grid: Omit<CartGrid, 'id' | 'createdAt'>) => void;
  removeGrid: (id: string) => void;
  clearCart: () => void;
  getTotalCost: () => number;
  getGridCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      grids: [],
      
      addGrid: (grid) => set((state) => ({
        grids: [
          ...state.grids,
          {
            ...grid,
            id: `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
          }
        ]
      })),
      
      removeGrid: (id) => set((state) => ({
        grids: state.grids.filter(g => g.id !== id)
      })),
      
      clearCart: () => set({ grids: [] }),
      
      getTotalCost: () => {
        const { grids } = get();
        return grids.reduce((sum, grid) => sum + grid.cost, 0);
      },
      
      getGridCount: () => get().grids.length,
    }),
    {
      name: 'suerte-cart-storage',
    }
  )
);
