import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLOR = { green: '#16a34a', yellow: '#ca8a04', red: '#dc2626' };
const STATUS_LABEL = { green: '🟢 Good Availability', yellow: '🟡 Limited Availability', red: '🔴 Critical / Full' };

const HospitalMap = ({ hospitals }) => {
  const valid = hospitals.filter(h => h.latitude && h.longitude);
  const center = valid.length > 0 ? [valid[0].latitude, valid[0].longitude] : [20.5937, 78.9629];

  return (
    <div className="rounded-xl overflow-hidden border shadow-lg" style={{ height: '450px' }}>
      <MapContainer center={center} zoom={valid.length > 0 ? 12 : 5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {valid.map(h => (
          <CircleMarker
            key={h.hospital_id}
            center={[h.latitude, h.longitude]}
            radius={14}
            pathOptions={{
              color: STATUS_COLOR[h.status],
              fillColor: STATUS_COLOR[h.status],
              fillOpacity: 0.85,
              weight: 2
            }}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>{h.hospital_name}</p>
                <p style={{ fontSize: '11px', color: '#666' }}>{h.address}, {h.city}</p>
                <p style={{ fontSize: '12px', marginTop: '6px' }}>{STATUS_LABEL[h.status]}</p>
                <p style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '4px' }}>🛏️ {h.available_beds}/{h.total_beds} beds available</p>
                {h.contact_number && <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>📞 {h.contact_number}</p>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HospitalMap;
