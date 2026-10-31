import { createSlice } from '@reduxjs/toolkit';

const initialProjects = [
  {
    id: 'PRJ-101',
    title: 'Skyline Penthouse Conference Suite',
    category: 'Venue Booking',
    client: 'Apex Global Corp',
    date: 'Oct 24, 2026',
    status: 'Confirmed',
    amount: '$1,850',
    progress: 100,
    icon: 'office-building',
    tagColor: '#10B981',
    description: 'Executive boardroom reservation with 4K telepresence and luxury catering.',
  },
  {
    id: 'PRJ-102',
    title: 'Tesla Model S Plaid VIP Rental',
    category: 'Chauffeur & Fleet',
    client: 'Nexus VIP Club',
    date: 'Nov 02, 2026',
    status: 'In Progress',
    amount: '$920',
    progress: 65,
    icon: 'car-sports',
    tagColor: '#6366F1',
    description: 'Airport executive pickup with private security escort and champagne reception.',
  },
  {
    id: 'PRJ-103',
    title: 'OmniStudio Soundstage 4 Booking',
    category: 'Creative Space',
    client: 'Pulse Media Studios',
    date: 'Nov 14, 2026',
    status: 'Pending',
    amount: '$3,400',
    progress: 30,
    icon: 'video-vintage',
    tagColor: '#F59E0B',
    description: 'Full-day acoustic soundstage booking with AR volume tracking cameras.',
  },
  {
    id: 'PRJ-104',
    title: 'Private Yacht Charter - Azure Sunset',
    category: 'Luxury Leisure',
    client: 'Horizon Holdings',
    date: 'Dec 05, 2026',
    status: 'Upcoming',
    amount: '$4,600',
    progress: 15,
    icon: 'sail-boat',
    tagColor: '#06B6D4',
    description: 'Private 80ft yacht booking with personal chef and coastal itinerary.',
  },
  {
    id: 'PRJ-105',
    title: 'E-Commerce Cloud Architecture Sprint',
    category: 'Tech Services',
    client: 'Velox Retail Inc',
    date: 'Dec 18, 2026',
    status: 'Confirmed',
    amount: '$5,200',
    progress: 80,
    icon: 'cloud-sync',
    tagColor: '#8B5CF6',
    description: 'High-availability microservice scaling for Black Friday commerce surge.',
  },
];

export const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    items: initialProjects,
    filter: 'All',
    searchQuery: '',
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    addProject: (state, action) => {
      state.items.unshift({
        id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        date: 'Today',
        progress: 10,
        tagColor: '#6366F1',
        icon: 'briefcase-outline',
        ...action.payload,
      });
    },
    updateProjectStatus: (state, action) => {
      const { id, status } = action.payload;
      const found = state.items.find((p) => p.id === id);
      if (found) {
        found.status = status;
        if (status === 'Confirmed' || status === 'Completed') {
          found.progress = 100;
          found.tagColor = '#10B981';
        } else if (status === 'Cancelled') {
          found.progress = 0;
          found.tagColor = '#EF4444';
        }
      }
    },
    deleteProject: (state, action) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setFilter, setSearchQuery, addProject, updateProjectStatus, deleteProject } = projectsSlice.actions;
export default projectsSlice.reducer;
