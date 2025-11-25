export function RecentActivity() {
  const activity = [
    { name: "Lucia Moretti", action: "a envoyé un SMS", time: "09:13" },
    { name: "Pierre Dubois", action: "a répondu à l’IA", time: "08:40" },
    { name: "Julie Martin", action: "a appelé (manqué)", time: "08:05" },
  ];

  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">Activité récente</h3>
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <ul className="divide-y divide-gray-100">
          {activity.map((item, i) => (
            <li key={i} className="py-3 flex justify-between text-gray-700">
              <span>
                <strong>{item.name}</strong> {item.action}
              </span>
              <span className="text-sm text-gray-500">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
