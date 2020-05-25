import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  FlatList
} from "react-native";
import { API_ROUTE } from "react-native-dotenv";
import {
  Card,
  ListItem
} from "react-native-elements";
import { AsyncStorage } from "react-native";
import Loader from "../components/Loader"
import CustomizedIcon from "../components/CustomizedIcon"
import { showMessage } from "react-native-flash-message";

export default class NotificationsScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
    headerLeft: <TouchableOpacity
    style={{padding: 5, width: 75, flexDirection: "row",}}
    onPress={() => {
      navigation.state.params.onGoBack()
      navigation.goBack()}}>
    <CustomizedIcon name="ios-arrow-back" color="#51B1D3"/>
    <Text style={{ marginLeft:10, fontSize: 20, fontWeight:'bold', color: "#51B1D3"}}>Back</Text>
    </TouchableOpacity>
    }
  };
  
  state = {
    user: "",
    friends: [],
    refreshing: false,
    all_users: [],
    loading: false,
  };

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getFriendRequests();
    this.setState({ refreshing: false });
  };
  componentDidMount = async () => {
    var user = await AsyncStorage.getItem("user").then(function(id) {
      return id;
    });
    this.setState({ user: user, loading: true });
    this.getFriendRequests();
  };
  componentWillUnmount() {
    this.setState({ loading: false });
  }


  getFriendRequests = () => {
    // Request API to get all incoming friend requests from other users
    var user = this.state.user;
    url = API_ROUTE + "/get_friend_requests/" + user;
    fetch(url, {
      method: "GET"
    })
      .then(response => response.json())
      .then(res => {
        var friends = [];
        for (var i = 0; i < res.friends.length; i++) {
          friends.push({
              id: res.friends[i].id,
              name: res.friends[i].username
            });
        }
        this.setState({ friends: friends, loading: false });
      })
      .catch(error => {
        this.setState({ loading: false });
        console.log(error)
      });
    return;
  };

  acceptFriendRequest = friend => {
    // Request API to accept this incoming friend request
    url = API_ROUTE + "/accept_friend_request"
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        user_a_id: friend,
        user_b_id: this.state.user
      }),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(res => {
        if (res.success) {
          this.getFriendRequests()
          return showMessage({
            message: 'Friend request accepted!',
            type: "default",
            backgroundColor: "#01c853",
          });
        }
      })
      .catch(error => {
        console.log(error)
      });
    return;
  }

  removeFriendRequest = friend => {
    // Request API to decline this incoming friend request
    url = API_ROUTE + "/decline_friend_request"
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        user_a_id: friend,
        user_b_id: this.state.user
      }),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(res => {
        if (res.success) {
          this.getFriendRequests()
          return showMessage({
            message: 'Friend request declined!',
            type: "default",
            backgroundColor: "#01c853",
          });
        }
      })
      .catch(error => {
        console.log(error)
      });
    return;
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

  renderLoading() {
    if (this.state.loading) {
      return <Loader loading={this.state.loading} color={"#000000"} /> 
    } else {
      return null
    }
  }

  render() {    
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
        style={styles.container}
        extraScrollHeight={100}
      >
        <Card title="Your Friend Requests:">
        <FlatList
          data={this.state.friends}
          renderItem={({ item }) => <ListItem
          style={styles.listItem}
          title={item.name}
          leftElement={<CustomizedIcon name="md-person" color="#51B1D3"/>}
          rightElement={
            <View style={styles.subContainer}>
              <TouchableOpacity style={{padding: 10}} onPress={() => this.acceptFriendRequest(item.id)}>
                <CustomizedIcon name="md-person-add" color="green"/>
              </TouchableOpacity>
              <TouchableOpacity style={{padding: 10}} onPress={() => this.removeFriendRequest(item.id)}>
                <CustomizedIcon name="md-close" color="red"/>
              </TouchableOpacity>
            </View>
          }
        />}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={this.renderSeparator}
        />
        </Card>
        {this.renderLoading()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#51B1D3"
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
  subContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  }
});