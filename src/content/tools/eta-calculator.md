# Estimated Time of Arrival (ETA) & Data Transfer Calculator: Throughput, Moving Averages, and Jitter Compensation

## 1. Quick Overview & Key Benefits
Calculating an accurate Estimated Time of Arrival (ETA) or completion time is a fundamental requirement across distributed systems engineering, large-scale database migrations, streaming uploads, cloud backup synchronizations, and Continuous Integration / Continuous Deployment (CI/CD) pipelines. At its simplest, an ETA projection extrapolates the remaining time required to process a remaining workload given an observed rate of throughput:

$$\text{Time Remaining} = \frac{\text{Remaining Workload}}{\text{Throughput Rate}}$$

However, real-world networks and computing clusters never operate in idealized, steady-state vacuum conditions. Bandwidth oscillates due to TCP congestion control (e.g., Cubic, BBR), disk I/O throttles under IOPS limits, CPU scheduling introduces latency spikes, and network routes experience packet loss and dynamic jitter. A naive instantaneous rate calculation creates a wildly unstable ETA that jumps erratically from seconds to hours, confusing operators and destabilizing automated orchestration workflows.

This browser-based **ETA & Data Transfer Calculator** models linear, Simple Moving Average (SMA), and Exponential Moving Average (EMA) throughput rates with configurable jitter compensation and packet-loss dampening. 

### Key Engineering Benefits
- **Zero Server Overhead & 100% Client-Side Privacy**: All calculations, payload profiling, and historical rate logs are evaluated entirely within your browser runtime using the high-resolution `performance.now()` Web API. No migration telemetry, file sizes, or network throughput metrics are transmitted across the wire.
- **Multiple Rate Modeling Engines**: Compare raw instantaneous throughput against windowed Simple Moving Averages (SMA) and Exponential Moving Averages (EMA) with configurable smoothing factors ($\alpha$) to prevent wild metric flapping.
- **Multi-Unit Workload Support**: Seamlessly translates between SI decimal units (KB, MB, GB, TB where $1\text{ kB} = 1,000\text{ bytes}$) and IEC binary prefixes (KiB, MiB, GiB, TiB where $1\text{ KiB} = 1,024\text{ bytes}$), preventing dangerous multi-gigabyte estimation discrepancies.
- **Jitter & Overhead Penalties**: Factor in TCP sliding window mechanics, protocol header overheads (TLS/TCP/IP encapsulation), and intermittent bandwidth dropouts.

---

## 2. Step-by-Step Practical Usage Guide

Using the ETA Calculator involves defining your total workload volume, current progress, observed transfer rates or sampling window intervals, and operational overhead parameters.

### Step 1: Define Total Workload and Completed Volume
Select your unit standard (IEC Binary vs. SI Decimal) and supply the workload dimensions:
- **Total Workload**: e.g., `4.5 TiB` (for a raw block storage replica or database dump).
- **Completed Workload**: e.g., `1.8 TiB` (progress to date: 40%).
- **Remaining Workload**: Automatically derived as $4.5 - 1.8 = 2.7\text{ TiB}$ ($2,968,681,394,995\text{ bytes}$).

### Step 2: Select Throughput Estimation Mode
1. **Instantaneous Rate Mode**: Supply a single fixed rate (e.g., $125\text{ MB/s}$ or a saturated 1 Gbps NIC link). Best for steady-state SAN-to-SAN transfers.
2. **Time-Series / Moving Average Mode**: Supply a sequence of time-stamped byte checkpoints or configure an EMA smoothing coefficient ($\alpha \in [0.05, 0.3]$).
3. **Elapsed Time Mode**: Supply the wall-clock time elapsed since job initiation (e.g., 2 hours 15 minutes to process 1.8 TiB) to compute the global historical average throughput.

### Step 3: Apply Network & Protocol Overhead Modifiers
In public cloud migrations or TLS-encrypted tunnels:
- **Protocol Encapsulation Overhead**: Set standard TCP/IP + TLS framing penalty (typically 2% to 5%).
- **Jitter / Network Degradation Factor**: Enter expected variance (e.g., $\pm 15\%$) to produce **Pessimistic**, **Nominal**, and **Optimistic** completion timestamps.

### Realistic Calculation Example: Multi-Terabyte S3 Sync
Suppose an engineer is synchronizing an on-premise NAS volume to an AWS S3 bucket:
- **Total Data Volume**: $8.50\text{ TiB}$ ($9,345,972,797,440\text{ bytes}$)
- **Current Progress**: $3.20\text{ TiB}$ ($3,518,437,208,883\text{ bytes}$)
- **Remaining Data**: $5.30\text{ TiB}$ ($5,827,535,588,557\text{ bytes}$)
- **Observed Throughput (EMA, $\alpha=0.15$)**: $320\text{ Mbps}$ ($40\text{ MB/s}$ or $38.147\text{ MiB/s}$)
- **Protocol Overhead Adjustment**: $3\%$ TLS/HTTPS chunking overhead

**Calculated Output:**
```
--------------------------------------------------------------------------------
REMAINING WORKLOAD:       5.30 TiB (5,427.20 GiB / 5,827,535,588,557 Bytes)
EFFECTIVE THROUGHPUT:     38.80 MB/s (after 3% protocol encapsulation overhead)
ESTIMATED TIME TO FINISH: 41 hours, 40 minutes, 12 seconds
OPTIMISTIC ETA (-10% jit): 37 hours, 30 minutes, 10 seconds
PESSIMISTIC ETA (+15% jit): 47 hours, 55 minutes, 14 seconds
ESTIMATED COMPLETION AT:  2026-09-13T16:45:21Z (based on current time)
--------------------------------------------------------------------------------
```

---

## 3. Technical Under the Hood: Specifications & Architecture

### 1. Mathematical Rate Estimators

#### A. Linear (Cumulative Mean) Rate
The simplest estimation considers the cumulative progress since time $t_0$:
$$R_{\text{cumulative}} = \frac{B(t) - B(t_0)}{t - t_0}$$
Where $B(t)$ represents the bytes processed at timestamp $t$. While globally accurate over days, it fails to account for recent network throttles or unexpected bandwidth recovery.

#### B. Simple Moving Average (SMA)
SMA samples the last $N$ discrete rate observations across a rolling temporal sliding window:
$$R_{\text{SMA}} = \frac{1}{N} \sum_{i=0}^{N-1} r_{t-i}$$
SMA dampens high-frequency jitter, but requires maintaining an $N$-length memory buffer and introduces a linear phase lag of $(N-1)/2$ time intervals.

#### C. Exponential Moving Average (EMA)
EMA provides optimal real-time responsiveness while eliminating outlier spikes. It weighs the most recent throughput measurement $r_t$ against the previous smoothed estimate $S_{t-1}$ using a decay multiplier $\alpha$:
$$S_t = \alpha \cdot r_t + (1 - \alpha) \cdot S_{t-1}$$
Where:
- $\alpha = \frac{2}{k + 1}$ (for an equivalent time-window of $k$ samples), or a tuned smoothing factor between $0.1$ and $0.2$.
- $r_t = \frac{\Delta \text{Bytes}}{\Delta \text{Seconds}}$ measured across interval $[t-1, t]$.

#### D. Dynamic Variance and Jitter Compensation
Throughput variance $\sigma^2_t$ is tracked via Welford's online algorithm or recursive exponential variance:
$$\sigma^2_t = (1 - \beta) \cdot \sigma^2_{t-1} + \beta \cdot (r_t - S_t)^2$$
The pessimistic (worst-case) and optimistic (best-case) rates are formulated using confidence multipliers:
$$R_{\text{pessimistic}} = \max\left(R_{\text{floor}}, S_t - Z \cdot \sigma_t\right)$$
$$R_{\text{optimistic}} = S_t + Z \cdot \sigma_t$$
For a 95% confidence interval under pseudo-Gaussian jitter, $Z \approx 1.96$.

### 2. High-Precision TypeScript Implementation
Below is a complete, production-grade implementation of a client-side ETA calculation engine with Exponential Moving Average, jitter compensation, and SI/IEC byte formatting:

```typescript
export interface TransferCheckpoint {
  timestampMs: number; // performance.now() or Date.now()
  bytesProcessed: bigint;
}

export interface EtaCalculationResult {
  remainingBytes: bigint;
  percentComplete: number;
  instantaneousThroughputBps: number;
  emaThroughputBps: number;
  etaSecondsNominal: number;
  etaSecondsPessimistic: number;
  etaSecondsOptimistic: number;
  formattedEtaNominal: string;
  completionDateNominal: Date;
}

export class EtaEngine {
  private totalBytes: bigint;
  private alpha: number;
  private currentEmaThroughput: number = 0;
  private previousCheckpoint: TransferCheckpoint | null = null;
  private variance: number = 0;

  constructor(totalBytes: bigint, smoothingAlpha: number = 0.15) {
    if (totalBytes <= 0n) throw new Error("Total bytes must be greater than zero.");
    this.totalBytes = totalBytes;
    this.alpha = Math.min(Math.max(smoothingAlpha, 0.01), 1.0);
  }

  public recordProgress(bytesProcessed: bigint, timestampMs: number = performance.now()): EtaCalculationResult {
    if (bytesProcessed > this.totalBytes) {
      bytesProcessed = this.totalBytes;
    }

    let instantaneousRate = 0;
    if (this.previousCheckpoint) {
      const deltaMs = timestampMs - this.previousCheckpoint.timestampMs;
      const deltaBytes = Number(bytesProcessed - this.previousCheckpoint.bytesProcessed);

      if (deltaMs > 0 && deltaBytes >= 0) {
        instantaneousRate = (deltaBytes / deltaMs) * 1000; // Bytes per second
        
        if (this.currentEmaThroughput === 0) {
          this.currentEmaThroughput = instantaneousRate;
        } else {
          // EMA update
          const diff = instantaneousRate - this.currentEmaThroughput;
          this.currentEmaThroughput = this.alpha * instantaneousRate + (1 - this.alpha) * this.currentEmaThroughput;
          // Exponential moving variance update
          this.variance = (1 - this.alpha) * (this.variance + this.alpha * diff * diff);
        }
      }
    }

    this.previousCheckpoint = { timestampMs, bytesProcessed };

    const remainingBytes = this.totalBytes - bytesProcessed;
    const percentComplete = Number((bytesProcessed * 10000n) / this.totalBytes) / 100;
    const stdDev = Math.sqrt(this.variance);

    const effectiveRate = this.currentEmaThroughput > 0 ? this.currentEmaThroughput : instantaneousRate;
    
    // Bounds checking to avoid division by zero or negative throughput
    const safeRateNominal = Math.max(effectiveRate, 1);
    const safeRatePessimistic = Math.max(effectiveRate - 1.96 * stdDev, safeRateNominal * 0.5, 1);
    const safeRateOptimistic = Math.max(effectiveRate + 1.96 * stdDev, safeRateNominal);

    const etaSecondsNominal = Number(remainingBytes) / safeRateNominal;
    const etaSecondsPessimistic = Number(remainingBytes) / safeRatePessimistic;
    const etaSecondsOptimistic = Number(remainingBytes) / safeRateOptimistic;

    const completionDateNominal = new Date(Date.now() + etaSecondsNominal * 1000);

    return {
      remainingBytes,
      percentComplete,
      instantaneousThroughputBps: instantaneousRate,
      emaThroughputBps: this.currentEmaThroughput,
      etaSecondsNominal,
      etaSecondsPessimistic,
      etaSecondsOptimistic,
      formattedEtaNominal: this.formatDuration(etaSecondsNominal),
      completionDateNominal,
    };
  }

  private formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return "Calculating...";
    const s = Math.floor(seconds);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const remSeconds = s % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${remSeconds}s`);
    return parts.join(" ");
  }
}
```

---

## 4. Real-World Production Use Cases

### Production Scenario 1: Terabyte-Scale Database Migration (PostgreSQL pg_dump to AWS RDS)
A site reliability engineering team needs to cut over a primary PostgreSQL database containing 3.8 TB of transaction data to an AWS Aurora PostgreSQL cluster during a scheduled weekend maintenance window.
- **Challenge**: The maintenance window is strictly capped at 6 hours. If data restoration exceeds 5 hours, the cutover must be aborted to prevent customer disruption.
- **Solution**: The team streams `pg_dump` through an encrypted TLS pipe directly into `pg_restore`. The ETA calculation engine runs inside their deployment telemetry dashboard, monitoring incoming block writes. By utilizing an EMA with $\alpha = 0.1$, the team accurately filters out periodic WAL-checkpoint write halts, calculating a reliable cutover ETA of 4 hours 12 minutes. This enables confident execution of the migration without triggering a false-positive rollback.

### Production Scenario 2: High-Volume S3 Cross-Region Replication (CRR) Backlog Drain
During a major fiber cut between `us-east-1` and `eu-central-1`, an enterprise object storage replication queue accumulates 45 million objects totaling 120 TiB of pending payload.
- **Challenge**: Network capacity is restored, but inter-region egress is throttled to 10 Gbps. Engineering leadership demands hourly status reports indicating when replication parity will be re-established.
- **Solution**: DevOps engineers deploy a monitoring script utilizing the moving average formula to compute the drain rate. By factoring in HTTP connection handshake overheads and S3 PUT object API latency (accounting for ~12 ms per object roundtrip time), the ETA engine provides an accurate prediction: 28 hours and 35 minutes until backlog clearance.

### Production Scenario 3: Container Image Fleet Deployment Across Kubernetes Edge Clusters
A telecommunications provider rolls out a 2.4 GB critical security base-layer patch to 1,200 edge compute nodes operating over variable 4G/5G cellular links.
- **Challenge**: Nodes on unstable cellular cells frequently drop connections, causing raw rate metrics to bounce between 500 kbps and 80 Mbps.
- **Solution**: The edge orchestrator utilizes jitter-compensated ETA calculations with optimistic/pessimistic bounds. Nodes whose pessimistic ETA exceeds their scheduled maintenance window are dynamically rerouted to local peer-to-peer (P2P) Docker registry caches, ensuring 100% fleet compliance before the scheduled cutover deadline.

---

## 5. Frequently Asked Questions (FAQs)

### 1. Why does my ETA fluctuate violently when a transfer begins?
During the initial seconds of any network transfer, the sample size is extremely small. TCP slow-start algorithms gradually probe network capacity by doubling the congestion window ($cwnd$) until packet loss is encountered. An ETA calculated during slow-start underestimates throughput, while burst cache reads overestimate it. Implementing an Exponential Moving Average (EMA) with an initial burn-in window (e.g., ignoring the first 10 seconds or 1% of data) stabilizes the projection.

### 2. What is the difference between Decimal (MB/s) and Binary (MiB/s) throughput?
Operating systems and network hardware measure data differently:
- **SI Decimal Standard ($10^3$)**: $1\text{ kB} = 1,000\text{ bytes}$, $1\text{ MB} = 1,000,000\text{ bytes}$, $1\text{ GB} = 10^9\text{ bytes}$. Telecommunications and network bandwidth (e.g., 1 Gbps internet) use decimal notation.
- **IEC Binary Standard ($2^{10}$)**: $1\text{ KiB} = 1,024\text{ bytes}$, $1\text{ MiB} = 1,048,576\text{ bytes}$, $1\text{ GiB} = 1,073,741,824\text{ bytes}$. Operating systems (Linux, Windows RAM/file systems) report storage in binary.
Failing to align units can introduce a **7.37% error at the Gigabyte level** and over **9.95% error at the Terabyte level**.

### 3. How does TCP congestion control affect ETA accuracy?
TCP protocols (such as Cubic or Reno) continually oscillate throughput: they increase transmission rates until packet drops occur, cut the transmission window in half, and ramp back up (sawtooth pattern). Google BBR (Bottleneck Bandwidth and RTT) models network capacity more smoothly but still encounters variable queuing delays. Moving average filters (SMA/EMA) mathematically smooth these sawtooth oscillations into a stable throughput trendline.

### 4. Can this calculator estimate multi-threaded or parallel transfers?
Yes. When using multi-part upload tools like AWS CLI (`aws s3 cp --parallel`), `rclone`, or `aria2c`, total system throughput is the aggregate sum of all active concurrent streams. In the calculator, enter the aggregate throughput or provide the total bytes transferred across all workers to compute the exact holistic completion ETA.

---

## 6. Technical Accuracy & Client-Side Privacy Notice

### Standards Compliance
- **IEC 80000-13:2008**: Clause 4 specifies binary prefixes (kibi, mebi, gibi, tebi) and distinguishes them from SI decimal prefixes.
- **RFC 793 / RFC 5681**: TCP Congestion Control specifications governing additive increase / multiplicative decrease (AIMD) throughput oscillation.
- **W3C High Resolution Time Level 3**: Employs sub-millisecond monotonic timer specifications (`performance.now()`) to eliminate clock drift caused by NTP system time synchronization adjustments during live calculations.

### Zero-Telemetry Privacy Guarantee
This application operates strictly within your local browser environment. No telemetry, file names, payload sizes, IP addresses, or network throughput statistics are recorded, logged, or transmitted to any external server or third-party analytics provider. All state logic executes purely within client-side memory.
