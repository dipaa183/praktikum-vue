import { ref, computed, watch } from 'vue'

const EVENTS_KEY = 'gatherly_events'
const REGS_KEY = 'gatherly_user_registrations'

// Membaca localStorage dengan aman (kalau data rusak, pakai nilai cadangan)
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// SINGLE SOURCE OF TRUTH (di luar fungsi agar dipakai bersama semua halaman)
const events = ref(load(EVENTS_KEY, []))
const userRegistrations = ref(load(REGS_KEY, []))

// WATCHERS: simpan otomatis ke localStorage setiap state berubah
watch(events, (v) => localStorage.setItem(EVENTS_KEY, JSON.stringify(v)), { deep: true })
watch(userRegistrations, (v) => localStorage.setItem(REGS_KEY, JSON.stringify(v)), { deep: true })

export function useEvents() {
  // DERIVED STATE
  const totalEvents = computed(() => events.value.length)
  const activeEvents = computed(() => events.value.filter((e) => !e.done))
  const completedEvents = computed(() => events.value.filter((e) => e.done))
  const totalRegistrations = computed(() => userRegistrations.value.length)

  // CREATE EVENT
  const createEvent = (eventData) => {
    const newEvent = {
      id: Date.now(),
      title: eventData.title.trim(),
      date: eventData.date,
      loc: eventData.loc.replace(/^📍\s*/, '').trim(),
      cat: eventData.cat,
      quota: Number(eventData.quota) || 100,
      desc: eventData.desc.trim(),
      done: false,
    }
    events.value.unshift(newEvent)
    return newEvent
  }

  // COMPLETE EVENT
  const completeEvent = (id) => {
    const target = events.value.find((e) => e.id === Number(id))
    if (target) target.done = true
  }

  // DELETE EVENT + PEMBERSIHAN BERANTAI (hapus semua tiket milik acara itu)
  const deleteEvent = (id) => {
    const numId = Number(id)
    const index = events.value.findIndex((e) => e.id === numId)
    if (index !== -1) events.value.splice(index, 1)
    userRegistrations.value = userRegistrations.value.filter((r) => r.eventId !== numId)
  }

  const getEventById = (id) => events.value.find((e) => e.id === Number(id))

  // REGISTER ATTENDEE: kurangi kuota, buat kode booking, simpan tiket
  const registerAttendee = (eventId, participantData) => {
    const target = events.value.find((e) => e.id === Number(eventId))
    if (!target || target.done || target.quota <= 0) return null
    if (userRegistrations.value.some((r) => r.eventId === target.id)) return null

    const bookingCode =
      'GTH-' +
      Date.now().toString(36).toUpperCase().slice(-4) +
      Math.random().toString(36).toUpperCase().slice(2, 6)

    const record = {
      id: Date.now(),
      eventId: target.id,
      eventTitle: target.title,
      eventCat: target.cat,
      eventDate: target.date,
      eventLoc: target.loc,
      bookingCode,
      registeredAt: new Date().toISOString(),
      fullName: participantData.fullName.trim(),
      email: participantData.email.trim(),
      phone: participantData.phone.trim(),
      dob: participantData.dob,
      reason: participantData.reason.trim(),
    }

    target.quota = Math.max(0, target.quota - 1)
    userRegistrations.value.unshift(record)
    return record
  }

  const isUserRegistered = (eventId) =>
    userRegistrations.value.some((r) => r.eventId === Number(eventId))

  const getRegistrationByEventId = (eventId) =>
    userRegistrations.value.find((r) => r.eventId === Number(eventId))

  // CANCEL REGISTRATION: hapus tiket dan kembalikan kuota
  const cancelRegistration = (eventId) => {
    const numId = Number(eventId)
    const index = userRegistrations.value.findIndex((r) => r.eventId === numId)
    if (index === -1) return false
    userRegistrations.value.splice(index, 1)
    const target = events.value.find((e) => e.id === numId)
    if (target) target.quota += 1
    return true
  }

  const clearAllEvents = () => {
    events.value = []
    userRegistrations.value = []
    localStorage.removeItem(EVENTS_KEY)
    localStorage.removeItem(REGS_KEY)
  }

  return {
    events,
    totalEvents,
    activeEvents,
    completedEvents,
    userRegistrations,
    totalRegistrations,
    createEvent,
    completeEvent,
    deleteEvent,
    getEventById,
    registerAttendee,
    isUserRegistered,
    getRegistrationByEventId,
    cancelRegistration,
    clearAllEvents,
  }
}
