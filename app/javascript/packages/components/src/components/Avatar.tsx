import React from 'react';
import { connect } from 'react-redux';

type AvatarType = {
  src: string;
  indicator?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full' | number;
  classes?: string;
  alt?: string;
  app: any;
  palette?: any;
  avatar_kind?: any;
};

function Avatar({
  src,
  indicator,
  size,
  classes,
  alt,
  app,
  avatar_kind,
  palette,
}: AvatarType) {
  function sizeClassName(size) {
    switch (size) {
      case 'small':
        return 'h-6 w-6';
      case 'medium':
        return 'h-8 w-8';
      case 'large':
        return 'h-10 w-10';
      case 'full':
        return 'w-full h-full';
      default:
        if (!isNaN(size)) return `h-${size} w-${size}`;
        return 'h-6 w-6';
    }
  }

  const encodedName = encodeURI(alt);

  const resolvedPalette =
    palette ||
    app?.preferences?.avatar_settings?.palette ||
    '264653,2a9d8f,e9c46a,f4a261,e76f51';
  let avatarKind =
    avatar_kind || app?.preferences?.avatar_settings?.style || 'marble';
  if (app?.preferences?.avatarKind) avatarKind = app.preferences.avatarKind;

  return (
    <span className={`inline-block relative ${size == 'full' ? 'w-full' : ''}`}>
      <img
        style={{
          backgroundSize: 'contain',
          backgroundImage: `url(
            'https://source.boringavatars.com/${avatarKind}/128/${encodedName}?colors=${resolvedPalette}'
          )`,
        }}
        className={`${sizeClassName(size)} rounded-full bg-white ${
          classes || ''
        }`}
        src={src}
        alt={alt || src}
      />

      {indicator && (
        <span
          className="absolute top-0 right-0
          block h-3 w-3 transform
          -translate-y-1/2 -translate-x-1/4 rounded-full
          text-white shadow-solid bg-green-400 border-white border-2"
        ></span>
      )}
    </span>
  );
}

function mapStateToProps(state) {
  const { app } = state;
  return {
    app,
  };
}

export default connect(mapStateToProps)(Avatar);
