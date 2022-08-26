import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Image,
} from 'react-native';
import Svg, {Polyline} from 'react-native-svg';

const Graph = () => {
  const data = [
    {
      data_id: 70,
      user_id: 1,
      time: '2021-11-30 13:56:39',
      data_sequence: 0,
      accel_x: 32783,
      accel_y: 14,
      accel_z: 193,
      temperature_1: 25312,
      temperature_2: 24703,
      humidity_1: 13228,
      humidity_2: 44049,
      temperature_3: 0,
      pressure: 0,
      capacitance_1: 11520,
      capacitance_2: 56062,
      capacitance_3: 22014,
      capacitance_4: 50685,
      capacitance_5: 14846,
      capacitance_6: 14077,
      capacitance_7: 19965,
      capacitance_8: 39937,
      capacitance_9: 56067,
      capacitance_10: 55039,
      capacitance_11: 43262,
      capacitance_12: 6654,
      capacitance_13: 61693,
      capacitance_14: 26622,
      capacitance_15: 61949,
      capacitance_16: 52733,
      capacitance_17: 12797,
      capacitance_18: 50687,
    },
    {
      data_id: 71,
      user_id: 1,
      time: '2021-11-30 13:56:40',
      data_sequence: 0,
      accel_x: 16400,
      accel_y: 14,
      accel_z: 16578,
      temperature_1: 25309,
      temperature_2: 24703,
      humidity_1: 13249,
      humidity_2: 44049,
      temperature_3: 0,
      pressure: 0,
      capacitance_1: 11264,
      capacitance_2: 56574,
      capacitance_3: 22014,
      capacitance_4: 50941,
      capacitance_5: 14846,
      capacitance_6: 14077,
      capacitance_7: 19965,
      capacitance_8: 39937,
      capacitance_9: 56067,
      capacitance_10: 55295,
      capacitance_11: 43006,
      capacitance_12: 6654,
      capacitance_13: 61949,
      capacitance_14: 26622,
      capacitance_15: 61949,
      capacitance_16: 52733,
      capacitance_17: 12797,
      capacitance_18: 50687,
    },
    {
      data_id: 72,
      user_id: 1,
      time: '2021-11-30 13:56:41',
      data_sequence: 0,
      accel_x: 16400,
      accel_y: 49165,
      accel_z: 16577,
      temperature_1: 25311,
      temperature_2: 24703,
      humidity_1: 13216,
      humidity_2: 44049,
      temperature_3: 0,
      pressure: 0,
      capacitance_1: 11008,
      capacitance_2: 56062,
      capacitance_3: 21502,
      capacitance_4: 50941,
      capacitance_5: 14846,
      capacitance_6: 14077,
      capacitance_7: 19965,
      capacitance_8: 39937,
      capacitance_9: 56067,
      capacitance_10: 55295,
      capacitance_11: 43006,
      capacitance_12: 6398,
      capacitance_13: 61693,
      capacitance_14: 26622,
      capacitance_15: 61949,
      capacitance_16: 52733,
      capacitance_17: 12541,
      capacitance_18: 50687,
    },
  ];
  const height = 300;
  const width = 500;
  const freq = Math.ceil(data.length / width);
  const toPlot = [];
  let idx = 0;
  while (idx < data.length) {
    toPlot.push(data[idx]['temperature_1']);
    idx += freq;
  }
  idx = 0;
  let points = '';
  const scale = height / (Math.max(toPlot) - Math.min(toPlot));
  toPlot.forEach((point) => {
    points += String(idx);
    idx += 1;
    points += ',';
    points += String(height - point * scale);
    points += ' ';
  });

  return (
    <View>
      <Svg height="100" width="500">
        <Polyline
          points="10,10 50,50 50,100 500,50"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
      </Svg>
    </View>
  );
};

export default Graph;
