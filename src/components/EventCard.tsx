import { Calendar, MapPin, Tv } from 'lucide-react';
import { Event, Fight } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FightType } from '../enums';
import { useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js";

interface EventCardProps {
  eventId: string;
}

export function EventCard({ eventId }: EventCardProps) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables");
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [event, setEvent] = useState<Event>();
  const [fights, setFights] = useState<Fight[]>([]);

  const mainEvent = fights.find((fight: { fight_type: FightType; }) => fight.fight_type === FightType.MainEvent);

  useEffect(() => {
    getEvent(eventId)
    getFights()
  }, []);
  
  async function getEvent(_eventId: string | undefined) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select()
        .limit(1)
        .eq("id", _eventId)
        .single();

      if (error) {
        console.error("Error fetching events:", error);
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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer h-96"> {/* Hauteur fixe */}
      <Link to={`/event/${event?.id}`}>
        <div className="flex h-full">
          {/* Image on the left */}
          <div className="w-1/3 relative">
            <img
              src={event?.img_url}
              alt={event?.name}
              className="w-full h-full object-cover object-center" // Couvre toute la zone sans déformation
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          </div>

          {/* Event details on the right */}
          <div className="w-2/3 p-4 flex flex-col justify-between"> {/* Flex pour organiser le contenu */}
            <div className="space-y-2">
              <div className="bottom-4 left-4 text-dark-100">
                <h3 className="text-2xl font-bold">{event?.name}</h3>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{event ? format(new Date(event.datetime), 'PPP') : ''}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{event?.venue}, {event?.location}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Tv className="w-5 h-5 mr-2" />
                <span>{event?.broadcast}</span>
              </div>
            </div>

            {mainEvent && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">Main Event</h4>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <img
                      src={mainEvent.fighter1.small_img_url}
                      alt={mainEvent.fighter1.name}
                      className="w-16 h-16 rounded-full mx-auto mb-2 object-cover object-center" // Couvre toute la zone sans déformation
                    />
                    <p className="font-semibold">{mainEvent.fighter1.name}</p>
                    <p className="text-sm text-gray-600">{mainEvent.fighter1.pro_mma_record}</p>
                  </div>
                  
                  <div className="px-4 text-2xl font-bold text-gray-400">VS</div>
                  
                  <div className="text-center flex-1">
                    <img
                      src={mainEvent.fighter2.small_img_url}
                      alt={mainEvent.fighter2.name}
                      className="w-16 h-16 rounded-full mx-auto mb-2 object-cover object-center" // Couvre toute la zone sans déformation
                    />
                    <p className="font-semibold">{mainEvent.fighter2.name}</p>
                    <p className="text-sm text-gray-600">{mainEvent.fighter2.pro_mma_record}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}