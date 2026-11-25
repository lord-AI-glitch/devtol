# IPv4 Range Expander: CIDR Blocks, Subnet Parsing & IP List Generation

## 1. Quick Overview & Core Advantages
The **IPv4 Range Expander** is a network engineering utility designed to parse IP ranges, hyphenated spans (e.g., `192.168.1.1-192.168.1.50`), and Classless Inter-Domain Routing (CIDR) blocks (e.g., `10.0.0.0/27`) into discrete, sequential lists of IP addresses. In modern systems engineering, firewall provisioning, vulnerability scanning, and cloud VPC peering, security engineers frequently need to transform range definitions into flat IP lists for ingest into automated access-control lists (ACLs) and security tools.

Our client-side **IPv4 Range Expander** offers zero-latency conversion, boundary calculation, and output formatting (newline-separated, comma-delimited, or JSON array) with zero server transmission.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Processing**: IP addresses, network subnets, and proprietary topology configurations remain entirely in your browser's execution thread.
- **Large Range Support**: High-performance bitwise generator capable of safely generating thousands of sequential host IPs without blocking the browser UI thread.
- **CIDR & Hyphenated Range Support**: Parses both CIDR prefixes (`192.168.0.0/24`) and explicit start-stop ranges (`172.16.0.10 - 172.16.0.25`).

---

## 2. Step-by-Step Usage Guide

### Expanding an IP Range
1. **Enter Range or CIDR**: Input your target range in one of two standard formats:
   - Hyphenated Range: `192.168.1.100 - 192.168.1.120`
   - CIDR Notation: `10.200.1.0/28`
2. **Configure Host Options**: Choose whether to include or exclude standard reserved addresses:
   - *Network Address* (first IP in CIDR)
   - *Broadcast Address* (last IP in CIDR)
3. **Select Output Formatting**: Choose your desired output structure:
   - Line-by-line (ideal for `nmap -iL` or `masscan`)
   - Comma-delimited list (ideal for SQL `IN (...)` queries or firewall rules)
   - JSON string array
4. **Copy or Export**: Instant copy to clipboard or download as `.txt` file.

### Input/Output Example
```
Input: 192.168.0.0/29
Generated IPs (8 total):
192.168.0.0  (Network)
192.168.0.1  (Host 1)
192.168.0.2  (Host 2)
192.168.0.3  (Host 3)
192.168.0.4  (Host 4)
192.168.0.5  (Host 5)
192.168.0.6  (Host 6)
192.168.0.7  (Broadcast)
```

---

## 3. Technical Deep-Dive: Bitwise IPv4 Representation & Expansion

An IPv4 address is an unsigned 32-bit integer represented in dot-decimal notation ($a.b.c.d$), where each octet ranges from 0 to 255 ($2^8 - 1$):

$$\text{IPv4 Integer} = (a \times 2^{24}) + (b \times 2^{16}) + (c \times 2^8) + d$$

### Bitwise Integer Conversion & Iteration
Converting an IP into a 32-bit unsigned integer enables linear $O(N)$ iteration:

```typescript
export function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

export function expandCidr(cidr: string, includeNetworkBroadcast = true): string[] {
  const [ipPart, maskPart] = cidr.split('/');
  const prefix = parseInt(maskPart, 10);
  if (prefix < 0 || prefix > 32) throw new Error('Invalid CIDR prefix');

  const baseLong = ipToLong(ipPart);
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkLong = (baseLong & mask) >>> 0;
  const broadcastLong = (networkLong | (~mask >>> 0)) >>> 0;

  const result: string[] = [];
  const start = includeNetworkBroadcast || prefix >= 31 ? networkLong : networkLong + 1;
  const end = includeNetworkBroadcast || prefix >= 31 ? broadcastLong : broadcastLong - 1;

  for (let current = start; current <= end; current++) {
    result.push(longToIp(current));
  }
  return result;
}
```

---

## 4. Real-World Production Use Cases
1. **Network Security Scanning**: Exporting target lists for penetration testing tools like Nmap, ZMap, and Masscan to perform vulnerability assessments across corporate cloud subnets.
2. **Cloud Security Group Provisioning**: Expanding subnets into individual IP targets when interacting with legacy hardware firewalls or cloud security groups that do not accept arbitrary CIDR masks.
3. **Database Whitelisting**: Generating discrete IP lists for cloud database access controls (AWS RDS, MongoDB Atlas, Google Cloud SQL) requiring explicit IP authorization.

---

## 5. Frequently Asked Questions (FAQs)

### Why can expanding a large CIDR block like /16 crash the browser?
A `/16` block contains $2^{16} = 65,536$ IP addresses, while a `/8` block contains $16,777,216$ addresses. Attempting to allocate strings for millions of IP addresses simultaneously exhausts JavaScript V8 heap memory (typically capped at 1.4-2 GB). For prefixes broader than `/18`, streaming generators or CLI scripts are recommended.

### How are /31 and /32 subnets handled?
Under **RFC 3021**, `/31` subnets are designated for point-to-point links and do not have dedicated network or broadcast addresses (both IPs are usable hosts). A `/32` represents a single host route. The expander recognizes these edge cases and avoids dropping host addresses.

### What is the maximum number of IPs in an IPv4 range?
The maximum theoretical count across the entire IPv4 space ($0.0.0.0/0$) is $2^{32} = 4,294,967,296$ addresses.

### Can this tool expand IPv6 ranges?
This tool is specifically engineered for 32-bit IPv4 spaces. Due to the massive address capacity of IPv6 (a single standard `/64` subnet contains $18,446,744,073,709,551,616$ addresses), expanding IPv6 blocks into flat lists is impractical; IPv6 addresses are managed using mathematical prefix aggregation instead.

---

## 6. Privacy & Security Notice
All network parsing, CIDR arithmetic, and string expansions happen locally in your browser session. Your internal network topologies, private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and public IP ranges are never transmitted to any external server.

---

## 7. Worked Example: Expanding a /28 for a Firewall Allow-List

Suppose you need to allow a small office subnet through a firewall that only accepts individual addresses. Enter `10.0.0.0/28` and exclude the network and broadcast addresses. A `/28` holds 2^(32-28) = 16 addresses, from `10.0.0.0` to `10.0.0.15`. Excluding the network address (`10.0.0.0`) and the broadcast address (`10.0.0.15`) leaves 14 usable hosts, `10.0.0.1` through `10.0.0.14`. Choose comma-delimited output and paste the result straight into the firewall rule.

The same 14 hosts can be produced from a hyphenated range instead: `10.0.0.1 - 10.0.0.14` expands to exactly the same list, which is a useful cross-check that the CIDR was typed correctly. A second check: `192.168.1.100 - 192.168.1.120` should produce 21 addresses (120 − 100 + 1), so if the tool reports any other count, re-check the endpoints before copying the list into a scanner or allow-list.

## 8. Common Mistakes

- **Expanding a /16 or broader in the browser.** A `/16` is 65,536 addresses and a `/8` is over 16 million; the tab can stall or run out of memory. For prefixes broader than `/18`, use a streaming generator or CLI script instead, as the FAQ above recommends.
- **Forgetting the network and broadcast toggle.** A `/28` gives 16 addresses with the toggle on and 14 with it off. If the count looks two short, the toggle — not the tool — is the explanation.
- **Typing a CIDR with host bits set.** `10.0.0.5/28` still expands from the network address `10.0.0.0`, because the expansion is computed from the masked network. Type the network address itself when you want the list to start there.
- **Pasting an IPv6 range.** The tool handles 32-bit IPv4 only; an IPv6 block will not expand.
- **Expecting a scan.** The expander only generates the address list. Reachability, open ports, and live hosts still need a scanner such as Nmap fed with the exported list.
