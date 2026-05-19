import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Users, ArrowRight, Shield } from 'lucide-react';

interface Person {
  id: string;
  name: string;
}

export default function HomePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    const { data } = await supabase.from('people').select('id, name').order('name');
    setPeople(data || []);
    setLoading(false);
  }

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleNext() {
    if (selected) {
      navigate(`/write/${selected}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-white/60"
        >
          <Shield className="w-4 h-4" />
          Admin
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 mb-6">
            <Users className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Farewell Notes
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
            Choose a person and share your memories, wishes, or words of appreciation for them.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for a person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {search ? 'No people found matching your search.' : 'No people have been added yet.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filtered.map((person) => (
                <button
                  key={person.id}
                  onClick={() => setSelected(person.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                    selected === person.id
                      ? 'bg-teal-50 border-2 border-teal-500 text-teal-900'
                      : 'bg-slate-50 border-2 border-transparent text-slate-700 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className="font-medium">{person.name}</span>
                  {selected === person.id && (
                    <ArrowRight className="w-4 h-4 text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={!selected}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                selected
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
