"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CalendarEvent = {
  id: string;
  title: string;
  type: string;
  status: string | null;
  property: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  start_time: string;
  end_time: string;
  notes: string | null;
};

type ViewMode = "day" | "week" | "month" | "year";

const MIN_HOUR = 8;
const MAX_HOUR = 20;

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // dimanche = 0 -> 7
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatHourLabel(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focusedMonth, setFocusedMonth] = useState(new Date());

  const [form, setForm] = useState({
    title: "",
    type: "visite",
    property: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(
    null
  );

  // ------------------------------------------
  //   CHARGEMENT DES EVENTS SUPABASE
  // ------------------------------------------
  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });

    if (!error && data) setEvents(data);
    setLoading(false);
  }

  // ------------------------------------------
  //   HELPERS EVENTS
  // ------------------------------------------

  const eventsForDay = (day: Date) =>
    events.filter((ev) => isSameDay(new Date(ev.start_time), day));

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const monthMatrix = useMemo(() => {
    const start = startOfMonth(focusedMonth);
    const end = endOfMonth(focusedMonth);

    const firstDayOfGrid = startOfWeek(start);
    const days: Date[] = [];
    let current = new Date(firstDayOfGrid);
    while (current <= end || days.length < 42) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    return days;
  }, [focusedMonth]);

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ------------------------------------------
  //   DRAG & DROP + DOUBLE-CLICK HELPERS
  // ------------------------------------------

  async function updateEventTime(id: string, start: Date, end: Date) {
    const { data, error } = await supabase
      .from("calendar_events")
      .update({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) {
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent(data);
      }
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, day: Date) {
    if (!draggingEvent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const totalMinutes = (MAX_HOUR - MIN_HOUR) * 60;
    const minutesFromTop = (y / rect.height) * totalMinutes;

    const newStart = new Date(day);
    newStart.setHours(MIN_HOUR + Math.floor(minutesFromTop / 60));
    newStart.setMinutes(Math.floor(minutesFromTop % 60));
    newStart.setSeconds(0, 0);

    const duration =
      new Date(draggingEvent.end_time).getTime() -
      new Date(draggingEvent.start_time).getTime();

    const newEnd = new Date(newStart.getTime() + duration);

    updateEventTime(draggingEvent.id, newStart, newEnd);
    setDraggingEvent(null);
  }

  function handleDoubleClick(e: React.MouseEvent<HTMLDivElement>, day: Date) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const totalMinutes = (MAX_HOUR - MIN_HOUR) * 60;
    const minutesFromTop = (y / rect.height) * totalMinutes;

    const start = new Date(day);
    start.setHours(MIN_HOUR + Math.floor(minutesFromTop / 60));
    start.setMinutes(Math.floor(minutesFromTop % 60));
    start.setSeconds(0, 0);

    const end = new Date(start.getTime() + 30 * 60000); // +30min

    setForm({
      title: "",
      type: "visite",
      property: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      date: start.toISOString().slice(0, 10),
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      notes: "",
    });

    setIsEditing(false);
    setSelectedEvent(null);
  }

  async function handleDeleteEvent() {
    if (!selectedEvent) return;

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", selectedEvent.id);

    if (!error) {
      setEvents((prev) => prev.filter((ev) => ev.id !== selectedEvent.id));
      setSelectedEvent(null);
      setIsEditing(false);
    }
  }

  // ------------------------------------------
  //   SUBMIT FORM (CREATE + UPDATE)
  // ------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.date || !form.startTime || !form.endTime || !form.title) return;

    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);

    if (isEditing && selectedEvent) {
      // UPDATE
      const { data, error } = await supabase
        .from("calendar_events")
        .update({
          title: form.title,
          type: form.type,
          property: form.property || null,
          contact_name: form.contact_name || null,
          contact_email: form.contact_email || null,
          contact_phone: form.contact_phone || null,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          notes: form.notes || null,
        })
        .eq("id", selectedEvent.id)
        .select("*")
        .single();

      if (!error && data) {
        setEvents((prev) => prev.map((ev) => (ev.id === data.id ? data : ev)));
        setSelectedEvent(data);
        setIsEditing(false);
      }
    } else {
      // CREATE
      const { data, error } = await supabase
        .from("calendar_events")
        .insert([
          {
            title: form.title,
            type: form.type,
            property: form.property || null,
            contact_name: form.contact_name || null,
            contact_email: form.contact_email || null,
            contact_phone: form.contact_phone || null,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            status: "prévu",
            notes: form.notes || null,
          },
        ])
        .select("*")
        .single();

      if (!error && data) {
        setEvents((prev) => [...prev, data]);
        setSelectedEvent(data);
        setFocusedMonth(start);
        setSelectedDate(start);
      }
    }

    setForm({
      title: "",
      type: "visite",
      property: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
    });
  }

  // ------------------------------------------
  //   RENDUS DES VUES PRINCIPALES
  // ------------------------------------------

  const hours = Array.from(
    { length: MAX_HOUR - MIN_HOUR + 1 },
    (_, i) => MIN_HOUR + i
  );

  function renderDayView() {
    const dayEvents = eventsForDay(selectedDate);

    return (
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-3 border-b flex items-baseline justify-between bg-white">
          <div>
            <h2 className="text-2xl font-semibold">
              {selectedDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {selectedDate.toLocaleDateString("fr-FR", { weekday: "long" })}
            </p>
          </div>
        </div>

        <div className="flex">
          {/* Colonne heures */}
          <div className="w-16 border-r bg-gray-50 text-[11px] text-right pr-2">
            {hours.map((h) => (
              <div key={h} className="h-12 border-t border-gray-200 pt-1">
                {formatHourLabel(h)}
              </div>
            ))}
          </div>

          {/* Grille + events */}
          <div
            className="flex-1 relative bg-white"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, selectedDate)}
            onDoubleClick={(e) => handleDoubleClick(e, selectedDate)}
          >
            {/* lignes horaires */}
            {hours.map((h) => (
              <div
                key={h}
                className="h-12 border-t border-gray-100 text-[11px]"
              />
            ))}

            {/* events positionnés */}
            {dayEvents.map((ev) => {
              const start = new Date(ev.start_time);
              const end = new Date(ev.end_time);

              const startMinutes = start.getHours() * 60 + start.getMinutes();
              const endMinutes = end.getHours() * 60 + end.getMinutes();

              const dayStartMinutes = MIN_HOUR * 60;
              const dayEndMinutes = MAX_HOUR * 60;
              const totalMinutes = dayEndMinutes - dayStartMinutes;

              const top =
                ((startMinutes - dayStartMinutes) / totalMinutes) * 100;
              const rawHeight =
                ((endMinutes - startMinutes) / totalMinutes) * 100;
              const height = Math.max(rawHeight, 6); // hauteur min 6%

              return (
                <div
                  key={ev.id}
                  draggable
                  onDragStart={() => setDraggingEvent(ev)}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setIsEditing(false);
                  }}
                  className="absolute left-2 right-2 rounded-md bg-blue-500/15 border border-blue-400 px-2 py-1 text-[11px] shadow-sm overflow-hidden cursor-pointer group"
                  style={{ top: `${top}%`, height: `${height}%` }}
                >
                  <p className="font-semibold text-blue-900 truncate">
                    {ev.title}
                  </p>
                  <p className="text-[10px] text-gray-700">
                    {formatTime(ev.start_time)} – {formatTime(ev.end_time)}
                  </p>
                  {ev.property && (
                    <p className="text-[10px] text-gray-600 truncate">
                      🏠 {ev.property}
                    </p>
                  )}

                  {/* TOOLTIP DÉTAILS */}
                  <div
                    className="
                      absolute left-full top-1/2 -translate-y-1/2 ml-2
                      w-64 p-3 rounded-xl shadow-lg bg-white border border-gray-200
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      z-50 text-[11px]
                    "
                  >
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      {ev.title}
                    </p>

                    <p className="text-xs text-gray-600 mb-1">
                      🕒 {formatTime(ev.start_time)} → {formatTime(ev.end_time)}
                    </p>

                    {ev.property && (
                      <p className="text-xs text-gray-600 mb-1">
                        🏠 Propriété : {ev.property}
                      </p>
                    )}

                    {ev.contact_name && (
                      <p className="text-xs text-gray-600">
                        👤 {ev.contact_name}
                      </p>
                    )}
                    {ev.contact_email && (
                      <p className="text-xs text-gray-600">
                        ✉️ {ev.contact_email}
                      </p>
                    )}
                    {ev.contact_phone && (
                      <p className="text-xs text-gray-600">
                        📞 {ev.contact_phone}
                      </p>
                    )}

                    {ev.notes && (
                      <p className="text-xs text-gray-600 mt-2 border-t pt-2">
                        📝 {ev.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  function renderWeekView() {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-3 border-b flex items-baseline justify-between bg-white">
          <h2 className="text-xl font-semibold">
            {selectedDate.toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <span className="text-sm text-gray-500">
            Semaine du{" "}
            {weekDays[0].toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}{" "}
            au{" "}
            {weekDays[6].toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        <div className="flex">
          {/* heures */}
          <div className="w-16 border-r bg-gray-50 text-[11px] text-right pr-2">
            {hours.map((h) => (
              <div key={h} className="h-12 border-t border-gray-200 pt-1">
                {formatHourLabel(h)}
              </div>
            ))}
          </div>

          {/* colonnes jours */}
          <div className="flex-1 grid grid-cols-7 bg-white text-[11px]">
            {weekDays.map((day) => {
              const dayEvents = eventsForDay(day);

              return (
                <div
                  key={day.toISOString()}
                  className="relative border-l"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, day)}
                  onDoubleClick={(e) => handleDoubleClick(e, day)}
                >
                  {/* header jour */}
                  <div className="h-10 flex flex-col items-center justify-center border-b bg-white sticky top-0 z-10">
                    <span className="capitalize">
                      {day.toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                    </span>
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs mt-1 ${
                        isSameDay(day, new Date())
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* lignes horaires */}
                  <div className="relative">
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="h-12 border-t border-gray-100"
                      />
                    ))}

                    {/* events */}
                    {dayEvents.map((ev) => {
                      const start = new Date(ev.start_time);
                      const end = new Date(ev.end_time);

                      const startMinutes =
                        start.getHours() * 60 + start.getMinutes();
                      const endMinutes =
                        end.getHours() * 60 + end.getMinutes();

                      const dayStartMinutes = MIN_HOUR * 60;
                      const dayEndMinutes = MAX_HOUR * 60;
                      const totalMinutes = dayEndMinutes - dayStartMinutes;

                      const top =
                        ((startMinutes - dayStartMinutes) / totalMinutes) *
                        100;
                      const rawHeight =
                        ((endMinutes - startMinutes) / totalMinutes) * 100;
                      const height = Math.max(rawHeight, 6); // hauteur min 6%

                      return (
                        <div
                          key={ev.id}
                          draggable
                          onDragStart={() => setDraggingEvent(ev)}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setIsEditing(false);
                          }}
                          className="absolute left-1 right-1 rounded-md bg-blue-500/15 border border-blue-400 px-1 py-[2px] text-[10px] shadow-sm overflow-hidden cursor-pointer group"
                          style={{ top: `${top}%`, height: `${height}%` }}
                        >
                          <p className="font-semibold text-blue-900 truncate">
                            {ev.title}
                          </p>
                          <p className="text-[9px] text-gray-700">
                            {formatTime(ev.start_time)} –{" "}
                            {formatTime(ev.end_time)}
                          </p>

                          {/* TOOLTIP DÉTAILS */}
                          <div
                            className="
                              absolute left-full top-1/2 -translate-y-1/2 ml-2
                              w-60 p-3 rounded-xl shadow-lg bg-white border border-gray-200
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              z-50 text-[11px]
                            "
                          >
                            <p className="font-semibold text-gray-900 text-sm mb-1">
                              {ev.title}
                            </p>

                            <p className="text-xs text-gray-600 mb-1">
                              🕒 {formatTime(ev.start_time)} →{" "}
                              {formatTime(ev.end_time)}
                            </p>

                            {ev.property && (
                              <p className="text-xs text-gray-600 mb-1">
                                🏠 Propriété : {ev.property}
                              </p>
                            )}

                            {ev.contact_name && (
                              <p className="text-xs text-gray-600">
                                👤 {ev.contact_name}
                              </p>
                            )}
                            {ev.contact_email && (
                              <p className="text-xs text-gray-600">
                                ✉️ {ev.contact_email}
                              </p>
                            )}
                            {ev.contact_phone && (
                              <p className="text-xs text-gray-600">
                                📞 {ev.contact_phone}
                              </p>
                            )}

                            {ev.notes && (
                              <p className="text-xs text-gray-600 mt-2 border-t pt-2">
                                📝 {ev.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  function renderMonthView() {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-3 border-b flex items-baseline justify-between bg-white">
          <h2 className="text-xl font-semibold">
            {focusedMonth.toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>

        {/* jours de la semaine */}
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 border-b bg-white py-2">
          {["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."].map(
            (d) => (
              <div key={d}>{d}</div>
            )
          )}
        </div>

        {/* grille mois */}
        <div className="grid grid-cols-7 text-xs bg-white">
          {monthMatrix.map((day) => {
            const inMonth = day.getMonth() === focusedMonth.getMonth();
            const dayEvents = eventsForDay(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setView("day");
                }}
                className={`h-24 border-t border-l px-1 pt-1 text-left align-top relative ${
                  inMonth ? "bg-white" : "bg-gray-50"
                } ${
                  isSameDay(day, selectedDate)
                    ? "ring-1 ring-blue-500 z-10"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[11px] ${
                      inMonth ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-sm bg-blue-100 text-[10px] px-1 py-[1px] truncate"
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-blue-700">
                      +{dayEvents.length - 3} autres
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

  function renderYearView() {
    const year = focusedMonth.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
      <Card className="p-4 overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">{year}</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-[11px]">
          {months.map((m) => {
            const matrix = (() => {
              const start = startOfMonth(m);
              const end = endOfMonth(m);
              const firstGrid = startOfWeek(start);

              const days: Date[] = [];
              let current = new Date(firstGrid);
              while (current <= end || days.length < 42) {
                days.push(new Date(current));
                current = addDays(current, 1);
              }
              return days;
            })();

            return (
              <div key={m.getMonth()} className="border rounded-lg p-2 bg-white">
                <div className="text-center font-semibold mb-2">
                  {m.toLocaleDateString("fr-FR", { month: "long" })}
                </div>
                <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 mb-1">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-[2px] text-center">
                  {matrix.map((day) => {
                    const inMonth = day.getMonth() === m.getMonth();

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          setFocusedMonth(day);
                          setSelectedDate(day);
                          setView("day");
                        }}
                        className={`h-5 rounded-full text-[10px] ${
                          !inMonth ? "text-gray-300" : "text-gray-700"
                        } ${
                          isSameDay(day, new Date())
                            ? "bg-blue-600 text-white"
                            : ""
                        }`}
                      >
                        {day.getDate() === 1 || inMonth ? day.getDate() : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // ------------------------------------------
  //   MINI CALENDRIER GAUCHE
  // ------------------------------------------
  function renderMiniCalendar() {
    const miniMatrix = monthMatrix;

    return (
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify_between mb-1">
          <div>
            <p className="text-xs text-gray-500">
              {focusedMonth.toLocaleDateString("fr-FR", { month: "long" })}
            </p>
            <p className="font-semibold text-sm">
              {focusedMonth.toLocaleDateString("fr-FR", { year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() =>
                setFocusedMonth(
                  new Date(
                    focusedMonth.getFullYear(),
                    focusedMonth.getMonth() - 1,
                    1
                  )
                )
              }
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setFocusedMonth(
                  new Date(
                    focusedMonth.getFullYear(),
                    focusedMonth.getMonth() + 1,
                    1
                  )
                )
              }
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 mb-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[2px] text-center text-[11px]">
          {miniMatrix.map((day) => {
            const inMonth = day.getMonth() === focusedMonth.getMonth();
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setFocusedMonth(day);
                }}
                className={`h-6 w-6 flex items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : inMonth
                    ? "text-gray-800 hover:bg-gray-100"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

  // ------------------------------------------
  //   RENDU PRINCIPAL
  // ------------------------------------------
  return (
    <main className="flex min-h-screen bg-gray-50 text-gray-900">

      <section className="flex-1 p-6">
        {/* HEADER CALENDRIER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Calendrier</h1>
            <p className="text-sm text-gray-500">
              Planification des visites, appels et rendez-vous.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Boutons vue */}
            <div className="flex items-center bg-gray-100 rounded-full px-1 py-1 text-sm">
              {[
                { key: "day", label: "Jour" },
                { key: "week", label: "Semaine" },
                { key: "month", label: "Mois" },
                { key: "year", label: "Année" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key as ViewMode)}
                  className={`px-3 py-1 rounded-full ${
                    view === v.key
                      ? "bg-white shadow-sm"
                      : "hover:bg-white/70"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Aujourd'hui */}
            <button
              onClick={() => {
                const now = new Date();
                setSelectedDate(now);
                setFocusedMonth(now);
              }}
              className="px-3 py-1 rounded-full border bg-white text-sm hover:bg-gray-100"
            >
              Aujourd’hui
            </button>

            {/* Loupe déco */}
            <button className="p-2 rounded-full border bg-white hover:bg-gray-100">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LAYOUT 3 COLONNES : mini cal / vue / formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-6"
        >
          {/* MINI CALENDRIER */}
          <div className="order-2 xl:order-1">{renderMiniCalendar()}</div>

          {/* VUE PRINCIPALE */}
          <div className="order-1 xl:order-2 space-y-4">
            {loading ? (
              <Card className="p-6 text-sm text-gray-400">
                Chargement des événements…
              </Card>
            ) : view === "day" ? (
              renderDayView()
            ) : view === "week" ? (
              renderWeekView()
            ) : view === "month" ? (
              renderMonthView()
            ) : (
              renderYearView()
            )}
          </div>

          {/* FORMULAIRE / PANNEAU DROIT */}
          <Card className="order-3 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">
                {isEditing ? "Modifier l’événement" : "Nouvel événement"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              {/* Titre */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Titre *
                </label>
                <input
                  className="w-full border rounded-lg px-2 py-1"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  placeholder="Visite T2 Paris 15e"
                />
              </div>

              {/* Type + nom */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Type
                  </label>
                  <select
                    className="w-full border rounded-lg px-2 py-1"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="visite">Visite</option>
                    <option value="appel">Appel</option>
                    <option value="réunion">Réunion</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Contact (nom)
                  </label>
                  <input
                    className="w-full border rounded-lg px-2 py-1"
                    value={form.contact_name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contact_name: e.target.value,
                      }))
                    }
                    placeholder="Nom du contact"
                  />
                </div>
              </div>

              {/* Email + tel */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-2 py-1"
                    value={form.contact_email}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contact_email: e.target.value,
                      }))
                    }
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    className="w-full border rounded-lg px-2 py-1"
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contact_phone: e.target.value,
                      }))
                    }
                    placeholder="0600000000"
                  />
                </div>
              </div>

              {/* Bien */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Bien / propriété
                </label>
                <input
                  className="w-full border rounded-lg px-2 py-1"
                  value={form.property}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, property: e.target.value }))
                  }
                  placeholder="Appartement, local, etc."
                />
              </div>

              {/* Date + heures */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-2 py-1"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Début *
                    </label>
                    <input
                      type="time"
                      className="w-full border rounded-lg px-2 py-1"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          startTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Fin *
                    </label>
                    <input
                      type="time"
                      className="w-full border rounded-lg px-2 py-1"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          endTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full border rounded-lg px-2 py-1 min-h-[70px]"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Infos complémentaires, codes d’accès, etc."
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 transition"
              >
                {isEditing ? "Mettre à jour l’événement" : "Enregistrer l’événement"}
              </button>
            </form>

            {/* panneau infos / détails selectedEvent */}
            {selectedEvent ? (
              <div className="pt-4 border-t text-sm space-y-2">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Détails du rendez-vous
                </h3>

                <p>
                  <span className="font-medium">Titre :</span>{" "}
                  {selectedEvent.title}
                </p>
                <p>
                  <span className="font-medium">Type :</span>{" "}
                  {selectedEvent.type}
                </p>
                <p>
                  <span className="font-medium">Horaires :</span>{" "}
                  {formatTime(selectedEvent.start_time)} →{" "}
                  {formatTime(selectedEvent.end_time)}
                </p>

                {selectedEvent.property && (
                  <p>
                    <span className="font-medium">Bien :</span>{" "}
                    {selectedEvent.property}
                  </p>
                )}

                {selectedEvent.contact_name && (
                  <p>
                    <span className="font-medium">Contact :</span>{" "}
                    {selectedEvent.contact_name}
                  </p>
                )}
                {selectedEvent.contact_email && (
                  <p>
                    <span className="font-medium">Email :</span>{" "}
                    {selectedEvent.contact_email}
                  </p>
                )}
                {selectedEvent.contact_phone && (
                  <p>
                    <span className="font-medium">Téléphone :</span>{" "}
                    {selectedEvent.contact_phone}
                  </p>
                )}

                {selectedEvent.notes && (
                  <p>
                    <span className="font-medium">Notes :</span>{" "}
                    {selectedEvent.notes}
                  </p>
                )}

                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setForm({
                        title: selectedEvent.title,
                        type: selectedEvent.type,
                        property: selectedEvent.property || "",
                        contact_name: selectedEvent.contact_name || "",
                        contact_email: selectedEvent.contact_email || "",
                        contact_phone: selectedEvent.contact_phone || "",
                        date: selectedEvent.start_time.slice(0, 10),
                        startTime: selectedEvent.start_time.slice(11, 16),
                        endTime: selectedEvent.end_time.slice(11, 16),
                        notes: selectedEvent.notes || "",
                      });
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Modifier cet événement
                  </button>

                  <button
                    onClick={handleDeleteEvent}
                    className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Supprimer l’événement
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t text-xs text-gray-400">
                Aucun événement sélectionné.
              </div>
            )}
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
