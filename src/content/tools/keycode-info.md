# JavaScript KeyCode & KeyboardEvent Inspector: W3C DOM Level 3 Standards, Physical Scancodes & International Input

## 1. Overview & Core Advantages
The JavaScript `KeyboardEvent` API forms the foundational communication bridge between physical human hardware input and interactive browser software execution. Historically dominated by the brittle, non-standard, and numeric `event.keyCode` / `event.which` attributes, modern web standards codified under the W3C DOM Level 3 Events Specification have deprecated numerical keycodes in favor of robust, semantic string properties: `event.key` and `event.code`.

Building keyboard shortcuts, gaming engines, code editors, and accessible navigation demands a deep understanding of keyboard hardware abstraction layers, operating system scancode translation, Input Method Editors (IME), and international keyboard layouts (QWERTY, AZERTY, Dvorak). This utility provides real-time event telemetry inspecting every hardware keydown event directly within your client browser.

### Core Architectural Advantages
- **100% Client-Side Local Event Interception**: Event listeners capture DOM `keydown` and `keyup` dispatches locally within client memory without server round-trips.
- **Zero External Telemetry & Total Keystroke Confidentiality**: Sensitive keystrokes, personal typing rhythms, hotkeys, and passwords are never transmitted over external web sockets or logged to cloud analytics.
- **W3C DOM Level 3 Events Compliance**: Real-time telemetry exposes modern properties (`key`, `code`, `location`) alongside legacy properties (`keyCode`, `which`) for backward-compatibility audits.
- **High-Frequency Input Diagnostic Support**: Sub-millisecond latency detection of modifier states (`Meta`, `Ctrl`, `Alt`, `Shift`), repeat states, and physical key positions.

---

## 2. Technical Architecture & Algorithmic Principles

### Hardware Scancode to Browser Event Pipeline
When a user presses a physical key on a keyboard, a multi-stage translation pipeline occurs before the browser DOM fires a `KeyboardEvent`:

```
[Physical Key Pressed (e.g., Top Row Q/A)]
                   |
                   v
[Keyboard Microcontroller: Emits USB HID Scancode (e.g., 0x04)]
                   |
                   v
[OS Kernel Keyboard Driver: Maps to Virtual Keycode (e.g., VK_KEY_A)]
                   |
                   v
[OS Active Layout Engine: Translates via Layout Table (US QWERTY vs. French AZERTY)]
                   |
                   v
[Browser Window Event Loop: Dispatches W3C KeyboardEvent]
        /                     \
       v                       v
`event.code` = "KeyQ"       `event.key` = "a" (on AZERTY) or "q" (on QWERTY)
(Physical hardware slot)     (Character / Symbol produced)
```

### The Crucial Distinction: `event.code` vs. `event.key` vs. Legacy `event.keyCode`

| Property | Standard Status | Description | Example (Pressing 'Q' on US QWERTY) | Example (Pressing same physical key on French AZERTY) | Recommended Engineering Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`event.code`** | W3C Standard | Identifies physical key position on the keyboard hardware, unaffected by layout. | `"KeyQ"` | `"KeyQ"` | Game controls (WASD), physical spatial shortcuts |
| **`event.key`** | W3C Standard | Represents the character/value produced taking into account active language, Shift, and AltGraph. | `"q"` (or `"Q"`) | `"a"` (or `"A"`) | Text input validation, mnemonic hotkeys (Ctrl+S) |
| **`event.location`** | W3C Standard | Distinguishes duplicate keys across the keyboard surface (`Standard: 0`, `Left: 1`, `Right: 2`, `Numpad: 3`). | `0` | `0` | Differentiating Left Shift vs Right Shift, Numpad Enter |
| **`event.keyCode`** | **Deprecated** | Ancient numeric system code. Inconsistent across browsers, platforms, and locales. | `81` | `65` | Legacy system maintenance only |

### The Modifier Key Bitmask & Event State
A standard `KeyboardEvent` carries boolean flags representing auxiliary hardware modifier keys:
- `event.shiftKey`: Indicates whether the Shift key is active.
- `event.ctrlKey`: Indicates whether the Control key is active.
- `event.altKey`: Indicates whether the Alt / Option key is active.
- `event.metaKey`: Indicates whether the Meta key (Windows key on PC, Command `⌘` key on macOS) is active.
- `event.getModifierState("CapsLock")`: Queries hardware lock toggles (`CapsLock`, `NumLock`, `ScrollLock`).

---

## 3. Step-by-Step Configuration & Implementation Guide

### 3.1 Production Keyboard Listener Architecture (TypeScript & Vue 3)
Below is an enterprise-grade keyboard shortcut manager handling cross-platform shortcuts (Mac Command vs. Windows Control) and preventing default browser actions:

```typescript
import { onMounted, onUnmounted } from 'vue';

export interface ShortcutConfig {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore keystrokes originating inside editable input elements
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
      return;
    }

    const isMac = navigator.userAgent.toLowerCase().includes('mac');
    const isCtrlOrMeta = isMac ? event.metaKey : event.ctrlKey;

    for (const sc of shortcuts) {
      const matchKey = event.key.toLowerCase() === sc.key.toLowerCase();
      const matchCtrl = sc.ctrlOrMeta ? isCtrlOrMeta : true;
      const matchShift = sc.shift ? event.shiftKey : !event.shiftKey;
      const matchAlt = sc.alt ? event.altKey : !event.altKey;

      if (matchKey && matchCtrl && matchShift && matchAlt) {
        event.preventDefault(); // Stop default browser action (e.g. Save Page)
        sc.handler(event);
        break;
      }
    }
  };

  onMounted(() => window.addEventListener('keydown', handleKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
}
```

### 3.2 Distinguishing Physical Controls in 3D WebGL / Canvas Games
When developing first-person navigation (WASD movement), developers must strictly listen to `event.code` to guarantee the keys work identically across all international keyboard layouts:

```typescript
window.addEventListener('keydown', (e: KeyboardEvent) => {
  switch (e.code) {
    case 'KeyW': // Moves forward on both US QWERTY and French AZERTY (Z physical position)
      player.moveForward();
      break;
    case 'KeyA': // Moves left regardless of keyboard language mapping
      player.moveLeft();
      break;
    case 'KeyS':
      player.moveBackward();
      break;
    case 'KeyD':
      player.moveRight();
      break;
  }
});
```

---

## 4. Production Engineering & Internationalization Considerations

### Input Method Editors (IME) & Composition Sessions
Users typing in ideographic languages (Chinese, Japanese, Korean) or accented scripts utilize an Input Method Editor (IME). During an IME session:
1. Keystrokes generate candidate conversion menus rather than immediate text output.
2. In legacy systems, `event.keyCode` continuously emitted `229` (representing `VK_PROCESSKEY`).
3. In modern W3C compliance, developers must inspect `event.isComposing` or bind to `compositionstart`, `compositionupdate`, and `compositionend` events:

```typescript
textarea.addEventListener('keydown', (e: KeyboardEvent) => {
  // Never trigger form submission if user is confirming an IME candidate list!
  if (e.isComposing || e.keyCode === 229) {
    return;
  }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    submitForm();
  }
});
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why is `event.keyCode` deprecated by W3C standards?
`event.keyCode` is deprecated because it suffers from irreconcilable inconsistencies across different operating systems, web browsers, and international keyboard configurations. For instance, the semicolon key emits keyCode 186 in Chrome and Edge on Windows, but historically emitted 59 in Firefox. The modern `event.key` and `event.code` properties provide unambiguous, standardized string descriptors.

### Q2: What is the difference between `event.code` and `event.key`?
`event.code` represents the physical hardware key slot on the keyboard (e.g., `KeyA`, `Digit1`, `Space`), never changing regardless of language layout. `event.key` represents the semantic symbol or character generated (e.g., `a`, `A`, `!`, `Enter`), reflecting active operating system layouts and modifier states.

### Q3: How do I support both Mac Command (`⌘`) and Windows Control (`Ctrl`) hotkeys?
Detect platform architecture using `navigator.userAgent` or `navigator.platform`. If running on macOS, check `event.metaKey`; on Windows or Linux, check `event.ctrlKey`. Alternatively, check `(event.ctrlKey || event.metaKey)` if both platforms should share equivalent functionality.

### Q4: Why does `event.preventDefault()` sometimes fail to stop a key event?
Certain low-level operating system keyboard shortcuts (such as `Ctrl+Alt+Delete` on Windows or `Cmd+Tab` on macOS) are intercepted by the operating system kernel before the browser receives the HID interrupt. Additionally, some browser-level reserved hotkeys (like `Ctrl+W` in certain secure browser modes) cannot be canceled by client JavaScript.

---

## 6. Client-Side Privacy & Security Guarantee
All keyboard event monitoring and keycode inspections in this application are performed 100% locally within your browser sandbox. Keystrokes, typing timings, and modifier states are never transmitted over network sockets or collected by telemetry systems.
