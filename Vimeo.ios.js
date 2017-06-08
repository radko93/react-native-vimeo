/**
 * @providesModule Vimeo
 * @flow
 */
import React from 'react';
import {
  StyleSheet,
  WebView
} from 'react-native';


function getVimeoPageURL(videoId) {
  return 'https://myagi.github.io/react-native-vimeo/v0.3.0.html?vid=' + videoId;
}


export default class Vimeo extends React.Component {

  static propTypes = {
    videoId: React.PropTypes.string.isRequired,
    onReady: React.PropTypes.func,
    onPlay: React.PropTypes.func,
    onPlayProgress: React.PropTypes.func,
    onPause: React.PropTypes.func,
    onFinish: React.PropTypes.func,
    scalesPageToFit: React.PropTypes.bool
  }

  constructor() {
    super();
    this.handlers = {};
    this.state = {
      ready: false
    };
  }

  componentDidMount() {
    this.registerHandlers();
  }

  componentWillReceiveProps() {
    this.registerHandlers();
  }

  api(method, cb) {
    if (!this.state.ready) {
      throw new Error('You cannot use the `api` method until `onReady` has been called');
    }
    this.webView.postMessage(method);
    this.registerBridgeEventHandler(method, cb);
  }

  registerHandlers() {
    this.registerBridgeEventHandler('ready', this.onReady);
    this.registerBridgeEventHandler('play', this.props.onPlay);
    this.registerBridgeEventHandler('playProgress', this.props.onPlayProgress);
    this.registerBridgeEventHandler('pause', this.props.onPause);
    this.registerBridgeEventHandler('finish', this.props.onFinish);
  }

  registerBridgeEventHandler(eventName, handler) {
    this.handlers[eventName] = handler;
  }

  onMessage = (message) => {
    let payload;
    try {
      payload = JSON.parse(message);
    } catch (err) {
      return;
    }
    let handler = this.handlers[payload.name];
    if (handler) handler(payload.data);
  }

  onReady = () => {
    this.setState({ ready: true });
    // Defer calling `this.props.onReady`. This ensures
    // that `this.state.ready` will be updated to
    // `true` by the time it is called.
    if (this.props.onReady) setTimeout(this.props.onReady);
  }

  render() {
    return (
      <WebView
        ref={(r) => {this.webView = r}}
        style={{
          // Accounts for player border
          marginTop: -8,
          marginLeft: -10,
          height: this.props.height
        }}
        source={{ uri: getVimeoPageURL(this.props.videoId) }}
        scalesPageToFit={this.props.scalesPageToFit}
        scrollEnabled={false}
        onMessage={this.onMessage}
        onError={(error) => console.error(error)}
      />
    );
  }

}
