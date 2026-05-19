import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  User,
  MessageSquare,
  Trash2,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface Person {
  id: string;
  name: string;
  created_at: string;
}

interface Description {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

function getAuthHeaders() {
  const credentials = sessionStorage.getItem('admin_auth');
  return { Authorization: `Basic ${credentials}` };
}

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

export default function AdminDashboard() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [descLoading, setDescLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) {
      navigate('/admin');
      return;
    }
    fetchPeople();
  }, [navigate]);

  async function fetchPeople() {
    try {
      const res = await fetch(`${API_BASE}/`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Auth failed');
      const data = await res.json();
      setPeople(data);
    } catch {
      sessionStorage.removeItem('admin_auth');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  }

  const fetchDescriptions = useCallback(async (personId: string) => {
    setDescLoading(true);
    try {
      const res = await fetch(`${API_BASE}/descriptions/${personId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setDescriptions(data);
    } catch {
      setDescriptions([]);
    } finally {
      setDescLoading(false);
    }
  }, []);

  function selectPerson(person: Person) {
    setSelectedPerson(person);
    fetchDescriptions(person.id);
  }

  async function handleAddPerson() {
    if (!newName.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch(`${API_BASE}/people`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const person = await res.json();
        setPeople((prev) => [...prev, person].sort((a, b) => a.name.localeCompare(b.name)));
        setNewName('');
        setShowAddModal(false);
      } else {
        const data = await res.json();
        setAddError(data.error || 'Failed to add person');
      }
    } catch {
      setAddError('Something went wrong');
    } finally {
      setAdding(false);
    }
  }

  async function handleDeletePerson(id: string) {
    if (!confirm('Delete this person and all their notes?')) return;
    try {
      await fetch(`${API_BASE}/people/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setPeople((prev) => prev.filter((p) => p.id !== id));
      if (selectedPerson?.id === id) {
        setSelectedPerson(null);
        setDescriptions([]);
      }
    } catch {
      // silently fail
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin');
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* People List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <h2 className="font-semibold text-slate-900">People</h2>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {people.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {people.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No people added yet. Click "Add" to get started.
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors group ${
                        selectedPerson?.id === person.id
                          ? 'bg-teal-50'
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => selectPerson(person)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            selectedPerson?.id === person.id
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`text-sm font-medium truncate ${
                            selectedPerson?.id === person.id
                              ? 'text-teal-900'
                              : 'text-slate-700'
                          }`}
                        >
                          {person.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePerson(person.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight
                          className={`w-4 h-4 ${
                            selectedPerson?.id === person.id
                              ? 'text-teal-600'
                              : 'text-slate-300'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Descriptions Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
              <div className="flex items-center gap-2 p-5 border-b border-slate-100">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-900">
                  {selectedPerson ? `Notes for ${selectedPerson.name}` : 'Notes'}
                </h2>
                {selectedPerson && descriptions.length > 0 && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {descriptions.length}
                  </span>
                )}
              </div>

              {!selectedPerson ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Select a person from the list to view their notes.
                </div>
              ) : descLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : descriptions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No notes have been written for {selectedPerson.name} yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                  {descriptions.map((desc) => (
                    <div key={desc.id} className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {desc.author_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {desc.author_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(desc.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed pl-8">
                        {desc.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Add Person</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewName('');
                  setAddError('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {addError}
              </div>
            )}

            <input
              type="text"
              placeholder="Enter person's name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all mb-4"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewName('');
                  setAddError('');
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPerson}
                disabled={!newName.trim() || adding}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  newName.trim() && !adding
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {adding ? 'Adding...' : 'Add Person'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
