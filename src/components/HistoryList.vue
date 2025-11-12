<template>
  <div>
    <div class="history-header">Scan-Historie</div>

    <DataTable :value="history" emptyMessage="Keine Scans">
      <!-- Zeit -->
      <Column header="Zeit">
        <template #body="{ data }">
          {{ formatTime(data.time) }}
        </template>
      </Column>

      <!-- Ergebnis -->
      <Column header="Ergebnis">
        <template #body="{ data }">
          <div class="result-cell">
            <span class="result-icon" :style="{ color: data.success ? '#198754' : '#d9534f' }">
              <i :class="data.success ? 'pi pi-check-circle' : 'pi pi-times-circle'" aria-hidden="true" />
            </span>
            <span class="result-label">{{ data.success ? 'Erfolg' : 'Fehler' }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
export default {
  name: 'HistoryList',
  props: {
    history: { type: Array, default: () => [] }
  },
  methods: {
    // Robust: akzeptiert Sekunden (10-stellig) und Millisekunden (13-stellig)
    // Format: dd.mm.yyyy - hh:mm
    formatTime(t) {
      if (t == null) return '';

      const num = typeof t === 'string' ? Number(t) : t;
      const ms = this.normalizeToMs(num);
      if (!Number.isFinite(ms)) return '';

      const d = new Date(ms);
      if (isNaN(d.getTime())) return '';

      const pad = (n) => String(n).padStart(2, '0');
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${day}.${month}.${year} - ${hours}:${minutes}`;
    },

    // Konvertiert Sekunden -> Millisekunden; lässt Millisekunden unverändert
    // Heuristik: 10-stellig (Sekunden) vs. 13-stellig (Millisekunden)
    normalizeToMs(value) {
      if (!Number.isFinite(value)) return NaN;
      const abs = Math.abs(value);
      // 10 Stellen ~ Sekundenbereich, 13 Stellen ~ Millisekundenbereich
      if (abs < 1e11) return value * 1000;    // Sekunden -> ms
      return value;                            // bereits ms
    }
  }
}
</script>

<style scoped>
.history-header {
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.result-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  line-height: 1;
}

.result-label {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: #2b2b2b;
}
</style>
