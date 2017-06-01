import React, {PropTypes} from 'react';
import {PanResponder} from 'react-native';

const CHANNEL = '__interaction-manager__';

class InactivitySubscription {
  constructor (duration, subscriber) {
    this.duration = duration;
    this.subscriber = subscriber;
  }

  refreshTimeout() {
    this.clearTimeout();

    this.timeout = setTimeout(() => {
      this.subscriber();
      this.clearTimeout();
    }, this.duration);
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  isPending() {
    return !!this.timeout;
  }
}


/**
 * A behavioral wrapper that decorates a child component with interaction detections.
 * This is helpful to determine whether or not a user is interacting with the application.
 * After a period of inactivity, `onInactive` will be fired, letting you know the application has idled.
 *
 * <InteractionContainer onInactive={() => navigator.pop()}>
 * 	<YourScreen />
 * </InteractionContainer>
 */
class InteractionContainer extends React.Component {
  static propTypes = {
    timeout: PropTypes.number, // timeout in milliseconds
    onActive: PropTypes.func.isRequired,
    onInactive: PropTypes.func.isRequired // called when the timer has completed
  };

  static defaultProps = {
    timeout: 60 * 1000 // 1m
  };

  static childContextTypes = {
    interactionProvider: React.PropTypes.object.isRequired
  };

  // static contextTypes = {
  //   interactionProvider: PropTypes.object
  // };

  constructor(props) {
    super(props);

    this.inactivitySubscription = new InactivitySubscription(props.timeout, this.onInactive);
    this.subscriptions = [];

    this.subscribeForInactivity = this.subscribeForInactivity.bind(this);
  }

  getChildContext() {
    return {
      interactionProvider: {
        subscribeForInactivity: this.subscribeForInactivity
      }
    };
  }

  subscribeForInactivity(duration, subscriber) {
    var subscription = new InactivitySubscription(duration, subscriber);
    this.subscriptions.push(subscription);
    subscription.refreshTimeout();

    // unsubscribe
    return () => {
      var index = this.subscriptions.indexOf(subscription);
      if (index > -1) {
        this.subscriptions[index].clearTimeout();
        this.subscriptions.splice(index, 1);
      }
    }
  }

  /**
   * Create the dismiss timer and initialize the PanResponders when the component mounts.
   *
   * @returns {void}
   */
  componentWillMount() {
    this.panResponder = PanResponder.create({
      // don't respond to gestures
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,

      // don't capture, but when permission to capture is requested, refresh the timer
      onStartShouldSetPanResponderCapture: () => this.onPanResponderCapture(),
      onMoveShouldSetPanResponderCapture: () => this.onPanResponderCapture()
    });
  }

  /**
   * Clear the timer when the component dismounts
   *
   * @return {void}
   */
  componentWillUnmount() {
    this.stopInactiveTimer();
  }

  /**
   * Refresh the timer when the PanResponder requests to capture a gesture.
   *
   * @return {Boolean} `false` to prevent capturing the gesture.
   */
  onPanResponderCapture () {
    if (!this.inactivitySubscription.isPending() && this.props.onActive) {
      this.props.onActive();
    }

    this.refreshInactiveTimer();
    return false;
  }

  onInactive() {
    this.props.onInactive();
  }

  /**
   * Starts the dismiss timeout.
   *
   * @return {void}
   */
  startInactiveTimer() {
    this.refreshInactiveTimer();
  }

  /**
   * Stops the dismiss timeout.
   *
   * @return {void}
   */
  stopInactiveTimer() {
    this.inactivitySubscription.clearTimeout();
    this.subscriptions.forEach(subscription => subscription.clearTimeout());
  }

  /**
   * Refreshes the dismiss timer
   *
   * @returns {void}.
   */
  refreshInactiveTimer() {
    this.inactivitySubscription.refreshTimeout();
    this.subscriptions.forEach(subscription => subscription.refreshTimeout());
  }

  /**
   * Decorate the child node with the pan handlers.
   *
   * @return {Object} The decorated React element.
   */
  render() {
    return React.cloneElement(this.props.children, {
      ...this.panResponder.panHandlers
    });
  }
}

export default InteractionContainer;
