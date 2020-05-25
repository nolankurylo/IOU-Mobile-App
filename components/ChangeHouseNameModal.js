import React from 'react';
import {
    Text,
    TouchableOpacity,
    TextInput,
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView
  } from "react-native";
  import {
    Card,
    ListItem
  } from "react-native-elements";
import { API_ROUTE } from "react-native-dotenv";
import FlashMessage, { showMessage } from "react-native-flash-message";


export default class ChangeHouseNameModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      house_name: "",
      house_id: this.props.house_id,
    } 
  }
  
  submitHouseName = () => {
    if (this.state.house_name.length == 0) {
      return this.refs.modalFlash.showMessage({
        message: "Please enter a new house name!",
        type: "danger"
      });
    }
      // Before proceeding, request API to check if this user is already apart of an active house with this name
      url = API_ROUTE + '/verify_house_name/' + this.state.house_name + '/' + this.state.user
      fetch(url, {
        method: "GET"
      })
      .then(response => response.json())
      .then(res => {
        if(res.success){
          this.changeHouseName();
        }
        else{
          return this.refs.modalFlash.showMessage({
            message: "You are already a part of a house with this name!",
            type: "danger"
          });
        }
      })
      .catch(err => {
        console.log(err)
      });
  }

  changeHouseName = () => {
    url = API_ROUTE + '/change_house_name'
      fetch(url, {
        method: "POST",
        body: JSON.stringify({id: this.state.house_id, name: this.state.house_name}),
        headers: { "Content-Type": "application/json" }
      })
      .then(response => response.json())
      .then(res => {
        if(res.success){
          showMessage({
            message: "House name changed successfully!",
            type: "default",
            backgroundColor: "#01c853",
          });
          return this.props.closeModal(false)
        }
      })
      .catch(err => {
        console.log(err)
      });
  }

  render() {
    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
            <ScrollView contentContainerStyle={{flexGrow:1, justifyContent: "center", alignContent: "center"}} contentInset={{top:0, bottom: 100}}>
                <View style={styles.cardContainer}>
                <Card title="Enter a New House Name" >
                    <TextInput maxLength={40} multiline maxHeight={100} placeholder="Let's go" style={this.state.house_name.length == 0 ? styles.textInputInvalid : styles.textInputValid} onChangeText={house_name => this.setState({ house_name })}/>
                </Card>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.bottomBtn}>
          <TouchableOpacity onPress={() => { this.props.closeModal(false)}} style={styles.closeBtn}>
              <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Cancel</Text>        
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.submitHouseName()} style={styles.continueBtn}>
            <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Change</Text>        
          </TouchableOpacity>
          
        </View>
        <FlashMessage ref="modalFlash" floating={true} position="top" style={{alignItems: "center"}} textStyle={{fontWeight: 'bold'}} />   
    </View>
      
    );
  }

}

const styles = StyleSheet.create({
    continueBtn: {
      marginHorizontal: 10,
      backgroundColor: "#3CB371",
      padding: 16,
      borderRadius: 8,
      width: "50%"
    },
    closeBtn: {
        marginHorizontal: 10,
        backgroundColor: "red",
        padding: 16,
        borderRadius: 8,
        width: "50%"
      },
      textInput: {
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "grey",
        marginBottom: 30
      },
      text: {
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        color: "#FFF",
        marginBottom: 7
      },
      numericInput: {
        flex: 1,
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "grey",
        marginBottom: 30,
        alignItems: 'stretch'
      },
      bottomBtn: {
        flexDirection: "row", 
        justifyContent: "space-evenly", 
        marginTop: 30,
        marginHorizontal: 10,
        marginBottom: 5,
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 5
      },
      container: {
    flex: 1,
    backgroundColor: "#51B1D3"
  },
  cardContainer: {
    alignItems: "stretch",
    padding: 20
  },
  });