import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Image,
  TextInput,
} from 'react-native';
import axios from 'axios';

const Login = ({navigation}) => {
  const [username, onChangeUsername] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const onPress = async () => {
    const res = await axios.post('http://18.27.78.44/api/v1/auth/login', {
      username: username,
      password: password,
    });
    console.log('res', res.data);
    if (res.status === 200) {
      const user_id = res.data.user_id;
      console.log(user_id);
      navigation.navigate('Home', {user_id});
    }
  };
  return (
    <View>
      <TextInput
        onChangeText={onChangeUsername}
        value={username}
        placeholder="Username"
      />
      <TextInput
        onChangeText={onChangePassword}
        value={password}
        placeholder="Password"
        secureTextEntry={true}
      />
      <Button onPress={onPress} title="Login" />
    </View>
  );
};

export default Login;
