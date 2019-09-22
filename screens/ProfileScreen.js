import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import TabBarIcon from "../components/TabBarIcon";
import { API_ROUTE } from "react-native-dotenv";
import {
  Card,
  ListItem
} from "react-native-elements";
import { AsyncStorage } from "react-native";
import Loader from "../components/Loader"
import CustomizedIcon from "../components/CustomizedIcon"

export default class ProfileScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
    headerTitle: <TabBarIcon name="ios-person" />,
    }
  };

  constructor(props) {
    super(props);
    this.navigationWillFocusListener = props.navigation.addListener('willFocus', async () => {
      if(!user){
        var user = await AsyncStorage.getItem("user")
        this.setState({ user: user});
        this.getFriends()
      }else{
        this.getFriends()
      }
    })
    this.state = {
      search: "",
      user: "",
      friends: [],
      all_users: [],
      loading: false,
      notifications: false,
      numFriends: 0,
      username: "",
      email: ""
    };
  }

  componentWillMount = () => {
    this.setState({ loading: true  });
  }
  
  getFriends = () => {
    // Request API to get all current friends linked to the current user as well as this user's profile information
    var user = this.state.user;
    url = API_ROUTE + "/get_friends/" + user;
    fetch(url, {
      method: "GET"
    })
      .then(response => response.json())
      .then(res => {
        var friends = [];
        var numFriends = 0;
        this.setState({ notifications: false });
        for (var i = 0; i < res.friends.length; i++) {
          if (res.friends[i].id == user ){
            res.friends[i].username = res.friends[i].username.toUpperCase()
            this.setState({ username: res.friends[i].username, email: res.friends[i].email  });
            continue;
          }
          if (res.friends[i].status == 'req') {
            if (res.friends[i].status == 'req' && res.friends[i].user_b_id == user){
              this.setState({ notifications: true });
            }
            continue;
          }
          if (res.friends[i].user_a_id == user) {
            numFriends++;
            friends.push({
              id: res.friends[i].id,
              name: res.friends[i].username
            });
          }
          if (res.friends[i].user_b_id == user) {
            numFriends++;
            friends.push({
              id: res.friends[i].id,
              name: res.friends[i].username
            });
          }
        }
        this.setState({ friends: friends, loading: false, numFriends: numFriends });
      })
      .catch(error => {
        this.setState({ loading: false });
        console.log(error)
      });
    return;
  };

  updateSearch = search => {
    this.setState({ search });
  };


  removeFriend = friend => {
    // Request API to remove this user from the current user's friends list
    url = API_ROUTE + "/remove_friend/" + this.state.user + "/" + friend;
    fetch(url, {
      method: "POST"
    })
      .then(response => response.json())
      .then(res => {
        this.getFriends();
      })
      .catch(error => {
        console.log(error)
      });
  };
  logout = async () => {
    // Logout current user, redirect to login/register stack navigator
    this.setState({ loading: true });
    await AsyncStorage.clear();
    this.setState({ loading: false  });
    this.props.navigation.navigate("AuthLoading");
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

  renderNotifications() {
    if(this.state.notifications){
      return (<TouchableOpacity
          style={styles.notifications}
          onPress={() => this.props.navigation.navigate("Notifications", {
            onGoBack: () => this.getFriends(),
          })}        
        >
        <Text style={{color:'white', fontWeight: 'bold'}}>You Have New Friend Requests :)</Text>
        <View style={{position: 'absolute', right: 10, margin:5, marginTop:10}}>
        <CustomizedIcon name="md-arrow-round-forward" color="white"/>
        </View>
        </TouchableOpacity> 
      )
    }
    else {
      return null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentInset={{top:0, bottom: 100}}>
          {this.renderNotifications()}
          <Card title={`Logged in as: ${this.state.username}`}>
            <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
              <Text>Email:</Text>
              <Text>Friends:</Text>
            </View>
            <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
              <Text>{this.state.email}</Text>
              <Text>({this.state.numFriends})</Text>
            </View>
          </Card>
          <Card title="Your Friends:">
          <FlatList
            data={this.state.friends}
            renderItem={({ item }) => <ListItem
            style={styles.user}
            title={item.name}
            leftElement={<CustomizedIcon name="md-person" color="#3498db"/>}
            rightElement={
              <TouchableOpacity onPress={() => this.removeFriend(item.id)}>
                <CustomizedIcon name="ios-trash" color="red"/>
              </TouchableOpacity>
            }
          />}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={this.renderSeparator}
          />
          </Card>          
        </ScrollView>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => this.logout()}><Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 22, textAlign: 'center'}}>Logout</Text></TouchableOpacity>
        {this.renderLoading()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db"
  },
  subText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center"
  },
  titleText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 50
  },
  listItem: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20
  },
  notifications: {
    flex: 1,
    flexDirection: "row",
    padding: 15, 
    backgroundColor:"red"
  },
  logoutBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    marginTop: 30,
    marginHorizontal: 30,
    marginBottom: 15,
    backgroundColor: "#E44925",
    padding: 16,
    alignItems: "stretch",
    borderRadius: 8
  } 
});
