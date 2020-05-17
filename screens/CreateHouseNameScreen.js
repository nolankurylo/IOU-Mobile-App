import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  AsyncStorage,
  Alert
} from "react-native";
import { API_ROUTE } from "react-native-dotenv";
import {
  Card
} from "react-native-elements";
import Loader from "../components/Loader"

export default class CreateHouseNameScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
    headerLeft: <TouchableOpacity
    style={{padding: 5, width: 100, flexDirection: "row"}}
    onPress={() => {navigation.goBack()}}>
    <Text style={{ marginLeft:10, fontSize: 18, fontWeight:'bold', color: "#3498db"}}>Cancel</Text>
    </TouchableOpacity>
    }
  };
  
  state = {
    user: "",
    name: "",
    loading: false,
  };

  componentDidMount = async () => {
    var user = await AsyncStorage.getItem("user")
    this.setState({ user: user, loading: false });
  };
  componentWillUnmount(){
    this.setState({ loading: false });
  }
    
  renderLoading() {
    if (this.state.loading) {
      return <Loader loading={this.state.loading} color={"#000000"} /> 
    } else {
      return null
    }
  }

  submitHouseName = () => {
      if (this.state.name.length == 0){
          return Alert.alert(
          'Wait!',
          'You must give a name for this house',
          [
            {
              text: 'Okay',
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      }
      // Before proceeding, request API to check if this user is already apart of an active house with this name
      url = API_ROUTE + '/verify_house_name/' + this.state.name + '/' + this.state.user
      fetch(url, {
        method: "GET"
      })
      .then(response => response.json())
      .then(res => {
        if(res.success){
          this.setState({loading: false })
          this.props.navigation.navigate('AddHouseFriends', {
            user: this.state.user,
            name: this.state.name
          })
        }
        else{
          return Alert.alert(
            'Oops!',
            'You have already have a house with this name',
            [
              {
                text: 'Okay',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch(err => {
        this.setState({loading: false })
        console.log(err)
      });
      
    }
  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
          <ScrollView contentContainerStyle={{flexGrow:1, justifyContent: "center", alignContent: "center"}} contentInset={{top:0, bottom: 100}}>
            <View style={styles.cardContainer}>
              <Card title="Enter a House name" >
                  <TextInput maxLength={40} multiline maxHeight={100} placeholder="Let's go" style={this.state.name.length == 0 ? styles.textInputInvalid : styles.textInputValid} onChangeText={name => this.setState({ name })}/>
              </Card>
              <TouchableOpacity style={styles.btn} onPress={() => this.submitHouseName()}>
                  <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 28, textAlign: 'center'}}>Go!</Text>
              </TouchableOpacity>
              {this.renderLoading()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>   
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db"
  },
  cardContainer: {
    alignItems: "stretch",
    padding: 20
  },
  textInputValid: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "green" 
  },
  textInputInvalid: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "red" 
  },
  btn: {
    marginHorizontal: 15,
    marginVertical: 35,
    backgroundColor: "#3CB371",
    padding: 16,
    alignItems: "stretch",
    borderRadius: 8
  }
});