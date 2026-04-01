import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';

const AddPatient = () => {
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', blood_group: '', phone: '', relation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await patientApi.addFamilyMember({
        patient_id: user.user_id,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        blood_group: formData.blood_group,
        phone: formData.phone,
        relation: formData.relation,
      });
      setSuccess(true);
      setTimeout(() => navigate('/patient/home'), 1500);
    } catch {
      setError('Failed to add family member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Add Family Member</h1>
            <p className="text-blue-300 text-sm mt-0.5">Register a family member for appointment booking</p>
          </div>
          <button onClick={() => navigate('/patient/home')} className="text-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition">
            Back
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-700 font-semibold">Family member added successfully</p>
              <p className="text-gray-400 text-sm mt-1">Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter full name' },
                { label: 'Age', key: 'age', type: 'number', placeholder: 'Enter age' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: 'Enter phone number' },
                { label: 'Relation', key: 'relation', type: 'text', placeholder: 'e.g. Father, Mother, Spouse' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={formData[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent outline-none"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                <select value={formData.gender} onChange={e => set('gender', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent outline-none">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blood Group</label>
                <select value={formData.blood_group} onChange={e => set('blood_group', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent outline-none">
                  <option value="">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#0b1f3a] text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Adding...' : 'Add Family Member'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AddPatient;
