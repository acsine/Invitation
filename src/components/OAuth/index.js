'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loader from '../Loader'
import registerFields from '../../utils/constants/registerFields'

const OAuth = ({ className, handleClose, disable }) => {
  const { push } = useRouter()

  const [{ email, password }, setFields] = useState(() => registerFields)
  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const inputElement = useRef(null)

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [disable])

  const handleGoHome = () => {
    push('/')
  }

  const handleChange = ({ target: { name, value } }) =>
    setFields(prevFields => ({
      ...prevFields,
      [name]: value,
    }))

  const submitForm = useCallback(
    async e => {
      e.preventDefault()
      fillFiledMessage?.length && setFillFiledMessage('')
      setLoading(true)
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setFillFiledMessage('Email ou mot de passe incorrect')
      } else {
        handleClose && handleClose()
        push('/dashboard')
      }
      
      setLoading(false)
    },
    [
      fillFiledMessage?.length,
      email,
      password,
      handleClose,
      push
    ]
  )

  return (
    <div className={cn("mx-auto w-full max-w-[525px] overflow-hidden rounded-lg bg-white py-14 px-8 sm:px-12 md:px-[60px] shadow-3 dark:bg-dark-2", className)}>
      <div className="mb-10">
        <h2 className="mb-3 text-[28px] font-bold text-dark dark:text-white">
          Connexion
        </h2>
        <p className="text-base text-body-color">
          Connectez-vous à votre compte InviteManager.
        </p>
      </div>

      
      {fillFiledMessage && (
        <div className="mb-5 text-sm text-red-500 font-medium">
          {fillFiledMessage}
        </div>
      )}

      <form onSubmit={submitForm}>
        <div className="mb-6">
          <input
            ref={inputElement}
            type="email"
            name="email"
            placeholder="Email"
            className="w-full rounded-md border-[1.5px] border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
            onChange={handleChange}
            value={email}
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full rounded-md border-[1.5px] border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
            onChange={handleChange}
            value={password}
            required
          />
        </div>
        <div className="mb-10">
          <button 
            type="submit" 
            className="w-full cursor-pointer rounded-md border border-primary bg-primary py-3 px-5 text-base font-medium text-white transition hover:bg-opacity-90 flex items-center justify-center"
          >
            {loading ? <Loader /> : 'Se connecter'}
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={disable ? handleGoHome : handleClose}
            className="w-full cursor-pointer rounded-md border border-stroke bg-transparent py-3 px-5 text-base font-medium text-body-color transition hover:border-primary hover:bg-primary hover:text-white"
          >
            {disable ? 'Retour à l\'accueil' : 'Annuler'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OAuth

