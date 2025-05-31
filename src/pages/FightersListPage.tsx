import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Award } from 'lucide-react';
import { Fighter } from '../types';
import { format } from 'date-fns';

// Mock data for demonstration
const weightClasses = [
  'Heavyweight',
  'Light Heavyweight',
  'Middleweight',
  'Welterweight',
  'Lightweight',
  'Featherweight',
  'Bantamweight',
  'Flyweight',
  'Women\'s Featherweight',
  'Women\'s Bantamweight',
  'Women\'s Flyweight',
  'Women\'s Strawweight'
];

// Generate mock fighters data
const generateMockFighters = (): Fighter[] => {
  const organizations = ['UFC', 'Bellator', 'ONE', 'PFL'];
  const statuses = ['Active', 'Inactive', 'Retired', 'Champion'];
  
  return Array(40).fill(null).map((_, index) => {
    const id = (index + 1).toString();
    const weightClass = weightClasses[Math.floor(Math.random() * weightClasses.length)];
    const organization = organizations[Math.floor(Math.random() * organizations.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const wins = Math.floor(Math.random() * 30);
    const losses = Math.floor(Math.random() * 10);
    const draws = Math.floor(Math.random() * 3);
    
    return {
      id,
      name: `Fighter ${id}`,
      nickname: index % 3 === 0 ? `"The ${['Beast', 'Assassin', 'Predator', 'Eagle', 'Lion', 'Warrior'][Math.floor(Math.random() * 6)]}"` : undefined,
      record: `${wins}-${losses}-${draws}`,
      weightClass,
      imageUrl: `https://images.unsplash.com/photo-1547941126-3d5322b218b0?auto=format&fit=crop&q=80&w=200&id=${id}`,
      organization,
      status,
      country: ['USA', 'Brazil', 'Russia', 'UK', 'Japan', 'Canada'][Math.floor(Math.random() * 6)],
      age: 20 + Math.floor(Math.random() * 20),
      height: `${5 + Math.floor(Math.random() * 2)}'${Math.floor(Math.random() * 12)}"`,
      reach: `${68 + Math.floor(Math.random() * 10)}"`,
      lastFight: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      nextFight: Math.random() > 0.5 ? new Date(Date.now() + Math.floor(Math.random() * 120 * 24 * 60 * 60 * 1000)).toISOString() : undefined
    };
  });
};

const mockFighters = generateMockFighters();

interface FightersListProps {
  onSelectFighter?: (fighterId: string) => void;
}

export function FightersList({ onSelectFighter }: FightersListProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeightClass, setSelectedWeightClass] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  
  // Filter fighters based on search and filters
  const filteredFighters = mockFighters.filter(fighter => {
    const matchesSearch = searchTerm === '' || 
      fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fighter.nickname && fighter.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fighter.country ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWeightClass = selectedWeightClass === 'all' || fighter.weightClass === selectedWeightClass;
    const matchesOrganization = selectedOrganization === 'all' || fighter.organization === selectedOrganization;
    const matchesStatus = selectedStatus === 'all' || fighter.status === selectedStatus;
    
    return matchesSearch && matchesWeightClass && matchesOrganization && matchesStatus;
  });
  
  // Sort fighters
  const sortedFighters = [...filteredFighters].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'weightClass':
        return a.weightClass.localeCompare(b.weightClass);
      case 'record':
        const aWins = parseInt(a.record.split('-')[0]);
        const bWins = parseInt(b.record.split('-')[0]);
        return bWins - aWins;
      default:
        return 0;
    }
  });
  
  // Group fighters by first letter of name for alphabetical listing
  const fightersByLetter: Record<string, Fighter[]> = {};
  if (sortBy === 'name') {
    sortedFighters.forEach(fighter => {
      const firstLetter = fighter.name.charAt(0).toUpperCase();
      if (!fightersByLetter[firstLetter]) {
        fightersByLetter[firstLetter] = [];
      }
      fightersByLetter[firstLetter].push(fighter);
    });
  }
  
  // Group fighters by weight class
  const fightersByWeightClass: Record<string, Fighter[]> = {};
  if (sortBy === 'weightClass') {
    sortedFighters.forEach(fighter => {
      if (!fightersByWeightClass[fighter.weightClass]) {
        fightersByWeightClass[fighter.weightClass] = [];
      }
      fightersByWeightClass[fighter.weightClass].push(fighter);
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">MMA Fighters</h1>
          <p className="text-gray-300">Browse and discover top fighters from around the world</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fighters by name, nickname, or country..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {filterOpen && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight Class</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedWeightClass}
                    onChange={(e) => setSelectedWeightClass(e.target.value)}
                  >
                    <option value="all">All Weight Classes</option>
                    {weightClasses.map(weightClass => (
                      <option key={weightClass} value={weightClass}>{weightClass}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedOrganization}
                    onChange={(e) => setSelectedOrganization(e.target.value)}
                  >
                    <option value="all">All Organizations</option>
                    <option value="UFC">UFC</option>
                    <option value="Bellator">Bellator</option>
                    <option value="ONE">ONE Championship</option>
                    <option value="PFL">PFL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Retired">Retired</option>
                    <option value="Champion">Champion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="weightClass">Weight Class</option>
                    <option value="record">Record (Most Wins)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedWeightClass('all');
                    setSelectedOrganization('all');
                    setSelectedStatus('all');
                    setSortBy('name');
                  }}
                >
                  Reset
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fighters List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Display count of fighters */}
        <div className="mb-6 text-gray-600">
          Showing {filteredFighters.length} fighters
        </div>
        
        {/* Display fighters grouped by first letter if sorted by name */}
        {sortBy === 'name' && (
          <div>
            {Object.entries(fightersByLetter).map(([letter, fighters]) => (
              <div key={letter} className="mb-8">
                <div id={`letter-${letter}`} className="flex items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600 mr-3">{letter}</div>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fighters.map(fighter => (
                    <FighterCard 
                      key={fighter.id} 
                      fighter={fighter} 
                      onClick={() => onSelectFighter && onSelectFighter(fighter.id)} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Display fighters grouped by weight class if sorted by weight class */}
        {sortBy === 'weightClass' && (
          <div>
            {Object.entries(fightersByWeightClass).map(([weightClass, fighters]) => (
              <div key={weightClass} className="mb-8">
                <div id={`weightclass-${weightClass}`} className="flex items-center mb-4">
                  <div className="text-2xl font-bold text-blue-600 mr-3">{weightClass}</div>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fighters.map(fighter => (
                    <FighterCard 
                      key={fighter.id} 
                      fighter={fighter} 
                      onClick={() => onSelectFighter && onSelectFighter(fighter.id)} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Display fighters in a grid if sorted by record */}
        {sortBy === 'record' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFighters.map(fighter => (
              <FighterCard 
                key={fighter.id} 
                fighter={fighter} 
                onClick={() => onSelectFighter && onSelectFighter(fighter.id)} 
              />
            ))}
          </div>
        )}
        
        {/* Show message if no fighters match the filters */}
        {filteredFighters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No fighters match your search criteria.</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => {
                setSearchTerm('');
                setSelectedWeightClass('all');
                setSelectedOrganization('all');
                setSelectedStatus('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface FighterCardProps {
  fighter: Fighter;
  onClick?: () => void;
}

function FighterCard({ fighter, onClick }: FighterCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex">
        <div className="w-1/3">
          <div className="relative h-full">
            <img 
              src={fighter.imageUrl} 
              alt={fighter.name}
              className="w-full h-full object-cover"
            />
            {fighter.status === 'Champion' && (
              <div className="absolute top-2 left-2">
                <div className="bg-yellow-500 text-white p-1 rounded-full">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-2/3 p-4">
          <h3 className="font-bold text-lg">{fighter.name}</h3>
          {fighter.nickname && (
            <p className="text-gray-600 text-sm italic mb-1">{fighter.nickname}</p>
          )}
          
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Record:</span>
              <span className="font-medium text-sm">{fighter.record}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Weight:</span>
              <span className="font-medium text-sm">{fighter.weightClass}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Organization:</span>
              <span className="font-medium text-sm">{fighter.organization}</span>
            </div>
            
            {fighter.nextFight && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-blue-600">
                  Next fight: {format(new Date(fighter.nextFight), 'MMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}