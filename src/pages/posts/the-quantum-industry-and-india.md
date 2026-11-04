---
layout: ../../layouts/Post.astro
title: "The quantum industry and India"
description: "Who is building quantum technology, how much money is flowing in, and what it means for a student in India. The global players by platform, the investment boom and its risks, national programmes, India's National Quantum Mission in detail (its goals, hubs and startups), the IBM machine planned for Amaravati, the jobs across the quantum stack, and how to read industry news critically."
date: 2026-11-04
category: lesson
lesson: 47
---

The last 46 lessons were about how quantum technology works. This one is about who is building it, who is paying for it, and where the jobs are, with a special focus on India. The field is changing fast: the numbers here are as of late 2026, and some will be out of date within a year. The habits of reading the news critically, at the end of the lesson, will last longer.

## The landscape: who builds what

Quantum computing is no longer a purely academic field. Hundreds of companies now work on it, in four broad groups.

**Large technology companies** with in-house quantum programmes:

| Company | Main platform or role | Notable work |
|---|---|---|
| IBM | Superconducting qubits; Qiskit; cloud access | Heron and Nighthawk processors; roadmap to the fault-tolerant Starling machine in 2029 (Lesson 38) |
| Google | Superconducting qubits | Willow and below-threshold error correction (Lesson 35); Quantum Echoes (Lesson 31) |
| Microsoft | Topological qubits; Azure Quantum cloud | Majorana 1 (2025, still debated; Lesson 39); partnerships with Quantinuum and Atom Computing |
| Amazon (AWS) | Cat qubits; Braket cloud | Ocelot chip (2025) |
| Nvidia | Classical hardware and software for quantum | CUDA-Q software, GPU simulation, linking GPUs to quantum processors |

**Dedicated quantum hardware companies**, many of them now public:

| Platform | Companies |
|---|---|
| Trapped ions | Quantinuum (Nasdaq IPO in 2026), IonQ, AQT |
| Neutral atoms | QuEra, Pasqal, Atom Computing, Infleqtion (public via merger in 2026) |
| Superconducting | Rigetti, IQM, Alice & Bob, Oxford Quantum Circuits, and in India, QpiAI |
| Photonics | PsiQuantum, Xanadu, Quandela |
| Annealing | D-Wave |
| Spins in silicon | Diraq, Quantum Motion, Intel |

**Enabling technology** suppliers: dilution refrigerators (Bluefors, Oxford Instruments), control electronics (Quantum Machines, Qblox, Zurich Instruments, Keysight), lasers, cryogenic cables, single-photon detectors, and chip foundries. This layer is often where engineers find the first jobs, and where countries building their own capability, like India, must invest.

**Software, applications and security:** quantum software and algorithm companies, consultancies, banks and pharmaceutical companies with research teams, and the much larger post-quantum cryptography industry (Lesson 43), which affects every organisation that uses encryption.

## The money: a boom, with real risks

According to McKinsey's Quantum Technology Monitor 2026:

- Investment in quantum start-ups reached about **$12.6 billion in 2025**, over six times the 2024 level, with about 90% going to quantum computing.
- Quantum computing companies earned **over $1 billion** in revenue worldwide in 2025.
- McKinsey projects a quantum market of **$60–100 billion by 2035**, and economic value across industries of up to $2.7 trillion.

Several companies listed on stock markets in 2025 and 2026, at high valuations. It's important to see the other side too. Revenues are still small compared with valuations, most companies make large losses, and much of the revenue comes from selling machines to governments and research labs rather than from solving business problems better than classical computers. Lesson 31 explained why: useful quantum advantage for practical problems hasn't yet been clearly established. Investment booms in deep technology can be followed by painful corrections. Good careers are built on skills that stay valuable either way: physics, electronics, software and mathematics.

## National programmes

Governments treat quantum technology as strategically important, for security (codebreaking and secure communication), economic competitiveness, and science:

- **United States:** the National Quantum Initiative Act (2018) coordinates research funding; DARPA, the Department of Energy and others fund large programmes.
- **China:** large state investment, especially in quantum communication (the Micius satellite and a national QKD backbone, Lesson 41) and in superconducting and photonic computing.
- **European Union:** the Quantum Flagship (from 2018), plus national programmes in Germany, France, the Netherlands, Finland and others.
- **United Kingdom:** a national programme since 2014, and a 10-year strategy from 2024 with £2.5 billion of public funding.
- Japan, South Korea, Canada, Australia, Singapore and Israel also run significant programmes.

## India's National Quantum Mission

India's Union Cabinet approved the **National Quantum Mission (NQM)** on 19 April 2023, with a budget of **₹6,003.65 crore** (about $740 million) over eight years, from 2023–24 to 2030–31. It's run by the Department of Science and Technology (DST). Its stated goals include:

- **Computing:** intermediate-scale quantum computers with 20 to 50 physical qubits within about three years, 50 to 100 in five years, and 50 to 1,000 within eight years, on platforms such as superconducting and photonic qubits.
- **Communication:** satellite-based secure quantum communication between ground stations about 2,000 km apart, long-distance secure links with other countries, inter-city QKD over 2,000 km, and multi-node quantum networks with quantum memories.
- **Sensing and metrology:** high-sensitivity magnetometers and atomic clocks for precision timing, communication and navigation.
- **Materials and devices:** superconductors, new semiconductor structures and topological materials for quantum devices.

### The four hubs

In 2024 the NQM set up four **thematic hubs** (T-Hubs), each led by a major institute working with partner institutions across the country:

| Hub | Lead institution |
|---|---|
| Quantum computing | Indian Institute of Science (IISc), Bengaluru |
| Quantum communication | IIT Madras (with C-DOT) |
| Quantum sensing and metrology | IIT Bombay |
| Quantum materials and devices | IIT Delhi |

### Startups

In late 2024 the NQM selected its first **eight startups** for support, covering the whole stack, which is a good map of what a national quantum industry needs:

| Startup | City | Area |
|---|---|---|
| QpiAI | Bengaluru | Superconducting quantum computers |
| QNu Labs | Bengaluru | Quantum communication and quantum-safe networks |
| Dimira Technologies | Mumbai (IIT Bombay) | Cryogenic cables |
| PrenishQ | Delhi (IIT Delhi) | Precision diode-laser systems |
| QuPrayog | Pune | Optical atomic clocks |
| Quanastra | Delhi | Cryogenics and superconducting detectors |
| Pristine Diamonds | Ahmedabad | Diamond materials for quantum sensing |
| Quan2D Technologies | Bengaluru | Superconducting nanowire single-photon detectors |

On World Quantum Day, 14 April 2025, QpiAI launched **QpiAI-Indus**, a 25-qubit superconducting quantum computer with its own software stack, described as India's first full-stack quantum computing platform. The NQM has since opened a rolling call for more startups.

### Amaravati Quantum Valley

In May 2025, IBM, Tata Consultancy Services and the Government of Andhra Pradesh announced plans to install an **IBM Quantum System Two** with a 156-qubit Heron processor (Lesson 38) at a new "Quantum Valley" technology park in Amaravati, which would be the largest quantum computer in India. Construction at the park began in 2026. As of October 2026, there was no official confirmation that the system had been installed, and state government statements pointed to a launch in early 2027. It's a useful example of how timelines for large technology projects slip, and of why you should check the latest official status rather than the first announcement.

### Other activity

India's quantum work extends well beyond the NQM: ISRO and DRDO have demonstrated QKD links (Lesson 41); C-DOT and Indian startups build QKD products; ISRO is developing indigenous atomic clocks for NavIC (Lesson 44); research groups at TIFR, IISc, the IITs, IISERs, RRI and others build superconducting, photonic, trapped-ion and NV-centre experiments; and Indian IT companies run quantum and post-quantum cryptography practices for global clients. Education is growing fast too, with tens of thousands of university students now taking quantum computing courses.

India's strengths are a very large pool of mathematics, physics and engineering talent, a world-class software industry, and strong institutions. The challenges are well known: limited domestic fabrication of advanced chips, dependence on imported components such as dilution refrigerators and lasers, and the need for patient, long-term funding. The NQM's startup choices (cables, lasers, detectors, materials) target exactly these gaps.

## Jobs across the quantum stack

Quantum technology needs far more than physicists. Here are the main kinds of role, and which parts of this course prepare you for each:

| Role | What they do | Background | Course lessons |
|---|---|---|---|
| Quantum hardware physicist | Design and characterise qubits | Physics PhD or master's | 32, 37–39 |
| Microwave and RF engineer | Signal chains, resonators, amplifiers, filters | ECE | 38 |
| FPGA and firmware engineer | Pulse sequencing, feedback, real-time decoders | ECE, embedded systems | 35, 38, 40 |
| Cryogenic and vacuum engineer | Fridges, wiring, vacuum systems | Mechanical, physics | 38, 39 |
| Laser and photonics engineer | Lasers for ions, atoms, QKD; detectors | Physics, optics, ECE | 39, 41, 44 |
| Fabrication and process engineer | Chip fabrication, materials | Materials science, physics, ECE | 38, 39 |
| Quantum software engineer | Compilers, SDKs, cloud platforms | Computer science | 17–20, 40 |
| Quantum algorithm researcher | New algorithms and applications | Mathematics, CS, physics | 22–31 |
| Error-correction engineer | Codes, decoders, fault-tolerant architecture | CS, physics, mathematics | 33–36 |
| Application scientist | Chemistry, materials, finance, optimisation use cases | Domain science plus quantum | 29, 45, 46 |
| Security and PQC engineer | Migrating systems to quantum-safe cryptography | CS, security | 41, 43 |
| Product, business and policy roles | Strategy, sales, standards, government programmes | Varied, plus solid technical literacy | 31, 47 |

Two observations. First, the largest number of near-term jobs is in **engineering and software around the qubits**, not in building qubits themselves. Second, the most valuable people bridge two worlds: an embedded engineer who understands qubits, a chemist who can write Qiskit, a security engineer who understands Shor's algorithm. You don't need to abandon your current field; you need to add quantum to it.

## Why Kota?

Kota is famous for one thing: preparing hundreds of thousands of students in physics, chemistry and mathematics, at a level few places in the world match. Those are exactly the foundations quantum technology needs. The idea behind Kota Quantum Valley is that this talent, and the teaching expertise around it, could feed a quantum-skilled workforce: students who learn quantum computing alongside their preparation, teachers who add quantum modules, and, in time, training and engineering work in the city itself. It's an aspiration, not yet a reality, and this course is a first step: free, in English and Hindi, from bits to real hardware.

## Reading quantum news critically

Every week brings announcements. Before believing one, ask:

1. **Qubits or quality?** A bigger qubit count means little without gate error rates, connectivity and coherence (Lesson 37). Look for two-qubit error rates and logical-qubit results.
2. **Peer-reviewed or press release?** Is there a paper, and has it been scrutinised? Advantage claims are often followed by classical counter-results (Lesson 31).
3. **Useful or contrived?** Was the task chosen to be hard for classical computers, or to be useful?
4. **Physical or logical?** Error-corrected logical qubits are what matter for long algorithms (Lesson 35). How many physical qubits per logical qubit, and at what logical error rate?
5. **Announced or delivered?** Roadmaps and partnership announcements describe intentions; check later for delivery.
6. **Revenue or valuation?** For companies, compare actual revenue and losses with market value.

## Try it

1. Name one company for each platform: superconducting, trapped ions, neutral atoms, photonics.
2. What were McKinsey's estimates for quantum start-up investment in 2025 and for quantum computing revenue?
3. What is the NQM's budget and duration, and what qubit counts does it target by its eighth year?
4. Which institutions lead the four NQM hubs?
5. Why might a country choose to fund startups making cryogenic cables and laser systems, not just quantum computers?
6. An announcement says "Company X unveils 1,000-qubit processor". What three questions would you ask first?
7. Which roles in the jobs table best match your own background, and which lessons would you revise first?

**Answers:**

1. For example: superconducting, IBM or Google (or QpiAI in India); trapped ions, Quantinuum or IonQ; neutral atoms, QuEra or Pasqal; photonics, PsiQuantum or Xanadu.
2. About **$12.6 billion** of start-up investment in 2025, and **over $1 billion** of quantum computing revenue.
3. **₹6,003.65 crore** over eight years (2023–24 to 2030–31), targeting **50 to 1,000 physical qubits** by the eighth year.
4. **IISc Bengaluru** (computing), **IIT Madras** (communication), **IIT Bombay** (sensing and metrology), **IIT Delhi** (materials and devices).
5. Every quantum computer depends on such components; importing them all creates dependence and supply risks, and they are areas where a country can build real industrial capability and exports even before quantum computers are useful.
6. For example: What are the two-qubit gate error rates and coherence times? How are the qubits connected, and has the device been benchmarked (or published)? Any logical qubits, and when will it actually be available to users?
7. This depends on you. For example, an embedded firmware engineer maps naturally to FPGA and control-system roles (Lessons 35, 38, 40) and to PQC on devices (Lesson 43).

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Big tech | IBM, Google, Microsoft, Amazon, Nvidia |
| Platforms | Superconducting, ions, atoms, photonics, annealing, silicon spins |
| Enabling tech | Fridges, control electronics, lasers, cables, detectors, foundries |
| Investment (2025) | ≈ $12.6 billion in start-ups; > $1 billion revenue (McKinsey 2026) |
| Market outlook | $60–100 billion by 2035 (McKinsey projection) |
| Caution | Small revenues, large losses, high valuations; advantage not yet shown for practical problems |
| India's NQM | Approved 19 April 2023; ₹6,003.65 crore; 2023–24 to 2030–31 |
| NQM goals | 50–1,000 qubits in 8 years; 2,000 km satellite QKD; magnetometers, clocks; materials |
| T-Hubs | IISc (computing), IIT Madras (communication), IIT Bombay (sensing), IIT Delhi (materials) |
| NQM startups | QpiAI, QNu Labs, Dimira, PrenishQ, QuPrayog, Quanastra, Pristine Diamonds, Quan2D |
| QpiAI-Indus | 25-qubit superconducting system, launched 14 April 2025 |
| Amaravati | IBM Quantum System Two (156-qubit Heron) planned; launch expected 2027 |
| Jobs | Most near-term roles are engineering and software around the qubits |
| News checklist | Quality not count; peer review; useful task; logical qubits; delivered; revenue |
