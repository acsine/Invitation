'use client';

import React, { useState } from 'react'
import cn from 'classnames'
import AppLink from '../AppLink'
import Icon from '../Icon'
import Image from '../Image'

const Card = ({ className, item }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("mb-10 overflow-hidden rounded-lg bg-white shadow-1 duration-300 hover:shadow-3 dark:bg-dark-2", className)} aria-hidden="true">
      <AppLink className="block" href={`/item/${item?.slug}` || '/'}>
        <div className="relative overflow-hidden">
          <Image
            size={{ width: '100%', height: '360px' }}
            src={item?.metadata?.image?.imgix_url}
            alt="Card"
            objectFit="cover"
            className="w-full transition duration-300 hover:scale-110"
          />
          <div className="absolute top-4 left-4">
             <span className="inline-block rounded-md bg-primary py-1 px-3 text-sm font-medium text-white">
                {item?.metadata?.categories[0]?.title}
             </span>
          </div>
          <button
            className={cn("absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-body-color shadow-2 transition hover:text-red-500", { "text-red-500": visible })}
            onClick={(e) => {
              e.preventDefault();
              setVisible(!visible);
            }}
          >
            <Icon name="heart" size="20" />
          </button>
        </div>
        <div className="p-6 text-left sm:p-8 md:p-6 lg:p-8 xl:p-7">
          <h3 className="mb-4 block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]">
            {item?.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-body-color">
              {item?.metadata?.count > 0
                ? `${item?.metadata?.count} Items`
                : 'Not Available'}
            </p>
            <span className="text-lg font-bold text-primary">
              {`$ ${item?.metadata?.price}`}
            </span>
          </div>
        </div>
      </AppLink>
    </div>
  )
}

export default Card

