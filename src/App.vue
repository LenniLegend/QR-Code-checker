<template>
  <div class="app-root">
    <div class="left-panel">
      <div class="left-inner">
        <div class="status-message">
        <!-- Default message when nothing scanned -->
        <div v-if="!lastResult" class="scan-message">System bereit zum Scannen</div>

        <!-- Success message when lastResult.success === true -->
        <div v-if="lastResult && lastResult.success" class="p-d-flex p-jc-center p-ai-center">
          <i class="pi pi-check-circle large-message-icon" style="color:var(--green-500)"></i>
          <div class="scan-message p-ml-2">
            <!-- Use explicit markup to ensure the success text is visible -->
            <div style="color: #198754; font-size:1.4rem; font-weight:700; text-align:center;">
              <span>QR-Code in Ordnung</span>
            </div>
            <div style="font-size:1.25rem; margin-top:0.5rem">UUID: {{ lastResult.payload }}</div>
          </div>
        </div>

        <!-- Failure message -->
        <div v-if="lastResult && !lastResult.success" class="p-d-flex p-jc-center p-ai-center">
          <i class="pi pi-times-circle large-message-icon" style="color:var(--red-600)"></i>
          <div class="scan-message p-ml-2">
            <Message severity="error" text="Scan fehlgeschlagen" />
            <div style="font-size:1.0rem; margin-top:0.5rem">{{ lastResult.raw || lastResult.error || 'Kein QR-Code erkannt' }}</div>
          </div>
        </div>
        </div>

        <!-- Scanner input (inline) replaces the previous button/modal -->
        <div class="scanner-area">
          <ScannerModal inline @scan-result="onScanResult" />
        </div>
      </div>
    </div>

    <div class="right-panel">
      <HistoryList :history="history" />
    </div>
  </div>
</template>

<script>
import { ref, onBeforeUnmount } from 'vue'
import ScannerModal from './components/ScannerModal.vue'
import HistoryList from './components/HistoryList.vue'

export default {
  name: 'App',
  components: { ScannerModal, HistoryList },
  setup () {
  // (no modal state needed in inline mode)

    // history array: { time: number, success: boolean, payload?: string, raw?: string }
    const history = ref([])

    // convenience to show last result in left panel
    const lastResult = ref(null)

    // openScanner removed; scanner is always ready inline

    // Timer used to reset the left panel after showing a result
    let resetTimer = null

    // Handle results emitted from ScannerModal
    function onScanResult (result) {
      const entry = {
        time: Date.now(),
        success: !!result.success,
        payload: result.payload || null,
        raw: result.raw || null,
        error: result.error || null
      }
      // Add to history at the top
      history.value = [entry, ...history.value]
      // Show as last result in the left panel
      lastResult.value = entry

      // Clear any previous reset timer and set a new one for 5s
      if (resetTimer) {
        clearTimeout(resetTimer)
        resetTimer = null
      }
      resetTimer = setTimeout(() => {
        lastResult.value = null
        resetTimer = null
      }, 5000)
    }

    // Cleanup timer on component unmount
    onBeforeUnmount(() => {
      if (resetTimer) {
        clearTimeout(resetTimer)
        resetTimer = null
      }
    })

    return { history, onScanResult, lastResult }
  }
}
</script>

<style>
/* Scoped styles in components or global styles.css */
</style>
