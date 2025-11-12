
<template>
  <!-- Inline mode: render a simple input area instead of a modal -->
  <div v-if="inline">
    <div class="p-field">
      <label for="scannerInput">Scannereingabe</label>
      <input
        id="scannerInput"
        ref="inputEl"
        class="p-inputtext p-component"
        :class="{ 'scanner-detected': detected }"
        v-model="inputValue"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        autocomplete="off"
      />
    </div>
    <div class="p-mt-3">
      <Button label="Leeren" icon="pi pi-times" @click="stopAndClose" />
    </div>
  </div>

  <!-- Modal mode: legacy behavior (kept for compatibility) -->
  <Dialog v-else v-model:visible="visible" :closable="true" :modal="true" header="Scanner (Tastaturmodus)" @hide="onClose" style="width:520px">
    <div>
      <div class="p-field">
        <label for="scannerInput">Scannereingabe</label>
        <input
          id="scannerInput"
          ref="inputEl"
          class="p-inputtext p-component"
          :class="{ 'scanner-detected': detected }"
          v-model="inputValue"
          @input="onInput"
          @keydown.enter.prevent="onEnter"
          autocomplete="off"
        />
      </div>

      <div class="p-mt-3 p-d-flex p-jc-between">
        <Button label="Stop" icon="pi pi-stop" @click="stopAndClose" />
      </div>
    </div>
  </Dialog>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

export default {
  name: 'ScannerModal',
  props: {
    modelValue: { type: Boolean, default: false },
    // when inline=true the component renders a plain input instead of a modal
    inline: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'scan-result'],
  setup (props, { emit }) {
    const visible = ref(props.modelValue)
    const inputValue = ref('')
    const detected = ref(false)
    const inputEl = ref(null)
    let submitTimer = null

    // Focus the input when the modal opens (or when inline mode mounts)
    watch(() => props.modelValue, async (val) => {
      visible.value = val
      if (val) {
        await nextTick()
        inputEl.value && inputEl.value.focus()
        inputValue.value = ''
        detected.value = false
      } else {
        clearTimer()
      }
    })

    // If inline mode is used, focus on mount
    onMounted(async () => {
      if (props.inline) {
        await nextTick()
        inputEl.value && inputEl.value.focus()
        inputValue.value = ''
        detected.value = false
      }
    })

    function clearTimer () {
      if (submitTimer) {
        clearTimeout(submitTimer)
        submitTimer = null
      }
    }

    function onInput (ev) {
      // Debounce a short time after input stops to consider the scan complete
      clearTimer()
      const val = inputValue.value
      if (!val) return
      submitTimer = setTimeout(() => {
        submitScan(val)
      }, 500) // 250ms after last keystroke -> treat as full scan
    }

    function onEnter () {
      clearTimer()
      if (inputValue.value && inputValue.value.trim().length > 0) {
        submitScan(inputValue.value)
      }
    }

    function submitScan (val) {
      const trimmed = String(val).trim()
      if (!trimmed) return
      // Mark detected briefly (green glow)
      detected.value = true
      // Emit scan result: treat any non-empty text as success per request
      emit('scan-result', { success: true, payload: trimmed, raw: trimmed })
      // clear input to be ready for next scan
      inputValue.value = ''
      // remove detection highlight after a short time
      setTimeout(() => { detected.value = false }, 800)
    }

    function stopAndClose () {
      clearTimer()
      // if in modal mode, close/modal-vmodel
      if (!props.inline) {
        visible.value = false
        emit('update:modelValue', false)
      } else {
        // inline mode: just clear input and keep visible
        inputValue.value = ''
        detected.value = false
      }
    }

    function onClose () {
      stopAndClose()
    }

    onBeforeUnmount(() => {
      clearTimer()
    })

    return { visible, inputValue, inputEl, detected, onInput, onEnter, stopAndClose, onClose, inline: props.inline }
  }
}
</script>

<style scoped>
#scannerInput { }
.scanner-detected {
  box-shadow: 0 0 12px rgba(25, 135, 84, 0.6);
  border-color: #198754 !important;
}
/* Basic styling to make the input look nicer inside the dialog */
.p-field input.p-inputtext.p-component {
  width: 100%;
  padding: 0.5rem;
  font-size: 1.1rem;
}
</style>
