import React, { useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import './AnimatedLoginLayout.css';

// Simple sound synthesis for the click
const playClickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // high pitch beep
    oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch(e) {
    // Ignore if audio context fails
  }
};

const playSwitchSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch(e) {
    // Ignore
  }
};

const AnimatedLoginLayout = ({ title, subtitle, error, success, children }) => {
  const [isLightOn, setIsLightOn] = useState(false);
  const controls = useAnimation();
  const cordY = useMotionValue(0);
  
  // Transform cordY into the path for the cord
  const cordPath = useTransform(cordY, (y) => {
    // y is usually 0 to 50
    // The anchor points: top is at 200. Pulling it down increases the Y of the control point and end point.
    const endY = 280 + y;
    const cpY = 250 + (y / 2);
    return `M170 200 Q170 ${cpY} 170 ${endY}`;
  });

  const cordEndY = useTransform(cordY, (y) => 280 + y);

  const handleDragEnd = (event, info) => {
    // if pulled down enough
    if (info.offset.y > 30) {
      playClickSound();
      
      // Delay switch sound slightly
      setTimeout(() => playSwitchSound(), 100);

      setIsLightOn((prev) => !prev);
    }
    // Snap back
    controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 10 } });
  };

  return (
    <motion.div 
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans relative transition-colors duration-500"
      animate={{
        backgroundColor: isLightOn ? '#0d1117' : '#030507'
      }}
      initial={{ backgroundColor: '#030507' }}
    >
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10">
        
        {/* Left Side: Animated Lamp */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 relative">
          <motion.svg 
             className="lamp-svg" 
             viewBox="0 0 400 500" 
             xmlns="http://www.w3.org/2000/svg"
             animate={{ rotate: isLightOn ? [0, 2, -1, 0] : 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
          >
            <defs>
              <linearGradient id="light-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(74, 222, 128, 0.8)" />
                <stop offset="100%" stopColor="rgba(74, 222, 128, 0)" />
              </linearGradient>
            </defs>

            {/* Base */}
            <motion.ellipse cx="200" cy="450" rx="60" ry="15" className="lamp-base" animate={{ fill: isLightOn ? '#d1d5db' : '#4b5563' }} transition={{ duration: 0.3 }} />
            <motion.path d="M140 450 v-10 c0 -15 30 -20 60 -20 s60 5 60 20 v10 z" className="lamp-stand" animate={{ fill: isLightOn ? '#f3f4f6' : '#6b7280' }} transition={{ duration: 0.3 }} />
            
            {/* Stand */}
            <motion.rect x="190" y="200" width="20" height="230" rx="10" className="lamp-stand" animate={{ fill: isLightOn ? '#f3f4f6' : '#6b7280' }} transition={{ duration: 0.3 }} />
            
            {/* Light Beam */}
            {/* Flicker effect when turning on */}
            <motion.polygon 
              points="110,200 290,200 400,500 0,500" 
              className="lamp-light"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isLightOn ? [0, 0.8, 0.2, 0.6, 0.1, 0.5] : 0,
                scaleY: isLightOn ? 1 : 0.5
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Shade */}
            <motion.path 
              d="M120 200 L140 80 Q200 60 260 80 L280 200 Z" 
              className="lamp-shade"
              animate={{ fill: isLightOn ? '#88c096' : '#3c4e41' }} 
              transition={{ duration: 0.3 }}
            />
            
            {/* Face - dark when off */}
            <motion.g className="lamp-eyes-group" animate={{ opacity: isLightOn ? 1 : 0.2 }} transition={{ duration: 0.3 }}>
              <path d="M170 140 Q180 130 190 140" fill="none" stroke="#0d1117" strokeWidth="4" strokeLinecap="round" />
              <path d="M210 140 Q220 130 230 140" fill="none" stroke="#0d1117" strokeWidth="4" strokeLinecap="round" />
            </motion.g>
            <motion.path d="M185 160 Q200 180 215 160 Z" className="lamp-mouth" animate={{ opacity: isLightOn ? 1 : 0.2 }} transition={{ duration: 0.3 }} />
            <motion.path d="M190 165 Q200 175 210 165 Z" className="lamp-tongue" animate={{ opacity: isLightOn ? 1 : 0.2 }} transition={{ duration: 0.3 }} />

            {/* Draggable Cord SVG Visuals */}
            <motion.path 
              d={cordPath} 
              className="lamp-cord" 
              animate={{ stroke: isLightOn ? '#e5e7eb' : '#6b7280' }}
              transition={{ duration: 0.3 }}
            />
            <motion.circle 
              cx="170" 
              cy={cordEndY} 
              r="8" 
              className="lamp-cord-end" 
              animate={{ fill: isLightOn ? '#ffffff' : '#9ca3af' }}
              transition={{ duration: 0.3 }}
            />
          </motion.svg>
          
          {/* Invisible Draggable Overlay over the cord end */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 50 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: 'grabbing' }}
            animate={controls}
            className="absolute z-20"
            style={{
              y: cordY,
              top: '56%',
              left: '42.5%',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              transform: 'translate(-50%, -50%)',
              touchAction: 'none',
              cursor: 'grab'
            }}
          />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 max-w-md relative">
          <motion.div 
            className="p-8 sm:p-10 rounded-2xl shadow-2xl form-container w-full"
            initial={{ opacity: 0, scale: 0.9, y: 20, pointerEvents: 'none' }}
            animate={{ 
              opacity: isLightOn ? 1 : 0, 
              scale: isLightOn ? 1 : 0.9,
              y: isLightOn ? 0 : 20,
              pointerEvents: isLightOn ? 'auto' : 'none'
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: isLightOn ? 0.3 : 0 }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white text-center mb-2">{title}</h2>
              {subtitle && <p className="text-[#8b949e] text-center text-sm mb-8">{subtitle}</p>}
              
              {error && (
                <div className="animated-error-msg">
                  {error}
                </div>
              )}
              
              {success && !error && (
                <div className="animated-success-msg">
                  {success}
                </div>
              )}

              <div className="mt-6">
                {children}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default AnimatedLoginLayout;
