import React, { useState } from 'react'
import cn from 'classnames'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import OutsideClickHandler from 'react-outside-click-handler'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Loader from '../../Loader'
import Image from '../../Image'
import AppLink from '../../AppLink'
import Icon from '../../Icon'

const User = ({ className, user }) => {
  const [visible, setVisible] = useState(false)
  const [loadingItem, setLoadingItem] = useState(null)
  const { push } = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setLoadingItem(null);
  }, [pathname]);

  const handleItemClick = (item, index) => {
    setLoadingItem(index);
    if (item.callback) {
      item.callback();
    } else {
      setVisible(false);
    }
  };

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
               {items.map((x, index) => {
                 const isLoading = loadingItem === index;
                 return x.url ? (
                   <AppLink
                     className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-body-color hover:bg-gray-50 hover:text-primary dark:hover:bg-dark-3"
                     href={x.url || '/'}
                     onClick={() => handleItemClick(x, index)}
                     key={index}
                   >
                     <div className="w-5 h-5 flex items-center justify-center">
                       {isLoading ? <Loader className="!h-3 !w-3" /> : <Icon name={x.icon} size="20" />}
                     </div>
                     {x.title}
                   </AppLink>
                 ) : (
                   <button
                     className="flex w-full items-center gap-3 px-5 py-3 text-sm font-medium text-body-color hover:bg-gray-50 hover:text-primary dark:hover:bg-dark-3 text-left"
                     key={index}
                     onClick={() => handleItemClick(x, index)}
                   >
                     <div className="w-5 h-5 flex items-center justify-center">
                       {isLoading ? <Loader className="!h-3 !w-3" /> : <Icon name={x.icon} size="20" />}
                     </div>
                     {x.title}
                   </button>
                 );
               })}
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  )
}

export default User

