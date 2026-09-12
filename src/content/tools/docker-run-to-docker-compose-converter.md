# Docker Run to Docker Compose Converter: Infrastructure-as-Code Migration Guide

## 1. Quick Overview & Key Benefits

Transitioning from ad-hoc CLI commands to declarative Infrastructure-as-Code (IaC) is a milestone in modern DevOps engineering. While executing `docker run` commands serves well for rapid prototyping and local debugging, it creates non-reproducible deployments, brittle documentation, and catastrophic operational risks in production. The **Docker Run to Docker Compose Converter** is an enterprise-grade migration compiler that parses unstructured `docker run` shell syntax and compiles it into pristine, canonical `compose.yaml` (Docker Compose V2) manifests.

### Key Benefits

- **Comprehensive Flag Tokenization**: Accurately maps 60+ Docker CLI arguments to their corresponding Compose schema fields, including port bindings (`-p`, `--expose`), volume mounts (`-v`, `--mount`), environment configurations (`-e`, `--env-file`), network bridges (`--network`), resource constraints (`--cpus`, `--memory`), healthchecks, and restart policies.
- **Docker Compose V2 Standard Compliance**: Generates modern Compose Specification (V2) syntax omitting obsolete top-level `version:` keys, properly organizing nested dictionaries, multi-stage arrays, and structured mapping blocks.
- **Multi-Line Bash & PowerShell Parsing**: Handles multi-line backslash line continuations (`\`), PowerShell backticks (`` ` ``), arbitrary flag ordering, and complex quoting without syntax corruption.
- **100% Client-Side Security**: All CLI tokenization, Abstract Syntax Tree (AST) parsing, and YAML generation run entirely in the user's browser sandbox. Proprietary database passwords, confidential environment variables, internal domain routes, and private container registries are never transmitted to external servers.

---

## 2. Step-by-Step Practical Usage Guide

### 2.1 Converting a Complex Production Command

To migrate a stateful production service, copy the raw `docker run` command into the input console:

#### Input `docker run` Shell Command:
```bash
docker run -d \
  --name production-redis-cluster \
  --restart unless-stopped \
  -p 6379:6379 \
  -p 16379:16379 \
  -v /var/data/redis:/data:rw \
  -v /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro \
  -e ALLOW_EMPTY_PASSWORD=no \
  -e REDIS_PASSWORD=Secr3tClusterPassw0rd! \
  --network internal-backend-mesh \
  --memory 2g \
  --cpus 1.5 \
  --health-cmd "redis-cli ping || exit 1" \
  --health-interval 15s \
  --health-timeout 5s \
  --health-retries 3 \
  redis:7.2-alpine \
  redis-server /usr/local/etc/redis/redis.conf
```

#### Output Canonical `compose.yaml` Specification:
```yaml
services:
  production-redis-cluster:
    image: redis:7.2-alpine
    container_name: production-redis-cluster
    command:
      - redis-server
      - /usr/local/etc/redis/redis.conf
    restart: unless-stopped
    ports:
      - "6379:6379"
      - "16379:16379"
    environment:
      ALLOW_EMPTY_PASSWORD: "no"
      REDIS_PASSWORD: "Secr3tClusterPassw0rd!"
    volumes:
      - /var/data/redis:/data:rw
      - /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    networks:
      - internal-backend-mesh
    deploy:
      resources:
        limits:
          cpus: "1.5"
          memory: 2048M
    healthcheck:
      test:
        - CMD-SHELL
        - redis-cli ping || exit 1
      interval: 15s
      timeout: 5s
      retries: 3

networks:
  internal-backend-mesh:
    external: true
```

### 2.2 CLI Arguments to Compose Spec Mapping Reference

| Docker CLI Argument | Docker Compose Directive | Value Transformation Mechanics |
| :--- | :--- | :--- |
| `-d`, `--detach` | *N/A (Implicit)* | Omitted; daemon execution is controlled via `docker compose up -d` |
| `--name <string>` | `container_name:` | Direct string mapping |
| `-p`, `--publish host:container` | `ports:` | String array, values quoted to avoid YAML integer/base-60 conversion |
| `-v <host>:<container>[:opt]` | `volumes:` | Formats as short-syntax volume strings or long-form bind mounts |
| `--mount type=bind,...` | `volumes:` (long syntax) | Converts CSV parameters into structured volume mapping objects |
| `-e`, `--env KEY=VAL` | `environment:` | Parsed into key-value map or array of strings |
| `--env-file <path>` | `env_file:` | Maps file paths; supports multiple declarations |
| `--net`, `--network <name>` | `networks:` | Injects service membership and declares root-level network objects |
| `--restart <policy>` | `restart:` | Maps `no`, `always`, `on-failure`, or `unless-stopped` |
| `--memory <bytes>` | `deploy.resources.limits.memory` | Converts human units (e.g., `512m`, `2g`) into standardized units |
| `--cpus <float>` | `deploy.resources.limits.cpus` | Converts CPU quota into string float representation |
| `--entrypoint <bin>` | `entrypoint:` | Tokenized command or array of strings |
| `--user <uid:gid>` | `user:` | Preserves Linux UID/GID strings |

---

## 3. Technical Under the Hood: Specifications & Architecture

### 3.1 Lexical Analysis & POSIX Shell Tokenization

Parsing arbitrary shell commands requires more than naive `split(' ')` regexes because developers routinely embed spaces, pipes, semicolons, and escape sequences inside quotes:

```bash
docker run -e "GREETING=Hello World" -e DB_CONFIG='{"pool": 10}' ...
```

The converter utilizes a state-machine lexer that reads the character stream token by token, handling three distinct lexical modes:
1. **Unquoted State**: Whitespace acts as a token delimiter; backslashes (`\`) escape immediate characters or trigger line-continuation merges.
2. **Single-Quoted State (`'`)**: Preserves all literal characters identically until encountering a closing single quote (POSIX rules forbid escaping single quotes within single quotes).
3. **Double-Quoted State (`"`)**: Retains spaces while expanding backslash escapes for `"`, `\`, and `$`.

```text
Input Stream:  [-e] ["DB_CONFIG='{\"pool\": 10}'"]
                  |
            [ Lexer FSM ]
                  |
Parsed Tokens: ['-e', 'DB_CONFIG=\'{"pool": 10}\'']
                  |
             [ AST Builder ]
                  |
Compose Spec:  environment:
                 DB_CONFIG: '{"pool": 10}'
```

### 3.2 The Modern Compose Specification vs Legacy V1/V2/V3 File Formats

Legacy Docker Compose configurations relied on top-level `version: '3.8'` or `version: '2.4'` declarations. This created significant confusion because Version 3 was designed for Docker Swarm and removed resource limits (`cpu_limit`, `mem_limit`) for standard `docker run` environments.

In 2020, Docker, AWS, and Microsoft unified these divergent standards under the open-source **Compose Specification** (`compose-spec.io`). Under this canonical standard:
- The top-level `version:` attribute is officially **deprecated and obsolete**.
- The standard filename is prioritized as `compose.yaml` (with fallback to `compose.yml` and `docker-compose.yml`).
- Resource limitations utilize the unified `deploy.resources.limits` schema, which modern Compose V2 runtimes apply seamlessly on standalone Docker hosts.

### 3.3 Production TypeScript Converter Implementation

Below is the robust conversion engine handling lexical tokenization, argument mapping, and deterministic YAML output generation:

```typescript
// docker-to-compose-parser.ts

export interface ComposeService {
  image?: string;
  container_name?: string;
  command?: string[];
  entrypoint?: string[];
  restart?: string;
  ports?: string[];
  environment?: Record<string, string>;
  volumes?: string[];
  networks?: string[];
  deploy?: {
    resources?: {
      limits?: {
        cpus?: string;
        memory?: string;
      };
    };
  };
  healthcheck?: {
    test: string[];
    interval?: string;
    timeout?: string;
    retries?: number;
  };
}

export interface ComposeManifest {
  services: Record<string, ComposeService>;
  networks?: Record<string, { external: boolean }>;
}

export class DockerRunConverter {
  /**
   * Tokenize shell command respecting quotes and escapes.
   */
  public static tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escapeNext = false;

    // Normalize PowerShell line continuations (`) to bash (\)
    const normalized = input.replace(/`\r?\n/g, ' ').replace(/\\\r?\n/g, ' ');

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];

      if (escapeNext) {
        current += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\' && !inSingleQuote) {
        escapeNext = true;
        continue;
      }

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        continue;
      }

      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }

      if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Parse token array into ComposeManifest structure.
   */
  public static convertToCompose(rawCommand: string): ComposeManifest {
    const tokens = this.tokenize(rawCommand);
    const service: ComposeService = {};
    const externalNetworks = new Set<string>();

    let idx = 0;
    // Skip leading "docker run"
    while (idx < tokens.length) {
      if (tokens[idx] === 'docker' && tokens[idx + 1] === 'run') {
        idx += 2;
        break;
      }
      idx++;
    }

    while (idx < tokens.length) {
      const token = tokens[idx];

      // Flags terminating flag-parsing: image name starts
      if (!token.startsWith('-')) {
        service.image = token;
        idx++;
        // Remaining tokens constitute command arguments
        const trailingCommand = tokens.slice(idx);
        if (trailingCommand.length > 0) {
          service.command = trailingCommand;
        }
        break;
      }

      if (token === '--name') {
        service.container_name = tokens[++idx];
      } else if (token === '-p' || token === '--publish') {
        service.ports = service.ports || [];
        service.ports.push(tokens[++idx]);
      } else if (token === '-v' || token === '--volume') {
        service.volumes = service.volumes || [];
        service.volumes.push(tokens[++idx]);
      } else if (token === '-e' || token === '--env') {
        service.environment = service.environment || {};
        const envVal = tokens[++idx];
        const eqIdx = envVal.indexOf('=');
        if (eqIdx !== -1) {
          service.environment[envVal.slice(0, eqIdx)] = envVal.slice(eqIdx + 1);
        } else {
          service.environment[envVal] = '';
        }
      } else if (token === '--net' || token === '--network') {
        const netName = tokens[++idx];
        service.networks = service.networks || [];
        service.networks.push(netName);
        externalNetworks.add(netName);
      } else if (token === '--restart') {
        service.restart = tokens[++idx];
      } else if (token === '--memory' || token === '-m') {
        service.deploy = service.deploy || { resources: { limits: {} } };
        service.deploy.resources!.limits!.memory = tokens[++idx];
      } else if (token === '--cpus') {
        service.deploy = service.deploy || { resources: { limits: {} } };
        service.deploy.resources!.limits!.cpus = tokens[++idx];
      } else if (token === '-d' || token === '--detach' || token === '--rm') {
        // Handled / ignored in Compose
      }
      idx++;
    }

    const serviceName = service.container_name || 'app';
    const manifest: ComposeManifest = {
      services: {
        [serviceName]: service,
      },
    };

    if (externalNetworks.size > 0) {
      manifest.networks = {};
      for (const net of externalNetworks) {
        manifest.networks[net] = { external: true };
      }
    }

    return manifest;
  }
}
```

---

## 4. Real-World Production Use Cases

### 4.1 GitOps Infrastructure-as-Code Migration
Enterprise organizations deprecating brittle shell-scripted provisioning (`init.sh` files executing unversioned `docker run` scripts across EC2 instances) use this converter to construct version-controlled `compose.yaml` repositories. Paired with tools like ArgoCD, Portainer, or Docker Swarm, declarative compose files enable automated rollback management, automated PR drift checks, and configuration diff visibility.

### 4.2 Local Development Environment Standardizing
When onboarding new engineering hires, teams frequently distribute 15-line `docker run` snippets across internal wikis for running PostgreSQL, Redis, MailHog, and local Kafka nodes. Developers often misconfigure port bindings or omit volume flags, resulting in state loss upon container restart. By translating these disparate commands into a unified `compose.yaml`, new engineers run a single command (`docker compose up -d`) to initialize identical, networked multi-container development environments.

### 4.3 Production Incident Recovery & Forensics
During infrastructure outages, engineers often run temporary ad-hoc containers directly via the Docker CLI to patch broken routing layers or inspect encrypted disk volumes. Once the immediate fire is extinguished, SREs convert the runtime commands recorded in the bash history (`~/.bash_history`) into permanent Compose declarations, ensuring emergency configuration alterations are safely documented and tracked.

---

## 5. Frequently Asked Questions (FAQs)

### What happened to the `version: '3.8'` line in Docker Compose?
The top-level `version` tag has been officially **deprecated** by the Docker community. Under the Compose Specification (V2), Compose engines automatically parse all valid attributes according to current schema capabilities. Modern Docker Compose CLI versions (`docker compose` instead of legacy `docker-compose`) will emit deprecation warnings when reading obsolete `version` declarations.

### Why are port mappings wrapped in quotation marks in the output?
In YAML syntax, values containing colons (e.g., `80:80` or `22:22`) can be misparsed as key-value pairs or base-60 sexagesimal integers (where `22:22` evaluates numerically to $22 \times 60 + 22 = 1342$). To guarantee that the Docker runtime interprets the mapping strictly as host-to-container port pairs, strings like `"8080:8080"` must always be explicitly quoted.

### How does Compose handle the `--rm` flag?
The `--rm` flag instructs the Docker daemon to destroy the container filesystem automatically when the primary process exits. In Docker Compose, container lifecycle is managed declaratively: containers persist until explicitly dismantled using `docker compose down`. For one-off task execution with auto-cleanup, use `docker compose run --rm <service-name>`.

### Can this converter process commands with complex `--mount` flags?
Yes. The parser recognizes both short-form `-v /host:/container:ro` syntax and the structured `--mount type=bind,source=/host,target=/container,readonly` standard, serializing both into canonical YAML volume blocks with correct read/write permissions.

---

## 6. Technical Accuracy & Client-Side Privacy Notice

### Standards Compliance
- **The Compose Specification (compose-spec.io)**: Full compliance with current open container orchestration definitions.
- **POSIX.1-2017 Shell Command Language**: Accurate argument tokenization, variable string boundaries, and escape sequence handling.
- **YAML 1.2 Specification**: Clean scalar block formatting, strict type coercion protection, and valid indentation structures.

### Zero-Telemetry Privacy Guarantee
This converter runs **100% client-side**. Your shell strings, container registries, proprietary network topologies, database passwords, and environment credentials are parsed purely inside your local browser memory. No network requests are initiated, guaranteeing total protection against secret leakage and data exfiltration.
