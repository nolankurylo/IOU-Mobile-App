import React from "react";
import {
  Text,
  SafeAreaView,
  View,
  AsyncStorage,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import TabBarIcon from "../components/TabBarIcon";
import { Button, List, ListItem, SearchBar } from "react-native-elements";
import { API_ROUTE } from "react-native-dotenv";
import Loader from "../components/Loader";
import CustomizedIcon from "../components/CustomizedIcon"

export default class SearchScreen extends React.Component {
  static navigationOptions = {
    headerTitle: <TabBarIcon name="md-glasses" />
  };
  constructor(props) {
    super(props);
    this.navigationWillFocusListener = props.navigation.addListener('willFocus', async () => {
      if(!user){
        var user = await AsyncStorage.getItem("user")
        this.setState({ user: user });
        this.getUsers()
      }else{
        this.getUsers()
      }
    })
    this.state = {
      user: "",
      all_users: [],
      dataBackup: [],
      loading: false,
      error: null,
      refreshing: false,
      search: ""
    };
  }

  componentDidMount = () => {
    this.setState({ loading: true });
  }
  componentWillUnmount() {
    this.setState({ loading: false });
  }
  
  renderLoading() {
    if (this.state.loading) {
      return <Loader loading={this.state.loading} color={"#000000"} /> 
    } else {
      return null
    }
  }

  getUsers = () => {
    // Request API to get all users in the database
    url = API_ROUTE + "/get_users/" + this.state.user
    fetch(url, {
      method: "GET"
    })
      .then(response => response.json())
      .then(res => {
        if (res.users.length < 1) {
          return this.setState({ all_users: [] });
        }
        var all_users = [];
        for (var i = 0; i < res.users.length; i++) {
          if(!res.users[i].friendship_id){
            all_users.push({ id: res.users[i].id, name: res.users[i].username, status: null})
          }
          else if (res.users[i].status == 'friends'){
            if(res.users[i].user_a_id == this.state.user || res.users[i].user_b_id == this.state.user){
              all_users.push({ id: res.users[i].id, name: res.users[i].username, status: res.users[i].status})
            }
          }
          else if (res.users[i].status == 'req'){
            if(res.users[i].user_a_id == this.state.user){
              all_users.push({ id: res.users[i].id, name: res.users[i].username, status: res.users[i].status})
            }
          }
        }
        this.setState({
          all_users: all_users,
          dataBackup: all_users,
          error: res.error || null,
          loading: false,
          refreshing: false
        });
      })
      .catch(error => this.setState({ error, loading: false }));
  };

  updateSearch = search => {
    this.setState({ search });
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

  cancelFriendRequest = friend => {
    // Request API to cancel this friend request
    url = API_ROUTE + '/cancel_friend_request'
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        user_a_id: this.state.user,
        user_b_id: friend
      }),
      headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
      .then(res => {
        if (res.success){
          this.getUsers();
        } 
      })
      .catch(error => {
        console.log(error); 
      });
  }

  newFriendRequest = friend => {
    // Request API to send a new friend request to this user
    url = API_ROUTE + '/new_friend_request'
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        user_a_id: this.state.user,
        user_b_id: friend
      }),
      headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
      .then(res => {
        if (res.success){
          this.getUsers();
        } 
      })
      .catch(error => {
        console.log(error); 
      });
  }
 
  render() {
    return (
      <SafeAreaView style={{flex:1}}> 
        <SearchBar
          value={this.state.search}
          onChangeText={text => this.filterList(text)}
          placeholder="Search for friends to add..."
          lightTheme
          round
        />
        <FlatList
          data={this.state.all_users}
          renderItem={({ item }) => <ListItem style={styles.user} title={item.name} 
          leftElement={<CustomizedIcon name="md-person" color="#51B1D3"/>} rightElement={item.status ? 
          (item.status == "req" ? <TouchableOpacity onPress={() => this.cancelFriendRequest(item.id)} style={styles.requested}><Text>Requested</Text></TouchableOpacity> : <View style={styles.friend}><Text>Friends</Text></View>) : 
          <TouchableOpacity onPress={() => this.newFriendRequest(item.id)}style={styles.addFriend}><Text style={{color: "#FFF"}}>Add Friend</Text></TouchableOpacity>}/>}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={this.renderSeparator}
        />
        {this.renderLoading()}
      </SafeAreaView>
    );
  } 
}

const styles = StyleSheet.create({
  user: {
    flex: 1,
    padding: 16,
    marginRight: 20,
    backgroundColor: "#FFF",
    borderRadius: 8
  },
  requested: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: "#FFF",
    borderColor: "#000000",
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 8
  },
  addFriend: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: "#1AF086",
    padding: 12,
    alignItems: "center",
    borderRadius: 8
  },
  friend: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: "#DDDDDD",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    padding: 12,
    color: "#2FEE9D",
    alignItems: "center",
    borderRadius: 8
  }
})