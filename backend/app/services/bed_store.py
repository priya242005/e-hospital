from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Literal, Optional, Tuple

from app.firebase import db

BedStatus = Literal["available", "reserved", "occupied"]
BedType = Literal["general", "icu", "emergency"]


@dataclass(frozen=True)
class BedAvailability:
    hospital_id: str
    general_beds_available: int
    icu_beds_available: int
    emergency_beds_available: int

    @property
    def total_available(self) -> int:
        return self.general_beds_available + self.icu_beds_available + self.emergency_beds_available


def _count_available(beds: Iterable[dict]) -> Tuple[int, int, int]:
    general = 0
    icu = 0
    emergency = 0
    for b in beds:
        if b.get("status") != "available":
            continue
        t = (b.get("bed_type") or "").lower()
        if t == "general":
            general += 1
        elif t == "icu":
            icu += 1
        elif t == "emergency":
            emergency += 1
    return general, icu, emergency


def get_beds_collection_name() -> str:
    """
    Canonical name going forward is `beds`, but we keep a fallback to legacy `bed_management`.
    """
    return "beds"


def _fetch_per_bed_docs(hospital_id: str, collection: str) -> list[dict]:
    docs = db.collection(collection).where("hospital_id", "==", hospital_id).stream()
    return [d.to_dict() for d in docs]


def get_bed_availability(hospital_id: str) -> BedAvailability:
    """
    Single-source availability query with safe fallback:
    - Prefer per-bed docs in `beds`
    - Fallback to legacy `bed_management`
    """
    primary = get_beds_collection_name()
    beds = _fetch_per_bed_docs(hospital_id, primary)
    if not beds and primary != "bed_management":
        beds = _fetch_per_bed_docs(hospital_id, "bed_management")

    g, i, e = _count_available(beds)
    return BedAvailability(
        hospital_id=hospital_id,
        general_beds_available=g,
        icu_beds_available=i,
        emergency_beds_available=e,
    )


def update_bed_fields(bed_id: str, fields: dict, *, hospital_id: Optional[str] = None) -> None:
    """
    Partial update of a bed record in canonical store, falling back if needed.
    """
    primary = get_beds_collection_name()
    doc = db.collection(primary).document(bed_id).get()
    if doc.exists:
        db.collection(primary).document(bed_id).update(fields)
        return

    # Fallback to legacy if the bed isn't in canonical store yet.
    db.collection("bed_management").document(bed_id).update(fields)

