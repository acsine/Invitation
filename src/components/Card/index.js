'use client';

import React, { useState } from 'react'
import cn from 'classnames'
import AppLink from '../AppLink'
import Icon from '../Icon'
import Image from '../Image'

const Card = ({ className, item }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("group mb-8 overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 border border-slate-200/80 dark:border-slate-800/80", className)} aria-hidden="true">
      <AppLink className="block" href={`/item/${item?.slug}` || '/'}>
        <div className="relative overflow-hidden aspect-[4/3]">
          <Image
            size={{ width: '100%', height: '100%' }}
            src={item?.metadata?.image?.imgix_url}
            alt={item?.title || "Card"}
            objectFit="cover"
            className="w-full h-full transition duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
             <span className="inline-flex items-center rounded-lg bg-indigo-600/90 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                {item?.metadata?.categories[0]?.title || 'Invitation'}
             </span>
          </div>
          <button
            type="button"
            className={cn("absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 shadow-md transition-all hover:scale-110 hover:text-rose-500", { "text-rose-500 bg-rose-50 dark:bg-rose-950/40": visible })}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVisible(!visible);
            }}
          >
            <Icon name="heart" size="18" />
          </button>
        </div>
        <div className="p-5 text-left">
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {item?.title}
          </h3>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {item?.metadata?.count > 0
                ? `${item?.metadata?.count} invités`
                : 'Disponible'}
            </p>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
              {item?.metadata?.price ? `$ ${item?.metadata?.price}` : 'Gratuit'}
            </span>
          </div>
        </div>
      </AppLink>
    </div>
  )
}

export default Card
