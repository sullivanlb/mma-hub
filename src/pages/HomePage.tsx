import { useEffect, useState } from 'react';
import { Search, Filter, Menu, Bell } from 'lucide-react';
import { Event } from '../types';
import { createClient } from "@supabase/supabase-js";
import { EventCard } from '../components/EventCard';
import { CountdownTimer } from '../components/CountdownTimer';

export function Home() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables");
    }
  
    const supabase = createClient(supabaseUrl, supabaseKey);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
  
    async function getUpcomingEvents() {
        try {
            const today = new Date().toISOString().split('T')[0];
            console.log(today)
        
            // Step 1: Fetch the closest event
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .select("*")
                .gte("datetime", today) 
                .order("datetime", { ascending: true });
        
            if (eventError) {
                console.error("Error fetching event:", eventError);
                return;
            }

            console.log(eventData)
        
            if (eventData && eventData.length > 0) {
                // Set the list of upcoming events
                setUpcomingEvents(eventData);
            } else {
                setUpcomingEvents([]);
            }

        } catch (error) {
          console.error("Error:", error);
        }
    }
    
    async function getPastEvents() {
      try {
          const today = new Date().toISOString().split('T')[0];
          console.log(today)
      
          // Step 1: Fetch the closest event
          const { data: eventData, error: eventError } = await supabase
              .from("events")
              .select("*")
              .lt("datetime", today)
              .order("datetime", { ascending: false });
      
          if (eventError) {
              console.error("Error fetching event:", eventError);
              return;
          }

          console.log(eventData)
      
          if (eventData && eventData.length > 0) {
              // Set the list of upcoming events
              setPastEvents(eventData);
          } else {
            setPastEvents([]);
          }

      } catch (error) {
        console.error("Error:", error);
      }
  }
    
    useEffect(() => {
        getUpcomingEvents();
        getPastEvents();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
          {/* Navigation */}
          <nav className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <span className="text-xl font-bold">MMA Hub</span>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center space-x-4">
                    <a href="/events" className="text-white hover:text-gray-300">Events</a>
                    <a href="/fighters" className="text-white hover:text-gray-300">Fighters</a>
                    {/* <a href="#" className="text-white hover:text-gray-300">News</a> */}
                    <a href="/rankings" className="text-white hover:text-gray-300">Rankings</a>
                    <button className="p-2 rounded-full hover:bg-gray-800">
                      <Bell className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="md:hidden">
                  <button className="p-2">
                    <Menu className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </nav>
    
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, fighters, or locations..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
    
            {/* Featured Event Section */}
            <section className="mb-12">
              {upcomingEvents[0] ? (
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <EventCard eventId={upcomingEvents[0]['id']} />
                  </div>
                  <div className="space-y-6">
                    <CountdownTimer targetDate={upcomingEvents[0].datetime} />
                    <div className="bg-white rounded-lg shadow p-4">
                      <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                      <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                          Buy Tickets
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
                          Full Fight Card
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
                          Fighter Stats
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
                          Event Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No upcoming events found.</p>
              )}
            </section>
    
            {/* Upcoming Events Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Upcoming Events</h2>
                <a href="#" className="text-blue-600 hover:text-blue-800">View All</a>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} eventId={event.id} />
                ))}
              </div>
            </section>

            {/* Past Events Section */}
            <section>
              <div className="flex items-center justify-between mb-6 mt-12">
                <h2 className="text-2xl font-bold">Past Events</h2>
                <a href="#" className="text-blue-600 hover:text-blue-800">View All</a>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {pastEvents.map(event => (
                  <EventCard key={event.id} eventId={event.id} />
                ))}
              </div>
            </section>
          </main>
        </div>
    );
}