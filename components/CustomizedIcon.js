import React from 'react';
import { Ionicons } from '@expo/vector-icons';


export default class CustomizedIcon extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Ionicons
        name={this.props.name}
        size={this.props.size ? this.props.size : 26}
        style={{ marginBottom: -3 }}
        color={this.props.color}
      />
    );
  }
}