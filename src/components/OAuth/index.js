'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Button from '../ui/Button'
import registerFields from '../../utils/constants/registerFields'

const OAuth = ({ className, handleClose, disable }) => {
  const { push } = useRouter()

  const [{ email, password }, setFields] = useState(() => registerFields)
  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [returnLoading, setReturnLoading] = useState(false)

  const inputElement = useRef(null)

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [disable])

  const handleGoHome = () => {
    setReturnLoading(true)
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
          <Button 
            type="submit" 
            className="w-full h-12"
            loading={loading}
          >
            Se connecter
          </Button>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={disable ? handleGoHome : handleClose}
            loading={returnLoading}
            className="w-full h-12 border-stroke !text-body-color hover:!border-primary hover:!text-primary"
          >
            {disable ? 'Retour à l\'accueil' : 'Annuler'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default OAuth

