import { EventCard } from './components/EventCard';
import { CountdownTimer } from './components/CountdownTimer';
import { Search, Filter, Bell, Menu } from 'lucide-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { EventDetails } from './pages/EventDetailsPage';
import { EventsList } from './pages/EventsListPage';
import { FightersList } from './pages/FightersListPage';
import { Rankings } from './pages/RankingsPage';
import { FighterProfile } from './pages/FighterProfilePage';
import { Home } from './pages/HomePage';

// Mock data for demonstration
const upcomingEvent = {
  id: '1',
  name: 'UFC 300: Battle for Glory',
  date: '2024-04-13T22:00:00.000Z',
  venue: 'T-Mobile Arena',
  location: 'Las Vegas, Nevada',
  broadcaster: 'Pay Per View + ESPN+',
  imageUrl: 'https://imgs.search.brave.com/xiPQGnAvKj1MZ6nZXKeLhGBGEgUCzo7-j-MxJKkLs1I/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9kbXhn/NXd4ZnFnYjR1LmNs/b3VkZnJvbnQubmV0/L3N0eWxlcy9iYWNr/Z3JvdW5kX2ltYWdl/X3NtL3MzLzIwMjQt/MDIvMDQxMzI0LXVm/Yy0zMDAtcGVyZWly/YS12cy1oaWxsLVRF/TVAtSEVSTy5qcGc_/aD1kMWNiNTI1ZCZp/dG9rPTFEQmM1UnNw',
  fights: [
  {
      id: '1',
      fighter1: {
      id: '1',
      name: 'Alex Pereira',
      record: '9-2-0',
      weightClass: 'Light Heavyweight',
      imageUrl: 'https://imgs.search.brave.com/41Qfyi_vx5INdJ0YUZdbsXIuOg7RFhhdgyMdxa5G_lY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YWN0dW1tYS5jb20v/d3AtY29udGVudC91/cGxvYWRzLzIwMjUv/MDEvYWxleC1wZXJl/aXJhLW1tYS11ZmMt/MS0xMDI0eDUzOC5q/cGc'
      },
      fighter2: {
      id: '2',
      name: 'Jamahal Hill',
      record: '12-1-0',
      weightClass: 'Light Heavyweight',
      imageUrl: 'https://imgs.search.brave.com/a3m8jpOgqQe49MVjn-rWAb1qgQKI22lw6tHgJe8KiB4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kbXhn/NXd4ZnFnYjR1LmNs/b3VkZnJvbnQubmV0/L3N0eWxlcy9hdGhs/ZXRlX2Jpb19mdWxs/X2JvZHkvczMvMjAy/NS0wMS9ISUxMX0pB/TUFIQUxfTF8wMS0x/OC5wbmc_aXRvaz0z/MU9kcG9PVQ'
      },
      weightClass: 'Light Heavyweight',
      rounds: 5,
      isMainEvent: true
  },
  {
      id: '2',
      fighter1: {
      id: '3',
      name: 'Conor McGregor',
      record: '22-6-0',
      weightClass: 'Lightweight',
      imageUrl: 'https://imgs.search.brave.com/PG5nA0TVzEAo6luGTVV_KRt8BT49kFlrlm5OZGt9sbo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy8z/LzM3L0Nvbm9yX01j/R3JlZ29yXzIwMTUu/anBn'
      },
      fighter2: {
      id: '4',
      name: 'Dustin Poirier',
      record: '28-7-0',
      weightClass: 'Lightweight',
      imageUrl: 'https://imgs.search.brave.com/diD0UPLt5QqIqqI2EuDSz-pRl2n_4-9fqGQdBHKWtZM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ib3hl/bWFnLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMS8wNS9w/b2lyaWVyLWV4Y3Vz/ZXMtNTUyMzk4OWI0/ZjFkOTk0NThmMGY3/NjhkMTgyOTYwNzYu/anBn'
      },
      weightClass: 'Lightweight',
      rounds: 3,
      isMainEvent: false
  },
  {
      id: '3',
      fighter1: {
      id: '5',
      name: 'Israel Adesanya',
      record: '23-2-0',
      weightClass: 'Middleweight',
      imageUrl: 'https://imgs.search.brave.com/KEFxRZEguEMWHIT-sthw4VokPKe1KVn2PH0g2JjBrzk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YmpwZW5uLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyNC8x/MS9Jc3JhZWwtQWRl/c2FueWEtMTAyNHg3/NjguanBn'
      },
      fighter2: {
      id: '6',
      name: 'Robert Whittaker',
      record: '24-6-0',
      weightClass: 'Middleweight',
      imageUrl: 'https://imgs.search.brave.com/q4YR_I6GiyQhifmDye5Z6b7BqrPSVZw7X8Fi7gPSfqU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy9l/L2VkL1JvYmVydF9X/aGl0dGFrZXJfMjAy/NC5wbmc'
      },
      weightClass: 'Middleweight',
      rounds: 3,
      isMainEvent: false
  }
  ]
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="/events" element={<EventsList events={[upcomingEvent]}/>} />
          <Route path="/fighters" element={<FightersList />} />
          <Route path="/fighter/:fighterId" element={<FighterProfile />} />
          <Route path="/rankings" element={<Rankings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;