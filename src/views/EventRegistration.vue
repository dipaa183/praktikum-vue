<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppModal from '@/components/ui/AppModal.vue'
import RegistrationSummary from '@/components/event/RegistrationSummary.vue'
import RegistrationForm from '@/components/event/RegistrationForm.vue'
import RegistrationReceipt from '@/components/event/RegistrationReceipt.vue'

const route = useRoute()
const router = useRouter()
const { getEventById, isUserRegistered } = useEvents()

const event = computed(() => getEventById(route.params.id))
const isRegistered = computed(() => (event.value ? isUserRegistered(event.value.id) : false))

const isSuccessModalOpen = ref(false)
const confirmedData = ref(null)

// Menentukan tampilan halaman. Saat modal sukses terbuka, tetap tampilkan 'form'
// supaya halaman di belakang modal tidak berganti jadi "Already Registered".
const pageState = computed(() => {
  if (!event.value) return 'notfound'
  if (isSuccessModalOpen.value) return 'form'
  if (event.value.done) return 'done'
  if (isRegistered.value) return 'registered'
  if (event.value.quota <= 0) return 'full'
  return 'form'
})

const handleRegistrationSuccess = (record) => {
  confirmedData.value = record
  isSuccessModalOpen.value = true
}

const handleBackToDetail = () => {
  router.push(`/browse/events/${event.value?.id || ''}`)
}

const handleGoToCatalog = () => {
  isSuccessModalOpen.value = false
  router.push('/browse/events')
}

const handleGoToYourEvents = () => {
  isSuccessModalOpen.value = false
  router.push('/browse/your-events')
}
</script>

<template>
  <div class="registration-page">
    <div v-if="pageState === 'registered'" class="notice-card">
      <span class="notice-badge">NOTICE</span>
      <h2>Already Registered</h2>
      <p>You have already secured a confirmed ticket for this event.</p>
      <div class="notice-actions">
        <router-link :to="'/browse/your-events/' + event.id" class="btn-primary-link">
          View Your Ticket Receipt
        </router-link>
        <button class="btn-secondary-link" @click="handleBackToDetail">Back to Event Detail</button>
      </div>
    </div>

    <div v-else-if="pageState === 'done'" class="notice-card">
      <span class="notice-badge">CONCLUDED</span>
      <h2>Registration Closed</h2>
      <p>This event has already concluded. Registrations are no longer accepted.</p>
      <div class="notice-actions">
        <button class="btn-primary-link" @click="router.push('/browse/events')">
          Browse Active Events
        </button>
      </div>
    </div>

    <div v-else-if="pageState === 'full'" class="notice-card">
      <span class="notice-badge">SOLD OUT</span>
      <h2>Event Full</h2>
      <p>All available seats for this event have been filled.</p>
      <div class="notice-actions">
        <button class="btn-secondary-link" @click="handleBackToDetail">Back to Event Detail</button>
      </div>
    </div>

    <div v-else-if="pageState === 'form'" class="registration-grid">
      <aside>
        <RegistrationSummary :event="event" @back="handleBackToDetail" />
      </aside>
      <section>
        <RegistrationForm
          :event="event"
          @success="handleRegistrationSuccess"
          @cancel="handleBackToDetail"
        />
      </section>
    </div>

    <div v-else class="notice-card">
      <span class="notice-badge">NOT FOUND</span>
      <h2>Event Not Found</h2>
      <p>The event you are trying to register for is not available or has been deleted.</p>
      <div class="notice-actions">
        <button class="btn-primary-link" @click="router.push('/browse/events')">
          Back to Event Catalog
        </button>
      </div>
    </div>

    <AppModal
      :is-open="isSuccessModalOpen"
      title="Registration Confirmed"
      badge-text="SUCCESS"
      badge-variant="success"
      variant="primary"
      @close="handleGoToCatalog"
    >
      <RegistrationReceipt :confirmed-data="confirmedData" :event="event" />

      <template #footer>
        <button class="btn-secondary-link" @click="handleGoToCatalog">Back to Event Catalog</button>
        <button class="btn-primary-link" @click="handleGoToYourEvents">Go to Your Events</button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.registration-page {
  padding-bottom: var(--space-12);
}
.registration-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: var(--space-8);
  align-items: start;
}

.notice-card {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  background: white;
  border-radius: var(--space-4);
  border: 1px solid var(--border-color);
  max-width: 540px;
  margin: var(--space-8) auto;
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
  color: var(--text-main);
  margin-bottom: var(--space-2);
}
.notice-card p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
  font-size: 0.95rem;
}
.notice-actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

.btn-primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
  min-height: 42px;
}
.btn-primary-link:hover {
  background: #5032d6;
}
.btn-secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  color: var(--text-main);
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
  min-height: 42px;
}
.btn-secondary-link:hover {
  background: var(--bg-light);
}

@media (max-width: 900px) {
  .registration-grid {
    grid-template-columns: 1fr;
  }
}
</style>
