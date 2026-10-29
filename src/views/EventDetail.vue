<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

const route = useRoute()
const router = useRouter()
const { getEventById, isUserRegistered } = useEvents()

const event = computed(() => getEventById(route.params.id))

const isRegistered = computed(() => (event.value ? isUserRegistered(event.value.id) : false))

// NAVIGASI PROGRAMATIK ke formulir pendaftaran
const handleRegister = () => {
  router.push(`/browse/events/${event.value.id}/register`)
}
</script>

<template>
  <div class="event-detail-page">
    <button @click="router.push('/browse/events')" class="btn-back">&larr; Back to Events</button>

    <div v-if="event">
      <div class="detail-header">
        <div class="header-tags">
          <span class="event-tag">{{ event.cat }}</span>
          <span v-if="event.done" class="status-tag status-ended">Event Finished</span>
          <span v-else-if="isRegistered" class="status-tag status-registered">Registered</span>
          <span v-else-if="event.quota <= 0" class="status-tag status-soldout">Sold Out</span>
          <span v-else class="status-tag status-live">Open Registration</span>
        </div>

        <h1>{{ event.title }}</h1>

        <div class="meta-info">
          <span class="meta-item">📅 Date: {{ event.date }}</span>
          <span class="meta-item">📍 Location: {{ event.loc }}</span>
          <span class="meta-item">👥 Remaining Quota: {{ event.quota }} Attendees</span>
        </div>
      </div>

      <div class="detail-content grid-asymmetric">
        <div class="main-desc">
          <h2>About This Event</h2>
          <p class="description-text">{{ event.desc }}</p>
        </div>

        <div class="sidebar">
          <AppCard class="ticket-card sticky-pane">
            <h3>Event Registration</h3>

            <p v-if="event.done" class="ticket-desc">
              Registration is closed as this event has concluded.
            </p>
            <p v-else-if="isRegistered" class="ticket-desc">
              You are registered for this event. Your booking is confirmed.
            </p>
            <p v-else-if="event.quota <= 0" class="ticket-desc">
              All seats for this event are currently full.
            </p>
            <p v-else class="ticket-desc">
              Secure your spot now before the remaining quota is filled.
            </p>

            <!-- HIERARKI TOMBOL: selesai > terdaftar > penuh > bisa daftar -->
            <AppButton
              v-if="event.done"
              variant="secondary"
              class="btn-register btn-disabled"
              disabled
            >
              Registration Closed
            </AppButton>

            <template v-else-if="isRegistered">
              <AppButton variant="secondary" class="btn-register btn-disabled" disabled>
                Already Registered
              </AppButton>
              <router-link :to="'/browse/your-events/' + event.id" class="receipt-link">
                View Your Ticket Receipt
              </router-link>
            </template>

            <AppButton
              v-else-if="event.quota <= 0"
              variant="secondary"
              class="btn-register btn-disabled"
              disabled
            >
              Sold Out
            </AppButton>

            <AppButton v-else variant="primary" class="btn-register" @click="handleRegister">
              Register Now
            </AppButton>

            <p v-if="!event.done && !isRegistered && event.quota > 0" class="spots">
              {{ event.quota }} seats available
            </p>
          </AppCard>
        </div>
      </div>
    </div>

    <div v-else class="not-found-card">
      <h2>404 - Event Not Found</h2>
      <p>The event you are looking for is unavailable or has been removed by the organizer.</p>
      <AppButton variant="primary" @click="router.push('/browse/events')">
        Back to Event Catalog
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.btn-back {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: var(--space-6);
  color: var(--text-muted);
  font-weight: 500;
}
.btn-back:hover {
  color: var(--primary);
}

.detail-header {
  background: var(--bg-light);
  border-radius: var(--space-4);
  border: 1px solid var(--border-color);
  padding: var(--space-12) var(--space-8);
  margin-bottom: var(--space-8);
}
.header-tags {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}
.event-tag {
  background: rgba(102, 68, 255, 0.1);
  color: var(--primary);
  padding: var(--space-1) var(--space-4);
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}
.status-tag {
  padding: var(--space-1) var(--space-3);
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
}
.status-live {
  background: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}
.status-ended {
  background: rgba(108, 117, 125, 0.15);
  color: #6c757d;
}
.status-registered {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-soldout {
  background: #fee2e2;
  color: #b91c1c;
}

.detail-header h1 {
  font-size: 2.8rem;
  margin-bottom: var(--space-4);
  line-height: 1.2;
  color: var(--text-main);
}
.meta-info {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
}
.meta-item {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 1.05rem;
}

.grid-asymmetric {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-12);
}
.main-desc h2 {
  margin-bottom: var(--space-4);
  font-size: 1.8rem;
  border-left: 4px solid var(--primary);
  padding-left: var(--space-2);
}
.description-text {
  color: var(--text-muted);
  line-height: 1.8;
  margin-bottom: var(--space-6);
  font-size: 1.1rem;
}

.ticket-card {
  padding: var(--space-8);
  text-align: center;
}
.sticky-pane {
  position: sticky;
  top: 100px;
}
.ticket-card h3 {
  font-size: 1.5rem;
  margin-bottom: var(--space-2);
}
.ticket-desc {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}
.btn-register {
  width: 100%;
}
.btn-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.receipt-link {
  display: inline-block;
  margin-top: var(--space-4);
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}
.receipt-link:hover {
  text-decoration: underline;
}
.spots {
  margin-top: var(--space-4);
  color: #27ae60;
  font-weight: 600;
  font-size: 0.95rem;
}

.not-found-card {
  text-align: center;
  padding: var(--space-12);
  background: white;
  border-radius: var(--space-4);
  border: 1px solid var(--border-color);
}
.not-found-card h2 {
  margin-bottom: var(--space-2);
}
.not-found-card p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

@media (max-width: 900px) {
  .grid-asymmetric {
    grid-template-columns: 1fr;
  }
}
</style>
