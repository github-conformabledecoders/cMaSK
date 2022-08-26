import React, {useEffect} from 'react';
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
import Connect from './Connect';

const Dashboard = ({
  connection,
  user,
  setUser,
  startScan,
  connectAndRead,
  printData,
  clearData,
  navigation,
  pushData,
  dumpData,
  route,
  data,
  startRecording,
}) => {
  useEffect(() => {
    setUser(route.params?.user_id);
  }, [route.params?.user_id]);
  return (
    <View style={styles.container}>
      <Image
        source={require('../img/decoders.jpg')}
        style={{width: 100, height: 100}}
      />
      <Text>Conformable Decoders - Smart Facemask</Text>
      {user !== -1 ? (
        <>
          <Connect
            connection={connection}
            startScan={startScan}
            connectAndRead={connectAndRead}
            printData={printData}
            dumpData={dumpData}
            clearData={clearData}
            pushData={pushData}
            startRecording={startRecording}
          />
          <Button
            onPress={() => navigation.navigate('Graph')}
            title="Graph"
            color="#ff7366"
          />
        </>
      ) : null}
      {user === -1 ? (
        <>
          <Button
            title="Register Account"
            onPress={() => navigation.navigate('Register')}
          />
          <Button title="Login" onPress={() => navigation.navigate('Login')} />
        </>
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Dashboard;
