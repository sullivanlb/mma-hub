import { useState } from 'react';
import { Search, Filter, ChevronDown, Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
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

// Generate mock rankings data
const generateMockRankings = () => {
  const organizations = ['UFC', 'Bellator', 'ONE', 'PFL'];
  
  // Create rankings for each organization and weight class
  const rankings: Record<string, Record<string, Fighter[]>> = {};
  
  organizations.forEach(org => {
    rankings[org] = {};
    
    weightClasses.forEach(weightClass => {
      // Generate 15 fighters for each weight class
      const fighters: Fighter[] = Array(15).fill(null).map((_, index) => {
        const id = `${org}-${weightClass}-${index + 1}`;
        const wins = Math.floor(Math.random() * 30) + (15 - index); // Better records for higher ranked fighters
        const losses = Math.floor(Math.random() * 5) + Math.floor(index / 3);
        const draws = Math.floor(Math.random() * 2);
        
        // Random movement indicators (more likely to be stable for higher ranks)
        let movement: 'up' | 'down' | 'none' = 'none';
        if (index > 2) {
          const rand = Math.random();
          if (rand < 0.2) movement = 'up';
          else if (rand < 0.4) movement = 'down';
        }
        
        return {
          id,
          name: `Fighter ${id}`,
          nickname: index % 3 === 0 ? `"The ${['Beast', 'Assassin', 'Predator', 'Eagle', 'Lion', 'Warrior'][Math.floor(Math.random() * 6)]}"` : undefined,
          record: `${wins}-${losses}-${draws}`,
          weightClass,
          imageUrl: `https://images.unsplash.com/photo-1547941126-3d5322b218b0?auto=format&fit=crop&q=80&w=200&id=${id}`,
          organization: org,
          status: index === 0 ? 'Champion' : 'Active',
          country: ['USA', 'Brazil', 'Russia', 'UK', 'Japan', 'Canada'][Math.floor(Math.random() * 6)],
          age: 20 + Math.floor(Math.random() * 20),
          height: `${5 + Math.floor(Math.random() * 2)}'${Math.floor(Math.random() * 12)}"`,
          reach: `${68 + Math.floor(Math.random() * 10)}"`,
          lastFight: new Date(Date.now() - Math.floor(Math.random() * 120 * 24 * 60 * 60 * 1000)).toISOString(),
          nextFight: Math.random() > 0.7 ? new Date(Date.now() + Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
          movement,
          rankingPoints: Math.floor(1000 - (index * 50) + (Math.random() * 30))
        };
      });
      
      rankings[org][weightClass] = fighters;
    });
  });
  
  return rankings;
};

const mockRankings = generateMockRankings();

// Create pound-for-pound rankings
const generatePoundForPoundRankings = () => {
  const allChampions: Fighter[] = [];
  const topContenders: Fighter[] = [];
  
  // Collect all champions and top contenders from each organization
  Object.keys(mockRankings).forEach(org => {
    Object.keys(mockRankings[org]).forEach(weightClass => {
      const fighters = mockRankings[org][weightClass];
      if (fighters.length > 0) {
        // Add champion
        allChampions.push(fighters[0]);
        
        // Add top contenders
        if (fighters.length > 3) {
          topContenders.push(...fighters.slice(1, 4));
        }
      }
    });
  });
  
  // Sort by ranking points
  const sortedChampions = [...allChampions].sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0));
  const sortedContenders = [...topContenders].sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0));
  
  // Take top 5 champions and top 10 contenders
  const p4pRankings = [
    ...sortedChampions.slice(0, 5),
    ...sortedContenders.slice(0, 10)
  ].sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0)).slice(0, 15);
  
  // Assign movement indicators
  return p4pRankings.map((fighter) => ({
    ...fighter,
    movement: ['up', 'down', 'none', 'none', 'none'][Math.floor(Math.random() * 5)] as 'up' | 'down' | 'none'
  }));
};

const poundForPoundRankings = generatePoundForPoundRankings();

interface RankingsProps {
  onSelectFighter?: (fighterId: string) => void;
}

export function Rankings({ onSelectFighter }: RankingsProps) {
  const [selectedOrganization, setSelectedOrganization] = useState<string>('UFC');
  const [selectedWeightClass, setSelectedWeightClass] = useState<string>('Pound-for-Pound');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Get the appropriate rankings based on selection
  const getCurrentRankings = (): Fighter[] => {
    if (selectedWeightClass === 'Pound-for-Pound') {
      return poundForPoundRankings;
    }
    
    if (selectedOrganization && selectedWeightClass && selectedWeightClass !== 'Pound-for-Pound') {
      return mockRankings[selectedOrganization]?.[selectedWeightClass] || [];
    }
    
    return [];
  };
  
  const currentRankings = getCurrentRankings();
  
  // Filter rankings by search term
  const filteredRankings = currentRankings.filter(fighter => 
    searchTerm === '' || 
    fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fighter.nickname && fighter.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (fighter.country && fighter.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">MMA Rankings</h1>
          <p className="text-gray-300">Official fighter rankings across major MMA organizations</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedOrganization}
                    onChange={(e) => setSelectedOrganization(e.target.value)}
                  >
                    <option value="UFC">UFC</option>
                    <option value="Bellator">Bellator</option>
                    <option value="ONE">ONE Championship</option>
                    <option value="PFL">PFL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight Class</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedWeightClass}
                    onChange={(e) => setSelectedWeightClass(e.target.value)}
                  >
                    <option value="Pound-for-Pound">Pound-for-Pound</option>
                    {weightClasses.map(weightClass => (
                      <option key={weightClass} value={weightClass}>{weightClass}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rankings Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            {selectedOrganization} {selectedWeightClass} Rankings
            {selectedWeightClass === 'Pound-for-Pound' && (
              <Trophy className="ml-2 text-yellow-500 w-6 h-6" />
            )}
          </h2>
          <p className="text-gray-600 mt-2">
            {selectedWeightClass === 'Pound-for-Pound' 
              ? 'Rankings of the best fighters across all weight classes based on skill and accomplishments.'
              : `Current rankings for ${selectedOrganization} ${selectedWeightClass} division.`
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fighter
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record
                  </th>
                  {selectedWeightClass === 'Pound-for-Pound' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight Class
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Last Fight
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Next Fight
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRankings.map((fighter, index) => (
                  <tr 
                    key={fighter.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectFighter && onSelectFighter(fighter.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && fighter.status === 'Champion' ? (
                          <div className="flex items-center">
                            <Trophy className="text-yellow-500 w-5 h-5 mr-1" />
                            <span className="font-bold">C</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="font-semibold">{index + 1}</span>
                            {fighter.movement === 'up' && <ArrowUp className="ml-1 text-green-500 w-4 h-4" />}
                            {fighter.movement === 'down' && <ArrowDown className="ml-1 text-red-500 w-4 h-4" />}
                            {fighter.movement === 'none' && <Minus className="ml-1 text-gray-400 w-4 h-4" />}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-10 w-10 rounded-full mr-3 object-cover" 
                          src={fighter.imageUrl} 
                          alt={fighter.name} 
                        />
                        <div>
                          <div className="font-medium text-gray-900">{fighter.name}</div>
                          {fighter.nickname && (
                            <div className="text-sm text-gray-500 italic">{fighter.nickname}</div>
                          )}
                          <div className="text-xs text-gray-500">{fighter.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{fighter.record}</span>
                    </td>
                    {selectedWeightClass === 'Pound-for-Pound' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {fighter.weightClass}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {fighter.lastFight ? (
                        <span className="text-sm text-gray-600">
                          {format(new Date(fighter.lastFight), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      {fighter.nextFight ? (
                        <span className="text-sm text-blue-600">
                          {format(new Date(fighter.nextFight), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRankings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No fighters match your search criteria.</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
        
        {/* Weight Classes Quick Navigation */}
        {selectedWeightClass !== 'Pound-for-Pound' && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Other Weight Classes</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-2 rounded-md text-sm ${selectedWeightClass === 'Pound-for-Pound' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setSelectedWeightClass('Pound-for-Pound')}
              >
                Pound-for-Pound
              </button>
              {weightClasses.map(weightClass => (
                <button 
                  key={weightClass}
                  className={`px-3 py-2 rounded-md text-sm ${selectedWeightClass === weightClass ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setSelectedWeightClass(weightClass)}
                >
                  {weightClass}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Organizations Quick Navigation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Other Organizations</h3>
          <div className="flex flex-wrap gap-2">
            {['UFC', 'Bellator', 'ONE', 'PFL'].map(org => (
              <button 
                key={org}
                className={`px-3 py-2 rounded-md text-sm ${selectedOrganization === org ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setSelectedOrganization(org)}
              >
                {org === 'ONE' ? 'ONE Championship' : org}
              </button>
            ))}
          </div>
        </div>
        
        {/* Rankings Explanation */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">About These Rankings</h3>
          <p className="text-gray-700 mb-4">
            These rankings represent the current competitive hierarchy in mixed martial arts. Rankings are determined by a panel of experts who evaluate fighters based on:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-2">
            <li>Recent performance and quality of competition</li>
            <li>Win/loss record and method of victory</li>
            <li>Activity level and consistency</li>
            <li>Championship status and title defenses</li>
            <li>Quality of opposition faced</li>
          </ul>
          <p className="text-gray-700">
            Rankings are updated following each major event. Fighters must compete at least once every 18 months to maintain their ranking status.
          </p>
        </div>
      </div>
    </div>
  );
}