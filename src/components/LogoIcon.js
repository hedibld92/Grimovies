import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

// Ton logo original exact - Version noire
const LOGO_BLACK = `
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Pellicule de film courbée -->
  <g transform="translate(250, 200)">
    <!-- Corps principal de la pellicule -->
    <path d="M-120,-80 C-120,-120 -60,-140 0,-130 C60,-140 120,-120 120,-80 
             C120,-40 80,-20 40,0 C20,20 -20,20 -40,0 
             C-80,-20 -120,-40 -120,-80 Z" 
          fill="#000000" stroke="#333" stroke-width="2"/>
    
    <!-- Bande de pellicule supérieure -->
    <path d="M-100,-70 C-100,-100 -50,-115 0,-110 C50,-115 100,-100 100,-70
             C100,-50 60,-40 20,-35 C-20,-35 -60,-40 -100,-70 Z"
          fill="#1a1a1a"/>
    
    <!-- Bande de pellicule inférieure -->
    <path d="M-80,-30 C-80,-50 -40,-60 0,-55 C40,-60 80,-50 80,-30
             C80,-10 50,0 20,5 C-20,5 -50,0 -80,-30 Z"
          fill="#333333"/>
    
    <!-- Perforations gauche -->
    <g fill="#ffffff">
      <rect x="-125" y="-75" width="8" height="8" rx="2"/>
      <rect x="-125" y="-60" width="8" height="8" rx="2"/>
      <rect x="-125" y="-45" width="8" height="8" rx="2"/>
      <rect x="-125" y="-30" width="8" height="8" rx="2"/>
      <rect x="-105" y="-65" width="6" height="6" rx="1"/>
      <rect x="-105" y="-50" width="6" height="6" rx="1"/>
      <rect x="-105" y="-35" width="6" height="6" rx="1"/>
      <rect x="-85" y="-55" width="5" height="5" rx="1"/>
      <rect x="-85" y="-40" width="5" height="5" rx="1"/>
    </g>
    
    <!-- Perforations droite -->
    <g fill="#ffffff">
      <rect x="117" y="-75" width="8" height="8" rx="2"/>
      <rect x="117" y="-60" width="8" height="8" rx="2"/>
      <rect x="117" y="-45" width="8" height="8" rx="2"/>
      <rect x="117" y="-30" width="8" height="8" rx="2"/>
      <rect x="99" y="-65" width="6" height="6" rx="1"/>
      <rect x="99" y="-50" width="6" height="6" rx="1"/>
      <rect x="99" y="-35" width="6" height="6" rx="1"/>
      <rect x="80" y="-55" width="5" height="5" rx="1"/>
      <rect x="80" y="-40" width="5" height="5" rx="1"/>
    </g>
    
    <!-- Reflets et brillance -->
    <ellipse cx="-30" cy="-60" rx="25" ry="15" fill="#666666" opacity="0.6" transform="rotate(-15)"/>
    <ellipse cx="20" cy="-45" rx="20" ry="10" fill="#888888" opacity="0.4" transform="rotate(-10)"/>
    <ellipse cx="-10" cy="-75" rx="15" ry="8" fill="#999999" opacity="0.3" transform="rotate(-20)"/>
  </g>
</svg>
`;

// Version blanche pour mode sombre
const LOGO_WHITE = `
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Pellicule de film courbée -->
  <g transform="translate(250, 200)">
    <!-- Corps principal de la pellicule -->
    <path d="M-120,-80 C-120,-120 -60,-140 0,-130 C60,-140 120,-120 120,-80 
             C120,-40 80,-20 40,0 C20,20 -20,20 -40,0 
             C-80,-20 -120,-40 -120,-80 Z" 
          fill="#ffffff" stroke="#cccccc" stroke-width="2"/>
    
    <!-- Bande de pellicule supérieure -->
    <path d="M-100,-70 C-100,-100 -50,-115 0,-110 C50,-115 100,-100 100,-70
             C100,-50 60,-40 20,-35 C-20,-35 -60,-40 -100,-70 Z"
          fill="#f5f5f5"/>
    
    <!-- Bande de pellicule inférieure -->
    <path d="M-80,-30 C-80,-50 -40,-60 0,-55 C40,-60 80,-50 80,-30
             C80,-10 50,0 20,5 C-20,5 -50,0 -80,-30 Z"
          fill="#e8e8e8"/>
    
    <!-- Perforations gauche -->
    <g fill="#000000">
      <rect x="-125" y="-75" width="8" height="8" rx="2"/>
      <rect x="-125" y="-60" width="8" height="8" rx="2"/>
      <rect x="-125" y="-45" width="8" height="8" rx="2"/>
      <rect x="-125" y="-30" width="8" height="8" rx="2"/>
      <rect x="-105" y="-65" width="6" height="6" rx="1"/>
      <rect x="-105" y="-50" width="6" height="6" rx="1"/>
      <rect x="-105" y="-35" width="6" height="6" rx="1"/>
      <rect x="-85" y="-55" width="5" height="5" rx="1"/>
      <rect x="-85" y="-40" width="5" height="5" rx="1"/>
    </g>
    
    <!-- Perforations droite -->
    <g fill="#000000">
      <rect x="117" y="-75" width="8" height="8" rx="2"/>
      <rect x="117" y="-60" width="8" height="8" rx="2"/>
      <rect x="117" y="-45" width="8" height="8" rx="2"/>
      <rect x="117" y="-30" width="8" height="8" rx="2"/>
      <rect x="99" y="-65" width="6" height="6" rx="1"/>
      <rect x="99" y="-50" width="6" height="6" rx="1"/>
      <rect x="99" y="-35" width="6" height="6" rx="1"/>
      <rect x="80" y="-55" width="5" height="5" rx="1"/>
      <rect x="80" y="-40" width="5" height="5" rx="1"/>
    </g>
    
    <!-- Reflets et brillance -->
    <ellipse cx="-30" cy="-60" rx="25" ry="15" fill="#cccccc" opacity="0.6" transform="rotate(-15)"/>
    <ellipse cx="20" cy="-45" rx="20" ry="10" fill="#aaaaaa" opacity="0.4" transform="rotate(-10)"/>
    <ellipse cx="-10" cy="-75" rx="15" ry="8" fill="#999999" opacity="0.3" transform="rotate(-20)"/>
  </g>
</svg>
`; 