// utils/scale.js

import { Dimensions } from 'react-native';

// Get initial window dimensions
const { width, height } = Dimensions.get('window');

// Function to scale sizes based on screen width
export const scale = (size, baseWidth = 375) => {
  return (size * width) / baseWidth;
};

// Function to scale font sizes
export const scaleFont = (size) => {
  return Math.round((size * Math.min(width, height)) / 375);
};
