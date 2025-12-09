"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types de contacts
const CONTACT_TYPES = [
  "Locataire",
  "Propriétaire",
  "Professionnel",
  "Artisan",
  "Agence immobilière",
  "Syndic",
  "Fournisseur",
  "Prospect",
  "Autre",
];

export default function ContactModal({ isOpen, onClose, contact }: any) {
  const [id, setId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("France");

  const [type, setType] = useState("");
  const [details, setDetails] = useState("");

  // -------------------------------------------------
  // Remplit le formulaire si on modifie un contact
  // -------------------------------------------------
  useEffect(() => {
    if (contact) {
      setId(contact.id);
      setFullName(contact.full_name || "");
      setEmail(contact.email || "");
      setPhone(contact.phone || "");

      setStreet(contact.street || "");
      setPostalCode(contact.postal_code || "");
      setCity(contact.city || "");
      setCountry(contact.country || "France");

      setType(contact.type || "");
      setDetails(contact.details || "");
    } else {
      setId(null);
      setFullName("");
      setEmail("");
      setPhone("");

      setStreet("");
      setPostalCode("");
      setCity("");
      setCountry("France");

      setType("");
      setDetails("");
    }
  }, [contact]);

  // -------------------------------------------------
  // Sauvegarde (Create / Update)
  // -------------------------------------------------
  const handleSave = async () => {
    const payload = {
      full_name: fullName,
      email,
      phone,
      street,
      postal_code: postalCode,
      city,
      country,
      type,
      details,
    };

    if (id) {
      // Update
      await supabase.from("contacts").update(payload).eq("id", id);
    } else {
      // Create — ⚠️ ne pas refresher ici (realtime le fera)
      await supabase.from("contacts").insert([payload]);
    }

    // ❌ On NE FAIT PLUS refresh() → éviter les doublons
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <h2 className="text-xl font-semibold mb-4">
              {id ? "Modifier le contact" : "Ajouter un contact"}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />

              <input
                type="text"
                placeholder="Téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">Type de contact</option>
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Notes internes / détails"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="border rounded-lg px-3 py-2 w-full resize-none"
              />

              <p className="mt-4 font-medium">Adresse</p>

              <input
                type="text"
                placeholder="Rue"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />

              <input
                type="text"
                placeholder="Code postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />

              <input
                type="text"
                placeholder="Ville"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />

              <input
                type="text"
                placeholder="Pays"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Annuler
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
