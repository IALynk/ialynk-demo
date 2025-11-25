"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MessagesList() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("Messages")
        .select("sender, content, time")
        .order("time", { ascending: false });
        console.log("Données reçues :", data);

      if (error) {
        console.error("Erreur de récupération :", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  if (loading) return <p>Chargement des messages...</p>;

  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">Messages récents</h3>
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm">
              <th className="pb-2">Expéditeur</th>
              <th className="pb-2">Contenu</th>
              <th className="pb-2">Heure</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, index) => (
              <tr key={index} className="border-t border-gray-100 text-sm">
                <td className="py-2">{msg.sender}</td>
                <td className="py-2">{msg.content}</td>
                <td className="py-2 text-gray-500">
                  {new Date(msg.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
