import React from 'react';

/**
 * Composes a component to receive properties indicating if it is active or inactive via
 * props.active and props.inactive.
 *
 * Example:
 * ```
 * function Button ({active, inactive, ...props}) {
 *   // can detect if its become inactive, or is currently active.
 * }
 *
 * const ButtonWithInteractionAwareness = withInteractionProps(Button, {duration: 5000});
 *
 * @param {Component} WrappedComponent A React component to receive interaction properties.
 * @param {Object} {duration} The interaction options.
 * @returns {Component} A wrapped React component.
 */
function withInteractionProps(WrappedComponent, {duration}) {
  class InteractionPropertyWrapper extends React.Component {
    static contextTypes = {
      interactionProvider: React.PropTypes.object.isRequired
    };

    state = {
      active: true,
      inactive: false
    };

    componentDidMount() {
      this.subscription = this.context.interactionProvider.subscription(
        duration,
        () => this.setState({active: true, inactive: false}),
        () => this.setState({active: false, inactive: true})
      );
    }

    componentWillUnmount() {
      this.subscription.remove();
    }

    render() {
      const {
        children,
        ...props
      };

      const child = React.Children.only(children);

      return React.cloneElement(child, {
        ...props,
        active: this.state.active,
        inactive: this.state.inactive
      });
    }
  }
}
