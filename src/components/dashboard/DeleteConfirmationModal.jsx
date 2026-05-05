'use client';

import React from 'react';
import Modal from '@/components/Modal';
import Icon from '@/components/Icon';
import cn from 'classnames';
import Button from '../ui/Button';

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
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-lg py-3 !text-body-color"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            variant="danger"
            className="flex-1 rounded-lg py-3"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

