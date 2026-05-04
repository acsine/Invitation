'use client';

import React from 'react';
import Modal from '@/components/Modal';
import Icon from '@/components/Icon';
import cn from 'classnames';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, eventName, loading }) {
  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
    >
      <div className="p-8 text-center bg-white dark:bg-dark-2 rounded-2xl max-w-sm mx-auto">
        <div className="mb-6 flex justify-center text-red-500">
          <Icon name="trash" size="48" />
        </div>
        
        <h3 className="mb-4 text-2xl font-bold text-dark dark:text-white">
          Supprimer l'événement ?
        </h3>
        
        <p className="mb-8 text-base text-body-color leading-relaxed">
          Souhaitez-vous vraiment supprimer <br/>
          <strong className="text-dark dark:text-white break-all">"{eventName}"</strong> ? <br/>
          Cette action est irréversible.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-stroke py-3 px-6 text-base font-semibold text-body-color hover:bg-gray-50 transition dark:border-white/10 dark:text-white/70 dark:hover:bg-dark-3"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-500 py-3 px-6 text-base font-semibold text-white hover:bg-opacity-90 transition disabled:bg-opacity-70"
            disabled={loading}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Icon name="trash" size="18" />
                <span>Supprimer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

