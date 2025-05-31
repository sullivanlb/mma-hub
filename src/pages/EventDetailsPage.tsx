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
      <div className="relative bg-gray-900 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Flyer à gauche */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative max-w-sm">
                <img
                  src={event?.img_url}
                  alt={event?.name}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
            
            {/* Informations à droite */}
            <div className="text-white text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">{event?.name}</h1>
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start">
                  <Calendar className="w-6 h-6 mr-3 text-red-500" />
                  <span className="text-lg">{event && format(new Date(event.datetime), 'PPP')}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <MapPin className="w-6 h-6 mr-3 text-red-500" />
                  <span className="text-lg">{event?.venue}, {event?.location}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <Tv className="w-6 h-6 mr-3 text-red-500" />
                  <span className="text-lg">{event?.broadcast}</span>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Buy Tickets
                </button>
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Watch Trailer
                </button>
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

            {/* Share poster */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Official Event Poster</h2>
                <p className="text-gray-600">Share the official poster on social media</p>
              </div>
              
              <div className="flex justify-center">
                <div className="relative group max-w-sm">
                  <img
                    src={event?.img_url}
                    alt={`${event?.name} Official Poster`}
                    className="w-full h-auto rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]"
                  />
                  
                  {/* Overlay avec boutons */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <div className="flex flex-col gap-3">
                        <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-all flex items-center">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Poster
                        </button>
                        <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-red-700 transition-all flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download HD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Boutons de partage social */}
              <div className="mt-8 flex justify-center">
                <div className="flex gap-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="bg-blue-800 hover:bg-blue-900 text-white p-3 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.746.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.744-1.378l-.628 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.444 2.966.444 6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}