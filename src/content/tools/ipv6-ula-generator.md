# IPv6 ULA Generator: RFC 4193 Unique Local IPv6 Unicast Addressing & Entropy Guide

## 1. Quick Overview & Core Advantages
Unique Local Addresses (ULA) are IPv6 unicast addresses designated for private, local communications within isolated networks, enterprise intranet sites, or multi-cloud private interconnects. Governed by **RFC 4193**, ULAs serve as the IPv6 architectural successor to IPv4 private spaces (RFC 1918). Unlike legacy IPv4 private networks (which suffer from frequent address overlap when companies merge or connect via VPNs), RFC 4193 defines a deterministic pseudo-random 40-bit Global ID algorithm that provides high statistical uniqueness, virtually eliminating the risk of address collisions.

Our client-side **IPv6 ULA Generator** utilizes the browser's cryptographically secure pseudo-random number generator (`crypto.getRandomValues`) and NTP timestamp hashing to produce fully compliant `fd00::/8` prefix blocks.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Cryptographic Randomness**: Entropy generation and SHA-1 hashing take place entirely within your browser's execution sandbox. Generated prefixes are never sent to external servers or logged.
- **Strict RFC 4193 Compliance**: Complies with the official algorithm: 7-bit prefix `1111110` + Local bit `1` (`0xFD`) followed by a cryptographically randomized 40-bit Global ID, a 16-bit Subnet ID, and a 64-bit Interface ID.
- **Instant Subnetting Blueprint**: Generates complete configuration snippets for router advertisements, WireGuard VPN tunnels, and BGP peering configurations.

---

## 2. Step-by-Step Usage Guide

### Generating a Unique Local IPv6 Prefix
1. **Trigger Entropy Generation**: Click **Generate ULA**. The tool captures high-resolution local timestamps and 160-bit cryptographic entropy via the Web Crypto API.
2. **Review Generated Address Components**:
   - **Prefix / Block**: Official `fd00::/8` prefix with `L=1` indicating locally assigned.
   - **40-bit Global ID**: 10 hexadecimal digits representing the unique network identifier (e.g., `fd8a:2b39:c14e::/48`).
   - **16-bit Subnet ID**: Configurable hex segment allowing up to 65,536 distinct `/64` subnets (e.g., `fd8a:2b39:c14e:0001::/64`).
3. **Configure Interface / Host IDs**: Allocate specific `/64` or `/128` host addresses or leave the interface identifier open for SLAAC (Stateless Address Autoconfiguration).
4. **Export Configuration Snippets**: Copy ready-to-use snippets for Linux `/etc/network/interfaces`, Netplan, or WireGuard `AllowedIPs`.

### Example Generated Output
```
ULA Prefix (/48):      fd8a:2b39:c14e::/48
Default Subnet (/64):  fd8a:2b39:c14e:0001::/64
Router Gateway IP:     fd8a:2b39:c14e:0001::1/64
Host Address (SLAAC):  fd8a:2b39:c14e:0001:216:3eff:fe12:3456/64
```

---

## 3. Technical Deep-Dive: RFC 4193 Algorithm & Binary Layout

### Binary Structure of an RFC 4193 ULA
```
| 7 bits | 1 |  40 bits   |  16 bits  |          64 bits          |
+--------+---+------------+-----------+---------------------------+
| Prefix | L | Global ID  | Subnet ID |       Interface ID        |
| 1111110| 1 | (random)   |           |                           |
+--------+---+------------+-----------+---------------------------+
```

1. **Prefix (7 bits)**: Binary `1111110` (`fc00::/7`).
2. **L Bit (1 bit)**: Set to `1` to designate that the prefix is locally assigned (yielding `fd00::/8`). An `L` bit of `0` is reserved for future centrally assigned registries.
3. **Global ID (40 bits)**: Forty pseudo-random bits generated via cryptographic hashing.
4. **Subnet ID (16 bits)**: An identifier of a subnet within the `/48` site, creating $2^{16} = 65,536$ subnets.
5. **Interface ID (64 bits)**: The host portion, configured statically, via EUI-64, or via RFC 7217 privacy extensions.

### Cryptographic Global ID Generation in TypeScript
```typescript
export interface UlaResult {
  prefix48: string;
  defaultSubnet64: string;
  globalIdHex: string;
  gatewayIp: string;
}

export async function generateRfc4193Ula(): Promise<UlaResult> {
  // Step 1: Obtain high-resolution 64-bit NTP-compatible timestamp
  const now = Date.now();
  const timeBuf = new ArrayBuffer(8);
  const timeView = new DataView(timeBuf);
  timeView.setBigUint64(0, BigInt(now) * 1000000n); // Simulated nanoseconds

  // Step 2: Obtain 48-bit EUI-48 or 64-bit random system key
  const randomEntropy = new Uint8Array(20);
  crypto.getRandomValues(randomEntropy);

  // Step 3: Concatenate timestamp and random entropy, then compute SHA-1 hash (RFC 4193 §3.2.2)
  const combined = new Uint8Array(28);
  combined.set(new Uint8Array(timeBuf), 0);
  combined.set(randomEntropy, 8);

  const hashBuf = await crypto.subtle.digest('SHA-1', combined);
  const hashBytes = new Uint8Array(hashBuf);

  // Step 4: Extract the low-order 40 bits (5 bytes) as the Global ID
  const globalIdBytes = hashBytes.slice(15, 20);
  const globalIdHex = Array.from(globalIdBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Format into standard IPv6 hextets: fdXX:XXXX:XXXX::/48
  const hextet1 = 'fd' + globalIdHex.substring(0, 2);
  const hextet2 = globalIdHex.substring(2, 6);
  const hextet3 = globalIdHex.substring(6, 10);

  const prefix48 = `${hextet1}:${hextet2}:${hextet3}::/48`;
  const defaultSubnet64 = `${hextet1}:${hextet2}:${hextet3}:0001::/64`;
  const gatewayIp = `${hextet1}:${hextet2}:${hextet3}:0001::1`;

  return {
    prefix48,
    defaultSubnet64,
    globalIdHex,
    gatewayIp
  };
}
```

---

## 4. Real-World Production Use Cases
1. **Site-to-Site WireGuard / IPSec VPN Mesh**: Interconnecting multiple private cloud datacenters (e.g., AWS, Equinix, on-premise Kubernetes) using unique `/48` ULA prefixes, eliminating routing conflicts when internal RFC 1918 subnets collide.
2. **Kubernetes Dual-Stack In-Cluster Networking**: Assigning ULAs to internal Pod and Service CIDRs while reserving public IPv6 unicast addresses exclusively for ingress load balancers.
3. **Isolated IoT & SCADA Automation Networks**: Provisioning internal smart-building networks that require stable, non-changing IPv6 communication without exposure to the public internet routing table.

---

## 5. Frequently Asked Questions (FAQs)

### Can IPv6 Unique Local Addresses be routed over the public internet?
No. Under RFC 4193, `fc00::/7` (including `fd00::/8`) prefixes are filtered and dropped by internet service providers and Border Gateway Protocol (BGP) border routers. They are strictly intended for internal intranet routing and private VPN tunnels.

### Why not just pick a memorable prefix like `fd00:1111:2222::/48`?
RFC 4193 explicitly warns against choosing predictable or manual Global IDs. If two organizations both manually select `fd00:1::/48` and subsequently merge or establish a private BGP peering session, severe address collisions will occur. Hashing with 40-bit randomness guarantees a $1 - e^{-k^2 / (2 \times 2^{40})}$ collision probability, making random conflicts practically negligible.

### What is the difference between `fc00::/8` and `fd00::/8`?
Both reside in `fc00::/7`. The 8th bit (`L` bit) dictates assignment: `fd00::/8` ($L=1$) is defined for locally generated, self-assigned prefixes. The block `fc00::/8` ($L=0$) is reserved for potential future centralized assignment by IANA, though no registry has been established to date.

### How does an IPv6 host obtain DNS resolution with ULAs?
Internal DNS servers (such as CoreDNS, Unbound, or BIND9) serve `AAAA` records mapping internal domain names (e.g., `db.internal.corp`) directly to ULA addresses. Under RFC 6724 default address selection, hosts will prefer public IPv6 global unicast addresses (GUA) for internet egress, while automatically using ULAs for destinations within the same prefix.

---

## 6. Privacy & Security Notice
Entropy collection, SHA-1 message digests, and IPv6 formatting happen exclusively within your browser client. No generated addresses, network IDs, or subnet designs are stored or sent to remote APIs.
