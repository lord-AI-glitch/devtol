# ISO/IEC 18004 QR Code Generator: Reed-Solomon Error Correction & 2D Matrix Specs

## 1. Quick Overview & Core Advantages
Quick Response (QR) codes are two-dimensional matrix barcodes invented by Masahiro Hara of Denso Wave in 1994. Today, QR codes are standardized internationally under **ISO/IEC 18004** and **JIS X 0510**, serving as universal optical data bridges connecting the physical world to digital URLs, Wi-Fi credentials, two-factor authentication (TOTP) seed keys, cryptographic cryptocurrency addresses, and enterprise logistics systems.

The online **QR Code Generator** is a high-performance, developer-focused utility built for generating crisp, standards-compliant vector (SVG) and raster (PNG, WebP) QR matrices entirely in the client browser.

### Core Advantages & Features
- **Zero-Data Leakage Architecture**: Sensitive payloads—such as Wi-Fi WPA2/WPA3 passwords, TOTP secret provisioning URIs (`otpauth://`), and corporate access tokens—are encoded strictly inside client-side browser memory. No data payload is ever dispatched over the network.
- **Full ISO/IEC 18004 Standard Compliance**: Implements all 40 standard QR code versions ($21 \times 21$ modules up to $177 \times 177$ modules) and all four data encoding modes (Numeric, Alphanumeric, Byte, Kanji).
- **Reed-Solomon Error Correction (ECC)**: Configurable recovery levels (L, M, Q, H), allowing codes to remain 100% readable even when up to 30% of the symbol surface is damaged, stained, or obscured by branding logos.
- **Lossless Scalable Vector Export (SVG)**: Exports clean, mathematical vector paths suitable for billboard-scale printing, precision laser engraving, and high-density responsive mobile interfaces.

---

## 2. Technical Under the Hood: Matrix Anatomy & Algorithmic Principles

```
+-------------------------------------------------------------+
| [Finder]                 [Timing Pattern]          [Finder] |
|  Pattern                  - - - - - - - -           Pattern |
|  #######                  # # # # # # # #           ####### |
|  #     #                                            #     # |
|  # ### #                 [Format Info]              # ### # |
|  # ### #                                            # ### # |
|  #     #                                            #     # |
|  #######                                            ####### |
|                                                             |
|           [Alignment Pattern]                               |
|                #####                                        |
|                # # #          [Data & Error Correction]     |
|                #####                 Modules                |
|                                                             |
| [Finder]                                                    |
|  Pattern                                                    |
|  #######                                                    |
|  #     #                                                    |
|  # ### #                                                    |
|  # ### #                                                    |
|  #     #                                                    |
|  #######                                                    |
+-------------------------------------------------------------+
```

### 2.1 The Physical Structure of a QR Code Matrix
Every ISO/IEC 18004 QR code matrix is constructed from distinct structural components:
1. **Finder Patterns (Position Detection Patterns)**: Located at three corners (top-left, top-right, bottom-left). Composed of concentric $7 \times 7$, $5 \times 5$, and $3 \times 3$ dark and light squares with a strict module ratio of $1:1:3:1:1$. This geometric symmetry enables optical scanners to locate and orient the matrix at any $360^\circ$ scan angle.
2. **Separators**: 1-module wide white borders isolating finder patterns from the data area.
3. **Timing Patterns**: Alternating black and white module lines running horizontally and vertically between finders. These establish the coordinate grid and version module pitch.
4. **Alignment Patterns**: Present in Version 2 ($25 \times 25$) and above. Placed at deterministic mathematical coordinates to correct for perspective skew, optical distortion, and curved surfaces.
5. **Format & Version Information**: Stores the chosen Reed-Solomon error correction level (2 bits), mask pattern index (3 bits), and version identifiers, protected by BCH $(15,5)$ error-correcting codes.
6. **Quiet Zone**: A mandatory blank border surrounding the matrix, strictly required to be at least **4 modules wide** to prevent adjacent visual noise from corrupting decoder edge detection.

### 2.2 Data Encoding Modes & Bitstream Efficiency
To optimize space efficiency, QR codes automatically segment payloads into specific encoding modes:
- **Numeric Mode**: Digits 0–9. Packed 3 digits into 10 bits ($3.33\text{ bits/char}$).
- **Alphanumeric Mode**: 45 characters (0–9, A–Z uppercase, space, `$ % * + - . / :`). Packed 2 characters into 11 bits ($5.5\text{ bits/char}$).
- **Byte Mode**: Standard 8-bit ISO-8859-1 or UTF-8 characters ($8\text{ bits/char}$).
- **Kanji Mode**: Shift JIS double-byte characters ($13\text{ bits/char}$).

### 2.3 Reed-Solomon Error Correction Over Galois Fields $GF(2^8)$
QR codes guarantee data recovery using **Reed-Solomon cyclic error-correcting block codes** operating over a Galois Field (Finite Field) defined by the primitive polynomial:
$$P(x) = x^8 + x^4 + x^3 + x^2 + 1 \quad (\text{binary: } 100011101_2 \text{ or } 0\text{x}11D)$$

The data stream is treated as a polynomial $D(x)$, which is multiplied by $x^{2t}$ (where $2t$ is the number of error correction codewords) and divided by the generator polynomial:
$$G(x) = \prod_{i=0}^{2t-1} (x - \alpha^i)$$
The remainder polynomial $R(x)$ forms the parity codewords appended to the payload.

#### Error Correction Levels Comparison

| Level | Error Recovery Capacity | Redundancy Ratio | Recommended Use Case |
| :--- | :--- | :--- | :--- |
| **L (Low)** | $\sim 7\%$ | Lowest redundancy | High-density data, clean industrial scanning, high-res screens. |
| **M (Medium)**| $\sim 15\%$ | Default balance | General mobile scanning, marketing URLs, business cards. |
| **Q (Quartile)**| $\sim 25\%$ | High redundancy | Industrial tags, curved consumer packaging, rough environments. |
| **H (High)** | $\sim 30\%$ | Maximum redundancy | Custom artistic QR codes with center-placed brand logos. |

### 2.4 Data Masking Evaluation
To prevent scanners from losing sync due to large monochromatic blocks or unintended false finder patterns, the matrix XOR-combines data bits with one of **8 mathematical mask patterns**:

| Mask Pattern | Evaluation Formula | Condition to Invert Module Bit |
| :--- | :--- | :--- |
| **000** | $(row + col) \bmod 2 = 0$ | Alternating checkerboard |
| **001** | $row \bmod 2 = 0$ | Horizontal lines |
| **010** | $col \bmod 3 = 0$ | Vertical stripes every 3 columns |
| **011** | $(row + col) \bmod 3 = 0$ | Diagonal stripes |
| **100** | $(\lfloor row/2 \rfloor + \lfloor col/3 \rfloor) \bmod 2 = 0$ | Block grid |
| **101** | $(row \cdot col) \bmod 2 + (row \cdot col) \bmod 3 = 0$ | Combined multiplication |
| **110** | $((row \cdot col) \bmod 2 + (row \cdot col) \bmod 3) \bmod 2 = 0$| Periodic non-linear blocks |
| **111** | $((row + col) \bmod 2 + (row \cdot col) \bmod 3) \bmod 2 = 0$| Complex diagonal-product |

The encoder evaluates all 8 masked matrices against four penalty criteria (lines of consecutive same-color modules, $2 \times 2$ blocks, finder-like bit sequences `1011101`, and dark/light ratio imbalance), choosing the pattern with the lowest total penalty score.

---

## 3. Step-by-Step Custom Configuration Guide

### 3.1 Choosing the Data Type
1. **Plain Text / URL**: Enter standard HTTPS URLs (`https://example.com`). Ensure HTTPS protocol is explicit so mobile cameras launch browsers directly.
2. **Wi-Fi Network Configuration**: Use the standard Wi-Fi string format:
   ```text
   WIFI:T:WPA;S:OfficeNet_5G;P:SuperSecretPass123;H:false;;
   ```
3. **vCard Contact Information**: Format as a standard vCard 3.0 or 4.0 block for 1-tap phonebook address importing.
4. **TOTP Two-Factor Setup**: Encode standard authenticator URIs:
   ```text
   otpauth://totp/AcmeCloud:john.doe@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AcmeCloud
   ```

### 3.2 Setting Error Correction & Styling
1. **Select ECC Level**: Use Level **M** (15%) for standard web links. Switch to Level **H** (30%) if you intend to overlay a company logo in the center.
2. **Module Colors**: Maintain a minimum contrast ratio of at least $4:1$ between foreground and background. Scanners rely on luminance detection; never place dark gray modules over a black background.
3. **Quiet Zone Padding**: Maintain at least 4 modules of surrounding clear space. Reducing margin to zero often renders codes unreadable on low-end cameras.

### 3.3 Exporting Output Files
- **SVG Vector**: Choose SVG for responsive web layouts, digital signage, and commercial printing.
- **PNG Raster**: Export at high resolution ($1024 \times 1024$ or $2048 \times 2048$ px) to prevent pixelation during raster resizing.

---

## 4. Production Architecture: QR Generation via Headless TypeScript

Below is an enterprise TypeScript pipeline illustrating programmatic vector SVG QR rendering using standard QR byte-matrix algorithms:

```typescript
/**
 * Production Client-Side QR Code Vector Renderer
 * ISO/IEC 18004 Compliant SVG Generation
 */

export interface QRRenderOptions {
  eccLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  size: number;
  darkColor: string;
  lightColor: string;
}

export class QRCodeVectorRenderer {
  /**
   * Generates a scalable, lightweight SVG string from a 2D boolean module matrix
   * @param modules 2D array where true = dark module, false = light module
   * @param options Custom styling and dimension settings
   */
  public static renderToSVG(
    modules: boolean[][],
    options: Partial<QRRenderOptions> = {}
  ): string {
    const margin = options.margin ?? 4;
    const size = options.size ?? 300;
    const darkColor = options.darkColor ?? '#000000';
    const lightColor = options.lightColor ?? '#FFFFFF';

    const moduleCount = modules.length;
    const totalSize = moduleCount + margin * 2;
    const moduleSize = size / totalSize;

    // Build SVG path data for dark modules using merged rectangles
    let pathData = '';

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (modules[r][c]) {
          const x = (c + margin) * moduleSize;
          const y = (r + margin) * moduleSize;
          pathData += `M${x.toFixed(2)},${y.toFixed(2)}h${moduleSize.toFixed(2)}v${moduleSize.toFixed(2)}h-${moduleSize.toFixed(2)}z `;
        }
      }
    }

    return `
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 ${size} ${size}" 
        width="${size}" 
        height="${size}" 
        shape-rendering="crispEdges"
      >
        <rect width="100%" height="100%" fill="${lightColor}"/>
        <path d="${pathData.trim()}" fill="${darkColor}"/>
      </svg>
    `.trim();
  }
}
```

---

## 5. Real-World Engineering Applications

### 5.1 Zero-Trust Multi-Factor Authentication (MFA) Provisioning
Identity providers (Okta, Keycloak, Auth0, AWS Cognito) provision RFC 6238 Time-based One-Time Password (TOTP) seed secrets to end-user mobile devices (Google Authenticator, 1Password) via ephemeral QR codes displayed in the user browser during enrollment. Generating this matrix strictly client-side prevents intermediate CDNs or logging layers from caching the plaintext MFA secret.

### 5.2 Cryptographic Web3 & Point-of-Sale Payments
Cryptographic payment flows (Bitcoin BIP 21, Ethereum EIP-681, Solana Pay) encode transaction URIs with recipient public addresses, invoice amounts, and memo tokens:
```text
ethereum:0x71C...897?value=1.5e18&gas=21000
```
Point-of-sale hardware terminals render dynamic QR codes, allowing mobile crypto wallets to sign transactions in seconds.

### 5.3 Automated Smart Home IoT Provisioning
Matter and HomeKit IoT smart-home protocols print QR codes on hardware enclosures containing Device Setup Codes and vendor payload IDs, allowing mobile apps to discover, commission, and securely onboard smart plugs and sensors over Bluetooth LE and Thread networks.

---

## 6. Frequently Asked Questions (FAQs)

### Q1: What is the maximum data storage capacity of a QR code?
Under **Version 40** ($177 \times 177$ modules) at Error Correction Level **L**, a QR code can store up to:
- **7,089** numeric digits, or
- **4,296** alphanumeric characters, or
- **2,953** raw binary bytes, or
- **1,817** Kanji characters.
However, for reliable mobile camera scanning, practical web URLs should stay under 300 characters to maintain a lower version ($< Version 10$).

### Q2: Can a QR code with an inverted color scheme (white on black) be scanned?
While the official ISO/IEC 18004 specification assumes dark modules on a light background, modern smartphone barcode readers (iOS Camera, Google Lens) support inverted QR codes. However, many industrial laser scanners and older handheld scanners strictly fail on inverted matrices. For universal interoperability, always utilize dark foreground modules over a light background.

### Q3: How does center logo insertion affect QR readability?
When placing a logo in the center of a QR code, the visual artwork covers and corrupts data modules. To maintain scannability, you must configure **Level H (30% error correction)** and ensure the logo occupies **under 20%** of total matrix area. Furthermore, the logo must never overlap any of the three corner Finder patterns or the Timing lines.

### Q4: What causes a QR code to fail to scan on mobile devices?
The most common reasons are:
1. **Missing Quiet Zone**: Lack of a 4-module blank margin causes adjacent background images or text to interfere with edge detection.
2. **Excessive Payload Density**: Encoding thousands of bytes results in microscopic module sizes that low-resolution lenses cannot resolve.
3. **Poor Contrast**: Insufficient color luminance difference between modules and background.
4. **Extreme Optical Reflections / Gloss**: Glare on physical stickers preventing scan sensors from reading module contrast.

---

## 7. Client-Side Privacy & Security Guarantee
This QR Code Generator operates **100% within your client browser**. Wi-Fi passwords, private encryption keys, internal company URLs, and sensitive authentication seeds are processed exclusively within local memory. Zero payload bytes are transmitted to any server or cloud API, providing total privacy and compliance with SOC 2, HIPAA, and GDPR standards.
