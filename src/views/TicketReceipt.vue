<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppModal from '@/components/ui/AppModal.vue'

const route = useRoute()
const router = useRouter()
const { userRegistrations, cancelRegistration, getEventById, events } = useEvents()

const eventId = computed(() => Number(route.params.id))

// Tiket hanya valid kalau acaranya masih ada dan pengguna terdaftar
const activeTicket = computed(() => {
  if (!eventId.value) return null
  const eventExists = events.value.some((e) => e.id === eventId.value)
  if (!eventExists) return null
  return userRegistrations.value.find((r) => r.eventId === eventId.value) || null
})

const isEventDone = (id) => {
  const ev = getEventById(id)
  return ev ? ev.done : false
}

const isCancelModalOpen = ref(false)

const handleConfirmCancel = () => {
  if (eventId.value) {
    cancelRegistration(eventId.value)
    isCancelModalOpen.value = false
    router.push('/browse/your-events')
  }
}
</script>

<template>
  <div class="ticket-receipt-page">
    <button class="btn-back" @click="router.push('/browse/your-events')">
      &larr; Back to Your Events
    </button>

    <div v-if="activeTicket" class="ticket-receipt-card">
      <header class="receipt-header">
        <div class="header-status">
          <span
            :class="[
              'status-badge',
              isEventDone(activeTicket.eventId) ? 'badge-concluded' : 'badge-confirmed',
            ]"
          >
            {{ isEventDone(activeTicket.eventId) ? 'EVENT CONCLUDED' : 'CONFIRMED PASS' }}
          </span>
          <span class="ref-code">#{{ activeTicket.bookingCode }}</span>
        </div>
        <p class="receipt-meta-date">
          Registered on
          {{
            new Date(activeTicket.registeredAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          }}
        </p>
      </header>

      <section class="receipt-section">
        <h4 class="section-heading">Event Details</h4>
        <h2 class="event-title">{{ activeTicket.eventTitle }}</h2>
        <div class="receipt-grid">
          <div class="grid-item">
            <span class="item-label">Category</span>
            <span class="item-value">{{ activeTicket.eventCat }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Date & Time</span>
            <span class="item-value">{{ activeTicket.eventDate }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Location Venue</span>
            <span class="item-value">{{ activeTicket.eventLoc }}</span>
          </div>
        </div>
      </section>

      <section class="receipt-section">
        <h4 class="section-heading">Attendee Information</h4>
        <div class="receipt-grid">
          <div class="grid-item">
            <span class="item-label">Full Name</span>
            <span class="item-value">{{ activeTicket.fullName }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Email Address</span>
            <span class="item-value">{{ activeTicket.email }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Phone Number</span>
            <span class="item-value">{{ activeTicket.phone }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Date of Birth</span>
            <span class="item-value">{{ activeTicket.dob }}</span>
          </div>
        </div>
      </section>

      <section class="receipt-section">
        <h4 class="section-heading">Reason for Attending</h4>
        <p class="reason-text">{{ activeTicket.reason }}</p>
      </section>

      <footer class="receipt-footer">
        <button class="btn-primary" @click="router.push('/browse/your-events')">
          Back to Your Events
        </button>
        <button
          v-if="!isEventDone(activeTicket.eventId)"
          class="btn-cancel-reg"
          @click="isCancelModalOpen = true"
        >
          Cancel Registration
        </button>
        <span v-else class="concluded-notice">
          This event has concluded. Attendance record is archived.
        </span>
      </footer>
    </div>

    <div v-else class="notice-card">
      <span class="notice-badge">NOT FOUND</span>
      <h2>Ticket Not Found</h2>
      <p>You do not have an active registration for this event, or it has been cancelled.</p>
      <button class="btn-primary" @click="router.push('/browse/your-events')">
        View Your Events List
      </button>
    </div>

    <AppModal
      :is-open="isCancelModalOpen"
      title="Cancel Registration?"
      message="Are you sure you want to cancel your registration for this event? Your seat will be returned to the event quota and your ticket will be removed."
      confirm-text="Yes, Cancel Registration"
      cancel-text="Keep Registration"
      variant="danger"
      @confirm="handleConfirmCancel"
      @close="isCancelModalOpen = false"
    />
  </div>
</template>

<style scoped>
.ticket-receipt-page {
  max-width: 760px;
  margin: 0 auto;
  padding-bottom: var(--space-12);
}
.btn-back {
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  margin-bottom: var(--space-6);
  display: inline-flex;
  align-items: center;
  transition: color 0.2s;
}
.btn-back:hover {
  color: var(--primary);
}

.ticket-receipt-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--space-4);
  padding: var(--space-8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}
.receipt-header {
  padding-bottom: var(--space-4);
  border-bottom: 2px dashed var(--border-color);
  margin-bottom: var(--space-6);
}
.header-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}
.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 5px 12px;
  border-radius: 50px;
}
.badge-confirmed {
  background: #dcfce7;
  color: #15803d;
}
.badge-concluded {
  background: #f1f3f5;
  color: #6c757d;
}
.ref-code {
  font-family: monospace;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary);
}
.receipt-meta-date {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.receipt-section {
  margin-bottom: var(--space-6);
}
.section-heading {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: var(--space-3);
}
.event-title {
  font-size: 1.7rem;
  color: var(--text-main);
  margin-bottom: var(--space-4);
}
.receipt-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}
.grid-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.item-value {
  font-weight: 600;
  color: var(--text-main);
  word-break: break-word;
}
.reason-text {
  color: var(--text-muted);
  line-height: 1.7;
  background: var(--bg-light);
  padding: var(--space-4);
  border-radius: 8px;
  margin: 0;
}

.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-color);
}
.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 11px 22px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #5032d6;
}
.btn-cancel-reg {
  background: white;
  color: #e63946;
  border: 1px solid rgba(230, 57, 70, 0.3);
  padding: 11px 22px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.btn-cancel-reg:hover {
  background: #e63946;
  color: white;
}
.concluded-notice {
  color: #8a8d93;
  font-size: 0.9rem;
  font-weight: 500;
}

.notice-card {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  background: white;
  border-radius: var(--space-4);
  border: 1px solid var(--border-color);
}
.notice-badge {
  display: inline-block;
  background: var(--bg-light);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 50px;
  margin-bottom: var(--space-3);
}
.notice-card h2 {
  font-size: 1.6rem;
  margin-bottom: var(--space-2);
}
.notice-card p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

@media (max-width: 600px) {
  .receipt-grid {
    grid-template-columns: 1fr;
  }
}
</style>
