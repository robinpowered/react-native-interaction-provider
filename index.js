import React, {PropTypes} from 'react';
import {PanResponder} from 'react-native';

const CHANNEL = '__interaction-manager__';

class InactivitySubscription {
  constructor (duration, onActive, onInactive) {
    this.duration = duration;
    this.onActive = onActive;
    this.onInactive = onInactive;
  }

  active() {
    if (this.onActive) {
      this.onActive();
    }
  }

  inactive() {
    if (this.onInactive) {
      this.onInactive();
    }
  }

  isPending() {
    return !!this.timeout;
  }

  refreshTimeout() {
    this.clearTimeout();

    this.timeout = setTimeout(() => {
      this.inactive();
      this.clearTimeout();
    }, this.duration);
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
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

    this.onActive = this.onActive.bind(this);
    this.onInactive = this.onInactive.bind(this);

    this.subscribe = this.subscribe.bind(this);
    this.subscribeForActivity = this.subscribeForActivity.bind(this);
    this.subscribeForInactivity = this.subscribeForInactivity.bind(this);

    this.inactivitySubscription = new InactivitySubscription(
      props.timeout,
      this.onActive,
      this.onInactive
    );

    this.subscriptions = [this.inactivitySubscription];
  }

  getChildContext() {
    return {
      interactionProvider: {
        subscribe: this.subscribe,
        subscribeForActivity: this.subscribeForActivity,
        subscribeForInactivity: this.subscribeForInactivity
      }
    };
  }

  subscribe(duration, onActive, onInactive) {
    var subscription = new InactivitySubscription(duration, onActive, onInactive);
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

  subscribeForInactivity(duration, onInactive) {
    return this.subscribe(duration, null, onInactive);
  }

  subscribeForActivity(duration, onActive) {
    return this.subscribe(duration, onActive, null);
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
    this.subscriptions.forEach(subscription => {
      if (!subscription.isPending()) {
        subscription.active();
      }
      subscription.refreshTimeout();
    });
    return false;
  }

  onInactive() {
    if (this.props.onInactive) {
      this.props.onInactive();
    }
  }

  onActive() {
    if (this.props.onActive) {
      this.props.onActive();
    }
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
    // this.inactivitySubscription.clearTimeout();
    this.subscriptions.forEach(subscription => subscription.clearTimeout());
  }

  /**
   * Refreshes the dismiss timer
   *
   * @returns {void}.
   */
  refreshInactiveTimer() {
    // this.inactivitySubscription.refreshTimeout();
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
