// Curated Document & PDF Archive Data
export const DOCUMENTS = [
  {
    id: 'doc-001',
    title: 'The Architecture of Thought',
    subtitle: 'A Mathematical Treatise on Neural Networks and Cognitive Topologies',
    author: 'Dr. Evelyn Vance',
    category: 'Artificial Intelligence',
    price: 399,
    rating: 4.96,
    reviewsCount: 142,
    pages: 48,
    readTime: '45 min',
    edition: 'First Edition · Issue #001',
    coverStyle: 'linear-gradient(135deg, #1C1917 0%, #292524 50%, #44403C 100%)',
    accentColor: '#D4AF37',
    badge: 'Flagship Monograph',
    abstract: 'An in-depth inquiry into multi-dimensional latent manifolds, examining how deep transformer architectures construct invariant representations of human semantic concepts.',
    highlights: [
      'Topological analysis of attention layers in multi-billion parameter models.',
      'Sparse mixture-of-experts and energetic efficiency in biological vs artificial systems.',
      'The convergence of category theory and geometric deep learning.'
    ],
    tableOfContents: [
      { page: 1, title: 'Chapter 1: The Geometry of Latent Spaces' },
      { page: 2, title: 'Chapter 2: Multi-Head Attention Topologies' },
      { page: 3, title: 'Chapter 3: Energy Landscapes and Optimization' },
      { page: 4, title: 'Chapter 4: Synthesis & Emergent Reasoning' },
      { page: 5, title: 'Chapter 5: Mathematical Formulations & Proofs' },
      { page: 6, title: 'Chapter 6: Future Horizons & Open Problems' }
    ],
    pagesContent: [
      {
        pageNumber: 1,
        chapter: 'CHAPTER I',
        title: 'The Geometry of Latent Spaces',
        content: `
          <p class="lead-paragraph text-xl font-serif leading-relaxed mb-6">
            <span class="float-left text-5xl font-bold font-serif leading-none pr-3 pt-1 text-neutral-900 dark:text-neutral-100">T</span>o understand the latent representation of high-dimensional reasoning is to understand the curvature of cognition itself. In the foundational formalism of contemporary neural architectures, knowledge is not indexed as discrete lexical tokens, but as continuous trajectories through Riemannian sub-manifolds.
          </p>
          <div class="my-8 p-6 bg-neutral-100/70 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <p class="font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">Definition 1.1 (Latent Geodesic Invariance)</p>
            <p class="italic font-serif text-base text-neutral-800 dark:text-neutral-200">
              Let $\\mathcal{M}$ be a smooth d-dimensional Riemannian manifold embedded in $\\mathbb{R}^D$ with metric tensor $g$. For any semantic transformation $\\psi: \\mathcal{M} \\to \\mathcal{M}$, the geodesic distance $d_g(x, y)$ remains invariant under isometric projection.
            </p>
          </div>
          <p class="text-base font-serif leading-relaxed mb-6">
            When an attention layer projects input embeddings through its parameter matrices $W_Q, W_K, W_V$, it performs an affine transformation followed by an anisotropic kernel deformation. The resulting similarity matrix forms a dynamic graph over the sequence horizon.
          </p>
          <div class="grid grid-cols-2 gap-4 my-8">
            <div class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
              <span class="block text-2xl font-bold font-mono">99.4%</span>
              <span class="text-xs text-neutral-500 uppercase tracking-wider">Semantic Precision</span>
            </div>
            <div class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
              <span class="block text-2xl font-bold font-mono">4.2 ms</span>
              <span class="text-xs text-neutral-500 uppercase tracking-wider">Geodesic Convergence</span>
            </div>
          </div>
        `
      },
      {
        pageNumber: 2,
        chapter: 'CHAPTER II',
        title: 'Multi-Head Attention Topologies',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            The core breakthrough of scaled dot-product attention lies in its capacity to construct non-local dependencies regardless of sequence distance. Unlike recurrent models which propagate gradients sequentially through time, transformer architectures establish direct pairwise communicative channels.
          </p>
          <blockquote class="border-l-2 border-neutral-900 dark:border-neutral-100 pl-6 my-8 italic font-serif text-lg text-neutral-700 dark:text-neutral-300">
            "The network does not simply store facts; it discovers the geometric symmetry of human language and collapses ambiguity into sharp probabilistic densities."
          </blockquote>
          <div class="my-6 p-5 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-xs overflow-x-auto">
            <p class="text-neutral-400">// Scaled Softmax Formulation</p>
            <p class="text-amber-300 font-bold mt-1">Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V</p>
            <p class="text-neutral-400 mt-2">// Multi-Head Projection Layer</p>
            <p class="text-neutral-200">MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W_O</p>
          </div>
          <p class="text-base font-serif leading-relaxed">
            By partitioning the embedding space into $h$ orthogonal representation subspaces, each head specializes in distinct topological features—syntactic agreement, coreference resolution, and abstract causality.
          </p>
        `
      },
      {
        pageNumber: 3,
        chapter: 'CHAPTER III',
        title: 'Energy Landscapes and Optimization',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            Gradient descent over non-convex neural loss surfaces exhibits anomalous diffusion characteristics. In over-parameterized regimes, wide local minima correspond to configurations with superior generalization bounds and resilient generalization.
          </p>
          <div class="my-8 p-6 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900/60">
            <h4 class="font-sans font-bold text-sm uppercase tracking-wider mb-2">Empirical Observations on Loss Topology:</h4>
            <ul class="space-y-2 text-sm font-serif">
              <li>• <strong>Spectral Regularity:</strong> The Hessian spectrum splits into a tiny bulk of large eigenvalues and a flat tail.</li>
              <li>• <strong>Sharpness-Aware Minimization:</strong> Explicitly penalizing maximum loss within a neighborhood radius $\\rho$ prevents overfitting on idiosyncratic noise.</li>
              <li>• <strong>Phase Transitions:</strong> Sudden emergence of grokking when weight decay regularizes representations post-memorization.</li>
            </ul>
          </div>
          <p class="text-base font-serif leading-relaxed">
            These phenomena reinforce the hypothesis that deep learning systems behave as thermodynamical ensembles settling into low-entropy configurational states.
          </p>
        `
      },
      {
        pageNumber: 4,
        chapter: 'CHAPTER IV',
        title: 'Synthesis & Emergent Reasoning',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            As model capacity scales past critical compute thresholds, qualitatively novel behaviors manifest without explicit supervision. Arithmetic multi-step deduction, recursive code generation, and inductive theory-of-mind simulations emerge spontaneously from simple token-prediction objectives.
          </p>
          <div class="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl my-6">
            <h4 class="font-sans font-bold text-xs uppercase tracking-widest text-amber-900 dark:text-amber-200 mb-2">Key Takeaway</h4>
            <p class="font-serif text-sm text-amber-950 dark:text-amber-100">
              Scaling is not merely quantitative expansion; it represents a qualitative ontological shift where statistical correlation condenses into systematic algorithmic execution.
            </p>
          </div>
          <p class="text-base font-serif leading-relaxed">
            The subsequent phase of cognitive architecture will focus on structured verification loops, programmatic test-time compute scaling, and verifiable theorem-proving guarantees.
          </p>
        `
      },
      {
        pageNumber: 5,
        chapter: 'CHAPTER V',
        title: 'Mathematical Formulations & Proofs',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            In this section we provide the analytical bounds for generalization error under isotropic Gaussian initialization and randomized coordinate projection.
          </p>
          <div class="p-5 font-mono text-xs bg-neutral-100 dark:bg-neutral-900 rounded-lg space-y-3">
            <p class="font-bold text-neutral-800 dark:text-neutral-200">Theorem 5.1 (Universal Geodesic Approximation):</p>
            <p class="text-neutral-600 dark:text-neutral-400">For every continuous functional $F: \\mathcal{C}(X) \\to \\mathbb{R}$ and $\\epsilon > 0$, there exists a two-layer attention operator $\\Phi_\\theta$ such that:</p>
            <div class="p-3 bg-white dark:bg-black rounded border border-neutral-300 dark:border-neutral-800 text-center font-bold">
              sup_{x \in X} | F(x) - \Phi_\theta(x) | < \epsilon
            </div>
            <p class="text-neutral-500 dark:text-neutral-500 italic">Proof follows from Stone-Weierstrass density over compact compacta.</p>
          </div>
        `
      },
      {
        pageNumber: 6,
        chapter: 'CHAPTER VI',
        title: 'Future Horizons & Open Problems',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            We conclude with three foundational open questions that will define the trajectory of artificial general cognition across the coming decade:
          </p>
          <ol class="list-decimal list-inside space-y-4 font-serif text-base leading-relaxed">
            <li><strong>The Grounding Conundrum:</strong> How can symbols manipulated purely within an internal linguistic calculus achieve true causal reference to external physical realities?</li>
            <li><strong>Continuous Lifelong Plasticity:</strong> Formulating non-destructive weight updates that incorporate new epistemological frameworks without catastrophic forgetting.</li>
            <li><strong>Computational Complexity Lower Bounds:</strong> Establishing whether autoregressive generation can simulate arbitrary polynomial-time Turing machines without exponential context growth.</li>
          </ol>
        `
      }
    ]
  },
  {
    id: 'doc-002',
    title: 'Monochrome & Minimalist Typography',
    subtitle: 'A Modern Manual on Editorial Layouts, Grid Systems, and Rhythm',
    author: 'Kaelen Thorne & Studio Bureau',
    category: 'Design & Architecture',
    price: 299,
    rating: 4.92,
    reviewsCount: 98,
    pages: 36,
    readTime: '30 min',
    edition: 'Second Edition',
    coverStyle: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
    accentColor: '#FFFFFF',
    badge: 'Design Essential',
    abstract: 'A definitive guide for designers and developers seeking mastery over visual hierarchy, negative whitespace, typographic scale, and Swiss grid systems.',
    highlights: [
      'The mathematics of the golden ratio in digital page geometry.',
      'Balancing high-fashion monochrome aesthetics with AA/AAA accessibility.',
      'Variable font performance and optical sizing for modern viewports.'
    ],
    tableOfContents: [
      { page: 1, title: 'Part I: The Philosophy of Subtraction' },
      { page: 2, title: 'Part II: Swiss Grids & Modular Geometry' },
      { page: 3, title: 'Part III: Rhythm, Leading & Negative Space' },
      { page: 4, title: 'Part IV: The Monochrome Contrast Spectrum' }
    ],
    pagesContent: [
      {
        pageNumber: 1,
        chapter: 'PART I',
        title: 'The Philosophy of Subtraction',
        content: `
          <p class="lead-paragraph text-xl font-serif leading-relaxed mb-6">
            Perfection in editorial design is achieved not when there is nothing more to add, but when there is nothing left that can be removed without collapsing the integrity of the message.
          </p>
          <p class="text-base font-serif leading-relaxed mb-6">
            Whitespace is not inert emptiness; it is an active structural medium. In luxury typography, the space surrounding a letterform commands as much deliberate intention as the stroke of the glyph itself.
          </p>
          <div class="my-8 p-6 bg-neutral-900 text-white rounded-xl text-center">
            <p class="font-serif italic text-xl">"Form follows silence before it follows function."</p>
            <p class="text-xs uppercase tracking-widest text-neutral-400 mt-2">— Studio Bureau Principles</p>
          </div>
        `
      },
      {
        pageNumber: 2,
        chapter: 'PART II',
        title: 'Swiss Grids & Modular Geometry',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            The 12-column baseline grid provides an underlying cadence that harmonizes diverse content elements. When headlines, figures, and sidebars align to fixed vertical rhythm units, cognitive load drops dramatically.
          </p>
          <div class="grid grid-cols-3 gap-3 my-6 text-center font-mono text-xs">
            <div class="p-3 border border-neutral-300 dark:border-neutral-700 rounded">8pt Baseline</div>
            <div class="p-3 border border-neutral-300 dark:border-neutral-700 rounded">1.618 Ratio</div>
            <div class="p-3 border border-neutral-300 dark:border-neutral-700 rounded">65 Chars / Line</div>
          </div>
        `
      },
      {
        pageNumber: 3,
        chapter: 'PART III',
        title: 'Rhythm, Leading & Negative Space',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            Line height must expand proportionally with column width. A measure of 75 characters demands a line-height multiplier between 1.55 and 1.65 to ensure comfortable eye trajectory across line breaks.
          </p>
          <div class="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-xl my-6">
            <h5 class="font-sans font-bold text-xs uppercase tracking-wider mb-2">Golden Ratio Leading Formula</h5>
            <p class="font-mono text-sm text-neutral-700 dark:text-neutral-300">Leading = (Font_Size * 1.618) + (Line_Width / 100)</p>
          </div>
        `
      },
      {
        pageNumber: 4,
        chapter: 'PART IV',
        title: 'The Monochrome Contrast Spectrum',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            Pure black (#000000) on pure white (#FFFFFF) creates vibrating halation effects under bright backlight displays. Modern high-end editorial experiences utilize off-whites (#FAF9F6) and deep obsidian (#111111) for effortless reading longevity.
          </p>
        `
      }
    ]
  },
  {
    id: 'doc-003',
    title: 'The Sovereign Algorithm',
    subtitle: 'Decentralized Governance, Micro-Economies & Autonomous Protocols',
    author: 'Prof. Alexei Mercer',
    category: 'Economics & Finance',
    price: 499,
    rating: 4.88,
    reviewsCount: 76,
    pages: 54,
    readTime: '50 min',
    edition: 'Special Monograph',
    coverStyle: 'linear-gradient(135deg, #09090B 0%, #1E1B4B 100%)',
    accentColor: '#818CF8',
    badge: 'Bestseller',
    abstract: 'An economic investigation into how autonomous agent networks and programmatic smart contracts will restructure capital allocation and corporate ownership.',
    highlights: [
      'Mechanism design and quadratic voting in autonomous entities.',
      'Zero-knowledge compliance and programmatic capital flows.',
      'The dissolution of bureaucratic transaction costs.'
    ],
    tableOfContents: [
      { page: 1, title: 'Chapter 1: The Zero-Friction Firm' },
      { page: 2, title: 'Chapter 2: Automated Liquidity Protocols' },
      { page: 3, title: 'Chapter 3: Cryptographic Game Theory' }
    ],
    pagesContent: [
      {
        pageNumber: 1,
        chapter: 'CHAPTER I',
        title: 'The Zero-Friction Firm',
        content: `
          <p class="lead-paragraph text-xl font-serif leading-relaxed mb-6">
            Ronald Coase argued in 1937 that firms exist because the transaction costs of contracting on the open market exceed the internal management overhead. Cryptographic verification inverted this equation forever.
          </p>
          <p class="text-base font-serif leading-relaxed">
            When agreements execute deterministically on state machines without intermediaries, the optimal size of a firm approaches a network of autonomous agents coordinated via tokenized incentives.
          </p>
        `
      },
      {
        pageNumber: 2,
        chapter: 'CHAPTER II',
        title: 'Automated Liquidity Protocols',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            Constant product automated market makers eliminate central order books in favor of invariant curves $x \\cdot y = k$. This chapter explores dynamic slippage and loss-versus-rebalancing dynamics.
          </p>
        `
      },
      {
        pageNumber: 3,
        chapter: 'CHAPTER III',
        title: 'Cryptographic Game Theory',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            By embedding Nash equilibria directly into protocol state transition functions, decentralized protocols guarantee Byzantine fault tolerance even under collusive economic attacks.
          </p>
        `
      }
    ]
  },
  {
    id: 'doc-004',
    title: 'Quantum Coherence & Topology',
    subtitle: 'Braiding Anyons, Fault-Tolerant Logical Qubits & Error Correction',
    author: 'Dr. Seraphina Zhao',
    category: 'Quantum Physics',
    price: 349,
    rating: 4.95,
    reviewsCount: 110,
    pages: 42,
    readTime: '40 min',
    edition: 'Cambridge Series #12',
    coverStyle: 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #0F172A 100%)',
    accentColor: '#34D399',
    badge: 'Peer Reviewed',
    abstract: 'Exploring topological protection against decoherence through non-Abelian anyon braiding in two-dimensional electron gases.',
    highlights: [
      'Majorana zero modes and topological quantum computation.',
      'Surface code thresholds with 2D square lattice geometry.',
      'Cryogenic control interfaces and microwave pulse synthesis.'
    ],
    tableOfContents: [
      { page: 1, title: 'Chapter 1: Topological Protection Principles' },
      { page: 2, title: 'Chapter 2: The Toric & Surface Codes' },
      { page: 3, title: 'Chapter 3: Physical Implementation & Benchmarks' }
    ],
    pagesContent: [
      {
        pageNumber: 1,
        chapter: 'CHAPTER I',
        title: 'Topological Protection Principles',
        content: `
          <p class="lead-paragraph text-xl font-serif leading-relaxed mb-6">
            Local environmental noise is the paramount adversary of quantum information storage. By encoding logical qubits across non-local topological degrees of freedom, the system becomes intrinsically immune to local perturbation.
          </p>
        `
      },
      {
        pageNumber: 2,
        chapter: 'CHAPTER II',
        title: 'The Toric & Surface Codes',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            Surface codes achieve a fault-tolerance threshold of ~1% physical error rate, making them the primary candidate for fault-tolerant quantum advantage.
          </p>
        `
      },
      {
        pageNumber: 3,
        chapter: 'CHAPTER III',
        title: 'Physical Implementation & Benchmarks',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            Recent superconducting circuits have demonstrated logical error suppression scaling exponentially with code distance $d = 3, 5, 7$.
          </p>
        `
      }
    ]
  },
  {
    id: 'doc-005',
    title: 'Critique of Digital Reason',
    subtitle: 'Phenomenology, Hyper-Reality, and Human Consciousness in the Algorithmic Age',
    author: 'Jean-Luc Moreau',
    category: 'Philosophy',
    price: 199,
    rating: 4.89,
    reviewsCount: 84,
    pages: 28,
    readTime: '25 min',
    edition: 'Parisian Essays #04',
    coverStyle: 'linear-gradient(135deg, #292524 0%, #1C1917 100%)',
    accentColor: '#F59E0B',
    badge: 'Critique',
    abstract: 'A philosophical probe into perception, presence, and semantic alienation in an era mediated by synthetic generative interfaces.',
    highlights: [
      'Heideggerian enframing applied to generative models.',
      'The simulation of empathy in recursive dialogue systems.',
      'Reclaiming cognitive solitude in frictionless environments.'
    ],
    tableOfContents: [
      { page: 1, title: 'Section 1: The Loss of the Negative' },
      { page: 2, title: 'Section 2: The Synthetic Simulacrum' }
    ],
    pagesContent: [
      {
        pageNumber: 1,
        chapter: 'SECTION I',
        title: 'The Loss of the Negative',
        content: `
          <p class="lead-paragraph text-xl font-serif leading-relaxed mb-6">
            When all friction is eliminated from intellectual inquiry, the depth of dialectical resistance vanishes. True thinking requires the confrontation with what is opaque and recalcitrant.
          </p>
        `
      },
      {
        pageNumber: 2,
        chapter: 'SECTION II',
        title: 'The Synthetic Simulacrum',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            We no longer consult the mirror to see ourselves; we consult the latent projection to find an idealized approximation of who we might have been.
          </p>
        `
      }
    ]
  },
  {
    id: 'doc-006',
    title: 'The Neurobiology of Deep Focus',
    subtitle: 'Dopaminergic Regulation, Attention Restructuring & Flow States',
    author: 'Dr. Marcus Sterling',
    category: 'Artificial Intelligence',
    price: 299,
    rating: 4.97,
    reviewsCount: 165,
    pages: 38,
    readTime: '35 min',
    edition: 'Cognitive Science Series',
    coverStyle: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
    accentColor: '#A78BFA',
    badge: 'Popular',
    abstract: 'Neuroscientific strategies for sustaining sustained attention span and neural plasticity in high-noise digital environments.',
    highlights: [
      'Prefrontal cortex dopamine kinetics during high-order problem solving.',
      'Circadian entrainment for peak cognitive throughput.',
      'Attention restoration therapy via structured reading rituals.'
    ],
    tableOfContents: [
      { page: 1, title: 'Chapter 1: Dopaminergic Circuitry' },
      { page: 2, title: 'Chapter 2: The Mechanics of Flow' }
    ],
    pagesContent: [
      {
        pageNumber: 1,
        chapter: 'CHAPTER I',
        title: 'Dopaminergic Circuitry',
        content: `
          <p class="lead-paragraph text-xl font-serif leading-relaxed mb-6">
            Dopamine is not the neurochemical of satisfaction; it is the currency of pursuit and cognitive anticipation. Sustained deep work requires calibrating baseline tonic dopamine levels rather than chasing phasic spikes.
          </p>
        `
      },
      {
        pageNumber: 2,
        chapter: 'CHAPTER II',
        title: 'The Mechanics of Flow',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            When task difficulty exactly matches operator skill level at the 4% threshold, transient hypofrontality ensues, dissolving self-conscious chatter into pure execution.
          </p>
        `
      }
    ]
  }
];

export const CATEGORIES = [
  'All Categories',
  'Artificial Intelligence',
  'Design & Architecture',
  'Economics & Finance',
  'Quantum Physics',
  'Philosophy'
];
