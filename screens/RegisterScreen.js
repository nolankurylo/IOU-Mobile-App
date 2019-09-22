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
import FlashMessage, { showMessage } from "react-native-flash-message";
import { API_ROUTE } from "react-native-dotenv";
import Loader from "../components/Loader"

export default class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      username: "",
      password: "",
      repeatPassword: "",
      usernameValidator: true,
      emailValidator: true,
      passwordValidator: true
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
      return <Loader loading={this.state.loading} color={"#FFFFFF"}/> 
    } else {
      return null
    }
  }
  render() {
    return (
      <KeyboardAwareScrollView extraScrollHeight={50} style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={styles.header}>- REGISTER -</Text>

          <TextInput
            maxHeight={100}
            maxLength={80}
            blurOnSubmit={true}
            placeholder="Enter your username"
            onChangeText={username => this.setState({ username })}
            onChange={this.usernameCheck}
            style={
              this.state.usernameValidator
                ? styles.textInput
                : styles.textInputError
            }
          />
          <TextInput
            maxLength={80}
            maxHeight={100}
            placeholder="Enter your email"
            onChangeText={email => this.setState({ email })}
            onChange={this.emailCheck}
            style={
              this.state.emailValidator
                ? styles.textInput
                : styles.textInputError
            }
          />
          <TextInput
            maxLength={128}
            maxHeight={100}
            secureTextEntry
            placeholder="Enter your password"
            onChangeText={password => this.setState({ password })}
            onChange={this.passwordCheck}
            style={
              this.state.passwordValidator
                ? styles.textInput
                : styles.textInputError
            }
          />
          <TextInput
            secureTextEntry
            placeholder="Repeat your password"
            style={styles.textInput}
            onChangeText={repeatPassword => this.setState({ repeatPassword })}
          />

          <TouchableOpacity style={styles.btn} onPress={() => this.register()}>
            <Text>REGISTER</Text>
            {this.renderLoading()}
          </TouchableOpacity>
        </View>
        <FlashMessage floating={true} position="center" />
        
      </KeyboardAwareScrollView>
    );
  }
  // The following 3 functions validate the registration textInput provided by the user
  usernameCheck = () => {
    if (this.state.username.length < 2) {
      return this.setState({ usernameValidator: false });
    } else {
      return this.setState({ usernameValidator: true });
    }
  };

  emailCheck = () => {
    var re = /\S+@\S+\.\S+/;
    if (!re.test(this.state.email)) {
      return this.setState({ emailValidator: false });
    } else {
      return this.setState({ emailValidator: true });
    }
  };

  passwordCheck = () => {
    if (this.state.password.length < 5) {
      return this.setState({ passwordValidator: false });
    } else {
      return this.setState({ passwordValidator: true });
    }
  };

  register = () => {
    // Validate that the textInput fields were entered properly
    if (
      this.state.password === "" ||
      this.state.repeatPassword === "" ||
      this.state.username === "" ||
      this.state.email === ""
    ) {
      showMessage({
        message: "One or more fields are empty",
        type: "danger"
      });
      return this.setState({
        passwordValidator: false,
        emailValidator: false,
        usernameValidator: false
      });
    }
    if (this.state.password !== this.state.repeatPassword) {
      showMessage({
        message: "Passwords do not match",
        type: "danger"
      });
      return this.setState({ passwordValidator: false });
    }
    if (
      this.state.usernameValidator &&
      this.state.emailValidator &&
      this.state.passwordValidator
    ) {
      this.setState({ loading: true });
      // Request API to register an account for this user 
      url = API_ROUTE + "/register";
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          username: this.state.username,
          email: this.state.email,
          password: this.state.password
        }),
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(res => {
          this.setState({ loading: false });
          if (res.auth === true) {
            // Create user token, login user, redirect to Main Tab Bar stack navigator
            AsyncStorage.setItem("user", JSON.stringify(res.user));
            this.props.navigation.navigate("Auth");
          } else {
            alert(res.error);
          }
        })
        .catch(error => {
          this.setState({ loading: false });
          console.log(error)
        });
    } else {
      showMessage({
        message: "Please go back and enter the correct information!",
        type: "danger"
      });
    }
  };
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#2896d3"
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    bottom: 0
  },
  textInputError: {
    alignSelf: "stretch",
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderColor: "red",
    borderWidth: 3
  },
  textInput: {
    alignSelf: "stretch",
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#fff"
  },
  header: {
    fontSize: 24,
    marginBottom: 40,
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
