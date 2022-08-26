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

const Register = () => {
  const [username, onChangeUsername] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [name, onChangeName] = React.useState('');
  const [age, onChangeAge] = React.useState('');
  const onPress = () => {
    axios.post('http://18.27.78.44/api/v1/auth/register', {
      name: name,
      username: username,
      age: age,
      password: password,
    });
  };
  return (
    <View>
      <TextInput onChangeText={onChangeName} value={name} placeholder="Name" />
      <TextInput
        onChangeText={onChangeUsername}
        value={username}
        placeholder="Username"
      />
      <TextInput
        onChangeText={onChangeAge}
        value={age}
        placeholder="Age"
        keyboardType="number-pad"
      />
      <TextInput
        onChangeText={onChangePassword}
        value={password}
        placeholder="Password"
        secureTextEntry={true}
      />
      <Button onPress={onPress} title="Register" />
    </View>
  );
};

export default Register;
