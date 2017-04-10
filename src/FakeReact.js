const isClass = (type) => {
  // React.Component subclasses have this flag
  return (
    Boolean(type.prototype) &&
    Boolean(type.prototype.isReactComponent)
  );
}

export default class FakeReact {
  constructor(injectedDOMComponent) {
    this.DOMComponent = injectedDOMComponent;
  }

  instantiateComponent(element) {
    var type = element.type;
    if (typeof type === 'function') {
      // User-defined components
      return new CompositeComponent(element, this);
    } else if (typeof type === 'string') {
      // Platform-specific components
      return new this.DOMComponent(element)
    }
  }
}

class CompositeComponent {
  constructor(element, react) {
    this.currentElement = element;
    this.renderedComponent = null;
    this.publicInstance = null;
    this.react = react;
  }

  getPublicInstance() {
    // For composite components, expose the class instance.
    return this.publicInstance;
  }

  mount() {
    var element = this.currentElement;
    var type = element.type;
    var props = element.props;

    var publicInstance;
    var renderedElement;
    if (isClass(type)) {
      // Component class
      publicInstance = new type(props);
      // Set the props
      publicInstance.props = props;
      // Call the lifecycle if necessary
      if (publicInstance.componentWillMount) {
        publicInstance.componentWillMount();
      }
      renderedElement = publicInstance.render();
    } else if (typeof type === 'function') {
      // Component function
      publicInstance = null;
      renderedElement = type(props);
    }

    // Save the public instance
    this.publicInstance = publicInstance;

    // Instantiate the child internal instance according to the element.
    // It would be a DOMComponent for <div /> or <p />,
    // and a CompositeComponent for <App /> or <Button />:
    this.renderedComponent = this.react.instantiateComponent(renderedElement);

    // Mount the rendered output
    return this.renderedComponent.mount();
  }
}
