import { Calendar, MapPin, Tv, Clock, Users, Trophy, Share2 } from 'lucide-react';
import { Event, Fight, FightResult } from '../types';
import { FightType } from '../enums';
import { format } from 'date-fns';
import { CountdownTimer } from '../components/CountdownTimer';
import { useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js";
import { Link, useParams } from 'react-router-dom';

export function EventDetails() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event>();
  const [fights, setFights] = useState<Fight[]>([]);

  
  useEffect(() => {
    getEvent();
    getFights();
  }, []);

  async function getEvent() {
    try {
      const { data, error } = await supabase
        .from("events")
        .select()
        .limit(1)
        .eq("id", eventId)
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

  async function getFights() {
    try {
      const { data, error } = await supabase
        .from("fights")
        .select(`
          *,
          fighter1: id_fighter_1 (id, name, small_img_url, pro_mma_record, weight_class),
          fighter2: id_fighter_2 (id, name, small_img_url, pro_mma_record, weight_class)
        `)
        .eq("id_event", eventId);

      if (error) {
        console.error("Error fetching fighter:", error);
      } else {
        setFights(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function formatDateTimeToET(isoString: string): string {
    const date = new Date(isoString);
    
    // Format to Eastern Time (ET)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York',
      weekday: 'long',       // e.g., "Saturday"
      month: '2-digit',      // e.g., "03"
      day: '2-digit',        // e.g., "29"
      year: 'numeric',       // e.g., "2025"
      hour: '2-digit',       // e.g., "04"
      minute: '2-digit',     // e.g., "00"
      hour12: true           // AM/PM format
    };
  
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
  
    // Extract parts
    const weekday = parts.find(p => p.type === 'weekday')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value;
  
    return `${weekday} ${month}.${day}.${year} at ${hour}:${minute} ${dayPeriod} ET`;
  }

  type ColorMap = {
    [key in FightResult]: string;
  } & {
    default: string;
  };

  const ringColor: ColorMap = {
    W: 'border-green-500',
    L: 'border-red-500',
    D: 'border-yellow-500',
    NC: 'border-gray-500',
    default: 'border-gray-300',
  } as const;

  const resultLabel: Record<FightResult, string> = {
    'W': 'WIN',
    'L': 'LOSE',
    'D': 'DRAW',
    'NC': 'NO CONTEST',
  } as const;

  const resultLabelColor: ColorMap = {
    W: 'bg-green-500',
    L: 'bg-red-500',
    D: 'bg-yellow-500',
    NC: 'bg-gray-500',
    default: 'bg-gray-300',
  } as const;

  const getRingColor = (result?: FightResult | null): string => {
    if (!result) return ringColor.default;
    return ringColor[result];
  };

  const getResultLabelColor = (result?: FightResult | null): string => {
    if (!result) return resultLabelColor.default;
    return resultLabelColor[result];
  };

  const mainEvent = fights?.find(fight => fight.fight_type === FightType.MainEvent);
  const prelimFights = fights?.filter(fight => fight.fight_type !== FightType.MainEvent);
  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Hero Section */}
      <div className="relative h-96 mb-8">
        <img
          src={event?.img_url}
          alt={event?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-4">{event?.name}</h1>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{event && format(new Date(event.datetime), 'PPP')}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{event?.venue}, {event?.location}</span>
                </div>
                <div className="flex items-center">
                  <Tv className="w-5 h-5 mr-2" />
                  <span>{event?.broadcast}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Event Section */}
            {mainEvent && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Main Event</h2>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <Link to={`/fighter/${mainEvent.fighter1.id}`}> {/* Add Link */}
                      <div className="relative inline-block">
                        <img
                          src={mainEvent.fighter1.small_img_url}
                          alt={mainEvent.fighter1.name}
                          className={`w-32 h-32 rounded-full object-cover border-4 ${getRingColor(mainEvent.result_fighter_1)}`}
                        />
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getResultLabelColor(mainEvent.result_fighter_1)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                        {mainEvent.result_fighter_1 ? resultLabel[mainEvent.result_fighter_1] : ""}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mt-4">{mainEvent.fighter1.name}</h3>
                      <p className="text-gray-600">{mainEvent.fighter1.pro_mma_record}</p>
                    </Link>
                  </div>

                  <div className="text-center px-6">
                    <div className="text-3xl font-bold text-red-600 mb-2">VS</div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <p className="text-sm text-gray-600">{mainEvent.fighter1.weight_class}</p>
                    </div>
                  </div>

                  <div className="text-center flex-1">
                    <Link to={`/fighter/${mainEvent.fighter2.id}`}> {/* Add Link */}
                      <div className="relative inline-block">
                        <img
                          src={mainEvent.fighter2.small_img_url}
                          alt={mainEvent.fighter2.name}
                          className={`w-32 h-32 rounded-full object-cover border-4 ${getRingColor(mainEvent.result_fighter_2)}`}
                        />
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getResultLabelColor(mainEvent.result_fighter_2)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                          {mainEvent.result_fighter_2 ? resultLabel[mainEvent.result_fighter_2] : ""}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mt-4">{mainEvent.fighter2.name}</h3>
                      <p className="text-gray-600">{mainEvent.fighter2.pro_mma_record}</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Preliminary Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Preliminary Card</h2>
              <div className="space-y-6">
                {prelimFights.map((fight) => (
                  <div key={fight.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <Link to={`/fighter/${fight.fighter1.id}`}> {/* Add Link */}
                          <div className="relative inline-block">
                            <img
                              src={fight.fighter1.small_img_url}
                              alt={fight.fighter1.name}
                              className={`w-20 h-20 rounded-full mx-auto object-cover border-2 ${getRingColor(fight.result_fighter_1)}`}
                            />
                            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getResultLabelColor(fight.result_fighter_1)} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                              {fight.result_fighter_1 ? resultLabel[fight.result_fighter_1] : ""}
                            </div>
                          </div>
                          <h4 className="font-semibold mt-2">{fight.fighter1.name}</h4>
                          <p className="text-sm text-gray-600">{fight.fighter1.pro_mma_record}</p>
                        </Link>
                      </div>

                      <div className="text-center px-4">
                        <div className="text-xl font-bold text-gray-400 mb-1">VS</div>
                        <div className="text-sm text-gray-600">{fight.fighter1.weight_class}</div>
                      </div>

                      <div className="text-center flex-1">
                      <Link to={`/fighter/${fight.fighter2.id}`}> {/* Add Link */}
                          <div className="relative inline-block">
                            <img
                              src={fight.fighter2.small_img_url}
                              alt={fight.fighter2.name}
                              className={`w-20 h-20 rounded-full mx-auto object-cover border-2 ${getRingColor(fight.result_fighter_2)}`}
                            />
                            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getResultLabelColor(fight.result_fighter_2)} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                              {fight.result_fighter_2 ? resultLabel[fight.result_fighter_2] : ""}
                            </div>
                          </div>
                          <h4 className="font-semibold mt-2">{fight.fighter2.name}</h4>
                          <p className="text-sm text-gray-600">{fight.fighter2.pro_mma_record}</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            <CountdownTimer targetDate={event ? event.datetime : ''} />

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Event Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-semibold">
                      {new Date(event?.datetime || new Date()).toLocaleString('en-US', {
                        timeZone: 'America/New_York',
                        weekday: 'long',
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      }).replace(/,/g, '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-semibold">20,000</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Championship Bouts</p>
                    <p className="font-semibold">1 Title Fight</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button className="w-full bg-blue-600 text-white rounded-lg py-3 mb-3 hover:bg-blue-700 transition-colors">
                Buy Tickets
              </button>
              <button className="w-full bg-gray-100 text-gray-800 rounded-lg py-3 hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Share2 className="w-5 h-5 mr-2" />
                Share Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}