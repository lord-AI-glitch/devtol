# Git Cheat Sheet & Command Memo: Architectural Internals, DAG Mechanics & Production Workflows

## 1. Overview & Core Advantages
Git is an open-source, content-addressable distributed version control system (DVCS) originally conceived and created by Linus Torvalds in 2005. Unlike older centralized systems such as Subversion (SVN) or Perforce—which treat revision histories as collections of file-by-file delta diffs against a centralized database—Git models software projects as a directed acyclic graph (DAG) of immutable snapshots. Every committed tree captures the comprehensive state of the root directory hierarchy at a precise moment in time, backed by cryptographic content hashing.

Understanding Git at an architectural level distinguishes ad-hoc command memorization from deterministic repository management. Whether staging atomic hotfixes, bisecting regression defects across tens of thousands of commits, or managing zero-downtime trunk-based deployment pipelines, mastering Git's internal object store and transport protocols is an indispensable engineering requirement.

### Core Architectural Advantages
- **100% Client-Side Local Execution**: All query, staging, commit, and log operations occur directly against the local `.git` repository folder without network overhead, preserving instant sub-millisecond execution times.
- **Zero External Telemetry & Complete Privacy**: Commands are processed strictly within your local machine or browser memory. Proprietary code, secrets, commit history, and metadata never leave your environment.
- **Cryptographic Immutability**: Every file, tree, commit, and tag is strictly addressed by its cryptographic hash (traditionally SHA-1, modernly transitioning to SHA-256 under RFC 6986). Any tampering with source code, author identity, or commit ancestry immediately changes the root hash, preventing silent corruption or malicious alteration.
- **Distributed Resilience**: Every developer's local clone functions as a complete, self-contained mirror of the entire repository history, eliminating single points of failure across infrastructure outages.

---

## 2. Technical Architecture & Algorithmic Principles

### The Git Object Store: Blobs, Trees, Commits, and Tags
Git's database resides inside `.git/objects/`. It is structured around four primitive object types:

1. **Blob (`blob`)**: Stores raw file data without filenames, permissions, or timestamp metadata. Two identical files anywhere in the repository point to the exact same blob hash, yielding native deduplication.
2. **Tree (`tree`)**: Represents a directory. It maps filenames, POSIX file modes (`100644` for normal files, `100755` for executables, `040000` for subdirectories), and points to the SHA hashes of child blobs or nested trees.
3. **Commit (`commit`)**: Points to a top-level root tree hash, lists zero or more parent commit hashes, and records author information, committer information, timestamps, and commit log messages.
4. **Annotated Tag (`tag`)**: An immutable reference containing a target commit hash, tagger signature, GPG cryptographic payload, and release notes.

```
+-------------------------------------------------------------+
|                     Commit Object                           |
|  tree: d8329fc1c...                                         |
|  parent: 4b825dc64...                                       |
|  author: Jane Doe <jane@corp.internal> 1773342300 +0000     |
|  committer: Jane Doe <jane@corp.internal> 1773342300 +0000  |
|                                                             |
|  "feat(core): implement secure token hashing"               |
+------------------------------+------------------------------+
                               |
                               v
               +---------------+---------------+
               |          Tree Object          |
               |  100644 blob 3b18e... app.ts  |
               |  040000 tree 8a71b... src/    |
               +---------------+---------------+
                               |
                               v
               +---------------+---------------+
               |          Blob Object          |
               |  [Raw source code payload]    |
               +-------------------------------+
```

### The Three Trees Architecture
A developer workspace interacts across three distinct logical layers:

- **Working Directory**: The actual sandbox filesystem containing physical, unpacked files that you edit in an IDE.
- **Index / Staging Area (`.git/index`)**: A binary cache tracking tracked file paths, modification timestamps, inode metadata, and staged blob object hashes. This staging layer acts as the blueprint for the next commit.
- **Repository (`HEAD`)**: The permanent commit history stored as an immutable object DAG in `.git/`.

### Directed Acyclic Graph (DAG) and Branch Pointers
A Git branch is not an expensive directory copy; it is simply a 41-byte plain-text file in `.git/refs/heads/<branch-name>` containing the 40-character hexadecimal SHA-1 string of its tip commit. Creating, deleting, or switching branches is a constant-time $O(1)$ pointer update.

---

## 3. Comprehensive Command Reference & Step-by-Step Guide

### 3.1 Setup, Configuration & Identity
Configure environment variables and global preferences:

```bash
# Set author identity across all repositories
git config --global user.name "Alex Mercer"
git config --global user.email "alex.mercer@engineering.org"

# Enforce strict line ending normalization (avoiding CRLF/LF cross-OS pollution)
git config --global core.autocrlf input       # On macOS/Linux
git config --global core.autocrlf true        # On Windows

# Set default initial branch name for new repositories
git config --global init.defaultBranch main

# Verify combined configuration origins
git config --list --show-origin
```

### 3.2 Inspecting, Staging, and Committing
Move changes reliably between the working tree, index, and commit history:

```bash
# Check status in compact format with branch tracking indicators
git status -sb

# Stage specific files or interactive hunks
git add src/server/auth.ts
git add -p src/client/components/   # Review each modification block interactively

# Commit staged changes with descriptive message
git commit -m "feat(auth): add PKCE token validation to oauth handshake"

# Amend the last commit (modify commit message or include forgotten staged files)
git add missed-config.json
git commit --amend --no-edit
```

### 3.3 Branching, Merging & Rebase Operations

```bash
# Create and switch to a feature branch
git switch -c feature/distributed-lock
# Equivalent legacy syntax: git checkout -b feature/distributed-lock

# List all local and remote tracking branches with upstream status
git branch -vv -a

# Merge feature branch into main with explicit merge commit (preserve topology)
git switch main
git merge --no-ff feature/distributed-lock -m "merge: incorporate distributed lock mechanism"

# Interactive Rebase: Clean up local branch history prior to pull request review
# Squash, reword, or drop commits within the last 4 commits
git rebase -i HEAD~4
```

### 3.4 Deep Inspection, History & Forensic Analysis

```bash
# Visual log of commits showing graph hierarchy, branch pointers, and commit hashes
git log --graph --oneline --decorate --all -n 20

# Identify exact line-by-line author attribution and commit timestamp for a file
git blame -L 45,95 src/crypto/cipher.ts

# Show historical changes to code functions across commits
git log -L :hashPayload:src/crypto/cipher.ts

# Search commit diffs for specific strings or variable removals (pickaxe search)
git log -S "AWS_SECRET_ACCESS_KEY" --source --all
```

### 3.5 Undoing Mistakes & Disaster Recovery

```bash
# Unstage a file without modifying working directory contents
git restore --staged config/credentials.env

# Discard all unstaged local file modifications in the working directory
git restore src/legacy/

# Reset current branch pointer to previous commit (keep modifications staged)
git reset --soft HEAD~1

# Nuclear reset: Discard all uncommitted changes and move HEAD to upstream remote state
git reset --hard origin/main

# Forensic recovery via reflog: Retrieve a commit orphaned by a hard reset or deleted branch
git reflog
# Output shows: e4b29a1 HEAD@{1}: commit: chore: vital unpushed data
git branch recovery-branch e4b29a1
```

---

## 4. Production Workflows & DevOps Architecture

### GitFlow vs. Trunk-Based Development
In high-velocity continuous integration and continuous deployment (CI/CD) environments, branching strategies dictate release stability:

| Metric / Dimension | Trunk-Based Development | GitFlow Workflow |
| :--- | :--- | :--- |
| **Branch Lifespan** | Short-lived (< 24 hours) | Long-lived (weeks to months) |
| **Target Audience** | Microservices, SaaS, Daily Continuous Deployment | Scheduled enterprise releases, embedded firmware |
| **Merge Complexity** | Minimal; frequent small integrations | High; large merge conflicts at release cycles |
| **Feature Isolation** | Feature Flags / Dark Launches | Isolated feature and release branches |
| **Automation Focus** | Aggressive automated unit/integration suites | Manual staging validation and QA gates |

### Automated CI/CD Git Pipeline Architecture
```
  [Developer Machine]
          |
          | git push origin feature/rate-limiter
          v
  [Git Remote Forge: GitHub / GitLab]
          |
          +--> Webhook Trigger (push event)
          |
  [CI Runner: GitHub Actions / Tekton]
          |
          +-- 1. Shallow Fetch: git clone --depth=50 --no-single-branch
          +-- 2. Dependency Audit & Secret Scan (Trivy, Gitleaks)
          +-- 3. Static Typecheck (tsc) & Linting (ESLint)
          +-- 4. Unit & Regression Tests (Vitest, Jest)
          +-- 5. Docker Container Build & Sign (Cosign)
          v
  [Artifact Registry & Kubernetes Cluster Deployment]
```

### Advanced Git Internals: Packfiles and Garbage Collection
Over time, loose objects in `.git/objects/` accumulate. Git automatically optimizes storage via `git gc` by compiling individual objects into compressed binary `.pack` files with index `.idx` lookups. Delta compression identifies similarity between file versions across different commits, storing only byte-level sliding window deltas. This routinely achieves 80-95% disk reduction for large code repositories.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is the difference between `git merge` and `git rebase`?
`git merge` creates a new "merge commit" with two parent references, preserving the exact historical timeline and branch topology as it occurred. `git rebase` rewrites history by lifting local commits and reapplying them sequentially on top of the target base branch. Rebase creates a clean, linear project history, but alters commit SHA hashes and must never be run on public shared branches.

### Q2: How can I completely remove a committed API secret or password from Git history?
Deleting the secret in a new commit is insufficient, as the credential remains in historical commits and dangling tree objects. Use dedicated tools such as `git-filter-repo` (recommended over legacy `git filter-branch`) or `BFG Repo-Cleaner` to purge the secret string or file across all commits, followed by forcing garbage collection:
```bash
git-filter-repo --invert-paths --path secrets.env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```
Always revoke and rotate compromised credentials immediately.

### Q3: What is the purpose of `git stash` and where are stashed changes stored?
`git stash` temporarily records the current state of the working directory and index without creating a permanent commit in the branch DAG. Internally, a stash creates two or three special commits referencing the working tree, the index, and untracked files, linking them into `.git/refs/stash`. You can view or restore them using `git stash list` and `git stash pop`.

### Q4: When should I use `git cherry-pick`?
`git cherry-pick <commit-hash>` extracts the diff introduced by a specific commit from any branch and applies it as a brand-new commit onto your active `HEAD`. It is optimal for backporting critical bug fixes from an unreleased development branch to an active production release branch without merging incomplete intermediate features.

---

## 6. Client-Side Privacy & Security Guarantee
This Git Memo reference runs completely within your web browser environment. No commands, file paths, repository identifiers, or user information are ever transmitted over external networks or logged to cloud servers. All reference materials, cheat-sheet queries, and local computations adhere strictly to zero-telemetry client-side privacy standards.