# IPv4 Address Converter & Subnet Mask Analyzer: RFC 791, 32-Bit Integers, Hex, and CIDR Mechanics

## 1. Quick Overview & Key Benefits
The Internet Protocol Version 4 (IPv4) address format is the cornerstone of telecommunications and global internet routing. Governed by **RFC 791**, an IPv4 address is fundamentally a 32-bit unsigned binary integer. In daily operational engineering, humans interact almost exclusively with canonical **dot-decimal notation** (e.g., `192.168.1.1`), where 32 bits are divided into four 8-bit octets separated by periods.

However, operating system network stacks, firewalls (iptables, nftables, pf), cloud security groups (AWS VPC, GCP VPC, Azure VNet), router ASICs, malware obfuscation engines, and database systems (PostgreSQL `inet` / `cidr`, MySQL `INET_ATON()`) frequently represent IPv4 addresses in non-decimal formats. An IPv4 address can be expressed as a single 32-bit unsigned decimal integer (`3232235777`), a hexadecimal integer (`0xC0A80101`), an octal string (`030052000401`), or raw binary (`11000000.10101000.00000001.00000001`).

This **IPv4 Address Converter & Subnet Analyzer** provides bidirectional conversion between all valid IPv4 representations while calculating Classless Inter-Domain Routing (CIDR) boundaries, network IDs, broadcast addresses, wildcard masks, and host capacity.

### Key Engineering Benefits
- **Zero-Latency, 100% Client-Side Privacy**: Network topology, internal enterprise IP schemes, VLAN designs, and cloud VPC CIDR configurations remain strictly local in your browser. Zero network requests or telemetry data are dispatched.
- **Universal Multi-Base Representation**: Instantly converts between Dot-Decimal, Raw 32-bit Unsigned Integer, Hexadecimal, Octal, Binary, and reverse DNS PTR notation (`in-addr.arpa`).
- **Comprehensive CIDR & Subnet Intelligence**: Computes usable host ranges, network address, broadcast address, 32-bit subnet mask, wildcard mask, and RFC 1918 / RFC 6598 private address classifications.
- **Obfuscated URL & SSRF Validation**: Decodes non-canonical IPv4 formats (e.g., integer or hex IP addresses in URLs like `http://2130706433/` for `127.0.0.1`), enabling security engineers to audit Server-Side Request Forgery (SSRF) bypasses.

---

## 2. Step-by-Step Practical Usage Guide

### Converting an IP Address and Analyzing Subnet Masks

#### Step 1: Input Any Valid IPv4 Format
You can supply an address in any standard or non-standard notation, optionally appending a CIDR prefix length (e.g., `/24`):
- **Dot-Decimal**: `172.16.254.1/20`
- **32-bit Decimal Integer**: `2886794753`
- **Hexadecimal**: `0xAC10FE01`
- **Binary**: `10101100.00010000.11111110.00000001`
- **Octal (POSIX style)**: `0254.0020.0376.0001`

#### Step 2: Configure Subnet Mask or CIDR Prefix
Adjust the CIDR prefix slider (ranging from `/0` to `/32`) or select a standard subnet mask (e.g., `255.255.240.0`).

#### Step 3: Inspect Real-Time Network Decomposition
The analyzer immediately performs bitwise masking and decomposes the address into structural parameters:

```
--------------------------------------------------------------------------------
INPUT ADDRESS:            172.16.254.1 / 20
--------------------------------------------------------------------------------
CANONICAL DOT-DECIMAL:   172.16.254.1
32-BIT INTEGER:          2886794753
HEXADECIMAL:             0xAC10FE01
OCTAL (DWORD):           025404177001
BINARY:                  10101100.00010000.11111110.00000001
REVERSE DNS (PTR):       1.254.16.172.in-addr.arpa

SUBNET DETAILS:
SUBNET MASK:             255.255.240.0 (/20)
WILDCARD MASK:           0.0.15.255
NETWORK ADDRESS:         172.16.240.0
BROADCAST ADDRESS:       172.16.255.255
FIRST USABLE HOST:       172.16.240.1
LAST USABLE HOST:        172.16.255.254
TOTAL ADDRESSES:         4,096
USABLE USABLE HOSTS:     4,094
RFC CLASSIFICATION:      RFC 1918 Private-Use (Class B Subnet)
--------------------------------------------------------------------------------
```

---

## 3. Technical Under the Hood: Specifications & Architecture

### 1. The 32-Bit Representation Mathematics
Under RFC 791, an IPv4 address is a 32-bit vector $I \in [0, 2^{32} - 1]$. 
When decomposed into four octets $(O_1, O_2, O_3, O_4)$ where $O_i \in [0, 255]$:
$$I = (O_1 \times 2^{24}) + (O_2 \times 2^{16}) + (O_3 \times 2^8) + O_4$$
Or expressed via bitwise shifts:
$$I = (O_1 \ll 24) \mid (O_2 \ll 16) \mid (O_3 \ll 8) \mid O_4$$

Conversely, extracting individual octets from a 32-bit unsigned integer $I$:
$$O_1 = (I \gg 24) \ \& \ \text{0xFF}$$
$$O_2 = (I \gg 16) \ \& \ \text{0xFF}$$
$$O_3 = (I \gg 8) \ \& \ \text{0xFF}$$
$$O_4 = I \ \& \ \text{0xFF}$$

> [!NOTE]
> In JavaScript, bitwise operators (`<<`, `>>`, `|`) cast operands to **signed 32-bit integers**. To safely obtain the unsigned 32-bit integer representation in client-side code, always use the unsigned right shift operator: `I >>> 0`.

### 2. CIDR Subnet Math (RFC 4632)
A Classless Inter-Domain Routing prefix $/P$ specifies that the most significant $P$ bits of the 32-bit address represent the network prefix, while the remaining $32 - P$ bits represent host space.

- **Subnet Mask ($M$)**:
$$M = \begin{cases} 
0, & \text{if } P = 0 \\
\left( \sum_{i=32-P}^{31} 2^i \right) = (\sim 0 \ll (32 - P)) \ \& \ \text{0xFFFFFFFF}, & \text{if } 1 \le P \le 32 
\end{cases}$$

- **Network Address ($N$)**:
$$N = I \ \& \ M$$

- **Broadcast Address ($B$)**:
$$B = N \mid (\sim M \ \& \ \text{0xFFFFFFFF})$$

- **Wildcard (Host) Mask ($W$)**:
$$W = \sim M \ \& \ \text{0xFFFFFFFF}$$

- **Usable Host Capacity ($H$)**:
$$H = \begin{cases} 
1, & \text{if } P = 32 \text{ (Host route)} \\
2, & \text{if } P = 31 \text{ (RFC 3021 Point-to-Point Links)} \\
2^{32 - P} - 2, & \text{if } 0 \le P \le 30 
\end{cases}$$

### 3. Production-Grade TypeScript Implementation

```typescript
export interface SubnetAnalysis {
  ipDotDecimal: string;
  ipInteger: number;
  ipHex: string;
  ipBinary: string;
  cidrPrefix: number;
  netmaskDotDecimal: string;
  wildcardDotDecimal: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalAddresses: number;
  usableHosts: number;
  isPrivate: boolean;
}

export class IPv4Engine {
  /**
   * Converts canonical dot-decimal string to an unsigned 32-bit integer.
   */
  public static dotDecimalToInteger(ip: string): number {
    const octets = ip.trim().split(".").map(Number);
    if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
      throw new Error(`Invalid IPv4 address format: "${ip}"`);
    }
    // Force unsigned 32-bit integer with >>> 0
    return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
  }

  /**
   * Converts an unsigned 32-bit integer into canonical dot-decimal notation.
   */
  public static integerToDotDecimal(intVal: number): string {
    const u = intVal >>> 0;
    return [
      (u >>> 24) & 0xff,
      (u >>> 16) & 0xff,
      (u >>> 8) & 0xff,
      u & 0xff,
    ].join(".");
  }

  /**
   * Formats integer as formatted binary with octet delimiters.
   */
  public static integerToBinary(intVal: number): string {
    const u = intVal >>> 0;
    return [
      ((u >>> 24) & 0xff).toString(2).padStart(8, "0"),
      ((u >>> 16) & 0xff).toString(2).padStart(8, "0"),
      ((u >>> 8) & 0xff).toString(2).padStart(8, "0"),
      (u & 0xff).toString(2).padStart(8, "0"),
    ].join(".");
  }

  /**
   * Analyzes an IP address and CIDR prefix.
   */
  public static analyzeSubnet(ipStr: string, cidr: number): SubnetAnalysis {
    if (cidr < 0 || cidr > 32) throw new RangeError("CIDR prefix must be between 0 and 32.");
    
    const ipInt = this.dotDecimalToInteger(ipStr);
    const maskInt = cidr === 0 ? 0 : ((~0 << (32 - cidr)) >>> 0);
    const wildcardInt = (~maskInt) >>> 0;

    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const totalAddresses = Math.pow(2, 32 - cidr);
    let usableHosts = 0;
    let firstHostInt = networkInt;
    let lastHostInt = broadcastInt;

    if (cidr === 32) {
      usableHosts = 1;
      firstHostInt = networkInt;
      lastHostInt = networkInt;
    } else if (cidr === 31) {
      usableHosts = 2; // RFC 3021
      firstHostInt = networkInt;
      lastHostInt = broadcastInt;
    } else {
      usableHosts = totalAddresses - 2;
      firstHostInt = networkInt + 1;
      lastHostInt = broadcastInt - 1;
    }

    // RFC 1918 Private Ranges check
    // 10.0.0.0/8 (167772160 - 184549375)
    // 172.16.0.0/12 (2886729728 - 2887778303)
    // 192.168.0.0/16 (3232235520 - 3232301055)
    const isPrivate =
      (ipInt >= 167772160 && ipInt <= 184549375) ||
      (ipInt >= 2886729728 && ipInt <= 2887778303) ||
      (ipInt >= 3232235520 && ipInt <= 3232301055);

    return {
      ipDotDecimal: this.integerToDotDecimal(ipInt),
      ipInteger: ipInt,
      ipHex: "0x" + ipInt.toString(16).toUpperCase().padStart(8, "0"),
      ipBinary: this.integerToBinary(ipInt),
      cidrPrefix: cidr,
      netmaskDotDecimal: this.integerToDotDecimal(maskInt),
      wildcardDotDecimal: this.integerToDotDecimal(wildcardInt),
      networkAddress: this.integerToDotDecimal(networkInt),
      broadcastAddress: this.integerToDotDecimal(broadcastInt),
      firstUsableHost: this.integerToDotDecimal(firstHostInt),
      lastUsableHost: this.integerToDotDecimal(lastHostInt),
      totalAddresses,
      usableHosts,
      isPrivate,
    };
  }
}
```

---

## 4. Real-World Production Use Cases

### Production Scenario 1: AWS VPC / Terraform CIDR Allocation & Subnet Planning
A Cloud Solutions Architect is designing an infrastructure blueprint in Terraform across 3 Availability Zones:
- **Challenge**: The corporate network security team delegates a single `/21` block (`10.140.0.0/21`, providing 2,048 addresses). The architect must segment this block into public, application, and database subnets across 3 AZs without IP overlaps.
- **Solution**: The architect uses the subnet analyzer to verify mathematical boundaries. Allocating `/24` subnets (256 addresses) for public tiers (`10.140.0.0/24`, `10.140.1.0/24`, `10.140.2.0/24`) leaves `/23` blocks for high-density private workloads. The tool immediately flags broadcast collisions and computes usable host ranges, preventing production VPC provisioning errors.

### Production Scenario 2: High-Performance Database Storage of IP Telemetry
A cybersecurity analytics platform ingests 200 million netflow records per day into ClickHouse and PostgreSQL:
- **Challenge**: Storing canonical dot-decimal strings (`VARCHAR(15)`) consumes 16 bytes per row plus index overhead. At 200 million rows/day, string storage degrades query performance and wastes hundreds of gigabytes of disk IOPS.
- **Solution**: The pipeline uses the IPv4-to-integer conversion logic. Storing addresses as unsigned 32-bit integers (`UInt32`) reduces storage footprint to exactly 4 bytes per record (a 75% savings). Queries filtering by CIDR range translate directly into ultra-fast numeric interval scans (`WHERE ip BETWEEN 2886729728 AND 2887778303`).

### Production Scenario 3: Application Security Auditing: SSRF Filter Evasion Analysis
A security engineer audits an internal document parser microservice that fetches remote URLs on behalf of users:
- **Challenge**: The microservice blocks blacklisted IP strings like `127.0.0.1` and `169.254.169.254` (AWS IMDS metadata endpoint). Attackers attempt to bypass simple regex filters using alternate representations:
  - Decimal Integer: `http://2130706433/`
  - Hexadecimal: `http://0x7f000001/`
  - Octal with leading zeros: `http://0177.0.0.1/`
- **Solution**: The security engineer inputs these payloads into the converter to confirm that POSIX `inet_aton()` and C runtime resolvers decode all these variations directly to `127.0.0.1`. The team implements robust pre-resolution checks using integer-based canonicalization before HTTP requests are executed.

---

## 5. Frequently Asked Questions (FAQs)

### 1. Why does `0177.0.0.1` resolve to `127.0.0.1` in web browsers?
Under historical BSD socket conventions (implemented in C library functions like `inet_aton`), numbers with a leading `0` are parsed as **octal (base-8)**. `0177` in octal equals $1 \times 64 + 7 \times 8 + 7 = 127$ in decimal. Browsers and OS networking stacks adhere to these legacy POSIX parsing rules, which is why non-decimal representations are common in security bypass attacks.

### 2. What is the difference between `/31` (RFC 3021) and standard `/30` point-to-point subnets?
Traditionally, every subnet requires two reserved addresses: the Network Address (all host bits 0) and the Broadcast Address (all host bits 1). A `/30` subnet allocates 4 total addresses with only 2 usable hosts ($4 - 2 = 2$), wasting 50% of public IPv4 space. **RFC 3021** eliminates network and broadcast addresses for point-to-point links using `/31`, allowing both addresses ($2^{32-31} = 2$) to be assigned to router interfaces.

### 3. What is a Subnet Wildcard Mask?
A wildcard mask is the bitwise inverse of a subnet mask ($\text{Wildcard} = \sim \text{Netmask}$). While a subnet mask uses contiguous binary `1`s to define network bits, a wildcard mask uses `0`s to indicate bits that must match and `1`s to indicate bits that are ignored ("wildcards"). Wildcard masks are widely used in Cisco IOS Access Control Lists (ACLs) and OSPF route configurations.

### 4. Why are 5 IP addresses reserved in AWS VPC subnets?
While standard RFC networking reserves 2 addresses per subnet (network and broadcast), AWS VPC reserves **5 addresses** in every CIDR block:
1. First address: Network address.
2. Second address: Reserved for the VPC router gateway.
3. Third address: Reserved for internal Amazon DNS resolution.
4. Fourth address: Reserved for future AWS internal usage.
5. Last address: Network broadcast address (VPC does not support standard broadcast).
Thus, an AWS `/24` subnet contains $256 - 5 = 251$ usable EC2 private IPs.

---

## 6. Technical Accuracy & Client-Side Privacy Notice

### Standards Compliance
- **RFC 791**: Internet Protocol Specification establishing the 32-bit addressing structure.
- **RFC 4632**: Classless Inter-domain Routing (CIDR) architecture and address assignment.
- **RFC 1918**: Address Allocation for Private Internets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- **RFC 3021**: Using 31-Bit Prefixes on IPv4 Point-to-Point Links.
- **RFC 6598**: IANA-Reserved IPv4 Prefix for Shared Address Space (`100.64.0.0/10` Carrier-Grade NAT).

### Zero-Telemetry Privacy Guarantee
This utility runs 100% within your client browser. Internal corporate IP addresses, subnet designs, firewall rules, and private network architecture are processed solely in local volatile memory and are never uploaded, logged, or analyzed by remote systems.
