import React from 'react';
import { useHistory } from 'react-router-dom';

type CardType = {
  title: string | React.ReactElement;
  description?: string;
  url?: string;
  imageSrc?: string;
  className?: string;
};

export default function Card({
  title,
  description,
  url,
  imageSrc,
  className,
}: CardType) {
  const classes =
    (className
      ? className
      : 'rounded overflow-hidden hover:bg-gray-50 shadow-lg bg-white h-full') +
    (url ? ' hover:cursor-pointer' : '');
  const history = useHistory();
  const navigateTo: () => any | undefined = url
    ? () => history.push(url)
    : undefined;

  return (
    <div className={classes} onClick={navigateTo}>
      {imageSrc && (
        <img className="w-full" src={imageSrc} alt="Sunset in the mountains" />
      )}

      <div className="px-6 py-4">
        {title && <div className="font-bold text-xl mb-2">{title}</div>}
        {description && (
          <p className="text-gray-700 text-base">{description}</p>
        )}
      </div>
      {/* <div className="px-6 py-4">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#photography</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#travel</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#winter</span>
      </div> */}
    </div>
  );
}
