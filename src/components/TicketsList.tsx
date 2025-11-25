"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function TicketsList() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase.from("Tickets").select("*").order("created_at", { ascending: false })
      if (error) console.error("Erreur de récupération :", error)
      else setTickets(data || [])
      setLoading(false)
    }

    fetchTickets()
  }, [])

  const getColor = (status: string) => {
    switch (status) {
      case "En cours":
        return "bg-yellow-100 text-yellow-800"
      case "Résolu":
        return "bg-green-100 text-green-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) return <p>Chargement des tickets...</p>

  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">Tickets récents</h3>
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm">
              <th className="pb-2">ID</th>
              <th className="pb-2">Titre</th>
              <th className="pb-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t text-gray-700">
                <td className="py-2">{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>
                  <span className={`px-2 py-1 text-sm rounded-full ${getColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
