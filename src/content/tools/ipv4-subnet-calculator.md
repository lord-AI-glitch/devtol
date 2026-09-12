# IPv4 Subnet Calculator: CIDR Notation, Bitwise Masks & VLSM Network Design

## 1. Quick Overview & Core Advantages
The **IPv4 Subnet Calculator** is an indispensable network design utility designed for systems architects, network engineers, and DevOps administrators. Subnetting is the practice of partitioning a single physical or virtual IP network into multiple logical sub-networks (subnets). Governed by **RFC 950**, **RFC 1518**, and **RFC 1519** (Classless Inter-Domain Routing - CIDR), subnetting optimizes route aggregation, isolates broadcast domains, and conserves limited IPv4 address space.

Our client-side **IPv4 Subnet Calculator** calculates complete network boundaries, wildcard masks, usable host ranges, broadcast addresses, and binary bitwise visualizations in sub-millisecond real time.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Evaluation**: Subnet calculations, IP infrastructure plans, and corporate CIDR architectures execute entirely in your local browser sandbox. No internal network topologies are transmitted over the web.
- **Full CIDR Mask Support (/0 through /32)**: Comprehensive calculations accommodating large wide-area aggregates (/8 to /16), standard enterprise LANs (/24), point-to-point router links (/30 and RFC 3021 /31), and single loopback hosts (/32).
- **Binary Bitwise Inspection**: Displays 32-bit binary octet breakdowns with network prefix and host portions highlighted.

---

## 2. Step-by-Step Usage Guide

### Calculating Subnet Properties
1. **Enter IP Address & Prefix**: Input any IPv4 address and CIDR prefix length (e.g., `10.140.20.55/26`) or choose a standard subnet mask from the dropdown (e.g., `255.255.255.192`).
2. **Review Network Parameters**:
   - **Network ID**: The initial wire address identifying the sub-network.
   - **Broadcast Address**: The terminal address used for all-host local subnet packet transmission.
   - **Subnet Mask**: Standard dot-decimal representation.
   - **Wildcard Mask**: Inverse mask used in Cisco ACLs and OSPF configurations.
   - **Usable Host Range**: The first and last allocatable IP addresses for host interfaces.
   - **Total vs. Usable Hosts**: Total IP pool ($2^{32-\text{prefix}}$) minus network and broadcast addresses ($2^{32-\text{prefix}} - 2$).
3. **Inspect Subnet Class & Scope**: Determine whether the IP falls under RFC 1918 Private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), RFC 6598 Carrier-Grade NAT (`100.64.0.0/10`), or Public Internet ranges.

### Example: /26 Subnet Calculation Breakdown
```
Input: 192.168.10.130 / 26 (Mask: 255.255.255.192)
------------------------------------------------------------
Network Address:   192.168.10.128
Broadcast Address: 192.168.10.191
Subnet Mask:       255.255.255.192
Wildcard Mask:     0.0.0.63
Usable Host Range: 192.168.10.129 - 192.168.10.190
Total Addresses:   64
Usable Hosts:      62
Binary Mask:       11111111.11111111.11111111.11000000
```

---

## 3. Technical Deep-Dive: Bitwise Arithmetic & CIDR Math

Every IPv4 address and subnet mask is internally treated as an unsigned 32-bit integer. The network address is calculated using a bitwise AND operation between the IP address and the subnet mask:

$$\text{Network Integer} = \text{IP Integer} \ \& \ \text{Subnet Mask Integer}$$

The broadcast address is calculated using a bitwise OR operation with the bitwise NOT (inverse) of the subnet mask:

$$\text{Broadcast Integer} = \text{Network Integer} \ | \ (\sim \text{Subnet Mask Integer} \ \& \ \text{0xFFFFFFFF})$$

### Complete CIDR Mask Reference Table

| CIDR Prefix | Subnet Mask | Wildcard Mask | Total Addresses | Usable Hosts | Typical Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **/32** | 255.255.255.255 | 0.0.0.0 | 1 | 1 (Host Route) | Loopback / Firewall Host rule |
| **/31** | 255.255.255.254 | 0.0.0.1 | 2 | 2 (RFC 3021) | Point-to-Point Router links |
| **/30** | 255.255.255.252 | 0.0.0.3 | 4 | 2 | Legacy Point-to-Point links |
| **/29** | 255.255.255.248 | 0.0.0.7 | 8 | 6 | Small DMZ / Redundant routers |
| **/28** | 255.255.255.240 | 0.0.0.15 | 16 | 14 | Small office / Infrastructure subnet |
| **/24** | 255.255.255.0 | 0.0.0.255 | 256 | 254 | Standard Enterprise Class C LAN |
| **/20** | 255.255.240.0 | 0.0.15.255 | 4,096 | 4,094 | Corporate Branch / Kubernetes Pods |
| **/16** | 255.255.0.0 | 0.0.255.255 | 65,536 | 65,534 | Cloud VPC / Campus Network |

### Production TypeScript Subnetting Engine
```typescript
export interface SubnetDetails {
  ip: string;
  prefix: number;
  netmask: string;
  wildcard: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  isPrivate: boolean;
}

function longToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, oct) => ((acc << 8) + parseInt(oct, 10)) >>> 0, 0);
}

export function calculateSubnet(ipStr: string, prefix: number): SubnetDetails {
  const ipLong = ipToLong(ipStr);
  const maskLong = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const wildcardLong = (~maskLong) >>> 0;
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const totalHosts = Math.pow(2, 32 - prefix);
  let usableHosts = 0;
  let firstUsableLong = networkLong;
  let lastUsableLong = broadcastLong;

  if (prefix === 32) {
    usableHosts = 1;
  } else if (prefix === 31) {
    usableHosts = 2; // RFC 3021
  } else {
    usableHosts = totalHosts - 2;
    firstUsableLong = networkLong + 1;
    lastUsableLong = broadcastLong - 1;
  }

  // RFC 1918 Private Ranges Check
  const isPrivate =
    (networkLong >= ipToLong('10.0.0.0') && networkLong <= ipToLong('10.255.255.255')) ||
    (networkLong >= ipToLong('172.16.0.0') && networkLong <= ipToLong('172.31.255.255')) ||
    (networkLong >= ipToLong('192.168.0.0') && networkLong <= ipToLong('192.168.255.255'));

  return {
    ip: ipStr,
    prefix,
    netmask: longToIp(maskLong),
    wildcard: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsableIp: longToIp(firstUsableLong),
    lastUsableIp: longToIp(lastUsableLong),
    totalHosts,
    usableHosts,
    isPrivate
  };
}
```

---

## 4. Real-World Production Use Cases
1. **Cloud VPC Architecture**: Planning AWS, Azure, or Google Cloud Virtual Private Clouds (VPCs) with non-overlapping subnets across availability zones (e.g., allocating `/24` public subnets, `/22` private application subnets, and `/28` transit gateway subnets).
2. **Kubernetes Cluster CNI Sizing**: Calculating pod CIDR ranges for Calico, Flannel, or Cilium to ensure node IP exhaustion does not halt pod scheduling in high-density container clusters.
3. **Data Center VLAN Segmentation**: Segmenting corporate office networks into dedicated VLANs for VoIP telephony, IoT sensors, guest Wi-Fi, and server management.

---

## 5. Frequently Asked Questions (FAQs)

### Why are 2 addresses subtracted from the total host count?
In traditional IPv4 networking, the very first address in a subnet represents the **Network ID** (used by routing protocols to identify the subnet), and the very last address is the **Directed Broadcast Address** (used to transmit packets simultaneously to every interface on the subnet). Hence, usable hosts = $2^{(32 - \text{prefix})} - 2$.

### How does RFC 3021 allow /31 subnets for point-to-point links?
Under standard rules, a `/30` subnet consumes 4 IP addresses to provide only 2 usable hosts, wasting 50% of the allocated addresses on network and broadcast IDs. RFC 3021 eliminates network and broadcast reservations on point-to-point links, permitting `/31` prefixes where both addresses (`0` and `1`) are assigned directly to the two connected interfaces.

### What is a Wildcard Mask and where is it used?
A wildcard mask is the exact bitwise inversion of a subnet mask (e.g., subnet mask `255.255.255.0` has a wildcard mask of `0.0.0.255`). In Cisco IOS ACLs, a `0` bit signifies "match the exact bit", while a `1` bit signifies "ignore this bit (wildcard)".

### What is Variable Length Subnet Masking (VLSM)?
VLSM is the technique of allocating subnets with different prefix lengths across a single network block according to specific host density needs. For example, allocating `/24` to a busy office, `/26` to a small lab, and `/30` to interconnecting routers, preventing IP space waste.

---

## 6. Privacy & Security Notice
All subnetting operations, bitwise calculations, and range conversions are processed 100% locally within your browser client. Your private network topologies, RFC 1918 allocations, and cloud architecture plans are never sent to external servers.
