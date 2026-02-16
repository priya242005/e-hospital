import OPDCard from "./OPDCard";
import BedCard from "./BedCard";
import DoctorCard from "./DoctorCard";
import PharmacyCard from "./PharmacyCard";

export default function Dashboard() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <OPDCard />
      <BedCard />
      <DoctorCard />
      <PharmacyCard />
    </div>
  );
}
