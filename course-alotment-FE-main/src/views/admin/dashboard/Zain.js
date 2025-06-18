import React, { useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Heading, Text, useColorModeValue ,VStack} from '@chakra-ui/react';
import { css } from '@emotion/react';

// Sample data with multiple series
const data = [
  { hour: '8 AM', morningClasses: 3, eveningClasses: 1, totalClasses: 4 },
  { hour: '9 AM', morningClasses: 4, eveningClasses: 2, totalClasses: 6 },
  { hour: '10 AM', morningClasses: 2, eveningClasses: 3, totalClasses: 5 },
  { hour: '11 AM', morningClasses: 5, eveningClasses: 2, totalClasses: 7 },
  { hour: '12 PM', morningClasses: 3, eveningClasses: 4, totalClasses: 7 },
  { hour: '1 PM', morningClasses: 4, eveningClasses: 3, totalClasses: 7 },
  { hour: '2 PM', morningClasses: 6, eveningClasses: 2, totalClasses: 8 },
  { hour: '3 PM', morningClasses: 4, eveningClasses: 3, totalClasses: 7 },
  { hour: '4 PM', morningClasses: 2, eveningClasses: 4, totalClasses: 6 },
  { hour: '5 PM', morningClasses: 3, eveningClasses: 2, totalClasses: 5 },
];

// Global styles with Inter font and text shadow
const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
  * {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const TimetableChart = () => {
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(45, 55, 72, 0.9)');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  // Canvas background animation
  useEffect(() => {
    const canvas = document.getElementById('chart-canvas');
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const particles = [];
    const particleCount = 80;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.glow = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        this.glow = Math.sin(Date.now() * 0.002 + this.x) * 0.3 + 0.5;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.glow})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Connect particles with lines
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="2xl"
      boxShadow="xl"
      position="relative"
      backdropFilter="blur(12px)"
      css={globalStyles}
    >
      {/* Canvas Background */}
      <canvas
        id="chart-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: 'linear-gradient(135deg, #e0f7fa 0%, #81e6d9 100%)',
        }}
      />

      {/* Chart Title */}
      <VStack spacing={4} mb={6} align="start" zIndex={1}>
        <Heading
          as="h3"
          size="lg"
          fontWeight="700"
          bgGradient="linear(to-r, teal.400, cyan.500)"
          bgClip="text"
        >
          Timetable Activity Overview
        </Heading>
        <Text fontSize="md" color={textColor} fontWeight="500">
          Track class distribution across the day for Morning and Evening shifts.
        </Text>
      </VStack>

      {/* Area Chart */}
      <ResponsiveContainer width="100%" height={450}>
        <AreaChart
          data={data}
          margin={{
            top: 30,
            right: 40,
            left: 20,
            bottom: 60,
          }}
        >
          <defs>
            <linearGradient id="morningGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0074D9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0074D9" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="eveningGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00C4B4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00C4B4" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="hour"
            label={{
              value: 'Time of Day',
              position: 'bottom',
              offset: 10,
              fill: textColor,
              fontSize: '14px',
              fontWeight: '600',
            }}
            tick={{ fill: textColor, fontSize: '12px' }}
          />
          <YAxis
            label={{
              value: 'Number of Classes',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fill: textColor,
              fontSize: '14px',
              fontWeight: '600',
            }}
            tick={{ fill: textColor, fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: bgColor,
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              padding: '12px',
            }}
            labelStyle={{ fontWeight: '700', color: textColor, fontSize: '14px' }}
            itemStyle={{ fontSize: '12px', color: textColor }}
          />
          <Legend
            verticalAlign="top"
            height={40}
            wrapperStyle={{ paddingBottom: '20px', fontSize: '14px', color: textColor }}
          />
          <Area
            type="monotone"
            dataKey="morningClasses"
            name="Morning Shift"
            stroke="#0074D9"
            fill="url(#morningGradient)"
            strokeWidth={3}
            dot={{ r: 5, stroke: '#0074D9', strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="eveningClasses"
            name="Evening Shift"
            stroke="#00C4B4"
            fill="url(#eveningGradient)"
            strokeWidth={3}
            dot={{ r: 5, stroke: '#00C4B4', strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="totalClasses"
            name="Total Classes"
            stroke="#FF6B6B"
            fill="url(#totalGradient)"
            strokeWidth={3}
            dot={{ r: 5, stroke: '#FF6B6B', strokeWidth: 2, fill: '#ffffff' }}
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TimetableChart;