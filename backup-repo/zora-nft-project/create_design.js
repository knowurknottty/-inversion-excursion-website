import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hidden coalition message to encode
const COALITION_MESSAGE = "WE ARE THE GUARDIANS. UNITY THROUGH TRUTH. COALITION OF THE AWAKE.";

/**
 * Create SVG t-shirt design with hidden message encoded in the pattern
 */
function createTShirtDesign() {
    // Convert message to binary
    const binaryMessage = COALITION_MESSAGE.split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');
    
    // Create pixel pattern based on binary message
    let pixelPattern = '';
    const pixelsPerRow = 64;
    const totalPixels = binaryMessage.length;
    const rows = Math.ceil(totalPixels / pixelsPerRow);
    
    for (let i = 0; i < totalPixels; i++) {
        const bit = binaryMessage[i];
        const x = (i % pixelsPerRow) * 4;
        const y = Math.floor(i / pixelsPerRow) * 4;
        
        // Darker pixels for 1, lighter for 0
        const color = bit === '1' ? '#1a1a2e' : '#16213e';
        pixelPattern += `<rect x="${x}" y="${y}" width="4" height="4" fill="${color}" />\n`;
    }

    // SVG T-Shirt Design
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Hidden message pattern -->
    <pattern id="hiddenPattern" x="0" y="0" width="256" height="${rows * 4}" patternUnits="userSpaceOnUse">
      ${pixelPattern}
    </pattern>
    
    <!-- Gradient for main design -->
    <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f23"/>
      <stop offset="50%" style="stop-color:#1a1a3e"/>
      <stop offset="100%" style="stop-color:#0f0f23"/>
    </linearGradient>
    
    <!-- Eye glow effect -->
    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#00ffff;stop-opacity:0"/>
    </radialGradient>
    
    <!-- Circuit pattern -->
    <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M0 20 L15 20 L20 15 L20 0" fill="none" stroke="#00ffff" stroke-width="0.5" opacity="0.3"/>
      <path d="M40 20 L25 20 L20 25 L20 40" fill="none" stroke="#00ffff" stroke-width="0.5" opacity="0.3"/>
      <circle cx="20" cy="20" r="2" fill="#00ffff" opacity="0.5"/>
    </pattern>
  </defs>
  
  <!-- Background with hidden pattern -->
  <rect width="800" height="800" fill="url(#hiddenPattern)" opacity="0.05"/>
  <rect width="800" height="800" fill="url(#mainGrad)"/>
  <rect width="800" height="800" fill="url(#circuit)" opacity="0.3"/>
  
  <!-- T-Shirt Shape -->
  <g transform="translate(100, 50)">
    <!-- Shirt body -->
    <path d="M100 100 
             Q150 80, 200 100 
             L250 120 
             L350 120 
             Q400 120, 450 100 
             L500 120 
             L520 180 
             L480 200 
             L480 550 
             Q480 580, 450 580 
             L150 580 
             Q120 580, 120 550 
             L120 200 
             L80 180 
             Z" 
          fill="#1a1a2e" 
          stroke="#00ffff" 
          stroke-width="2"/>
    
    <!-- Collar -->
    <path d="M200 100 Q300 140, 400 100" fill="none" stroke="#00ffff" stroke-width="3"/>
    
    <!-- Main Design: All-Seeing Eye with Guardian Theme -->
    <g transform="translate(300, 280)">
      <!-- Outer rings -->
      <circle cx="0" cy="0" r="120" fill="none" stroke="#00ffff" stroke-width="1" opacity="0.3"/>
      <circle cx="0" cy="0" r="100" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.5"/>
      <circle cx="0" cy="0" r="80" fill="none" stroke="#00ffff" stroke-width="1" opacity="0.4"/>
      
      <!-- Eye shape -->
      <path d="M-70 0 Q0 -60, 70 0 Q0 60, -70 0" fill="#0a0a1a" stroke="#00ffff" stroke-width="3"/>
      
      <!-- Iris -->
      <circle cx="0" cy="0" r="35" fill="#00ffff" opacity="0.2"/>
      <circle cx="0" cy="0" r="25" fill="#00ffff" opacity="0.4"/>
      
      <!-- Pupil with glow -->
      <circle cx="0" cy="0" r="15" fill="#000"/>
      <circle cx="0" cy="0" r="15" fill="url(#eyeGlow)" opacity="0.8"/>
      <circle cx="5" cy="-5" r="5" fill="#fff" opacity="0.6"/>
      
      <!-- Guardian text around eye -->
      <path id="textCircle" d="M-90 0 A90 90 0 0 1 90 0" fill="none"/>
      <text fill="#00ffff" font-family="monospace" font-size="12" letter-spacing="4">
        <textPath href="#textCircle">GOYIM GUARDIAN • WATCHING • PROTECTING •</textPath>
      </text>
    </g>
    
    <!-- Binary code strips (decorative, contains partial message) -->
    <g transform="translate(150, 450)" opacity="0.4">
      <text x="0" y="0" fill="#00ffff" font-family="monospace" font-size="8">
        01000111 01001111 01011001 01001001 01001101
      </text>
      <text x="0" y="15" fill="#00ffff" font-family="monospace" font-size="8">
        01000111 01010101 01000001 01010010 01000100
      </text>
      <text x="0" y="30" fill="#00ffff" font-family="monospace" font-size="8">
        01001001 01000001 01001110 00100000 01000001
      </text>
      <text x="0" y="45" fill="#00ffff" font-family="monospace" font-size="8">
        01001001 00100000 01000011 01001111 01000001
      </text>
    </g>
    
    <!-- Coalition tag -->
    <g transform="translate(380, 520)">
      <rect x="0" y="0" width="80" height="25" fill="#00ffff" opacity="0.1" stroke="#00ffff" stroke-width="1"/>
      <text x="40" y="17" fill="#00ffff" font-family="monospace" font-size="10" text-anchor="middle">
        COALITION
      </text>
    </g>
    
    <!-- Edition number -->
    <text x="300" y="560" fill="#00ffff" font-family="monospace" font-size="12" text-anchor="middle" opacity="0.6">
      EDITION 001 / 100
    </text>
  </g>
  
  <!-- Corner decorations -->
  <g opacity="0.5">
    <path d="M20 20 L60 20 L60 25 L25 25 L25 60 L20 60 Z" fill="#00ffff"/>
    <path d="M780 20 L740 20 L740 25 L775 25 L775 60 L780 60 Z" fill="#00ffff"/>
    <path d="M20 780 L60 780 L60 775 L25 775 L25 740 L20 740 Z" fill="#00ffff"/>
    <path d="M780 780 L740 780 L740 775 L775 775 L775 740 L780 740 Z" fill="#00ffff"/>
  </g>
  
  <!-- Title text -->
  <text x="400" y="720" fill="#00ffff" font-family="monospace" font-size="24" text-anchor="middle" font-weight="bold">
    GOYIM GUARDIAN
  </text>
  <text x="400" y="750" fill="#00ffff" font-family="monospace" font-size="14" text-anchor="middle" opacity="0.7">
    COALITION TEE #001
  </text>
</svg>`;

    // Save SVG
    const outputPath = path.join(__dirname, 'tshirt_design.svg');
    fs.writeFileSync(outputPath, svg);
    
    // Save metadata
    const metadata = {
        name: "Goyim Guardian Coalition Tee #001",
        description: "Limited edition wearable statement. The truth is in the details. This design contains hidden messages for those who know where to look. Part of the Guardian Coalition collection.",
        image: "ipfs://{CID}/tshirt_design.svg",
        external_url: "https://zora.co/collect/{contract_address}/1",
        attributes: [
            {
                trait_type: "Edition",
                value: "001"
            },
            {
                trait_type: "Supply",
                value: "100"
            },
            {
                trait_type: "Type",
                value: "T-Shirt Design"
            },
            {
                trait_type: "Hidden Feature",
                value: "Encoded Message"
            },
            {
                trait_type: "Coalition",
                value: "Guardian"
            }
        ],
        hidden_message: COALITION_MESSAGE,
        encoding_method: "LSB Steganography + Binary Pattern"
    };
    
    const metadataPath = path.join(__dirname, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log('✅ T-shirt design created successfully!');
    console.log(`📁 SVG saved to: ${outputPath}`);
    console.log(`📁 Metadata saved to: ${metadataPath}`);
    console.log(`🔐 Hidden message encoded: "${COALITION_MESSAGE}"`);
    console.log(`📊 Binary length: ${binaryMessage.length} bits`);
    
    return {
        svgPath: outputPath,
        metadataPath: metadataPath,
        message: COALITION_MESSAGE
    };
}

// Execute
createTShirtDesign();
