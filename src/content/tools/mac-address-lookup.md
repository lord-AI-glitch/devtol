# MAC Address Lookup: IEEE OUI Standards, Hardware Slicing & NIC Identification

## 1. Quick Overview & Core Advantages
A Media Access Control (MAC) address is a unique 48-bit (or 64-bit EUI-64) identifier assigned to a Network Interface Controller (NIC) for physical Layer 2 communications on IEEE 802 networks (including Ethernet, Wi-Fi, and Bluetooth). Under specifications maintained by the **IEEE Standards Association (IEEE-SA)**, MAC addresses are split into two primary components: the **Organizationally Unique Identifier (OUI)**, which identifies the hardware manufacturer (e.g., Apple, Cisco, Intel, Raspberry Pi), and the **Network Interface Controller (NIC) Specific Identifier**, assigned uniquely by the vendor.

Our client-side **MAC Address Lookup Tool** allows network administrators, cybersecurity analysts, and IoT engineers to instantly identify manufacturers, inspect broadcast/unicast and universal/local bit flags, and format MAC strings across standardized conventions.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side In-Memory OUI Database**: Lookups are performed against a compiled local index of IEEE-registered OUIs embedded in browser WebAssembly / JavaScript. No target MAC addresses or device inventories are sent across the internet.
- **Support for All Standard Delimiters**: Seamlessly parses colon (`00:1A:2B:3C:4D:5E`), hyphen (`00-1A-2B-3C-4D-5E`), dot-decimal Cisco notation (`001a.2b3c.4d5e`), or raw continuous hexadecimal (`001A2B3C4D5E`).
- **IEEE 802 Bitwise Flag Decoding**: Automatically determines whether the address is Unicast vs. Multicast (I/G bit) and Globally Unique vs. Locally Administered (U/L bit).

---

## 2. Step-by-Step Usage Guide

### Looking Up a MAC Address
1. **Enter MAC Address**: Paste any 12-character hex sequence with or without delimiters.
2. **Review Manufacturer Details**:
   - **Company / Vendor Name**: Registered organization (e.g., *Cisco Systems, Inc.*, *Espressif Inc.*).
   - **IEEE Assignment Type**: MA-L (Large / 24-bit OUI), MA-M (Medium / 28-bit), or MA-S (Small / 36-bit).
   - **Vendor Address & Registry Date**: Physical registry location if documented by IEEE.
3. **Inspect Bitwise Layer 2 Flags**:
   - **I/G Bit (Individual / Group)**: `0` for Unicast (point-to-point), `1` for Multicast / Broadcast.
   - **U/L Bit (Universal / Local)**: `0` for Globally Unique (IEEE assigned), `1` for Locally Administered (private / randomized MAC).
4. **Copy Converted Notations**: Export the address formatted for Linux (`ip link`), Cisco IOS, Windows (`getmac`), or Wireshark capture filters.

### Lookup Walkthrough Example
```
Input: 3C:06:30:4F:A2:11
--------------------------------------------------
Sanitized Hex:       3C06304FA211
OUI Prefix (24-bit): 3C:06:30
Vendor Name:         Apple, Inc.
Address Type:        Unicast (I/G = 0)
Administration:      Globally Unique (U/L = 0)
Cisco Format:        3c06.304f.a211
Windows Format:      3C-06-30-4F-A2-11
```

---

## 3. Technical Deep-Dive: IEEE 802 Addressing & Bitwise Semantics

An IEEE 802 MAC-48 address comprises 6 octets (48 bits):

```
+--------------------------+--------------------------+
|  OUI (Octets 1, 2, and 3) | Device (Octets 4, 5, 6)  |
|  24 bits (Manufacturer)  | 24 bits (Unique Serial)  |
+--------------------------+--------------------------+
```

### The First Octet Special Bits (Least Significant Bits)
In the first octet ($b_7 b_6 b_5 b_4 b_3 b_2 b_1 b_0$):
- **Bit 0 (b0) - I/G (Individual / Group)**:
  - `0`: Individual (Unicast) address.
  - `1`: Group (Multicast or Broadcast address, e.g., `FF:FF:FF:FF:FF:FF`).
- **Bit 1 (b1) - U/L (Universal / Local)**:
  - `0`: Universally Administered (assigned by IEEE, burned into physical hardware ROM).
  - `1`: Locally Administered (software overridden or randomized, common in modern iOS/Android Wi-Fi privacy features).

### Parsing and Bit Decoding in TypeScript
```typescript
export interface MacAnalysis {
  sanitized: string;
  oui: string;
  isMulticast: boolean;
  isLocallyAdministered: boolean;
  ciscoFormat: string;
}

export function parseMacAddress(raw: string): MacAnalysis {
  const sanitized = raw.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  if (sanitized.length !== 12) {
    throw new Error('MAC address must contain exactly 12 hexadecimal characters.');
  }

  // Extract first octet integer
  const firstOctet = parseInt(sanitized.substring(0, 2), 16);

  // Bit 0: Multicast flag (0x01)
  const isMulticast = (firstOctet & 0x01) === 0x01;

  // Bit 1: Locally Administered flag (0x02)
  const isLocallyAdministered = (firstOctet & 0x02) === 0x02;

  // OUI prefix (first 6 hex chars formatted)
  const oui = `${sanitized.slice(0,2)}:${sanitized.slice(2,4)}:${sanitized.slice(4,6)}`;

  // Cisco notation: xxxx.xxxx.xxxx
  const ciscoFormat = `${sanitized.slice(0,4)}.${sanitized.slice(4,8)}.${sanitized.slice(8,12)}`.toLowerCase();

  return {
    sanitized,
    oui,
    isMulticast,
    isLocallyAdministered,
    ciscoFormat
  };
}
```

---

## 4. Real-World Production Use Cases
1. **Network Inventory & DHCP Audits**: Mapping connected devices on corporate LANs by correlating DHCP lease tables with hardware vendor identities to detect unauthorized rogue endpoints.
2. **Wireshark Packet Analysis**: Filtering packet captures with display filters (`eth.addr[0:3] == 00:1A:2B`) to isolate packets emitted by specific vendor equipment.
3. **IoT Provisioning & Asset Tracking**: Verifying factory-programmed MAC addresses on assembly line circuit boards before final device packaging.

---

## 5. Frequently Asked Questions (FAQs)

### What does "Locally Administered MAC Address" mean?
When the second least-significant bit of the first octet is `1`, the address is locally administered. Modern operating systems (iOS 14+, Android 10+, Windows 11) generate randomized locally administered MAC addresses when connecting to Wi-Fi networks to prevent advertisers and trackers from logging physical user movement across locations.

### Why does a valid MAC address return "Vendor Not Found"?
If the MAC address is locally administered or randomized, it is not registered in the IEEE OUI database. Furthermore, newer vendors registered within the last few weeks may require a local database update.

### What is the difference between MAC-48 and EUI-64?
MAC-48 uses 48 bits (6 bytes) and is standard in Ethernet and 802.11 Wi-Fi. EUI-64 uses 64 bits (8 bytes) and is common in Zigbee, 6LoWPAN, and IPv6 Stateless Address Autoconfiguration (SLAAC), where a 48-bit MAC is converted into EUI-64 by inserting `FF:FE` between the third and fourth octets.

### Can two devices share the same MAC address?
Universally administered MAC addresses are designed to be globally unique. However, software tools (such as `macchanger` in Linux) can spoof or clone MAC addresses on a local subnet, which will cause ARP table thrashing and Layer 2 frame collision issues on network switches.

---

## 6. Privacy & Security Notice
All parsing, regex cleaning, and OUI database indexing occur 100% within your client browser. Your local network MAC addresses, device inventories, and router hardware IDs are never transmitted to external servers.
