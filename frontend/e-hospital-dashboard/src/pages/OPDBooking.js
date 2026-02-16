import { useState } from "react";
import axios from "axios";

export default function OPDBooking() {
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "",
    hospitalId: "",
    department: "",
    priority: "normal"
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hospitals = [
    { id: "H001", name: "AIIMS Delhi" },
    { id: "H002", name: "Safdarjung Hospital" }
  ];

  const departments = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Pediatrics"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/opd/", {
        patient_id: formData.patientId,
        appointment_id: formData.appointmentId,
        hospital_id: formData.hospitalId,
        department: formData.department,
        priority: formData.priority
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- SUCCESS VIEW --------------------
  if (result) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-green-50 border border-green-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            ✅ OPD Booked Successfully
          </h2>

          <div className="space-y-3">
            <p><strong>Token:</strong> {result.token}</p>
            <p><strong>Assigned Doctor:</strong> {result.doctor_id}</p>
            <p><strong>Patients Ahead:</strong> {result.patients_ahead}</p>
            <p className="text-orange-600 font-semibold">
              ⏱ Expected Waiting Time: {result.expected_waiting_time_min} minutes
            </p>
          </div>

          <button
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded"
            onClick={() => setResult(null)}
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  // -------------------- FORM VIEW --------------------
  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">OPD Booking</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Patient ID"
            className="w-full border p-2 rounded"
            value={formData.patientId}
            onChange={(e) =>
              setFormData({ ...formData, patientId: e.target.value })
            }
          />

          <input
            required
            placeholder="Appointment ID"
            className="w-full border p-2 rounded"
            value={formData.appointmentId}
            onChange={(e) =>
              setFormData({ ...formData, appointmentId: e.target.value })
            }
          />

          <select
            required
            className="w-full border p-2 rounded"
            value={formData.hospitalId}
            onChange={(e) =>
              setFormData({ ...formData, hospitalId: e.target.value })
            }
          >
            <option value="">Select Hospital</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          <select
            required
            className="w-full border p-2 rounded"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="w-full border p-2 rounded"
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
          >
            <option value="normal">Normal</option>
            <option value="elder">Elder</option>
            <option value="emergency">Emergency</option>
          </select>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Booking..." : "Book OPD"}
          </button>
        </form>
      </div>
    </div>
  );
}
