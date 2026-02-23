import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const AnalogClock = ({ size = 280, hours, minutes, seconds, theme }) => {
  const center = size / 2;
  const radius = (size / 2) - 20;
  const colors = theme.colors;

  // Calculate angles
  const secondAngle = (seconds / 60) * 360 - 90;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360 - 90;
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360 - 90;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const handCoords = (angle, length) => ({
    x: center + length * Math.cos(toRad(angle)),
    y: center + length * Math.sin(toRad(angle)),
  });

  const hourHand = handCoords(hourAngle, radius * 0.5);
  const minuteHand = handCoords(minuteAngle, radius * 0.7);
  const secondHand = handCoords(secondAngle, radius * 0.85);

  // Hour markers
  const markers = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 360 - 90;
    const innerR = radius * 0.85;
    const outerR = radius * 0.95;
    const inner = handCoords(angle, innerR);
    const outer = handCoords(angle, outerR);

    markers.push(
      <Line
        key={`marker_${i}`}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={colors.text}
        strokeWidth={i % 3 === 0 ? 3 : 1.5}
        strokeLinecap="round"
      />
    );

    // Hour numbers
    const numR = radius * 0.72;
    const numPos = handCoords(angle, numR);
    const hourNum = i === 0 ? 12 : i;
    markers.push(
      <SvgText
        key={`num_${i}`}
        x={numPos.x}
        y={numPos.y + 5}
        fill={colors.text}
        fontSize={16}
        fontWeight="600"
        textAnchor="middle"
      >
        {hourNum}
      </SvgText>
    );
  }

  // Minute tick marks
  for (let i = 0; i < 60; i++) {
    if (i % 5 !== 0) {
      const angle = (i / 60) * 360 - 90;
      const innerR = radius * 0.92;
      const outerR = radius * 0.95;
      const inner = handCoords(angle, innerR);
      const outer = handCoords(angle, outerR);
      markers.push(
        <Line
          key={`tick_${i}`}
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke={colors.textSecondary}
          strokeWidth={0.8}
          strokeLinecap="round"
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Clock face */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={colors.surface}
          stroke={colors.border}
          strokeWidth={2}
        />

        {/* Markers and numbers */}
        {markers}

        {/* Hour hand */}
        <Line
          x1={center}
          y1={center}
          x2={hourHand.x}
          y2={hourHand.y}
          stroke={colors.text}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <Line
          x1={center}
          y1={center}
          x2={minuteHand.x}
          y2={minuteHand.y}
          stroke={colors.text}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Second hand */}
        <Line
          x1={center}
          y1={center}
          x2={secondHand.x}
          y2={secondHand.y}
          stroke={colors.primary}
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <Circle cx={center} cy={center} r={5} fill={colors.primary} />
        <Circle cx={center} cy={center} r={2} fill={colors.text} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnalogClock;
