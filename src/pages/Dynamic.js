import React, { useState, useEffect } from 'react';
import { mergeProps } from '@react-aria/utils';

function isString(obj) {
  return typeof obj === 'string' || obj instanceof String;
}

function resolvedChildren(children, bag) {
  return typeof children === 'function' ? children(bag) : children;
}

function renderChildren(children) {
  const type = typeof children;

  if (type === 'string' || children instanceof String) {
    return children;
  }

  if (Array.isArray(children)) {
    return children.map(child => {
      return createComponent(child);
    });
  }
  // TODO: handle object and function
  console.log('Children render null');
  return null;
}

const defaultPanelProps = {
  className: 'shadow overflow-hidden sm:rounded-md',
};
function Panel(props) {
  const { id, text, children, ...rest } = props;
  const newProps = mergeProps(defaultPanelProps, rest);
  return (
    <div {...newProps}>
      {/* Figure out inner props */}
      <div className="px-4 py-5 bg-white sm:p-6">
        {renderChildren(children)}
      </div>
    </div>
  );
}

function Button(props) {
  const { id, text, children, ...rest } = props;

  if (text) {
    return <button {...rest}>{text}</button>;
  }

  return <button {...rest}>{renderChildren(children)}</button>;
}

const componentMap = {
  Button: Button,
  Panel: Panel,
};

function createComponent(item) {
  const { id, type, children, props } = item;
  const Comp = componentMap[type];
  return (
    <Comp key={id} {...props}>
      {children}
    </Comp>
  );
}

export default function Page() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [components, setComponents] = useState({});
  const [pageComponents, setPageComponents] = useState([]);
  const [pages, setPages] = useState({});

  useEffect(() => {
    fetch('http://localhost:5001/db')
      .then(res => res.json())
      .then(
        result => {
          console.log(result);
          setIsLoaded(true);
          setPages(result.pages);
          setComponents(result.components);
          setPageComponents(result.pageComponents);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        error => {
          setIsLoaded(true);
          setError(error);
        },
      );
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <ul>
        {pageComponents.map(compId => {
          const item = components[compId];
          return <li key={compId}>{createComponent(item)}</li>;
        })}
      </ul>
    );
  }
}
