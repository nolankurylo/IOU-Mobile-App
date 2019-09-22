import React from "react";
import TabBarIcon from "../components/TabBarIcon";
import { API_ROUTE } from "react-native-dotenv";
import { Header } from "react-navigation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import moment from "moment";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  View,
  AsyncStorage
} from "react-native";
import {
  Input,
  Button,
  Card,
  ButtonGroup,
  ListItem
} from "react-native-elements";
export default class Budget extends React.Component {
  static navigationOptions = {
    headerTitle: <TabBarIcon name="logo-usd" />
  };

  constructor(props) {
    super(props);
    this.state = {
      curr_amount: "",
      new_amount: "",
      reduced_amount: "",
      daily_used: "",
      insert_value: "",
      user_id: "",
      daily_converter: "",
      weekly_converter: ""
    };
  }
  componentWillMount = async () => {
    var user_id = await AsyncStorage.getItem("user").then(function (id) {
      return id;
    });
    this.setState({ user_id: user_id });
    url = API_ROUTE + "/get_amount/" + user_id;
    //
    fetch(url, {
      method: "GET"
    })
      .then(response => response.json())
      .then(res => {
        this.setState({
          curr_amount: res.curr_amount,
          daily_used: res.amount
        });
      })
      .catch(error => console.log(error));
  };

  // Timeout function to update daily purchases
  componentDidMount = () => {
    var now = new Date();
    var date = moment().days();
    console.log(date);
    var millisTill10 =
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0, 0) -
      now;
    if (millisTill10 < 0) {
      millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
    }
    var current_day = Math.round(
      (now - moment().startOf("month")) / (1000 * 60 * 60 * 24)
    );
    var days_to_end = Math.round(
      (moment().endOf("month") - now) / (1000 * 60 * 60 * 24)
    );
    console.log(days_to_end);
    this.setState({
      daily_converter: days_to_end.toString(),
      weekly_converter: current_day.toString()
    });
    setTimeout(function () {
      alert("It's 10am!");
    }, millisTill10);
  };
  addNewPurchase = () => {
    console.log(this.state.curr_amount);
    console.log(this.state.insert_value);
    if (this.state.insert_value !== "") {
      url = API_ROUTE + "/insert_new_purchase";
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          value: this.state.insert_value,
          id: this.state.user_id
        }),
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(res => {
          console.log(res);
          this.setState({
            daily_used: res.updated_value,
            insert_value: ""
          });
        })
        .catch(error => console.log(error));
    }
  };

  reduceBudget = () => {
    if (this.state.reduced_amount !== "") {
      url = API_ROUTE + "/remove";
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          id: this.state.user_id,
          value: this.state.reduced_amount
        }),
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(res => {
          this.setState({
            curr_amount: res.updated_value,
            reduced_amount: ""
          });
        })
        .catch(error => console.log(error));
    }
  };

  addBudget = () => {
    if (this.state.new_amount !== "") {
      url = API_ROUTE + "/insert";
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          id: this.state.user_id,
          value: this.state.new_amount
        }),
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(res => {
          this.setState({
            curr_amount: res.updated_value,
            new_amount: ""
          });
        })
        .catch(error => console.log(error));
    }
  };
  render() {
    return (
      <KeyboardAwareScrollView style={styles.container} extraScrollHeight={50}>
        <Card containerStyle={{ padding: 10 }} title="Budget">
          <ListItem
            bottomDivider={true}
            titleStyle={
              this.state.curr_amount < 100 ? styles.priceWARN : styles.priceOK
            }
            title={
              "TOTAL AMOUNT:\n$" +
              (this.state.curr_amount / 1).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) //monthly amount (1) should be a variable decided by time (moment()) till months end
            }
          />
          <ListItem
            bottomDivider={true}
            titleStyle={{ color: "grey", fontSize: 16 }}
            title={
              "Weekly: " +
              moment()
                .endOf("week")
                .subtract(1, "day")
                .days() +
              " days until end of week\n$" +
              (
                this.state.curr_amount /
                (4 - Math.floor(this.state.weekly_converter / 7))
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
              //weekly amount (4) should be a variable decided by time (moment()) till months end
            }
          />
          <ListItem
            bottomDivider={true}
            titleStyle={{ color: "grey", fontSize: 16 }}
            title={
              "Daily: " +
              this.state.daily_converter +
              " days until end of month\n$" +
              (
                this.state.curr_amount / this.state.daily_converter
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) //daily amount (30) should be a variable decided by time (moment()) till months end
            }
          />
          <ListItem
            titleStyle={{ color: "grey", fontSize: 16 }}
            title={
              "Amount Spent Today:\n$" +
              (this.state.daily_used / 1).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            }
          />
        </Card>
        <Text style={styles.header}>Insert latest purchase:</Text>
        <View style={styles.subContainer}>
          <TextInput
            value={this.state.insert_value}
            onChangeText={insert_value => this.setState({ insert_value })}
            keyboardType="numeric"
            placeholder="Enter amount"
            style={styles.textInput}
          />
          <TouchableOpacity onPress={this.addNewPurchase} style={styles.btn}>
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Submit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Remove from your monthly allowance:</Text>
        <View style={styles.subContainer}>
          <TextInput
            value={this.state.reduced_amount}
            onChangeText={reduced_amount => this.setState({ reduced_amount })}
            keyboardType="numeric"
            placeholder="Enter amount"
            style={styles.textInput}
          />
          <TouchableOpacity onPress={this.reduceBudget} style={styles.btn}>
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Submit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Add to your monthly allowance:</Text>
        <View style={styles.subContainer}>
          <TextInput
            value={this.state.new_amount}
            onChangeText={new_amount => this.setState({ new_amount })}
            keyboardType="numeric"
            placeholder="Enter amount"
            style={styles.textInput}
          />
          <TouchableOpacity onPress={this.addBudget} style={styles.btn}>
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Submit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#2896d3"
  },
  priceOK: {
    color: "green",
    fontWeight: "bold",
    fontSize: 24
  },
  priceWARN: {
    color: "red",
    fontWeight: "bold",
    fontSize: 24
  },
  subContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  textInput: {
    flex: 1,
    padding: 16,
    marginRight: 20,
    backgroundColor: "#FFF",
    borderRadius: 8
  },
  btn: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: "#3CB371",
    padding: 16,
    alignItems: "center",
    borderRadius: 8
  },
  header: {
    fontSize: 20,
    paddingTop: 20,
    color: "#C0C0C0",
    fontWeight: "bold",
    textAlign: "center"
  }
});
