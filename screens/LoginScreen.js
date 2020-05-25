import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  View,
  AsyncStorage,
  ScrollView,
  SafeAreaView
} from "react-native";

import { API_ROUTE } from "react-native-dotenv";
import Loader from "../components/Loader"
import { showMessage } from "react-native-flash-message";

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false
    };
  }
  static navigationOptions = ({navigation}) => {
    return {
      header: null
    }
  };

  componentDidMount() {
    this._loadInitialState().done();
  }

  componentWillUnmount(){
    this.state.loading = false;
  }
  _loadInitialState = async () => {
    var value = await AsyncStorage.getItem("user");
    if (value !== null) {
      this.props.navigation.navigate("Auth");
    }
  };
  renderLoading() {
    if (this.state.loading) {
      return <Loader loading={this.state.loading} color={"#FFFFFF"} /> 
    } else {
      return null
    }
  }

  render() {
    return (
        <View style={styles.container}>
          <KeyboardAvoidingView behavior='padding' style={{flex: 1}} >
            <ScrollView contentContainerStyle={{flexGrow:1, justifyContent: "center", alignContent: "center"}} contentInset={{top:0, bottom: 100}}>
              <SafeAreaView style={styles.wrapper}>
                <View style={styles.contentWrapper}>
                  <Text style={styles.header}>- UOME LOGIN -</Text>
                  <TextInput
                    maxHeight={100}
                    maxLength={80}
                    placeholder="Enter your username or email"
                    style={styles.textInput}
                    onChangeText={username => this.setState({ username })}
                  />
                  <TextInput
                    maxHeight={100}
                    maxLength={128}
                    secureTextEntry
                    placeholder="Enter your password"
                    style={styles.textInput}
                    onChangeText={password => this.setState({ password })}
                  />
                  <TouchableOpacity style={styles.btn} onPress={() => this.login()}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>LOGIN</Text>
                    {this.renderLoading()}
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      
    );
  }

  login = () => {
    if (
      this.state.password === "" ||
      this.state.username === ""
    ) {
      showMessage({
        message: "One or more fields are empty",
        type: "danger"
      });
      return
    }
    this.setState({ loading: true  });
    // Request API to log current user in
    url = API_ROUTE + "/login";
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        login: this.state.username,
        password: this.state.password
      }),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(res => {        
        this.setState({ loading: false  });
        if (res.auth === true) {
          AsyncStorage.setItem("user", JSON.stringify(res.user));
          this.props.navigation.navigate("Auth");
          showMessage({
            message: "Logged in successfully!",
            type: "default",
            backgroundColor: "#01c853",
          });
          
        } else if (res.auth === false) {
          showMessage({
            message: res.message,
            type: "danger"
          });
        } else {
          showMessage({
            message: res.error,
            type: "danger"
          });
        }
      })
      .catch(error => {
        console.log(error); 
        this.setState({ loading: false  });
      });
  };
}
const styles = StyleSheet.create({
  wrapper: {
    alignItems: "stretch"  
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30
  },
  container: {
    flex: 1,
    backgroundColor: "#51B1D3",
  },
  textInput: {
    alignSelf: "stretch",
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 2
  },
  header: {
    fontSize: 24,
    marginBottom: 65,
    color: "#fff",
    fontWeight: "bold"
  },
  btn: {
    alignSelf: "stretch",
    backgroundColor: "#01c853",
    padding: 20,
    alignItems: "center",
    borderRadius: 50,
    marginTop: 50
  }
});
