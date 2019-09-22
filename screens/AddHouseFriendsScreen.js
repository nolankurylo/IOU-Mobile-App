import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  SafeAreaView,
  Alert,
  RefreshControl
} from "react-native";
import { API_ROUTE } from "react-native-dotenv";
import {
  Card,
  ListItem,
  SearchBar
} from "react-native-elements";
import Loader from "../components/Loader"
import CustomizedIcon from "../components/CustomizedIcon"

export default class AddHouseFriendsScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
    headerLeft: <TouchableOpacity
    style={{padding: 5, width: 100, flexDirection: "row"}}
    onPress={ () =>  navigation.navigate('Home')}>
    <Text style={{ marginLeft:10, fontSize: 18, fontWeight:'bold', color: "#3498db"}}>Cancel</Text>
    </TouchableOpacity>
    }
  };
  
  state = {
    user: "",
    all_users: [],
    dataBackup: [],
    loading: false,
    search: "",
    name: "",
    refreshing: false
  };
  
  componentWillMount = () => {
    this.state.user = this.props.navigation.getParam('user');
    this.state.name = this.props.navigation.getParam('name');
    this.setState({ loading: true });
    this.getFriends();
  };

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getFriends();
    this.setState({ refreshing: false });
  };

  getFriends = () => {
    // Request API to get all the current friends of this user
    url = API_ROUTE + "/get_friends/" + this.state.user 
    fetch(url, {
      method: "GET"
    })
    .then(response => response.json())
    .then(res => {
      var all_users = [];
      for (var i = 0; i < res.friends.length; i++) {
        if(res.friends[i].id == this.state.user || res.friends[i].status != 'friends'){
          continue
        }
        else{
          all_users.push({ id: res.friends[i].id, name: res.friends[i].username, add: false})
        }
      }
      this.setState({
        all_users: all_users,
        dataBackup: all_users,
        loading: false,
      });
    })
    .catch(err => {
      this.setState({loading: false })
      console.log(err)
    });
  };
  
  updateSearch = search => {
    this.setState({ search });
  };

  filterList = text => {
    var newData = this.state.dataBackup;
    newData = this.state.dataBackup.filter(item => {
      const itemData = item.name.toLowerCase();
      const textData = text.toLowerCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      search: text,
      all_users: newData // after filter set users to new array
    });
  };
  
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

  renderLoading() {
    if (this.state.loading) {
      return <Loader loading={this.state.loading} color={"#000000"} /> 
    } else {
      return null
    }
  }

  render() {
    return (
      <SafeAreaView style={{flex:1}}>
      <SearchBar
          value={this.state.search}
          onChangeText={text => this.filterList(text)}
          placeholder="Search for friends..."
          lightTheme
          round
        />
        <ScrollView contentInset={{ top: 0, bottom: 100 }} refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }>
        <Card title="Add friends">
        <FlatList
          extraData={this.state}
          data={this.state.all_users}
          renderItem={({ item, index }) => <ListItem
          style={styles.listItem}
          title={item.name}
          leftElement={<CustomizedIcon name="md-person" color="#3498db"/>}
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
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={this.renderSeparator}
        />
        
        </Card>
        </ScrollView>
        <TouchableOpacity
        style={styles.btn}
        onPress={() => this.checkForm()}>
        <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 28, textAlign: 'center'}}>Go!</Text>        
        </TouchableOpacity>
        
        {this.renderLoading()}
        </SafeAreaView>
    );
  }

  updateAdd = (index) => {
    // Set state when a user in the list is checked/unchecked
    var users = this.state.all_users;
    users[index] = {
      "id": this.state.all_users[index]["id"],
      "name": this.state.all_users[index]["name"],
      "add": !this.state.all_users[index]["add"],
    }
    this.setState({ all_users: users });
  } 

  checkForm =  () => {
    // Add all users in the list that were checked to an array
    addUsers = []
    addUsers.push(this.state.user)
    for (var i = 0; i < this.state.all_users.length; i++){
      if (this.state.all_users[i].add){
        addUsers.push(this.state.all_users[i].id)
      }
    }
    if(addUsers.length <= 1){
      return Alert.alert(
        'Wait!',
        'You must select at least one person',
        [
          {
            text: 'Okay',
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
    else{
      this.createNewHouse(addUsers)
    }
  }

  createNewHouse = addUsers => {
    // Request the API to create the new house with the the current user as well as the users in the addUsers array
    url = API_ROUTE + '/add_new_house'
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({house: addUsers, name: this.state.name}),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(res => {
      if (res.success){
        this.props.navigation.navigate("House", {house_id: res.house_id, house_name: this.state.name, creation: true}) // creation = true to disbale back swipe gesture
      }
    })
    .catch(error => console.log(error));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db"
  },
  listItem: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20
  },
  subContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  btn: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    marginTop: 30,
    marginHorizontal: 30,
    marginBottom: 15,
    backgroundColor: "#3CB371",
    padding: 16,
    alignItems: "stretch",
    borderRadius: 8
  },
});