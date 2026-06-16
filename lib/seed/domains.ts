// Anchor repos and capability vocabulary per domain (CONTEXT.md section 7.1).
// Used to seed a starter universe of developers (so search feels full from day
// one) and to drive the repository facets and discovery seeds.
// No em dashes, no emojis.

export interface DomainRepo {
  fullName: string; // owner/name
  stars: number;
}

export interface Domain {
  id: string;
  label: string;
  keywords: string[];
  skills: string[];
  repos: DomainRepo[];
  langs: string[];
}

export const DOMAINS: Domain[] = [
  {
    id: "rust-systems",
    label: "Rust systems and async runtimes",
    keywords: ["rust", "systems", "embedded", "kernel", "low-level", "allocator", "tokio", "async runtime"],
    skills: [
      "unsafe Rust abstractions",
      "custom allocators",
      "lock-free concurrency",
      "tokio runtime internals",
      "zero-copy I/O",
    ],
    repos: [
      { fullName: "tokio-rs/tokio", stars: 27600 },
      { fullName: "rust-lang/rust", stars: 99800 },
      { fullName: "embassy-rs/embassy", stars: 6200 },
      { fullName: "rust-embedded/cortex-m", stars: 2100 },
    ],
    langs: ["Rust", "C", "Zig", "Go"],
  },
  {
    id: "cryptography",
    label: "Cryptography and zero-knowledge",
    keywords: ["crypto", "cryptography", "zk", "zero knowledge", "encryption", "security", "cipher"],
    skills: [
      "elliptic-curve cryptography",
      "zero-knowledge proofs",
      "constant-time implementations",
      "AEAD ciphers",
      "side-channel hardening",
    ],
    repos: [
      { fullName: "RustCrypto/traits", stars: 1100 },
      { fullName: "zkcrypto/bls12_381", stars: 480 },
      { fullName: "openssl/openssl", stars: 27200 },
      { fullName: "dalek-cryptography/curve25519-dalek", stars: 1000 },
    ],
    langs: ["Rust", "C", "Go", "Python"],
  },
  {
    id: "compilers",
    label: "Compilers and language tooling",
    keywords: ["compiler", "llvm", "parser", "language", "interpreter", "frontend", "codegen"],
    skills: [
      "LLVM backend internals",
      "SSA optimization passes",
      "parser and lexer design",
      "trait and type solving",
      "incremental compilation",
    ],
    repos: [
      { fullName: "llvm/llvm-project", stars: 29400 },
      { fullName: "rust-lang/rust", stars: 99800 },
      { fullName: "ziglang/zig", stars: 35100 },
      { fullName: "WebAssembly/binaryen", stars: 7600 },
    ],
    langs: ["C++", "Rust", "Zig", "OCaml"],
  },
  {
    id: "wasm",
    label: "WebAssembly toolchains",
    keywords: ["wasm", "webassembly", "component model", "sandbox runtime"],
    skills: [
      "WASM compiler toolchains",
      "zero-copy serialization",
      "JIT codegen",
      "sandbox runtime design",
      "component model",
    ],
    repos: [
      { fullName: "bytecodealliance/wasmtime", stars: 16000 },
      { fullName: "WebAssembly/binaryen", stars: 7600 },
      { fullName: "emscripten-core/emscripten", stars: 26300 },
    ],
    langs: ["Rust", "C++", "TypeScript"],
  },
  {
    id: "databases",
    label: "Database engines and query optimizers",
    keywords: ["database", "query", "optimizer", "storage", "sql", "lsm", "mvcc"],
    skills: [
      "query planning and optimization",
      "LSM storage engines",
      "MVCC concurrency",
      "vectorized execution",
      "write-ahead logging",
    ],
    repos: [
      { fullName: "apache/datafusion", stars: 6700 },
      { fullName: "cockroachdb/cockroach", stars: 30700 },
      { fullName: "duckdb/duckdb", stars: 25800 },
      { fullName: "facebook/rocksdb", stars: 28900 },
    ],
    langs: ["Rust", "C++", "Go"],
  },
  {
    id: "low-latency",
    label: "Low-latency and trading systems",
    keywords: ["trading", "latency", "hft", "finance", "quant", "kernel-bypass"],
    skills: [
      "low-latency networking",
      "lock-free ring buffers",
      "kernel-bypass I/O",
      "NUMA-aware scheduling",
      "deterministic tuning",
    ],
    repos: [
      { fullName: "OpenHFT/Chronicle-Queue", stars: 2900 },
      { fullName: "DPDK/dpdk", stars: 2600 },
      { fullName: "real-logic/aeron", stars: 7500 },
    ],
    langs: ["C++", "Rust", "C"],
  },
  {
    id: "ml-systems",
    label: "ML systems and inference",
    keywords: ["ml", "machine learning", "ai", "inference", "training", "model", "neural", "cuda", "llm"],
    skills: [
      "CUDA kernel optimization",
      "distributed training",
      "inference graph compilation",
      "quantization",
      "attention internals",
    ],
    repos: [
      { fullName: "pytorch/pytorch", stars: 84000 },
      { fullName: "ggml-org/llama.cpp", stars: 70000 },
      { fullName: "triton-lang/triton", stars: 13600 },
      { fullName: "vllm-project/vllm", stars: 31000 },
    ],
    langs: ["Python", "C++", "CUDA"],
  },
  {
    id: "distributed",
    label: "Distributed systems and consensus",
    keywords: ["distributed", "consensus", "infra", "kubernetes", "networking", "raft", "replication"],
    skills: [
      "Raft consensus",
      "gossip membership",
      "gRPC service meshes",
      "backpressure design",
      "fault-tolerant replication",
    ],
    repos: [
      { fullName: "etcd-io/etcd", stars: 48000 },
      { fullName: "hashicorp/raft", stars: 8500 },
      { fullName: "grpc/grpc-go", stars: 21300 },
      { fullName: "tikv/tikv", stars: 15400 },
    ],
    langs: ["Go", "Rust", "C++"],
  },
  {
    id: "graphics",
    label: "Graphics, GPU, and game engines",
    keywords: ["graphics", "gpu", "rendering", "game", "shader", "engine"],
    skills: [
      "GPU pipeline design",
      "real-time rendering",
      "shader authoring",
      "spatial data structures",
      "physics integration",
    ],
    repos: [
      { fullName: "bevyengine/bevy", stars: 37000 },
      { fullName: "gfx-rs/wgpu", stars: 13500 },
      { fullName: "godotengine/godot", stars: 90000 },
    ],
    langs: ["Rust", "C++", "C"],
  },
  {
    id: "robotics",
    label: "Robotics, control, and SLAM",
    keywords: ["robotics", "control", "sensor", "slam", "quantum", "rtos", "motion planning"],
    skills: [
      "real-time control loops",
      "SLAM and localization",
      "sensor fusion",
      "RTOS scheduling",
      "motion planning",
    ],
    repos: [
      { fullName: "ros2/rclcpp", stars: 1000 },
      { fullName: "stereolabs/zed-ros2-wrapper", stars: 470 },
      { fullName: "rtic-rs/rtic", stars: 2100 },
    ],
    langs: ["C++", "Rust", "Python"],
  },
];

export const LANG_COLORS: Record<string, string> = {
  Rust: "#4f8bff",
  TypeScript: "#6ea0ff",
  Go: "#79a4ff",
  Python: "#9db9ff",
  "C++": "#3a63b8",
  Zig: "#c7d6ff",
  Swift: "#5a86d8",
  C: "#8fb0ff",
  CUDA: "#7d9cf0",
  OCaml: "#b3c8ff",
};

// Best-match domain for a free-text query (ported from the prototype).
export function domainFor(query: string): Domain {
  const ql = query.toLowerCase();
  let best: Domain | null = null;
  let score = 0;
  for (const d of DOMAINS) {
    let s = 0;
    for (const k of d.keywords) if (ql.includes(k)) s++;
    if (s > score) {
      score = s;
      best = d;
    }
  }
  return best || DOMAINS[0];
}

export function domainById(id: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}
