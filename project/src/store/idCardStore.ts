import { create } from 'zustand';
import { IdCardRequest } from '../types';

const initialRequests: IdCardRequest[] = [
  {
    id: '1',
    userId: 'user1',
    studentName: 'Alex Johnson',
    reason: 'Lost my previous ID card',
    status: 'Pending',
    createdAt: '2025-04-15T10:30:00Z',
    updatedAt: '2025-04-15T10:30:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    studentName: 'Jessica Davis',
    reason: 'ID card was damaged',
    status: 'Pending',
    createdAt: '2025-04-14T14:15:00Z',
    updatedAt: '2025-04-14T14:15:00Z',
  },
  {
    id: '3',
    userId: 'user3',
    studentName: 'Michael Brown',
    reason: 'Need a new ID card with updated photo',
    status: 'Approved',
    createdAt: '2025-04-12T09:45:00Z',
    updatedAt: '2025-04-13T11:20:00Z',
  },
  {
    id: '4',
    userId: 'user4',
    studentName: 'Samantha Williams',
    reason: 'Original ID card was stolen',
    status: 'Rejected',
    createdAt: '2025-04-10T16:05:00Z',
    updatedAt: '2025-04-11T10:30:00Z',
  },
];

interface IdCardState {
  requests: IdCardRequest[];
  addRequest: (request: IdCardRequest) => void;
  updateRequest: (id: string, status: string) => void;
  cancelRequest: (id: string) => void;
}

export const useIdCardStore = create<IdCardState>((set) => ({
  requests: initialRequests,
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
}));
