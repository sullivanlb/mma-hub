import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { 
  Award, 
  Calendar, 
  MapPin, 
  User, 
  Ruler, 
  Scale, 
  Maximize, 
  Dumbbell, 
  Clock, 
  Flag, 
  Swords, 
  Shield, 
  Target, 
  TrendingUp, 
  Zap, 
  Trophy
} from 'lucide-react';
import { Fighter, FighterRecords, Fight } from '../types';
import { createClient } from "@supabase/supabase-js";

interface FighterProfileProps {
  fighter: Fighter;
  records: FighterRecords;
  fights: Fight;
  fightersOfFights: Fighter;
}

export function FighterProfile() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { fighterId } = useParams();
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [fighter, setFighters] = useState<Fighter | null>(null);
  const [records, setRecords] = useState<FighterRecords[]>([]);
  const [fights, setFights] = useState<Fight[]>([]);
  const [opponents, setOpponents] = useState<Fighter[]>([]);

  useEffect(() => {
    getFighters(fighterId);
    getFighterRecords();
    getFights();
    getOpponents(fighterId);
  }, []);

  async function getFighters(_fighterId: string | undefined) {
    try {
      setLoading(true); // Set loading to true while fetching data
      const { data, error } = await supabase
        .from("fighters")
        .select()
        .limit(1)
        .eq("id", _fighterId)
        .single();

      if (error) {
        console.error("Error fetching fighter:", error);
      } else {
        setFighters(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  }

  async function getFighterRecords() {
    try {
      setLoading(true); // Set loading to true while fetching data
  
      // Fetch all records where id_fighter matches fighterId
      const { data, error } = await supabase
        .from("records_by_promotion")
        .select("*") // Select all columns
        .eq("id_fighter", fighterId); // Filter by id_fighter
  
      if (error) {
        console.error("Error fetching fighter records:", error);
      } else {
        setRecords(data); // Update state with the fetched records
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  }

  async function getFights() {
    try {
      setLoading(true); // Set loading to true while fetching data
  
      // Fetch all fights where fighterId matches id_fighter_1 OR id_fighter_2
      const { data, error } = await supabase
        .from("fights")
        .select("*") // Select all columns
        .or(`id_fighter_1.eq.${fighterId},id_fighter_2.eq.${fighterId}`); // Filter by id_fighter_1 OR id_fighter_2
  
      if (error) {
        console.error("Error fetching fights:", error);
      } else {
        // Add a new field to indicate the role of the current fighter
        const fightsWithRole = data.map((fight) => {
          if (fight.id_fighter_1 == fighterId) {
            return { ...fight, current_fighter_role: "fighter_1" };
          } else if (fight.id_fighter_2 == fighterId) {
            return { ...fight, current_fighter_role: "fighter_2" };
          }
          return fight; // Fallback (should not happen due to the query filter)
        });
        
        setFights(fightsWithRole); // Update state with the modified fights
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  }

  async function getOpponents(_fighterId: string | undefined) {
    try {
      // Step 1: Fetch all fights involving the fighterId
      const { data: fights, error: fightsError } = await supabase
        .from("fights")
        .select("*")
        .or(`id_fighter_1.eq.${fighterId},id_fighter_2.eq.${fighterId}`);
  
      if (fightsError) {
        throw new Error(`Error fetching fights: ${fightsError.message}`);
      }
  
      // Step 2: Extract opponent IDs
      const opponentIds = new Set(); // Use a Set to avoid duplicate IDs
      fights.forEach((fight) => {
        if (fight.id_fighter_1 == fighterId) {
          opponentIds.add(fight.id_fighter_2);
        } else if (fight.id_fighter_2 == fighterId) {
          opponentIds.add(fight.id_fighter_1);
        }
      });
  
      // Step 3: Fetch fighter details for opponents
      const { data: opponents, error: opponentsError } = await supabase
        .from("fighters")
        .select("*")
        .in("id", Array.from(opponentIds)); // Convert Set to Array for the query
  
      if (opponentsError) {
        throw new Error(`Error fetching opponents: ${opponentsError.message}`);
      }
  
      // Step 4: Return the list of opponents
      setOpponents(opponents);
    } catch (error) {
      console.error(error);
      return []; // Return an empty array in case of error
    }
  }

  // Calculate win percentages
  const recordParts = fighter?.pro_mma_record?.split(',')[0].split('-');

  const wins = parseInt(recordParts?.[0] ?? '0');
  const losses = parseInt(recordParts?.[1] ?? '0');
  const draws = parseInt(recordParts?.[2] ?? '0');

  let nbKoTko = 0
  let nbSub = 0
  let nbDecision = 0

  records.forEach(record => {
    nbKoTko += record.win_ko
    nbSub += record.win_sub
    nbDecision += record.win_decision
  });

  const totalFights = wins + losses + draws;
  
  // Calculate striking accuracy
  const strikingAccuracy = fighter?.significantStrikeAccuracy || 
    (fighter?.significantStrikesLanded && fighter?.significantStrikesAttempted 
      ? Math.round((fighter?.significantStrikesLanded / fighter.significantStrikesAttempted) * 100) 
      : 0);
  
  // Calculate takedown accuracy
  const takedownAccuracy = fighter?.takedownAccuracy || 
    (fighter?.takedownsLanded && fighter?.takedownsAttempted 
      ? Math.round((fighter?.takedownsLanded / fighter?.takedownsAttempted) * 100) 
      : 0);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
      <div className="min-h-screen bg-gray-100 py-8">
        {/* Fighter Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 relative">
                <div className="h-full">
                  <img
                    src={fighter?.profile_img_url || "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}
                    alt={fighter?.name}
                    className="w-full h-full object-cover object-center"
                    style={{ minHeight: '300px' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-none"></div>
                  {fighter?.status === 'Champion' && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                      <Trophy className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center relative">
                <div className="md:hidden absolute top-4 right-4">
                  {fighter?.born && (
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
                      <Flag className="w-4 h-4 mr-1" />
                      <span>{fighter?.born}</span>
                    </div>
                  )}
                </div>
                
                <div className="hidden md:block mb-2">
                  {fighter?.born && (
                    <div className="inline-flex items-center bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">
                      <Flag className="w-4 h-4 mr-1" />
                      <span>{fighter?.born}</span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-1 text-gray-900">{fighter?.name}</h1>
                
                {fighter?.nickname && (
                  <h2 className="text-xl text-gray-600 md:text-gray-600 mb-4">"{fighter?.nickname}"</h2>
                )}
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="text-xs text-gray-500">Record</div>
                    <div className="text-lg font-bold">{fighter?.pro_mma_record}</div>
                  </div>
                  
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="text-xs text-gray-500">Weight Class</div>
                    <div className="text-lg font-bold">{fighter?.weight_class}</div>
                  </div>
                  
                  {fighter?.promotion && (
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="text-xs text-gray-500">Organization</div>
                      <div className="text-lg font-bold">{fighter?.promotion}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {fighter?.age && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Age</div>
                          <div className="font-medium">{fighter?.age} years</div>
                        </div>
                      </div>
                    )}
                    
                    {fighter?.height && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <Ruler className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Height</div>
                          <div className="font-medium">{fighter?.height}</div>
                        </div>
                      </div>
                    )}
                    
                    {fighter?.last_weight_in && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <Scale className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Weight</div>
                          <div className="font-medium">{fighter?.last_weight_in}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {fighter?.reach && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <Maximize className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Reach</div>
                          <div className="font-medium">{fighter?.reach}</div>
                        </div>
                      </div>
                    )}
                    
                    {fighter?.stance && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <Swords className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Stance</div>
                          <div className="font-medium">{fighter?.stance}</div>
                        </div>
                      </div>
                    )}
                    
                    {fighter?.affiliation && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <Dumbbell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">affiliation/Team</div>
                          <div className="font-medium">{fighter?.affiliation}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Professional Record */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Professional Record</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{wins}</div>
                    <div className="text-sm text-gray-600">Wins</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-600">{losses}</div>
                    <div className="text-sm text-gray-600">Losses</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-gray-600">{draws}</div>
                    <div className="text-sm text-gray-600">Draws</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{totalFights}</div>
                    <div className="text-sm text-gray-600">Total Fights</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-4">Win Method Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">KO/TKO</div>
                      <div className="text-lg font-bold">{nbKoTko || Math.floor(wins * 0.4)}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${nbKoTko ? (nbKoTko / wins) * 100 : 40}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Submission</div>
                      <div className="text-lg font-bold">{nbSub || Math.floor(wins * 0.3)}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${nbSub ? (nbSub / wins) * 100 : 30}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Decision</div>
                      <div className="text-lg font-bold">{nbDecision || Math.floor(wins * 0.3)}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${nbDecision ? (nbDecision / wins) * 100 : 30}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Career Statistics */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Career Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-red-500" />
                      Striking
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Significant Strikes Landed</span>
                          <span className="font-medium">{fighter?.significantStrikesLanded || 342}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Significant Strikes Attempted</span>
                          <span className="font-medium">{fighter?.significantStrikesAttempted || 687}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Striking Accuracy</span>
                          <span className="font-medium">{strikingAccuracy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${strikingAccuracy}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Strikes Landed per Minute</span>
                          <span className="font-medium">4.2</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Strikes Absorbed per Minute</span>
                          <span className="font-medium">2.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-500" />
                      Grappling
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Takedowns Landed</span>
                          <span className="font-medium">{fighter?.takedownsLanded || 28}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Takedowns Attempted</span>
                          <span className="font-medium">{fighter?.takedownsAttempted || 47}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Takedown Accuracy</span>
                          <span className="font-medium">{takedownAccuracy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${takedownAccuracy}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Takedown Defense</span>
                          <span className="font-medium">{fighter?.takedownDefense || 76}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${fighter?.takedownDefense || 76}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fighting Style */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">Fighting Style</h2>
                <p className="text-gray-700 leading-relaxed">
                  {fighter?.biography || 
                  `${fighter?.name} is known for ${fighter?.stance === 'Orthodox' ? 'his orthodox stance and technical striking' : 
                  fighter?.stance === 'Southpaw' ? 'his southpaw stance and powerful left hand' : 
                  'his versatile fighting style'}. With a background in ${
                    fighter?.knockouts && fighter?.knockouts > (fighter?.submissions || 0) ? 'striking martial arts' : 
                    fighter?.submissions && fighter?.submissions > (fighter?.knockouts || 0) ? 'grappling and submission wrestling' : 
                    'mixed martial arts'
                  }, ${fighter?.name.split(' ')[0]} has developed a well-rounded skill set that makes him a threat both on the feet and on the ground.
                  
                  ${fighter?.name.split(' ')[0]} is particularly effective at ${
                    strikingAccuracy > 50 ? 'landing precise strikes with high accuracy' : 
                    takedownAccuracy > 50 ? 'securing takedowns and controlling opponents on the ground' : 
                    fighter?.takedownDefense && fighter?.takedownDefense > 70 ? 'defending takedowns and keeping the fight standing' : 
                    'adapting his strategy based on his opponent\'s weaknesses'
                  }. His ${
                    fighter?.knockouts && fighter?.knockouts > (fighter?.submissions || 0) ? 'knockout power' : 
                    fighter?.submissions && fighter?.submissions > (fighter?.knockouts || 0) ? 'submission skills' : 
                    'technical proficiency'
                  } has earned him a reputation as one of the most ${
                    fighter?.status === 'Champion' ? 'dominant champions' : 
                    'dangerous contenders'
                  } in the ${fighter?.weight_class} division.`}
                </p>
              </div>
              
              {/* Fight History */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Fight History</h2>
                <div className="space-y-6">
                {fights.map((fight, index) => {
                  console.log(fight)

                  let opponent; // Declare the variable outside the if-else block

                  if (fight.current_fighter_role == "fighter_1") {
                    opponent = opponents.find((opponent) => opponent.id == fight.id_fighter_2); // Assign to the outer variable
                  } else {
                    opponent = opponents.find((opponent) => opponent.id == fight.id_fighter_1); // Assign to the outer variable
                  }

                  return (
                    <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
                            fight.result === 'win' ? 'bg-green-100 text-green-600' : 
                            fight.result === 'loss' ? 'bg-red-100 text-red-600' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <span className="font-bold uppercase">{
                              fight.result === 'win' ? 'W' : 
                              fight.result === 'loss' ? 'L' : 
                              fight.result === 'draw' ? 'D' : 'NC'
                            }</span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">vs. {opponent?.name}</span> {/* Use the variable here */}
                              {opponent?.small_img_url && (
                                <img 
                                  src={opponent.small_img_url} 
                                  alt={opponent.name}
                                  className="w-6 h-6 rounded-full ml-2 object-cover"
                                />
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(`${fight.month_day}, ${fight.year}`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:text-right">
                          <div className="text-sm text-gray-600">{fight.id_event}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Ranking */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Current Ranking
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Weight Class:</span>
                    <span className="font-medium">{fighter?.weight_class}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Division Rank:</span>
                    <span className="font-medium">{fighter?.status === 'Champion' ? 'Champion' : `#${Math.floor(Math.random() * 15) + 1}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pound for Pound:</span>
                    <span className="font-medium">{fighter?.status === 'Champion' ? `#${Math.floor(Math.random() * 10) + 1}` : 'Unranked'}</span>
                  </div>
                </div>
              </div>
              
              {/* Titles & Achievements */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Titles & Achievements
                </h3>
                <ul className="space-y-3">
                  {(fighter?.titles || (fighter ? generateMockTitles(fighter) : [])).map((title, index) => (
                    <li key={index} className="flex items-start">
                      <Trophy className="w-4 h-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {fighter?.date_of_birth && (
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Born</p>
                        <p className="font-medium">{new Date(fighter?.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                  
                  {fighter?.born && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Birthplace</p>
                        <p className="font-medium">{fighter?.born}</p>
                      </div>
                    </div>
                  )}
                  
                  {fighter?.debut && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">MMA Debut</p>
                        <p className="font-medium">{fighter.debut}</p>
                      </div>
                    </div>
                  )}
                  
                  {fighter?.head_coach && (
                    <div className="flex items-start">
                      <Zap className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Head Coach</p>
                        <p className="font-medium">{fighter.head_coach}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Next Fight */}
              {fighter?.next_fight && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-red-600" />
                    Upcoming Fight
                  </h3>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {new Date(fighter.next_fight).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="font-medium mb-4">UFC Fight Night: Las Vegas</div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <img
                          src={fighter.image_url}
                          alt={fighter.name}
                          className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-blue-500"
                        />
                        <p className="font-medium mt-2">{fighter.name}</p>
                      </div>
                      
                      <div className="px-4 text-xl font-bold text-gray-400">VS</div>
                      
                      <div className="text-center">
                        <img
                          src="https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                          alt="Opponent"
                          className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-red-500"
                        />
                        <p className="font-medium mt-2">Upcoming Opponent</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}

// Helper function to generate mock fight history if not provided
function generateMockFightHistory(fighter: Fighter): FightHistoryItem[] {
  // const recordParts = fighter.record.split('-');
  const recordParts = ['0', '5']
  const wins = parseInt(recordParts[0]);
  const losses = parseInt(recordParts[1]);
  const draws = parseInt(recordParts[2]);
  const totalFights = wins + losses + draws;
  
  const methods = [
    'KO/TKO (Punches)',
    'KO/TKO (Head Kick)',
    'Submission (Rear-Naked Choke)',
    'Submission (Armbar)',
    'Unanimous Decision',
    'Split Decision'
  ];
  
  const events = [
    'UFC 276',
    'UFC Fight Night: Vegas',
    'UFC 265',
    'UFC 259',
    'UFC Fight Night: London'
  ];
  
  const opponents = [
    'Alex Johnson',
    'Mike Thompson',
    'Carlos Silva',
    'James Wilson',
    'Robert Lee'
  ];
  
  const history: FightHistoryItem[] = [];
  
  // Create recent fights (last 5 or less)
  const recentFightsCount = Math.min(totalFights, 5);
  
  for (let i = 0; i < recentFightsCount; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (i * 4)); // Each fight roughly 4 months apart
    
    let result: 'win' | 'loss' | 'draw' | 'nc';
    if (i < wins) {
      result = 'win';
    } else if (i < wins + losses) {
      result = 'loss';
    } else {
      result = 'draw';
    }
    
    history.push({
      id: `fight-${i + 1}`,
      date: date.toISOString(),
      opponent: opponents[i % opponents.length],
      opponentImageUrl: `https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80&id=${i}`,
      result,
      method: methods[Math.floor(Math.random() * methods.length)],
      round: Math.floor(Math.random() * 3) + 1,
      time: `${Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      event: events[i % events.length]
    });
  }
  
  return history;
}

// Helper function to generate mock titles if not provided
function generateMockTitles(fighter: Fighter): string[] {
  const titles = [];
  
  if (fighter.status === 'Champion') {
    titles.push(`Current ${fighter.organization || 'UFC'} ${fighter.weight_class} Champion`);
  }
  
  // Add some random achievements based on record
  // const recordParts = fighter.record.split('-');
  const recordParts = ['0', '5']
  const wins = parseInt(recordParts[0]);
  
  if (wins > 15) {
    titles.push(`${fighter.organization || 'UFC'} ${fighter.weight_class} Champion (2 title defenses)`);
  }
  
  if (wins > 10) {
    titles.push('Performance of the Night (3 times)');
    titles.push('Fight of the Night (2 times)');
  }
  
  if (wins > 5) {
    titles.push('Knockout of the Night (1 time)');
  }
  
  // Add some random regional titles
  titles.push('Former Regional MMA Champion');
  
  // Add some background achievements
  if (Math.random() > 0.5) {
    titles.push('NCAA Division I Wrestling All-American');
  } else {
    titles.push('Brazilian Jiu-Jitsu Black Belt');
  }
  
  return titles;
}