import React, { useState } from 'react'
import cn from 'classnames'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import OutsideClickHandler from 'react-outside-click-handler'
import Image from '../../Image'
import AppLink from '../../AppLink'
import Icon from '../../Icon'

const User = ({ className, user }) => {
  const [visible, setVisible] = useState(false)
  const { push } = useRouter()

  const items = [
    ...(user?.role === 'ADMIN' ? [{
      title: 'Panneau Admin',
      icon: 'gear',
      url: '/admin',
    }] : []),
    {
      title: 'Tableau de bord',
      icon: 'home',
      url: '/dashboard',
    },
    {
      title: 'Déconnexion',
      icon: 'exit',
      callback: () => {
        signOut({ callbackUrl: '/' })
      },
    },
  ]

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn("relative inline-block", className)}>
        <div 
          className="flex items-center cursor-pointer gap-3 hover:opacity-80 transition" 
          onClick={() => setVisible(!visible)}
        >
          <div className="h-9 w-9 overflow-hidden rounded-full border border-stroke">
            <Image
              size={{ width: '100%', height: '100%' }}
              src={user?.['avatar_url'] || '/images/content/avatar.png'}
              alt="Avatar"
              objectFit="cover"
            />
          </div>
          <div className="hidden text-sm font-medium text-dark dark:text-white sm:block">
            {user?.['first_name'] || 'User'}
          </div>
          <span className={cn("transition-transform", { "rotate-180": visible })}>
            <Icon name="arrow-bottom" size="12" />
          </span>
        </div>
        
        {visible && (
          <div className="absolute right-0 top-full mt-3 w-[240px] rounded-lg bg-white py-3 shadow-3 dark:bg-dark-2 z-50">
            <div className="flex flex-col">
              {items.map((x, index) =>
                x.url ? (
                  <AppLink
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-body-color hover:bg-gray-50 hover:text-primary dark:hover:bg-dark-3"
                    href={x.url || '/'}
                    onClick={() => setVisible(false)}
                    key={index}
                  >
                    <Icon name={x.icon} size="20" />
                    {x.title}
                  </AppLink>
                ) : (
                  <button
                    className="flex w-full items-center gap-3 px-5 py-3 text-sm font-medium text-body-color hover:bg-gray-50 hover:text-primary dark:hover:bg-dark-3"
                    key={index}
                    onClick={x.callback}
                  >
                    <Icon name={x.icon} size="20" />
                    {x.title}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  )
}

export default User

