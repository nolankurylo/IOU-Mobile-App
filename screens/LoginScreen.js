import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  AsyncStorage
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { API_ROUTE } from "react-native-dotenv";
import Loader from "../components/Loader"

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false
    };
  }

  componentDidMount() {
    this._loadInitialState().done();
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
      <KeyboardAwareScrollView extraScrollHeight={120} style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={styles.header}>- LOGIN -</Text>
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
            <Text>LOGIN</Text>
            {this.renderLoading()}
          </TouchableOpacity>
         
        </View>
      </KeyboardAwareScrollView>
    );
  }

  login = () => {
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
        } else if (res.auth === false) {
          alert(res.message);
        } else {
          alert(res.error);
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
    padding: 20,
    flex: 1,
    backgroundColor: "#2896d3"
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    bottom: -100
  },
  textInput: {
    alignSelf: "stretch",
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#fff"
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
    alignItems: "center"
  }
});
