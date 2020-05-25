import React from 'react';
import {
    Text,
    TouchableOpacity,
    FlatList,
    View,
    StyleSheet,
    ScrollView,
  } from "react-native";
  import {
    Card,
    ListItem
  } from "react-native-elements";
import CustomizedIcon from "./CustomizedIcon"
import { API_ROUTE } from "react-native-dotenv";
import FlashMessage, { showMessage } from "react-native-flash-message";

export default class AddFriendModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      house: [],
      user: this.props.user,
      house_name: this.props.house_name,
      house_id: this.props.house_id,
      addedArray: [],
    } 
  }
  
  componentDidMount = () =>{
    // Request an array of friends to add to current house that are not already in the house
    url = API_ROUTE + `/get_new_possible_friends/${this.state.house_id}/${this.state.user}`;
    fetch(url, {
      method: "GET"
    })
    .then(response => response.json())
    .then(res => {
        var house = []
        for (var i = 0; i < res.users.length; i++){
            house.push({id: res.users[i].id, name: res.users[i].username, add: false})
        }
        this.setState({ house: house  });
    })
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE"
        }}
      />
    );
  };
  
  updateAdd = (index) => {
    // Set state of the updated list of users selected/ not selected
    var updatedHouse = this.state.house;
    updatedHouse[index] = {
      "id": this.state.house[index]["id"],
      "name": this.state.house[index]["name"],
      "add": !this.state.house[index]["add"],
    }
    this.setState({ house: updatedHouse});
  } 
  
  render() {
    return (
      <View style={{ flex:1, backgroundColor:"#51B1D3", justifyContent: 'center'}} >
        <ScrollView contentInset={{ top: 0, bottom: 200 }} contentContainerStyle={{flexGrow:1, justifyContent: 'center'}}>
          <View style={{justifyContent: "center", alignItems: "center"}}>
            <CustomizedIcon name="ios-people" color="#FFF" size={100}/>
            <Text style={styles.text}>Add New Friends</Text>
          </View>
            <Card title="Who do you want to include?">
              <FlatList
                extraData={this.state}
                data={this.state.house}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => <ListItem
                style={styles.listItem}
                title={item.name}
                leftElement={<CustomizedIcon name="md-person" color="#51B1D3"/>}
                rightElement={ 
                <TouchableOpacity onPress={() => this.updateAdd(index)} style={{
                  borderWidth:2,
                  borderColor: item.add ? "green" : "grey",
                  alignItems:'center',
                  justifyContent:'center',
                  width:30,
                  height:30,
                  backgroundColor:'#fff',
                  borderRadius:50}}>
                  <CustomizedIcon name="md-checkmark" color={item.add ? "green" : "white"}/>
                </TouchableOpacity>}
                />}
                ItemSeparatorComponent={this.renderSeparator}
              />
            </Card>
        </ScrollView>
        <View style={styles.bottomBtn}>
          <TouchableOpacity onPress={() => { this.props.closeModal(false)}} style={styles.closeBtn}>
              <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Cancel</Text>        
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.checkForm()} style={styles.continueBtn}>
            <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Add Friends</Text>        
          </TouchableOpacity>
        </View>
        <FlashMessage ref="modalFlash1" floating={true} position="top" style={{alignItems: "center"}} textStyle={{fontWeight: 'bold'}} />  
      </View>
    );
  }

  checkForm = () => {
    var users = []
    // Push user ids into an array that are to be added to this house
    for (var i = 0; i < this.state.house.length; i++){
      if (this.state.house[i].add){
        users.push(this.state.house[i].id) 
      }
    }
    if(users.length == 0){
      return this.refs.modalFlash1.showMessage({
        message: "You must select at least one person!",
        type: "danger"
      });
    }
    // Request API to add the selected users to this house
    url = API_ROUTE + '/add_users_to_house'
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({ house_id: this.state.house_id, house_name: this.state.house_name, house: users}),
      headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(res => {
        if(res.success){
          showMessage({
            message: `Added ${users.length} new people to your house!`,
            type: "default",
            backgroundColor: "#01c853",
          });
          return this.props.closeModal(false)
        }
    })
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
      }
  });