<template>
  <div class="app-root" :class="{ 'is-mobile': isMobile }">
    <div class="left-panel">
      <div class="left-inner">
        <div class="status-actions">
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

          <!-- Controls (mobile only) -->
          <div class="controls" v-if="isMobile">
            <Button label="Kamera" icon="pi pi-camera" class="big-button" @click="toggleCamera" />
          </div>
        </div>

        <!-- Scanner area: either inline text scanner or inline camera -->
        <div class="scanner-area">
          <InlineCameraScanner v-if="cameraOpen" @scan-result="onScanResultFromCamera" @error="onCameraError" />
          <!-- On mobile we hide the keyboard/input scanner; only show ScannerModal on non-mobile -->
          <ScannerModal v-else-if="!isMobile" inline @scan-result="onScanResult" />
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
        // keep the overlay visible long enough for the keyframe animation to run
        setTimeout(() => { flashOn.value = false }, 720)
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
/* Full-screen green flash overlay with smoother keyframe fade:
   - Uses a short, snappy ramp-up followed by a slower fade-out for a pleasant visual.
   - Keyframes give fine control over timing and easing for in/out separately.
*/
.screen-flash {
  position: fixed;
  inset: 0;
  pointer-events: none; /* don't block clicks */
  background-color: #198754; /* success green */
  opacity: 0; /* start hidden */
  z-index: 99999;
  will-change: opacity;
}
.screen-flash.show {
  animation: flashFade 700ms cubic-bezier(.2,.9,.2,1) both;
}

@keyframes flashFade {
  /* quick ramp to visible, hold, then smooth fade-out */
  0%   { opacity: 0; }
  12%  { opacity: 0.9; }
  60%  { opacity: 0.9; }
  100% { opacity: 0; }
}
</style>
