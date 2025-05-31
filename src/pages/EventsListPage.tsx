import { useEffect, useState } from 'react';
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react';
import { Event } from '../types';
import { format } from 'date-fns';
import { createClient } from "@supabase/supabase-js";

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const [event, setEvent] = useState<Event>();

  async function getEvent() {
    try {
      const { data, error } = await supabase
        .from("events")
        .select()
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching fighter:", error);
      } else {
        setEvent(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  
  useEffect(() => {
    getEvent();
  }, []);

  // Group events by month for easier navigation
  const eventsByMonth: Record<string, Event[]> = {};
  events.forEach(event => {
    const monthYear = format(new Date(event.date), 'MMMM yyyy');
    if (!eventsByMonth[monthYear]) {
      eventsByMonth[monthYear] = [];
    }
    eventsByMonth[monthYear].push(event);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Upcoming MMA Events</h1>
          <p className="text-gray-300">Find and track all upcoming MMA events across major organizations</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events, fighters, or locations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedOrganization}
                    onChange={(e) => setSelectedOrganization(e.target.value)}
                  >
                    <option value="all">All Organizations</option>
                    <option value="ufc">UFC</option>
                    <option value="bellator">Bellator</option>
                    <option value="one">ONE Championship</option>
                    <option value="pfl">PFL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="all">All Months</option>
                    {Object.keys(eventsByMonth).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight Class</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="all">All Weight Classes</option>
                    <option value="heavyweight">Heavyweight</option>
                    <option value="light-heavyweight">Light Heavyweight</option>
                    <option value="middleweight">Middleweight</option>
                    <option value="welterweight">Welterweight</option>
                    <option value="lightweight">Lightweight</option>
                    <option value="featherweight">Featherweight</option>
                    <option value="bantamweight">Bantamweight</option>
                    <option value="flyweight">Flyweight</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
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

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
          <div key={month} className="mb-10">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold">{month}</h2>
            </div>
            
            <div className="space-y-4">
              {monthEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/4 h-48 md:h-auto relative">
                      <img 
                        src={event.imageUrl} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-black/70 text-white px-3 py-1 m-2 rounded text-sm">
                        {format(new Date(event.date), 'MMM d')}
                      </div>
                    </div>
                    
                    <div className="p-6 md:w-3/4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{event.name}</h3>
                        <div className="mt-2 md:mt-0 text-sm text-gray-500">
                          {format(new Date(event.date), 'EEEE, MMMM d, yyyy • h:mm a')}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center text-gray-600 mb-2">
                          <span className="font-medium mr-2">Venue:</span>
                          <span>{event.venue}, {event.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Broadcast:</span>
                          <span>{event.broadcaster}</span>
                        </div>
                      </div>
                      
                      {/* Main Event Preview */}
                      {event.fights.find(fight => fight.isMainEvent) && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-semibold text-gray-500 mb-3">Main Event</h4>
                          <div className="flex items-center">
                            <div className="flex items-center flex-1">
                              <img 
                                src={event.fights.find(fight => fight.isMainEvent)?.fighter1.imageUrl} 
                                alt={event.fights.find(fight => fight.isMainEvent)?.fighter1.name}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div>
                                <p className="font-medium">{event.fights.find(fight => fight.isMainEvent)?.fighter1.name}</p>
                                <p className="text-xs text-gray-500">{event.fights.find(fight => fight.isMainEvent)?.fighter1.record}</p>
                              </div>
                            </div>
                            
                            <div className="px-4 text-lg font-bold text-gray-400">VS</div>
                            
                            <div className="flex items-center flex-1 justify-end text-right">
                              <div>
                                <p className="font-medium">{event.fights.find(fight => fight.isMainEvent)?.fighter2.name}</p>
                                <p className="text-xs text-gray-500">{event.fights.find(fight => fight.isMainEvent)?.fighter2.record}</p>
                              </div>
                              <img 
                                src={event.fights.find(fight => fight.isMainEvent)?.fighter2.imageUrl} 
                                alt={event.fights.find(fight => fight.isMainEvent)?.fighter2.name}
                                className="w-10 h-10 rounded-full object-cover ml-3"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium">{event.fights.length}</span> fights scheduled
                        </div>
                        <a 
                          href={`/event/${event.id}`} 
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}