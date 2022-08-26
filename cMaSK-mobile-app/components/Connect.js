import React from 'react';
import {Button} from 'react-native';

const Connect = ({
  connection,
  startScan,
  connectAndRead,
  printData,
  clearData,
  pushData,
  dumpData,
  startRecording,
}) => {
  return (
    <>
      {connection == 0 ? (
        <Button onPress={startScan} title="Start scan" color="#555" />
      ) : null}
      {connection == 1 ? (
        <>
          <Button onPress={connectAndRead} title="Connect" color="#555" />
          <Button onPress={startRecording} title="Record" color="#555" />
        </>
      ) : null}
      {/* <Button onPress={readData} title='Read Data' color='#555' /> */}
      <Button onPress={printData} title="Print Data" color="#66ff70" />
      <Button onPress={dumpData} title="Dump Data" color="#66ff70" />
      <Button onPress={clearData} title="Restart" color="#ff7366" />
      <Button onPress={pushData} title="Push Data" color="#ff7366" />
      {connection == 2 ? (
        <Button
          onPress={disconnectFacemask}
          title="Disconnect"
          color="#ff7366"
        />
      ) : null}
    </>
  );
};

export default Connect;
