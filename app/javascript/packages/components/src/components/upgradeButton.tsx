import React from 'react';
import Button from './Button';
import { Link, withRouter } from 'react-router-dom';
import useOnClickOutside from './hooks/useClickOutside';
import { Transition } from '@headlessui/react';

import { connect } from 'react-redux';
import I18n from '../../../../src/shared/FakeI18n';

function UpgradeButton({ classes, size, app, label, feature, children }) {
  const [toggle, setToggle] = React.useState(false);

  function onToggle(val) {
    setToggle(val);
  }

  const plansEnabled = !app.plan.disabled;

  const activeFeature =
    plansEnabled &&
    app.plan.features.find((f) => f.name === feature && f.active);

  if (!app.subscriptionsEnabled) return children;

  return (
    <div>
      {plansEnabled && !activeFeature && (
        <FeaturesMenu
          size={size}
          name={label}
          label={label}
          onToggle={onToggle}
          classes={classes}
        >
          <div className="rounded-lg shadow-lg overflow-hidden border-2 border-black">
            <MenuItems app={app} feature={feature} />
          </div>
        </FeaturesMenu>
      )}

      {plansEnabled && activeFeature && children}
    </div>
  );
}

function mapStateToProps(state) {
  const { app } = state;

  return {
    app,
  };
}

export default withRouter(connect(mapStateToProps)(UpgradeButton));

function FlyoutItem({ children, onClickOutside }) {
  const ref = React.useRef();
  useOnClickOutside(ref, onClickOutside);
  return (
    <div ref={ref} className="md:relative">
      {children}
    </div>
  );
}

function FeaturesMenu({ classes, size, label, name, children, onToggle }) {
  const [flyoutMenuOpen, setFlyoutMenuOpen] = React.useState(false);

  const defaultClasses = 'absolute z-10 ml-1 mt-3 transform w-screen max-w-md';

  return (
    <FlyoutItem
      onClickOutside={() => {
        setFlyoutMenuOpen(false);
        onToggle(name);
      }}
      // className="md:relative"
    >
      <Button
        size={size}
        className="mr-2"
        variant={'success'}
        // onMouseOver={() => {
        //  setFlyoutMenuOpen(!flyoutMenuOpen)
        //  onToggle(true)
        // }}
        onClick={() => {
          setFlyoutMenuOpen(!flyoutMenuOpen);
          onToggle(true);
        }}
      >
        {label}
      </Button>

      <Transition
        show={flyoutMenuOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
        className={classes || defaultClasses}
        // style={{display: 'none'}}
      >
        {children}
      </Transition>
    </FlyoutItem>
  );
}

function MenuItems({ app, feature }) {
  return (
    <div className="relative z-20 bg-white py-6 px-5 grid gap-6 sm:gap-8 sm:p-8">
      <Link
        to={`/apps/${app.key}/billing`}
        className="-m-3 rounded-lg p-3 flex items-start space-x-4 hover:bg-cool-gray-50 transition ease-in-out duration-150"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
          />
        </svg>
        <div className="space-y-1">
          <p className="text-base leading-6 font-medium text-cool-gray-900">
            Upgrade
          </p>
          <p className="text-sm leading-5 text-cool-gray-500">
            {I18n.t(`subscriptions.features.${feature}.upgrade_message`)}
          </p>
        </div>
      </Link>
    </div>
  );
}
