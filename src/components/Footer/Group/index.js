'use client';

import React, { useState } from 'react'
import AppLink from '../../AppLink'
import cn from 'classnames'
import Icon from '../../Icon'

const Group = ({ className, item }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("mb-12 w-full", className)}>
      <div 
        className="mb-9 flex items-center justify-between text-lg font-semibold text-dark dark:text-white cursor-pointer lg:cursor-default"
        onClick={() => setVisible(!visible)}
      >
        {'Menu'}
        <span className={cn("transition-transform lg:hidden", { "rotate-180": visible })}>
          <Icon name="arrow-bottom" size="10" />
        </span>
      </div>
      <ul className={cn("lg:block", { "hidden": !visible })}>
        {item?.map((x, index) => (
          <li key={index}>
            <AppLink 
              className="mb-2 inline-block text-base text-body-color hover:text-primary transition" 
              href={x.url || '/'}
            >
              {x.title}
            </AppLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Group

