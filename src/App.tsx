
import { useEffect, useState } from 'react';
import './App.css';
import { supabase } from '../supabase/client';


function App() {
  // State for storing profiles data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch profiles from Supabase
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        alert('Error fetching data: ' + error.message);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase + React Profiles</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Table for displaying profiles */}
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead>
              <tr>
                {/* Dynamically render table headers based on profile keys */}
                {profiles[0] && Object.keys(profiles[0]).map((key) => (
                  <th key={key} className="px-4 py-2 border-b bg-gray-100 text-left text-sm font-semibold text-gray-700">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Render each profile as a table row */}
              {profiles.map((profile, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(profile).map((value, i) => (
                    <td key={i} className="px-4 py-2 border-b text-sm text-gray-800">{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App
