import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Image,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import axios from 'axios';

import Dashboard from './components/Dashboard';
import Register from './components/Register';
import Login from './components/Login';
import Graph from './components/Graph';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const Stack = createStackNavigator();

const App = () => {
  // connection = 0: not connected, 1: scanned and found device, 2: connected
  const [connection, setConnection] = useState(0);
  const [firstConnection, setFirstConnection] = useState(true);
  const [user, setUser] = useState(-1);
  const savedData = useRef([]);

  // Facemask UUID: 40DC562C-2B2E-80D7-0CE5-1C23253D67AB
  // Old UUID: 7EA7371B-3759-6B63-51FE-0E60AAA093AE

  const _storeData = async () => {
    try {
      await AsyncStorage.setItem('appData', data);
    } catch (error) {
      // Error saving data
    }
  };

  // const _retrieveData = async () => {
  //   try {
  //     const value = await AsyncStorage.getItem('appData');
  //     if (value !== null) {
  //       // We have data!!
  //       return value;
  //     }
  //   } catch (error) {
  //     // Error retrieving data
  //   }
  // };

  useEffect(() => {
    console.log('Mounting.');
    BleManager.start({showAlert: false}).then(() => {
      console.log('Module initialized.');
    });
    // const fetchData = async () => {
    //   asyncdata = await _retrieveData();
    //   return asyncdata;
    // };
    // data = fetchData();
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (args) => {
      // The id: args.id
      // The name: args.name
      if (
        args.name === 'Jin-Hoon Kim testing' ||
        args.name === 'Conformable Decoders' ||
        args.name === 'DLG-PROXR'
      ) {
        console.log('Discovered device:');
        console.log(args.id, args.name);
        setConnection(1);
      }
    });
  }, []);

  const startScan = () => {
    BleManager.scan([], 5, false).then(() => {
      // Success code
      console.log('Scanning for peripherals...');
    });
  };

  const concatBits = (data, flip) => {
    const result = [];
    for (let i = 0; i < data.length; i += 2) {
      if (flip) {
        result.push(data[i + 1] * 256 + data[i]);
      } else {
        result.push(data[i] * 256 + data[i + 1]);
      }
    }
    return result;
  };

  const arrayToInt = (data) => {
    let result = 0;
    data.forEach((val, idx) => {
      result += Math.pow(256, data.length - idx - 1) * val;
    });
    return result;
  };

  // Real time clock service and characteristic:
  // Service UUID: EDFEC62E-9910-0BAC-5241-D8BDA6932A2F
  // Characteristic UUID: 772AE377-B3D2-FF8E-1042-5481D1E03456
  // year, month, day, hour, minute, second
  const parseArray = (data) => {
    const result = {};
    const now = new Date();
    const date = now.toISOString().slice(0, 8) + data[0];
    const datetime = date + ' ' + data[1] + ':' + data[2] + ':' + data[3];
    result.rtc = datetime;
    result.sequence_id = arrayToInt(data.slice(4, 8));
    result.capATtiny1 = concatBits(data.slice(8, 26), true);
    result.capATtiny2 = concatBits(data.slice(26, 44), true);
    result.temp_1 = concatBits(data.slice(44, 46))[0];
    result.humidity_1 = concatBits(data.slice(46, 48))[0];
    result.temp_2 = concatBits(data.slice(54, 56))[0];
    result.humidity_2 = concatBits(data.slice(56, 58))[0];
    result.accelerometer = concatBits(data.slice(58, 64), true);
    result.temp_pressure = concatBits(data.slice(48, 50))[0];
    result.pressure = arrayToInt(data.slice(50, 54));
    console.log(data.slice(50, 54));
    return result;
  };

  const connectAndRead = async () => {
    const peripheral = 'E6464D25-CAC4-4298-9C2A-A0CCB31A72E5';
    const service = 'EDFEC62E-9910-0BAC-5241-D8BDA6932A2F';
    const characteristic = '15005991-B131-3396-014C-664C9867B917';
    console.log('Connecting to peripheral...');
    await BleManager.connect(peripheral);
    console.log('Retrieving services...');
    await BleManager.retrieveServices(peripheral);

    // Send RTC data
    const time = new Date();

    const timeData = [
      time.getFullYear().toString().slice(-2),
      time.getMonth(),
      time.getDate().toString(),
      time.getHours().toString(),
      time.getMinutes().toString(),
      time.getSeconds().toString(),
    ];

    BleManager.writeWithoutResponse(
      'E6464D25-CAC4-4298-9C2A-A0CCB31A72E5',
      'EDFEC62E-9910-0BAC-5241-D8BDA6932A2F',
      '772AE377-B3D2-FF8E-1042-5481D1E03456',
      timeData,
    )
      .then(() => {
        console.log('Wrote: ', timeData);
      })
      .catch((err) => {
        console.log(err);
      });

    await BleManager.startNotification(peripheral, service, characteristic);

    if (firstConnection) {
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        ({value, peripheral, characteristic, service}) => {
          // Convert bytes array to string

          console.log(`Recieve ${value} for characteristic ${characteristic}`);
          console.log(typeof value);
          console.log(value);
          // savedData.current.push(1);
          // Split into length 64 arrays.
          let splitArray = value.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / 64);
            if (!resultArray[chunkIndex]) {
              resultArray[chunkIndex] = []; // start a new chunk
            }
            resultArray[chunkIndex].push(item);
            return resultArray;
          }, []);
          // Push parsed data onto data.
          savedData.current.push(...splitArray.map((row) => parseArray(row)));
          // console.log('Data');
          // console.log('Data:', savedData.current);
        },
      );
      setFirstConnection(false);
    }
  };

  const pushData = () => {
    Promise.all(
      savedData.current.map((row) => {
        return axios.post('http://smartfacemask.media.mit.edu/api/v1/data', {
          ...row,
          user,
        });
      }),
    );
    // savedData.current.forEach((row) => {
    //   axios
    //     .post('http://smartfacemask.media.mit.edu/api/v1/data', {
    //       ...row,
    //       user,
    //     })
    //     .then((res) => {
    //       console.log(res);
    //     })
    //     .catch((err) => {
    //       console.error(err);
    //     });
    // });
    savedData.current = [];
  };

  const disconnectFacemask = () => {
    BleManager.disconnect('E6464D25-CAC4-4298-9C2A-A0CCB31A72E5').then(() => {
      console.log('Disconnected.');
      setConnection(0);
    });
  };

  const printData = () => {
    console.log('Current Data:', savedData.current);
  };

  const dumpData = () => {
    savedData.current = [];
  };

  const clearData = () => {
    savedData.current = [];
    disconnectFacemask();
    setConnection(0);
    setUser(-1);
  };

  const startRecording = () => {
    setInterval(async () => {
      console.log('started recording');
      await connectAndRead();
      pushData();
      console.log('pushed data. 2 minutes until next connection.');
    }, 120000);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {(props) => (
            <Dashboard
              {...props}
              connection={connection}
              user={user}
              setUser={setUser}
              startScan={startScan}
              connectAndRead={connectAndRead}
              printData={printData}
              clearData={clearData}
              dumpData={dumpData}
              disconnectFacemask={disconnectFacemask}
              pushData={pushData}
              startRecording={startRecording}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Graph">
          {(props) => <Graph {...props} data={savedData.current} />}
        </Stack.Screen>
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
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

export default App;
