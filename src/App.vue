<template>
  <div class="app-root" :class="{ 'is-mobile': isMobile }">
    <div class="left-panel">
      <div class="left-inner">
        <div class="status-actions" style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          <div class="status-message">
            <!-- Default message when nothing scanned -->
            <div v-if="!lastResult" class="scan-message">System bereit zum Scannen</div>

            <!-- Success message when lastResult.success === true -->
            <div v-if="lastResult && lastResult.success" class="p-d-flex p-jc-center p-ai-center">
              <i class="pi pi-check-circle large-message-icon" style="color:var(--green-500)"></i>
              <div class="scan-message p-ml-2">
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

          <!-- Camera toggle button -->
          <div>
            <Button label="Kamera" icon="pi pi-camera" class="big-button" @click="toggleCamera" />
          </div>
        </div>

        <!-- Scanner area: either inline text scanner or inline camera -->
        <div class="scanner-area">
          <InlineCameraScanner v-if="cameraOpen" @scan-result="onScanResultFromCamera" @error="onCameraError" />
          <ScannerModal v-else inline @scan-result="onScanResult" />
        </div>
      </div>
    </div>

    <div class="right-panel" v-if="!isMobile">
      <HistoryList :history="history" />
    </div>

    <!-- Fullscreen green flash overlay on success -->
    <div class="screen-flash" :class="{ show: flashOn }" aria-hidden="true"></div>
  </div>
</template>

<script>
import { ref, onBeforeUnmount, onMounted } from 'vue'
import ScannerModal from './components/ScannerModal.vue'
import HistoryList from './components/HistoryList.vue'
import InlineCameraScanner from './components/InlineCameraScanner.vue'

export default {
  name: 'App',
  components: { ScannerModal, HistoryList, InlineCameraScanner },
  setup () {
    // history array: { time: number, success: boolean, payload?: string, raw?: string }
    const history = ref([])

    // convenience to show last result in left panel
    const lastResult = ref(null)

    // camera state
    const cameraOpen = ref(false)

    // flash overlay
    const flashOn = ref(false)

    // mobile detection
    const isMobile = ref(false)
    let mm = null

    function updateIsMobile () {
      // consider mobile widths up to 768px
      isMobile.value = window.matchMedia('(max-width: 768px)').matches
    }

    onMounted(() => {
      mm = window.matchMedia('(max-width: 768px)')
      updateIsMobile()
      if (mm && mm.addEventListener) mm.addEventListener('change', updateIsMobile)
    })

    onBeforeUnmount(() => {
      if (mm && mm.removeEventListener) mm.removeEventListener('change', updateIsMobile)
    })

    // Timer used to reset the left panel after showing a result
    let resetTimer = null

    // Handle results emitted from ScannerModal (keyboard)
    function onScanResult (result) {
      recordResult(result)
    }

    // Handle results from camera scanner
    function onScanResultFromCamera (result) {
      recordResult(result)
      // auto-close camera after a successful read
      cameraOpen.value = false
    }

    function onCameraError (err) {
      // show as lastResult error
      recordResult({ success: false, error: err && err.message ? err.message : String(err) })
      cameraOpen.value = false
    }

    function recordResult (result) {
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

      // flash screen briefly on success
      if (entry.success) {
        flashOn.value = true
        setTimeout(() => { flashOn.value = false }, 300)
      }

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

    function toggleCamera () {
      cameraOpen.value = !cameraOpen.value
    }

    return { history, onScanResult, lastResult, cameraOpen, toggleCamera, onScanResultFromCamera, onCameraError, flashOn, isMobile }
  }
}
</script>

<style>
/* small component-level style overrides (global layout lives in styles.css) */
.status-actions { margin-bottom: 0.75rem; }
.screen-flash { position: fixed; inset: 0; background: rgba(25, 135, 84, 0.9); pointer-events: none; opacity: 0; transition: opacity 180ms ease-in-out; z-index: 9999; }
.screen-flash.show { opacity: 1; }
</style>
