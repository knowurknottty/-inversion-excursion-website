# ScrollCard Minting Flow Diagram

## System Architecture

```mermaid
flowchart TB
    subgraph Client["📱 Client Layer"]
        UI[Player UI]
        Upload[Image Upload]
        Wallet[Wallet Connection]
    end

    subgraph Processing["⚙️ Processing Layer"]
        OCR[OCR Engine<br/>Tesseract/Google Vision]
        AI[AI Extraction<br/>GPT-4V/Claude]
        Stats[Stats Generator]
    end

    subgraph Metadata["📦 Metadata Layer"]
        IPFS[IPFS Upload<br/>Pinata/web3.storage]
        JSON[Metadata JSON]
        Image[Card Image Gen]
    end

    subgraph Blockchain["⛓️ Blockchain Layer"]
        Paymaster[Base Paymaster<br/>CDP/Pimlico]
        Zora[Zora Protocol SDK]
        Contract[ScrollCard.sol<br/>ERC-721 on Base]
    end

    subgraph Storage["🗄️ Data Layer"]
        DB[(Mint Records)]
        Cache[Redis Cache]
    end

    %% Flow
    UI --> Upload
    Upload --> OCR
    OCR --> AI
    AI --> Stats
    Stats --> Image
    Image --> IPFS
    IPFS --> JSON
    JSON --> Zora
    Wallet --> Zora
    Zora --> Paymaster
    Paymaster --> Contract
    Contract --> DB
    Contract --> Cache

    %% Return path
    Contract -.->|NFT Minted| Wallet
    Wallet -.->|Display| UI

    style Client fill:#e1f5fe
    style Processing fill:#f3e5f5
    style Metadata fill:#e8f5e9
    style Blockchain fill:#fff3e0
    style Storage fill:#fce4ec
```

## Detailed Minting Flow

```mermaid
sequenceDiagram
    autonumber
    participant P as Player
    participant UI as Frontend App
    participant API as Backend API
    participant AI as AI Service
    participant IPFS as IPFS Node
    participant Zora as Zora SDK
    participant PM as Paymaster
    participant SC as ScrollCard.sol
    participant BC as Base Network

    P->>UI: Upload book screenshot
    UI->>API: POST /extract-metadata
    API->>AI: Process image with OCR
    AI-->>API: Extracted: chapter, dungeon, quote
    API->>API: Calculate card stats
    API->>API: Determine rarity tier
    API->>IPFS: Upload card image
    IPFS-->>API: IPFS hash (ipfs://...)
    API->>IPFS: Upload metadata JSON
    IPFS-->>API: Metadata URI
    API-->>UI: {metadataUri, stats, rarity}
    
    P->>UI: Confirm mint
    UI->>Zora: Connect wallet
    Zora->>UI: Wallet connected
    UI->>Zora: createCoin/mint call
    Zora->>PM: Request gas sponsorship
    PM->>PM: Validate policy limits
    PM->>SC: Forward mint transaction
    SC->>SC: Mint ERC-721 token
    SC->>BC: Record on Base L2
    BC-->>SC: Tx confirmed
    SC-->>PM: Success
    PM-->>Zora: Sponsored tx hash
    Zora-->>UI: Mint complete!
    UI->>API: POST /record-mint
    API->>DB: Store mint record
    UI->>P: Display NFT card
```

## Gasless Minting Flow (Paymaster)

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Client as dApp Client
    participant SC as Smart Account
    participant PM as Paymaster Service
    participant Bundler as Bundler
    participant Entry as EntryPoint
    participant Contract as ScrollCard

    User->>Client: Request mint
    Client->>SC: Create UserOperation
    SC->>SC: Sign UserOp
    Client->>PM: Submit for sponsorship
    PM->>PM: Check policy (per-user limit)
    PM->>PM: Check global limit
    PM->>PM: Validate calldata
    alt Policy allows
        PM->>PM: Sign paymasterData
        PM-->>Client: Sponsored UserOp
        Client->>Bundler: Submit UserOp
        Bundler->>Entry: HandleOps
        Entry->>Contract: execute(mintTo)
        Contract->>Contract: _safeMint()
        Contract-->>Entry: Success
        Entry-->>Bundler: Receipt
        Bundler-->>Client: Tx hash
        Client-->>User: Mint confirmed!
    else Policy rejects
        PM-->>Client: Rejected (limit reached)
        Client-->>User: Show error / request payment
    end
```

## Rarity Tiers & Stats Generation

```mermaid
graph LR
    A[Extracted Content] --> B{Rarity Analysis}
    B -->|Common| C[Tier 1: Common<br/>Power: 10-30]
    B -->|Uncommon| D[Tier 2: Uncommon<br/>Power: 31-60]
    B -->|Rare| E[Tier 3: Rare<br/>Power: 61-85]
    B -->|Epic| F[Tier 4: Epic<br/>Power: 86-95]
    B -->|Legendary| G[Tier 5: Legendary<br/>Power: 96-100]
    
    C --> H[Card Attributes]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Attack]
    H --> J[Defense]
    H --> K[Wisdom]
    H --> L[Luck]
```

## Data Flow: Screenshot to NFT

```mermaid
flowchart LR
    subgraph Input["Input: Screenshot"]
        IMG[Image File<br/>PNG/JPG]
    end
    
    subgraph Analysis["Content Analysis"]
        OCR[Text Extraction]
        CH[Chapter Detection]
        DN[Dungeon Parser]
        QT[Quote Extractor]
    end
    
    subgraph CardGen["Card Generation"]
        RAR[Rarity Calculator]
        STAT[Stat Generator]
        ART[Art Generator]
    end
    
    subgraph Output["Output: NFT"]
        META[Metadata JSON]
        TOKEN[ERC-721 Token]
    end
    
    IMG --> OCR
    OCR --> CH
    OCR --> DN
    OCR --> QT
    CH --> RAR
    DN --> RAR
    QT --> RAR
    RAR --> STAT
    RAR --> ART
    STAT --> META
    ART --> META
    META --> TOKEN
    
    style Input fill:#e3f2fd
    style Analysis fill:#f3e5f5
    style CardGen fill:#e8f5e9
    style Output fill:#fff3e0
```

## Error Handling & Fallbacks

```mermaid
flowchart TD
    A[Start Mint] --> B{Extract Metadata}
    B -->|Success| C[Generate Card]
    B -->|OCR Fails| D[Manual Input Mode]
    D --> C
    
    C --> E{IPFS Upload}
    E -->|Success| F[Prepare Mint]
    E -->|Fails| G[Retry with Backup Node]
    G --> E
    
    F --> H{Paymaster Available?}
    H -->|Yes| I[Gasless Mint]
    H -->|No| J[User Pays Gas]
    
    I --> K{Policy Allows?}
    K -->|Yes| L[Submit Sponsored Tx]
    K -->|No| J
    
    J --> M[Show Gas Estimate]
    M --> N{User Confirms?}
    N -->|Yes| O[Submit Transaction]
    N -->|No| P[Save Draft]
    
    L --> Q{Tx Success?}
    O --> Q
    Q -->|Yes| R[NFT Delivered!]
    Q -->|No| S[Retry / Refund]
    
    style R fill:#c8e6c9
    style S fill:#ffcdd2
```
