import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IdCardRequest } from '../types';

interface IdCardState {
  requests: IdCardRequest[];
  addRequest: (request: IdCardRequest) => void;
  updateRequest: (id: string, status: string) => void;
  cancelRequest: (id: string) => void;
}

export const useIdCardStore = create<IdCardState>()(
  persist(
    (set) => ({
      requests: [],
      addRequest: (request) =>
        set((state) => ({ requests: [request, ...state.requests] })),
      updateRequest: (id, status) =>
        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === id
              ? { ...req, status, updatedAt: new Date().toISOString() }
              : req
          ),
        })),
      cancelRequest: (id) =>
        set((state) => ({
          requests: state.requests.filter((req) => req.id !== id),
        })),
    }),
    {
      name: 'id-card-storage',
    }
  )
);
